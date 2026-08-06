/**
 * 从 MaxCompute 拉取「上一完整自然周」搜索词 TOP50000（UV 降序），
 * 写入 第N周搜索词.csv，并重建 data/keywords-N.*
 *
 * SQL：../sql/weekly_keywords.mjs
 *
 * 用法：
 *   node 搜索数据看板（周度）/scripts/update_weekly_keywords_from_odps.mjs
 *   node 搜索数据看板（周度）/scripts/update_weekly_keywords_from_odps.mjs 2026-31
 *   node 搜索数据看板（周度）/scripts/update_weekly_keywords_from_odps.mjs --dry-run
 *   node 搜索数据看板（周度）/scripts/update_weekly_keywords_from_odps.mjs --skip-convert
 *
 * 自 2026-07-30（第31周）起可写；≤30 周冻结。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { loadEnv } from '../../lib/loadEnv.js';
import { McpHttpClient, sleep } from '../../lib/mcpHttpClient.js';
import {
  KEYWORD_SQL,
  KEYWORD_LIMIT,
  KEYWORD_PAGE_SIZE
} from '../sql/weekly_keywords.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARD_DIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(BOARD_DIR, '..');
const SQL_CUTOFF_DATE = '2026-07-30';

loadEnv();
{
  const localEnv = path.join(BOARD_DIR, '.env');
  if (fs.existsSync(localEnv)) {
    for (const rawLine of fs.readFileSync(localEnv, 'utf8').split(/\r?\n/)) {
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

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const skipConvert = argv.includes('--skip-convert');
  const yw = argv.find((a) => /^\d{4}-W?\d{1,2}$/i.test(a));
  return { dryRun, skipConvert, yw };
}

function parseYearWeek(yw) {
  const m = String(yw).match(/^(\d{4})-W?(\d{1,2})$/i);
  if (!m) throw new Error(`无法解析周次: ${yw}`);
  return { year: Number(m[1]), week: Number(m[2]) };
}

function prevCompleteWeek(now = new Date()) {
  const y = now.getFullYear();
  const start = new Date(y, 0, 1);
  const dayIndex = Math.floor((now - start) / 86400000);
  const week = Math.floor(dayIndex / 7) + 1;
  if (week <= 1) {
    const prevYear = y - 1;
    const leap =
      (prevYear % 4 === 0 && prevYear % 100 !== 0) || prevYear % 400 === 0;
    const days = leap ? 366 : 365;
    return { year: prevYear, week: Math.floor((days - 1) / 7) + 1 };
  }
  return { year: y, week: week - 1 };
}

function weekRange(year, week) {
  const beginDate = new Date(year, 0, 1 + (week - 1) * 7);
  const endDate = new Date(year, 0, 1 + (week - 1) * 7 + 6);
  const iso = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };
  return { begin: iso(beginDate), end: iso(endDate) };
}

function fillSql(template, vars) {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => {
    if (vars[key] == null) throw new Error(`缺少 \${${key}}`);
    return String(vars[key]);
  });
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
      return sync;
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
    const truncated = dataBody?.truncated === true;
    console.log(
      `完成 (${Math.round((Date.now() - t0) / 1000)}s, ${rows.length} 行${truncated ? ', 截断' : ''})`
    );
    if (truncated) {
      throw new Error(
        `[${label}] 结果被截断（${rows.length} 行）。请减小 KEYWORD_PAGE_SIZE 后重试。`
      );
    }
    return rows;
  }
  throw new Error(`[${label}] 超时 instanceId=${instanceId}`);
}

function csvEscape(cell) {
  const s = String(cell ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function normalizeKeywordRows(rows) {
  const out = [];
  for (const r of rows) {
    const keywords = String(r.keywords ?? '').trim();
    const pv = Number(r.pv);
    const uv = Number(r.uv);
    if (!keywords || !Number.isFinite(pv) || !Number.isFinite(uv)) continue;
    out.push({ keywords, pv, uv });
  }
  return out;
}

async function fetchKeywordsPaged(client, begin, end, { limit, pageSize, dryRun }) {
  const all = [];
  const target = dryRun ? Math.min(20, pageSize) : limit;
  let rnBegin = 1;
  let page = 1;
  while (all.length < target) {
    const rnEnd = Math.min(rnBegin + pageSize - 1, target);
    const sql = fillSql(KEYWORD_SQL.sql, { begin, end, rnBegin, rnEnd });
    const label = dryRun
      ? `${KEYWORD_SQL.label}预览`
      : `${KEYWORD_SQL.label} p${page} (${rnBegin}-${rnEnd})`;
    const rawRows = await runOdpsSql(client, sql, {
      maxCU: KEYWORD_SQL.maxCU,
      label,
      waitMs: KEYWORD_SQL.waitMs
    });
    const rows = normalizeKeywordRows(rawRows);
    all.push(...rows);
    // 以 ODPS 原始行数判断是否还有下一页（normalize 可能丢掉少量脏行）
    if (rawRows.length < rnEnd - rnBegin + 1) break;
    if (dryRun) break;
    rnBegin = rnEnd + 1;
    page += 1;
  }
  return all.slice(0, target);
}

function writeKeywordCsv(week, rows) {
  const filePath = path.join(BOARD_DIR, `第${week}周搜索词.csv`);
  const lines = ['keywords,pv,uv'];
  for (const r of rows) {
    lines.push([csvEscape(r.keywords), r.pv, r.uv].join(','));
  }
  const content = `${lines.join('\n')}\n`;
  const tmp = `${filePath}.tmp.${process.pid}`;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
  return filePath;
}

function rebuildKeywordAssets() {
  const script = path.join(BOARD_DIR, 'convert_csv_to_js.js');
  if (!fs.existsSync(script)) {
    console.warn('未找到 convert_csv_to_js.js，跳过');
    return;
  }
  console.log('\n>> 重建 data/keywords-*.js（convert_csv_to_js）');
  const r = spawnSync(process.execPath, [script], {
    cwd: BOARD_DIR,
    encoding: 'utf8'
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) throw new Error(`convert_csv_to_js 失败 exit=${r.status}`);
}

async function main() {
  const { dryRun, skipConvert, yw } = parseArgs(process.argv.slice(2));
  const target = yw ? parseYearWeek(yw) : prevCompleteWeek();
  const range = weekRange(target.year, target.week);

  if (range.begin < SQL_CUTOFF_DATE) {
    console.error(
      `目标周 ${range.begin}~${range.end} 早于 ${SQL_CUTOFF_DATE}，搜索词历史（≤30周）已冻结。`
    );
    process.exit(1);
  }

  console.log('========================================');
  console.log('  搜索看板 · 周度搜索词 MaxCompute 更新');
  console.log(
    `  目标: ${target.year}年第${target.week}周（${range.begin} ~ ${range.end}）`
  );
  console.log(`  上限: TOP ${KEYWORD_LIMIT}（UV 降序）`);
  if (dryRun) console.log('  模式: dry-run');
  console.log('========================================');

  if (!process.env.MCP_KEY && !process.env.X_MCP_KEY) {
    console.error('请配置 MCP_KEY');
    process.exit(1);
  }

  const client = new McpHttpClient({
    url: process.env.MAXCOMPUTE_MCP_URL || 'https://test-dmp-mcp.xkw.com/maxcompute-mcp',
    apiKey: process.env.MCP_KEY || process.env.X_MCP_KEY
  });

  await client.initialize();
  try {
    const rows = await fetchKeywordsPaged(client, range.begin, range.end, {
      limit: KEYWORD_LIMIT,
      pageSize: dryRun ? 20 : KEYWORD_PAGE_SIZE,
      dryRun
    });

    console.log(`\n  预览 top:`);
    rows.slice(0, 10).forEach((r) => {
      console.log(`    ${r.uv}\t${r.pv}\t${r.keywords}`);
    });
    if (rows.length > 10) console.log(`    ... 共 ${rows.length} 条`);

    if (dryRun) {
      console.log('\n[dry-run] 未写入 CSV');
      return;
    }

    const out = writeKeywordCsv(target.week, rows);
    console.log(`\n  已写入 ${path.basename(out)}（${rows.length} 行）`);

    if (!skipConvert) rebuildKeywordAssets();
    console.log('\n完成。');
  } finally {
    try {
      await client.close?.();
    } catch {
      /* ignore */
    }
  }
}

main().catch((err) => {
  console.error('\n失败:', err.message || err);
  process.exit(1);
});
