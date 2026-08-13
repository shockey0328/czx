/**
 * 从 MaxCompute 拉取「上一完整自然周」日度趋势，追加/更新三张趋势 CSV。
 * SQL 见 ../sql/daily_trend_metrics.mjs（改口径只改该文件）。
 *
 * 用法：
 *   node 核心数据看板（周度）/scripts/update_weekly_trends_from_odps.mjs
 *   node 核心数据看板（周度）/scripts/update_weekly_trends_from_odps.mjs 2026-31
 *   node 核心数据看板（周度）/scripts/update_weekly_trends_from_odps.mjs --dry-run
 *   node 核心数据看板（周度）/scripts/update_weekly_trends_from_odps.mjs --only=active,paid
 *
 * 自 2026-07-30（第31周）起追加；此前历史冻结。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { spawnSync } from 'child_process';
import { loadEnv } from '../../lib/loadEnv.js';
import { createWarehouseClient } from '../../lib/warehouseClient.js';
import { DAILY_TREND_SQL } from '../sql/daily_trend_metrics.mjs';

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
const SQL_PATH = path.join(BOARD_DIR, 'sql', 'daily_trend_metrics.mjs');

const MONTHLY_PAYER_CFG = path.join(ROOT, '核心数据看板（月度）', 'config', 'excluded_payer_ids.txt');
const WEEKLY_PAYER_CFG = path.join(BOARD_DIR, 'config', 'excluded_payer_ids.txt');

/** 日趋势 SQL 起点（含当日）= 2026 年第 31 周起始 */
const SQL_CUTOFF_DATE = '2026-07-30';

const FILES = {
  active: {
    name: '活跃用户趋势_utf8.csv',
    header: 'dt,pv,uv',
    dateKey: 'dt'
  },
  paid: {
    name: '付费用户及营收趋势_utf8.csv',
    header: 'dt,付费用户,营收',
    dateKey: 'dt'
  },
  usage: {
    name: '使用率趋势_utf8.csv',
    header: 'date,活跃用户数,使用用户数,使用率百分比',
    dateKey: 'date'
  }
};

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const skipConvert = argv.includes('--skip-convert');
  const yw = argv.find((a) => /^\d{4}-W?\d{1,2}$/i.test(a));
  const onlyArg = argv.find((a) => a.startsWith('--only='));
  const only = onlyArg
    ? onlyArg
        .slice('--only='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : ['active', 'paid', 'usage'];
  return { dryRun, skipConvert, yw, only };
}

function parseYearWeek(yw) {
  const m = String(yw).match(/^(\d{4})-W?(\d{1,2})$/i);
  if (!m) throw new Error(`无法解析周次参数: ${yw}（期望如 2026-31）`);
  return { year: Number(m[1]), week: Number(m[2]) };
}

function weekOfYear(date) {
  const y = date.getFullYear();
  const jan1 = new Date(y, 0, 1);
  const today = new Date(y, date.getMonth(), date.getDate());
  const dayIndex = Math.floor((today - jan1) / 86400000);
  return { year: y, week: Math.floor(dayIndex / 7) + 1 };
}

function prevCompleteWeek(now = new Date()) {
  const { year, week } = weekOfYear(now);
  if (week <= 1) {
    const prevYear = year - 1;
    const leap =
      (prevYear % 4 === 0 && prevYear % 100 !== 0) || prevYear % 400 === 0;
    const days = leap ? 366 : 365;
    return { year: prevYear, week: Math.floor((days - 1) / 7) + 1 };
  }
  return { year, week: week - 1 };
}

function weekRange(year, week) {
  const beginDate = new Date(year, 0, 1 + (week - 1) * 7);
  const endDate = new Date(year, 0, 1 + (week - 1) * 7 + 6);
  const fmt = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };
  return { begin: fmt(beginDate), end: fmt(endDate), beginDate, endDate };
}

/** 与现有 CSV 一致：2026/1/1（月日不补零） */
function formatCsvDate(isoOrDate) {
  const s = String(isoOrDate).slice(0, 10).replace(/-/g, '/');
  const [y, m, d] = s.split('/');
  return `${Number(y)}/${Number(m)}/${Number(d)}`;
}

function loadExcludedPayers() {
  const cfg = fs.existsSync(WEEKLY_PAYER_CFG) ? WEEKLY_PAYER_CFG : MONTHLY_PAYER_CFG;
  if (!fs.existsSync(cfg)) {
    throw new Error(`未找到排除名单: ${WEEKLY_PAYER_CFG} 或 ${MONTHLY_PAYER_CFG}`);
  }
  const ids = fs
    .readFileSync(cfg, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  const uniq = [...new Set(ids)];
  if (!uniq.length) throw new Error('排除名单为空');
  console.log(`  排除名单: ${path.relative(ROOT, cfg)}（${uniq.length} 个）`);
  return uniq.map((id) => `'${id.replace(/'/g, "''")}'`).join(',');
}

function fillSql(template, vars) {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => {
    if (vars[key] == null) throw new Error(`SQL 占位符未提供: \${${key}}`);
    return String(vars[key]);
  });
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

function detectCsvEncoding(buf) {
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return 'utf8';
  }
  try {
    const gbk = iconv.decode(buf, 'gbk');
    if (/[年月日活跃付费使用]/.test(gbk) || /dt|date|pv|uv/.test(gbk)) return 'gbk';
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

function writeCsvText(filePath, text, encoding = 'gbk') {
  const body = text.replace(/^\uFEFF/, '');
  const buf = iconv.encode(body, encoding === 'utf8' ? 'utf8' : 'gbk');
  writeFileWithRetryBuffer(filePath, buf);
}

function normalizeDateKey(s) {
  return formatCsvDate(String(s).trim());
}

function mapActiveRows(rows) {
  return rows.map((r) => ({
    date: normalizeDateKey(r.dt),
    line: `${normalizeDateKey(r.dt)},${Number(r.pv)},${Number(r.uv)}`
  }));
}

function mapPaidRows(rows) {
  return rows.map((r) => {
    const revenue = Math.round(Number(r.revenue));
    return {
      date: normalizeDateKey(r.dt),
      line: `${normalizeDateKey(r.dt)},${Number(r.paid_users)},${revenue}`
    };
  });
}

function mapUsageRows(rows) {
  return rows.map((r) => {
    const rate = Number(r.usage_rate);
    const rateStr = Number.isInteger(rate) ? String(rate) : String(rate);
    return {
      date: normalizeDateKey(r.date),
      line: `${normalizeDateKey(r.date)},${Number(r.active_users)},${Number(r.usage_users)},${rateStr}`
    };
  });
}

function upsertDailyCsv(fileKey, mappedRows) {
  const meta = FILES[fileKey];
  const filePath = path.join(BOARD_DIR, meta.name);
  let text = `${meta.header}\n`;
  let encoding = fileKey === 'active' ? 'utf8' : 'gbk';
  if (fs.existsSync(filePath)) {
    const read = readCsvText(filePath);
    text = read.text;
    encoding = read.encoding === 'utf8' ? 'utf8' : 'gbk';
  }
  text = text.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter((l, i) => (i === 0 ? true : l.trim() !== ''));
  if (!lines[0] || !lines[0].includes(meta.header.split(',')[0])) {
    lines.unshift(meta.header);
  }

  const indexByDate = new Map();
  for (let i = 1; i < lines.length; i++) {
    const datePart = lines[i].split(',')[0];
    if (datePart) indexByDate.set(normalizeDateKey(datePart), i);
  }

  let updated = 0;
  let appended = 0;
  for (const row of mappedRows) {
    const idx = indexByDate.get(row.date);
    if (idx != null) {
      lines[idx] = row.line;
      updated++;
    } else {
      lines.push(row.line);
      indexByDate.set(row.date, lines.length - 1);
      appended++;
    }
  }

  return {
    filePath,
    content: `${lines.join('\n')}\n`,
    encoding,
    updated,
    appended,
    preview: mappedRows.map((r) => r.line)
  };
}

function convertCsvToJs() {
  const conv = path.join(BOARD_DIR, 'convert_csv_to_js.cjs');
  if (!fs.existsSync(conv)) {
    console.warn(`未找到 ${conv}，跳过 data.js 转换`);
    return false;
  }
  console.log('\n>> 转换 CSV → data.js');
  const r = spawnSync(process.execPath, [conv], {
    encoding: 'utf8',
    cwd: BOARD_DIR
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) throw new Error(`convert_csv_to_js.cjs 失败 exit=${r.status}`);
  return true;
}

async function main() {
  const { dryRun, skipConvert, yw, only } = parseArgs(process.argv.slice(2));
  const target = yw ? parseYearWeek(yw) : prevCompleteWeek();
  const { year, week } = target;
  const { begin, end } = weekRange(year, week);

  if (begin < SQL_CUTOFF_DATE) {
    console.error(
      `目标周 ${year}年第${week}周（${begin}~${end}）早于 SQL 起点 ${SQL_CUTOFF_DATE}，历史趋势请勿用本脚本覆盖。`
    );
    process.exit(1);
  }

  for (const key of only) {
    if (!DAILY_TREND_SQL[key]) {
      console.error(`未知指标 --only=${key}，可选: active,paid,usage`);
      process.exit(1);
    }
  }

  console.log('========================================');
  console.log('  周度日度趋势 · 数仓更新');
  console.log(`  SQL 模板: ${path.relative(ROOT, SQL_PATH)}`);
  console.log(`  目标周次: ${year}年第${week}周（${begin} ~ ${end}）`);
  console.log(`  指标: ${only.join(', ')}`);
  if (dryRun) console.log('  模式: dry-run（不写文件）');
  console.log('========================================');

  if (!process.env.MCP_KEY && !process.env.X_MCP_KEY) {
    console.error('请先配置 MCP_KEY（与 Cursor mcp.json 的 X-MCP-Key 一致）');
    process.exit(1);
  }

  const payerInList = loadExcludedPayers();
  const vars = { begin, end, payerInList };
  const client = await createWarehouseClient();

  try {
    const results = {};

    if (only.includes('active')) {
      const meta = DAILY_TREND_SQL.active;
      const rows = await client.runSql(fillSql(meta.sql, vars), meta);
      results.active = mapActiveRows(rows);
      console.log('    预览:');
      results.active.forEach((r) => console.log(`      ${r.line}`));
    }

    if (only.includes('paid')) {
      const meta = DAILY_TREND_SQL.paid;
      const rows = await client.runSql(fillSql(meta.sql, vars), meta);
      results.paid = mapPaidRows(rows);
      console.log('    预览:');
      results.paid.forEach((r) => console.log(`      ${r.line}`));
    }

    if (only.includes('usage')) {
      const meta = DAILY_TREND_SQL.usage;
      const rows = await client.runSql(fillSql(meta.sql, vars), meta);
      results.usage = mapUsageRows(rows);
      console.log('    预览:');
      results.usage.forEach((r) => console.log(`      ${r.line}`));
    }

    if (dryRun) {
      console.log('\n[dry-run] 未写入 CSV');
      return;
    }

    console.log('\n>> 写入 CSV');
    for (const key of Object.keys(results)) {
      const out = upsertDailyCsv(key, results[key]);
      const outEnc = out.encoding === 'utf8' ? 'utf8' : 'gbk';
      try {
        writeCsvText(out.filePath, out.content, outEnc);
        console.log(
          `   ${FILES[key].name}: 更新 ${out.updated} / 追加 ${out.appended} → ${out.filePath}`
        );
      } catch (err) {
        const pendingDir = path.join(BOARD_DIR, 'config');
        fs.mkdirSync(pendingDir, { recursive: true });
        const pending = path.join(pendingDir, `${FILES[key].name}.pending-${begin}_${end}.csv`);
        writeCsvText(pending, out.content, outEnc);
        console.warn(`   [WARN] ${FILES[key].name} 被占用，已写 pending: ${pending}`);
      }
    }

    if (!skipConvert) convertCsvToJs();
    console.log('\n完成。周度核心表 / B 端未改动。');
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('\n[失败]', err.message || err);
  process.exit(1);
});
