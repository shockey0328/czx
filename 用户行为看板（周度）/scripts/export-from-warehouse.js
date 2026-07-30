/**
 * 从数仓按日导出用户行为日志 → data/YYYY-MM-DD.json（userGroups 格式）
 *
 * 说明：
 * - 全量很大（7 月单日约 70万~190万行），MCP 单次约 1 万行上限
 * - 因此按 user_id % buckets 分片拉取后合并
 *
 * 用法（在「用户行为看板（周度）」目录，需配置 MCP_KEY）：
 *   node scripts/export-from-warehouse.js 2026-07-01 2026-07-01
 *   node scripts/export-from-warehouse.js 2026-07-01 2026-07-30
 *
 * 环境变量：
 *   MCP_KEY / WAREHOUSE_ENGINE / XYIO_BUCKETS（默认 256，峰值日建议 ≥ 256）
 *   XYIO_OUT_DIR（默认 ../data 相对本脚本，即看板 data/）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnv } from '../../lib/loadEnv.js';
import { McpHttpClient, sleep } from '../../lib/mcpHttpClient.js';
import { normalizeLogRow } from '../../lib/xyioLogSql.js';

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.XYIO_OUT_DIR
  ? path.resolve(process.env.XYIO_OUT_DIR)
  : path.resolve(__dirname, '../data');
const CLOUD_DIR = path.resolve(__dirname, '../cloud-upload');
const BUCKETS = Math.max(Number(process.env.XYIO_BUCKETS) || 256, 1);
const PRODUCT_IDS = (process.env.XYIO_PRODUCT_IDS || 'czx,xueban')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const APPLICATION_ID = process.env.XYIO_APPLICATION_ID || 'mzhan';

function assertDate(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error(`日期无效: ${d}`);
  return d;
}

function eachDate(start, end) {
  const out = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function parseOdpsPayload(text) {
  const raw = (text || '').trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const a = raw.indexOf('{');
    const b = raw.lastIndexOf('}');
    if (a >= 0 && b > a) return JSON.parse(raw.slice(a, b + 1));
    throw new Error(`无法解析 ODPS 返回: ${raw.slice(0, 200)}`);
  }
}

function parseCsv(csvText) {
  const text = String(csvText || '').replace(/^\uFEFF/, '');
  if (!text.trim()) return [];
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else field += ch;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (ch === '\n' || (ch === '\r' && next === '\n')) {
      if (ch === '\r') i++;
      row.push(field);
      field = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
      continue;
    }
    if (ch === '\r') {
      row.push(field);
      field = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
      continue;
    }
    field += ch;
  }
  row.push(field);
  if (row.some((c) => c !== '')) rows.push(row);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => String(h).trim());
  return rows.slice(1).map((cols) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? '';
    });
    return obj;
  });
}

function extractRows(body) {
  if (!body) return [];
  if (Array.isArray(body.data)) return body.data;
  const csv = body.results?.AnonymousSQLTask;
  if (typeof csv === 'string') return parseCsv(csv);
  return [];
}

function buildBucketSql(dt, bucket, buckets) {
  const products = PRODUCT_IDS.map((p) => `'${p.replace(/'/g, "''")}'`).join(', ');
  return `
SELECT
    xyio_client_time,
    CAST(user_id AS STRING) AS user_id,
    device_id,
    request_url AS url,
    product_id,
    referrer,
    product_source_id AS source,
    os,
    device_manufacturer,
    device_model,
    platform,
    html_element_class_name AS element_class_name,
    html_element_content AS element_content,
    html_element_id AS element_id,
    html_element_name AS element_name,
    log_event_type,
    xyio_backend_time,
    lib_version,
    dt
FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
WHERE dt = '${dt}'
  AND product_id IN (${products})
  AND application_id = '${APPLICATION_ID.replace(/'/g, "''")}'
  AND user_id IS NOT NULL
  AND PMOD(user_id, ${buckets}) = ${bucket}
LIMIT 10000
`.trim();
}

async function runOdpsSql(client, sql) {
  const submit = await client.callTool('execute_sql', {
    project: 'dmp_analyst',
    sql,
    async: true,
    maxCU: Number(process.env.ODPS_MAX_CU || 80)
  });
  const submitBody = parseOdpsPayload(submit.text);
  const instanceId = submitBody?.instanceId;
  if (!instanceId) {
    const sync = extractRows(submitBody);
    if (sync.length) return { rows: sync, truncated: false };
    throw new Error(`未返回 instanceId: ${submit.text.slice(0, 240)}`);
  }

  const maxWait = Number(process.env.ODPS_WAIT_MS || 180000);
  const t0 = Date.now();
  while (Date.now() - t0 < maxWait) {
    const st = parseOdpsPayload(
      (
        await client.callTool('get_instance_status', {
          project: 'dmp_analyst',
          instanceId
        })
      ).text
    );
    if (!st?.isTerminated) {
      await sleep(2000);
      continue;
    }
    if (st.isSuccessful === false) {
      throw new Error(`ODPS 失败: ${JSON.stringify(st).slice(0, 300)}`);
    }
    const dataBody = parseOdpsPayload(
      (
        await client.callTool('get_instance', {
          project: 'dmp_analyst',
          instanceId
        })
      ).text
    );
    const rows = extractRows(dataBody);
    const truncated = dataBody?.truncated === true || rows.length >= 10000;
    return { rows, truncated };
  }
  throw new Error(`超时 instanceId=${instanceId}`);
}

function toUserGroups(rows) {
  const userGroups = {};
  for (const raw of rows) {
    const row = normalizeLogRow(raw);
    const uid = String(row.user_id || '').trim();
    if (!uid) continue;
    if (!userGroups[uid]) userGroups[uid] = [];
    userGroups[uid].push(row);
  }
  for (const uid of Object.keys(userGroups)) {
    userGroups[uid].sort((a, b) =>
      String(a.xyio_client_time).localeCompare(String(b.xyio_client_time))
    );
  }
  return userGroups;
}

async function exportOneDay(client, dt) {
  console.log(`\n=== 导出 ${dt}（buckets=${BUCKETS}）===`);
  const all = [];
  let truncatedBuckets = 0;

  for (let b = 0; b < BUCKETS; b++) {
    const sql = buildBucketSql(dt, b, BUCKETS);
    process.stdout.write(`  bucket ${b + 1}/${BUCKETS} ... `);
    try {
      const { rows, truncated } = await runOdpsSql(client, sql);
      console.log(`${rows.length} 行${truncated ? ' [可能截断]' : ''}`);
      if (truncated) truncatedBuckets += 1;
      all.push(...rows);
    } catch (err) {
      console.log(`失败: ${err.message}`);
      throw err;
    }
  }

  const userGroups = toUserGroups(all);
  const recordCount = Object.values(userGroups).reduce((n, arr) => n + arr.length, 0);
  const payload = {
    date: dt,
    recordCount,
    userCount: Object.keys(userGroups).length,
    products: PRODUCT_IDS,
    applicationId: APPLICATION_ID,
    exportedAt: new Date().toISOString(),
    truncatedBuckets,
    buckets: BUCKETS,
    userGroups
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `${dt}.json`);
  fs.writeFileSync(outFile, JSON.stringify(payload));
  console.log(
    `已写入 ${outFile}（用户 ${payload.userCount}，记录 ${recordCount}${
      truncatedBuckets ? `，警告: ${truncatedBuckets} 个分片可能截断，请增大 XYIO_BUCKETS` : ''
    }）`
  );
  return payload;
}

function writeStats(datesMeta) {
  const availableDates = datesMeta.map((d) => d.date).sort();
  const stats = {
    totalUsers: datesMeta.reduce((n, d) => n + (d.userCount || 0), 0),
    totalRecords: datesMeta.reduce((n, d) => n + (d.recordCount || 0), 0),
    availableDates,
    dateRange: availableDates.length
      ? { start: availableDates[0], end: availableDates[availableDates.length - 1] }
      : null,
    dataSource: 'exported-files',
    updatedAt: new Date().toISOString()
  };
  fs.mkdirSync(CLOUD_DIR, { recursive: true });
  fs.writeFileSync(path.join(CLOUD_DIR, 'stats.json'), JSON.stringify(stats, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'available-dates.json'), JSON.stringify(availableDates, null, 2));
  console.log('\n已更新 cloud-upload/stats.json 与 data/available-dates.json');
  return stats;
}

function scanExistingMeta() {
  if (!fs.existsSync(OUT_DIR)) return [];
  return fs
    .readdirSync(OUT_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => {
      const date = f.slice(0, 10);
      try {
        const j = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), 'utf8'));
        return {
          date,
          userCount: j.userCount || Object.keys(j.userGroups || {}).length,
          recordCount: j.recordCount || 0
        };
      } catch {
        return { date, userCount: 0, recordCount: 0 };
      }
    });
}

const start = assertDate(process.argv[2] || '2026-07-01');
const end = assertDate(process.argv[3] || start);

if (!process.env.MCP_KEY && !process.env.X_MCP_KEY) {
  console.error('请先配置 MCP_KEY（与 Cursor mcp.json 的 X-MCP-Key 一致）');
  process.exit(1);
}

const client = new McpHttpClient({
  url:
    process.env.MAXCOMPUTE_MCP_URL ||
    'https://test-dmp-mcp.xkw.com/maxcompute-mcp',
  apiKey: process.env.MCP_KEY || process.env.X_MCP_KEY
});

await client.initialize();
try {
  const dates = eachDate(start, end);
  console.log(`将导出 ${dates.length} 天: ${dates[0]} ~ ${dates[dates.length - 1]}`);
  console.log(
    `预计分片请求约 ${dates.length * BUCKETS} 次；单日高峰约需 ${Math.ceil(
      (BUCKETS * 20) / 60
    )} 分钟量级，建议先单日试跑。`
  );

  for (const dt of dates) {
    await exportOneDay(client, dt);
  }
  writeStats(scanExistingMeta());
} finally {
  await client.close();
}
