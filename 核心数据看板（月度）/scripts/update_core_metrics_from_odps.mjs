/**
 * 从 MaxCompute 拉取「上一自然月」月度核心指标，追加/更新到 月度核心数据.csv
 *
 * 用法（仓库根目录或本看板目录均可）：
 *   node 核心数据看板（月度）/scripts/update_core_metrics_from_odps.mjs
 *   node 核心数据看板（月度）/scripts/update_core_metrics_from_odps.mjs 2026-07
 *   node 核心数据看板（月度）/scripts/update_core_metrics_from_odps.mjs --dry-run
 *
 * 依赖：MCP_KEY（与 Cursor mcp.json 的 X-MCP-Key 一致）
 * 26年7月起走 SQL；历史行不改。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { spawnSync } from 'child_process';
import { loadEnv } from '../../lib/loadEnv.js';
import { McpHttpClient, sleep } from '../../lib/mcpHttpClient.js';

const require = createRequire(import.meta.url);

function loadIconv() {
  const candidates = [
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../搜索数据看板（周度）/node_modules/iconv-lite'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../用户增长数据看板（周度）/node_modules/iconv-lite')
  ];
  for (const p of candidates) {
    try {
      return require(p);
    } catch {
      /* try next */
    }
  }
  throw new Error('未找到 iconv-lite，请先在「搜索数据看板（周度）」执行 npm install');
}

const iconv = loadIconv();

loadEnv();
// 额外尝试本看板目录下的 .env
{
  const localEnv = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
  if (fs.existsSync(localEnv)) {
    const text = fs.readFileSync(localEnv, 'utf8');
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARD_DIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(BOARD_DIR, '..');
const CSV_NAME = '月度核心数据.csv';
const CSV_PATH = path.join(BOARD_DIR, CSV_NAME);
const PUBLIC_CSV_PATH = path.join(BOARD_DIR, 'public', CSV_NAME);
const PAYER_CFG = path.join(BOARD_DIR, 'config', 'excluded_payer_ids.txt');

const SQL_CUTOFF = { year: 2026, month: 7 }; // 从此月起走 SQL

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const skipConvert = argv.includes('--skip-convert');
  const ym = argv.find((a) => /^\d{4}-\d{1,2}$/.test(a));
  return { dryRun, skipConvert, ym };
}

function prevCalendarMonth(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth() + 1; // 1-12
  if (m === 1) return { year: y - 1, month: 12 };
  return { year: y, month: m - 1 };
}

function parseYearMonth(ym) {
  const [ys, ms] = ym.split('-');
  return { year: Number(ys), month: Number(ms) };
}

function monthRange(year, month) {
  const begin = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { begin, end };
}

function shiftMonth(year, month, delta) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

function csvYearLabel(year) {
  return `${year % 100}年`;
}

function csvMonthLabel(month) {
  return `${month}月`;
}

function loadExcludedPayers() {
  if (!fs.existsSync(PAYER_CFG)) {
    throw new Error(`未找到排除名单: ${PAYER_CFG}`);
  }
  const ids = fs
    .readFileSync(PAYER_CFG, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  const uniq = [...new Set(ids)];
  if (!uniq.length) throw new Error('排除名单为空');
  return uniq.map((id) => `'${id.replace(/'/g, "''")}'`).join(',');
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

function parseCsvText(csvText) {
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
  if (typeof csv === 'string') return parseCsvText(csv);
  return [];
}

async function runOdpsSql(client, sql, { maxCU, label, waitMs } = {}) {
  const cu = maxCU || Number(process.env.ODPS_MAX_CU || 200);
  const maxWait = waitMs || Number(process.env.ODPS_WAIT_MS || 600000);
  process.stdout.write(`  [${label}] 提交 (maxCU=${cu}) ... `);
  const submit = await client.callTool('execute_sql', {
    project: 'dmp_analyst',
    sql,
    async: true,
    maxCU: cu
  });
  const submitBody = parseOdpsPayload(submit.text);
  if (submitBody?.overLimit) {
    throw new Error(
      `CU 超限 estimated=${submitBody.estimatedCU}，请提高 ODPS_MAX_CU（建议 ${submitBody.suggestedMaxCU || cu * 2}）`
    );
  }
  const instanceId = submitBody?.instanceId;
  if (!instanceId) {
    const sync = extractRows(submitBody);
    if (sync.length) {
      console.log('同步完成');
      return sync[0];
    }
    throw new Error(`未返回 instanceId: ${submit.text.slice(0, 240)}`);
  }

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
      await sleep(3000);
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
    console.log(`完成 (${Math.round((Date.now() - t0) / 1000)}s)`);
    if (!rows.length) throw new Error(`[${label}] 无结果行`);
    return rows[0];
  }
  throw new Error(`[${label}] 超时 instanceId=${instanceId}`);
}

function pctFromRatio(ratio) {
  return `${Math.round(Number(ratio) * 100)}%`;
}

function pctFromPercentNumber(n) {
  return `${Math.round(Number(n))}%`;
}

function fmtArpu(n) {
  return String(Number(Number(n).toFixed(2)));
}

function fmtArppu(n) {
  return String(Number(Number(n).toFixed(1)));
}

function buildSqls({ begin, end, prevBegin, prevEnd, payerInList }) {
  return {
    mau: {
      label: '月活',
      maxCU: 20,
      sql: `
SELECT count(1) AS pv, count(DISTINCT user_id) AS uv
FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
WHERE product_id IN ('czx', 'xueban')
  AND is_spider = false
  AND dt >= '${begin}' AND dt <= '${end}'
`.trim()
    },
    newUsers: {
      label: '新增用户',
      maxCU: 30,
      sql: `
WITH temp1 AS (
    SELECT user_id, min(dt) AS first_date
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban')
      AND application_id = 'mzhan'
      AND is_spider = false
    GROUP BY user_id
)
SELECT count(user_id) AS new_user_cnt
FROM temp1
WHERE first_date BETWEEN '${begin}' AND '${end}'
`.trim()
    },
    retention: {
      label: '次月留存',
      maxCU: 30,
      sql: `
WITH temp1 AS (
    SELECT DISTINCT user_id
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban') AND application_id = 'mzhan'
      AND dt >= '${prevBegin}' AND dt <= '${prevEnd}'
),
temp2 AS (
    SELECT DISTINCT user_id
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban') AND application_id = 'mzhan'
      AND dt >= '${begin}' AND dt <= '${end}'
),
temp3 AS (
    SELECT 1 AS a, count(DISTINCT t1.user_id) AS retained_users
    FROM temp1 t1
    INNER JOIN temp2 t2 ON t1.user_id = t2.user_id
),
temp4 AS (
    SELECT 1 AS a, count(DISTINCT user_id) AS active_users
    FROM temp1
)
SELECT t4.active_users, t3.retained_users,
       t3.retained_users / t4.active_users AS retention_rate
FROM temp4 t4
LEFT JOIN temp3 t3 ON t4.a = t3.a
`.trim()
    },
    revenue: {
      label: '营收订单付费用户',
      maxCU: 20,
      sql: `
SELECT
    sum(paid_amount * 0.01) AS revenue,
    COUNT(*) AS order_cnt,
    COUNT(DISTINCT payer_id) AS paying_users
FROM dmp_cdm.dwd_ump_pay_trd_charges_di
WHERE dt >= '${begin}' AND dt <= '${end}'
  AND app_id = 'app_xkwczx'
  AND paid_status = '1'
  AND refunded = '0'
  AND payer_id NOT IN (${payerInList})
`.trim()
    },
    depth: {
      label: '深度访问UV',
      maxCU: 80,
      waitMs: 300000,
      sql: `
SELECT count(1) AS pv, COUNT(DISTINCT user_id) AS uv
FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
WHERE (request_url LIKE 'https://c.zxxk.com/doc-detail%'
    OR request_url LIKE 'https://c.xkw.com/doc-detail%')
  AND log_event_type = 'view'
  AND is_spider = false
  AND dt >= '${begin}' AND dt <= '${end}'
`.trim()
    },
    usage: {
      label: '使用用户',
      maxCU: 200,
      waitMs: 600000,
      sql: `
WITH visited_users AS (
    SELECT DISTINCT CAST(user_id AS STRING) AS user_id
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban')
      AND is_spider = false
      AND dt >= '${begin}' AND dt <= '${end}'
),
action_users AS (
    SELECT DISTINCT CAST(user_id AS STRING) AS user_id
    FROM (
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_download_complete
        WHERE dt >= '${begin}' AND dt <= '${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE (referrer LIKE 'https://c.zxxk.com/doc-detail%' OR referrer LIKE 'https://c.xkw.com/doc-detail%')
          AND (request_url LIKE 'https://c.zxxk.com/correct?documentId%' OR request_url LIKE 'https://c.xkw.com/correct?documentId%')
          AND log_event_type = 'view'
          AND is_spider = false
          AND dt >= '${begin}' AND dt <= '${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id IN ('czx', 'xueban')
          AND log_event_type = 'click'
          AND html_element_name = 'full_preview'
          AND dt >= '${begin}' AND dt <= '${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id IN ('czx', 'xueban')
          AND log_event_type = 'click'
          AND html_element_name = 'toast_favorite_success'
          AND dt >= '${begin}' AND dt <= '${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_video_play_1
        WHERE dt >= '${begin}' AND dt <= '${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE (referrer LIKE 'https://c.zxxk.com/doc-detail%' OR referrer LIKE 'https://c.xkw.com/doc-detail%')
          AND (request_url LIKE 'https://c.zxxk.com/report%' OR request_url LIKE 'https://c.xkw.com/report%')
          AND log_event_type = 'view'
          AND is_spider = false
          AND dt >= '${begin}' AND dt <= '${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id = 'czx'
          AND (request_url LIKE 'https://c.zxxk.com/practice%' OR request_url LIKE 'https://c.xkw.com/practice%')
          AND log_event_type = 'view'
          AND is_spider = false
          AND dt >= '${begin}' AND dt <= '${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE (request_url LIKE 'https://xb.xkw.com/photo-search%' OR request_url = 'https://xb.xkw.com/')
          AND log_event_type = 'view'
          AND is_spider = false
          AND dt >= '${begin}' AND dt <= '${end}'
    ) AS actions
)
SELECT COUNT(DISTINCT vu.user_id) AS user_count
FROM visited_users vu
JOIN action_users au ON vu.user_id = au.user_id
`.trim()
    },
    vip: {
      label: '大会员活跃率',
      maxCU: 30,
      waitMs: 300000,
      sql: `
WITH yearly_members AS (
    SELECT
        payer_id AS seller_id,
        dt AS purchase_date,
        CASE
            WHEN paid_amount IN (15800, 23800, 26800) THEN DATE_ADD(CAST(dt AS DATE), 365)
            WHEN paid_amount = 21900 THEN DATE_ADD(CAST(dt AS DATE), 335)
            WHEN paid_amount = 59800 THEN DATE_ADD(CAST(dt AS DATE), 1095)
        END AS expiry_date
    FROM dmp_cdm.dwd_ump_pay_trd_charges_di
    WHERE paid_status = '1'
      AND refunded = '0'
      AND app_id = 'app_xkwczx'
      AND paid_amount IN (15800, 23800, 26800, 21900, 59800)
      AND dt >= '2023-01-01'
      AND dt <= '${end}'
),
valid_yearly_members AS (
    SELECT DISTINCT seller_id
    FROM yearly_members
    WHERE purchase_date <= '${end}'
      AND expiry_date >= '${begin}'
)
SELECT
    COUNT(DISTINCT vm.seller_id) AS member_cnt,
    COUNT(DISTINCT t.user_id) AS visit_cnt,
    ROUND(COUNT(DISTINCT t.user_id) * 100.0 / COUNT(DISTINCT vm.seller_id), 2) AS active_rate
FROM valid_yearly_members vm
LEFT JOIN dmp_cdm.dwd_pub_io_log_xyiolog_di t
    ON CAST(t.user_id AS STRING) = vm.seller_id
   AND t.product_id IN ('czx', 'xueban')
   AND t.is_spider = false
   AND t.dt >= '${begin}'
   AND t.dt <= '${end}'
`.trim()
    }
  };
}

function detectCsvEncoding(buf) {
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return 'utf8';
  }
  // 现网月度 CSV 多为 GBK；优先按 GBK 读，避免 UTF-8 误判导致乱码
  try {
    const gbk = iconv.decode(buf, 'gbk');
    if (/[年月日数据用户]/.test(gbk)) return 'gbk';
  } catch {
    /* ignore */
  }
  return 'utf8';
}

function readCsvText(filePath) {
  const buf = fs.readFileSync(filePath);
  const enc = detectCsvEncoding(buf);
  return { text: iconv.decode(buf, enc === 'gbk' ? 'gbk' : 'utf8'), encoding: enc };
}

function writeCsvText(filePath, text, encoding = 'gbk') {
  const body = text.replace(/^\uFEFF/, '');
  const buf = iconv.encode(body, encoding === 'utf8' ? 'utf8' : 'gbk');
  writeFileWithRetryBuffer(filePath, buf);
}

function sleepSync(ms) {
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  } catch {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      /* spin */
    }
  }
}

function writeFileWithRetryBuffer(filePath, buf, retries = 5) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const tmp = `${filePath}.tmp.${process.pid}`;
      fs.writeFileSync(tmp, buf);
      fs.renameSync(tmp, filePath);
      return;
    } catch (err) {
      lastErr = err;
      if (err && (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'EACCES')) {
        sleepSync(1000 * (i + 1));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

function buildCsvContent(csvPath, yearLabel, monthLabel, values) {
  const header =
    '年份,月份,月活,新增用户,次月留存,营收,订单,ARPU,ARPPU,深度访问率,使用率,大会员活跃率';
  let text = `${header}\n`;
  let encoding = 'gbk';
  try {
    if (fs.existsSync(csvPath)) {
      const read = readCsvText(csvPath);
      text = read.text;
      encoding = read.encoding === 'utf8' ? 'utf8' : 'gbk';
    }
  } catch {
    if (fs.existsSync(PUBLIC_CSV_PATH)) {
      const read = readCsvText(PUBLIC_CSV_PATH);
      text = read.text;
      encoding = read.encoding === 'utf8' ? 'utf8' : 'gbk';
    }
  }
  text = text.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter((l, i) => (i === 0 ? true : l.trim() !== ''));
  if (!lines[0] || !lines[0].includes('年份')) {
    lines.unshift(header);
  }
  const row = [
    yearLabel,
    monthLabel,
    values.mau,
    values.newUsers,
    values.retention,
    values.revenue,
    values.orders,
    values.arpu,
    values.arppu,
    values.depthRate,
    values.usageRate,
    values.vipRate
  ].join(',');

  const key = `${yearLabel},${monthLabel},`;
  let replaced = false;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].startsWith(key)) {
      lines[i] = row;
      replaced = true;
      break;
    }
  }
  if (!replaced) lines.push(row);
  return { content: `${lines.join('\n')}\n`, replaced, row, encoding };
}

function writeCsvOutputs(yearLabel, monthLabel, values) {
  const { content, replaced, encoding } = buildCsvContent(CSV_PATH, yearLabel, monthLabel, values);
  const action = replaced ? 'updated' : 'appended';
  const written = [];
  const failed = [];
  // 与现有文件及 convert_csv_to_js_v2 探测逻辑对齐，默认写 GBK
  const outEnc = encoding === 'utf8' ? 'utf8' : 'gbk';

  try {
    writeCsvText(CSV_PATH, content, outEnc);
    written.push(CSV_PATH);
  } catch (err) {
    failed.push(`${CSV_PATH} (${err.code || err.message})`);
    const pending = path.join(BOARD_DIR, 'config', `月度核心数据.pending-${yearLabel}${monthLabel}.csv`);
    fs.mkdirSync(path.dirname(pending), { recursive: true });
    writeCsvText(pending, content, outEnc);
    written.push(pending);
    console.warn(
      `  [WARN] 主 CSV 被占用（请关闭 WPS/Excel 后，用 config 下 pending 文件覆盖 月度核心数据.csv）\n         ${pending}`
    );
  }

  try {
    writeCsvText(PUBLIC_CSV_PATH, content, outEnc);
    written.push(PUBLIC_CSV_PATH);
  } catch (err) {
    failed.push(`${PUBLIC_CSV_PATH} (${err.code || err.message})`);
  }

  return { action, written, failed };
}

function convertCsvToJs({ preferPublic = false } = {}) {
  const conv = path.join(ROOT, 'convert_csv_to_js_v2.ps1');
  if (!fs.existsSync(conv)) {
    console.warn(`未找到 ${conv}，跳过 data.js 转换`);
    return false;
  }
  console.log('\n>> 转换 CSV → data.js');

  let folder = BOARD_DIR;
  let tmpDir = null;
  if (preferPublic) {
    tmpDir = fs.mkdtempSync(path.join(path.resolve(process.env.TEMP || ROOT), 'czx-monthly-'));
    fs.copyFileSync(PUBLIC_CSV_PATH, path.join(tmpDir, CSV_NAME));
    const bRoot = path.join(BOARD_DIR, 'B端核心数据.csv');
    const bPub = path.join(BOARD_DIR, 'public', 'B端核心数据.csv');
    const bSrc = fs.existsSync(bRoot) ? bRoot : bPub;
    if (fs.existsSync(bSrc)) fs.copyFileSync(bSrc, path.join(tmpDir, 'B端核心数据.csv'));
    folder = tmpDir;
    console.log('  （主 CSV 可能未写入，改用 public 副本转换）');
  }

  const r = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', conv, '-FolderPath', folder],
    { encoding: 'utf8', cwd: ROOT }
  );
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) throw new Error(`convert_csv_to_js_v2 失败 exit=${r.status}`);

  const srcJs = path.join(folder, 'data.js');
  const dstJs = path.join(BOARD_DIR, 'data.js');
  const dstPublicJs = path.join(BOARD_DIR, 'public', 'data.js');
  if (fs.existsSync(srcJs)) {
    fs.copyFileSync(srcJs, dstJs);
    fs.copyFileSync(srcJs, dstPublicJs);
    console.log('  已同步 data.js / public/data.js');
  }
  if (tmpDir) {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
  return true;
}

async function main() {
  const { dryRun, skipConvert, ym } = parseArgs(process.argv.slice(2));
  const target = ym ? parseYearMonth(ym) : prevCalendarMonth();
  const { year, month } = target;

  if (
    year < SQL_CUTOFF.year ||
    (year === SQL_CUTOFF.year && month < SQL_CUTOFF.month)
  ) {
    console.error(
      `目标 ${year}-${month} 早于 SQL 起点 ${SQL_CUTOFF.year}-${SQL_CUTOFF.month}，历史数据请勿用本脚本覆盖。`
    );
    process.exit(1);
  }

  const { begin, end } = monthRange(year, month);
  const prev = shiftMonth(year, month, -1);
  const { begin: prevBegin, end: prevEnd } = monthRange(prev.year, prev.month);
  const yearLabel = csvYearLabel(year);
  const monthLabel = csvMonthLabel(month);

  console.log('========================================');
  console.log('  月度核心数据 · MaxCompute 更新');
  console.log(`  目标月份: ${yearLabel}${monthLabel}（${begin} ~ ${end}）`);
  console.log(`  留存对照: ${csvYearLabel(prev.year)}${csvMonthLabel(prev.month)} → 当月`);
  if (dryRun) console.log('  模式: dry-run（不写文件）');
  console.log('========================================\n');

  if (!process.env.MCP_KEY && !process.env.X_MCP_KEY) {
    console.error('请先配置 MCP_KEY（与 Cursor mcp.json 的 X-MCP-Key 一致）');
    console.error('可写入仓库根 .env、用户行为看板（周度）/.env 或 核心数据看板（月度）/.env');
    process.exit(1);
  }

  const payerInList = loadExcludedPayers();
  const sqls = buildSqls({ begin, end, prevBegin, prevEnd, payerInList });

  const client = new McpHttpClient({
    url: process.env.MAXCOMPUTE_MCP_URL || 'https://test-dmp-mcp.xkw.com/maxcompute-mcp',
    apiKey: process.env.MCP_KEY || process.env.X_MCP_KEY
  });

  await client.initialize();
  try {
    const mauRow = await runOdpsSql(client, sqls.mau.sql, sqls.mau);
    const mau = Number(mauRow.uv);
    console.log(`    月活 UV = ${mau}`);

    const newRow = await runOdpsSql(client, sqls.newUsers.sql, sqls.newUsers);
    const newUsers = Number(newRow.new_user_cnt);
    console.log(`    新增用户 = ${newUsers}`);

    const retRow = await runOdpsSql(client, sqls.retention.sql, sqls.retention);
    const retention = pctFromRatio(retRow.retention_rate);
    console.log(
      `    次月留存 = ${retention}（活跃 ${retRow.active_users} / 留存 ${retRow.retained_users}）`
    );

    const revRow = await runOdpsSql(client, sqls.revenue.sql, sqls.revenue);
    const revenue = Math.round(Number(revRow.revenue));
    const orders = Number(revRow.order_cnt);
    const payingUsers = Number(revRow.paying_users);
    const arpu = fmtArpu(revenue / mau);
    const arppu = fmtArppu(revenue / payingUsers);
    console.log(
      `    营收=${revenue} 订单=${orders} 付费用户=${payingUsers} ARPU=${arpu} ARPPU=${arppu}`
    );

    const depthRow = await runOdpsSql(client, sqls.depth.sql, sqls.depth);
    const depthUv = Number(depthRow.uv);
    const depthRate = pctFromRatio(depthUv / mau);
    console.log(`    深度访问率 = ${depthRate}（详情 UV ${depthUv}）`);

    const usageRow = await runOdpsSql(client, sqls.usage.sql, sqls.usage);
    const usageUsers = Number(usageRow.user_count);
    const usageRate = pctFromRatio(usageUsers / mau);
    console.log(`    使用率 = ${usageRate}（使用用户 ${usageUsers}）`);

    const vipRow = await runOdpsSql(client, sqls.vip.sql, sqls.vip);
    const vipRate = pctFromPercentNumber(vipRow.active_rate);
    console.log(
      `    大会员活跃率 = ${vipRate}（会员 ${vipRow.member_cnt} / 到访 ${vipRow.visit_cnt}）`
    );

    const values = {
      mau,
      newUsers,
      retention,
      revenue,
      orders,
      arpu,
      arppu,
      depthRate,
      usageRate,
      vipRate
    };

    console.log('\n>> 目标行预览:');
    console.log(
      `${yearLabel},${monthLabel},${mau},${newUsers},${retention},${revenue},${orders},${arpu},${arppu},${depthRate},${usageRate},${vipRate}`
    );

    if (dryRun) {
      console.log('\n[dry-run] 未写入 CSV');
      return;
    }

    const { action, written, failed } = writeCsvOutputs(yearLabel, monthLabel, values);
    console.log(`\n>> CSV 已${action === 'updated' ? '更新' : '追加'}`);
    written.forEach((p) => console.log(`   写入: ${p}`));
    if (failed.length) {
      failed.forEach((p) => console.warn(`   失败: ${p}`));
    }

    const mainFailed = failed.some((f) => f.includes(CSV_PATH));
    if (!skipConvert) convertCsvToJs({ preferPublic: mainFailed });

    console.log('\n完成。B 端数据未改动；全量月度看板请稍后运行「月度更新.bat」。');
    if (mainFailed) {
      console.log('注意：请关闭占用 月度核心数据.csv 的 WPS/Excel，再把 config 下 pending 文件覆盖到主 CSV。');
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('\n[失败]', err.message || err);
  process.exit(1);
});
