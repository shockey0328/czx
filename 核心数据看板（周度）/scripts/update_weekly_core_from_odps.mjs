/**
 * 从 MaxCompute 拉取「上一完整自然周」周度核心指标，并同步写入去年同周序号。
 * SQL 口径见 ../sql/weekly_core_metrics.mjs（改口径只改该文件）。
 *
 * 用法：
 *   node 核心数据看板（周度）/scripts/update_weekly_core_from_odps.mjs
 *   node 核心数据看板（周度）/scripts/update_weekly_core_from_odps.mjs 2026-31
 *   node 核心数据看板（周度）/scripts/update_weekly_core_from_odps.mjs --dry-run
 *   node 核心数据看板（周度）/scripts/update_weekly_core_from_odps.mjs 2026-31 --skip-yoy
 *
 * 依赖：MCP_KEY（与 Cursor mcp.json 的 X-MCP-Key 一致）
 * 自 2026 年第 31 周起走 SQL；第 30 周及以前冻结不覆盖。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { spawnSync } from 'child_process';
import { loadEnv } from '../../lib/loadEnv.js';
import { McpHttpClient, sleep } from '../../lib/mcpHttpClient.js';
import { METRIC_SQL } from '../sql/weekly_core_metrics.mjs';

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
const CSV_NAME = '周度核心数据_utf8.csv';
const CSV_PATH = path.join(BOARD_DIR, CSV_NAME);
const SQL_PATH = path.join(BOARD_DIR, 'sql', 'weekly_core_metrics.mjs');

const MONTHLY_PAYER_CFG = path.join(ROOT, '核心数据看板（月度）', 'config', 'excluded_payer_ids.txt');
const WEEKLY_PAYER_CFG = path.join(BOARD_DIR, 'config', 'excluded_payer_ids.txt');

/** 从此周起走 SQL（含该周）；此前历史冻结 */
const SQL_CUTOFF = { year: 2026, week: 31 };

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const skipConvert = argv.includes('--skip-convert');
  const skipYoy = argv.includes('--skip-yoy');
  const yw = argv.find((a) => /^\d{4}-W?\d{1,2}$/i.test(a));
  return { dryRun, skipConvert, skipYoy, yw };
}

function parseYearWeek(yw) {
  const m = String(yw).match(/^(\d{4})-W?(\d{1,2})$/i);
  if (!m) throw new Error(`无法解析周次参数: ${yw}（期望如 2026-31 或 2026-W31）`);
  return { year: Number(m[1]), week: Number(m[2]) };
}

function weekOfYear(date) {
  const y = date.getFullYear();
  const jan1 = new Date(y, 0, 1);
  const today = new Date(y, date.getMonth(), date.getDate());
  const dayIndex = Math.floor((today - jan1) / 86400000);
  return { year: y, week: Math.floor(dayIndex / 7) + 1 };
}

/** 上一完整自然周（与月度「上一自然月」对称：当前周序号 - 1） */
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
  const cn = (d) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  return {
    begin: fmt(beginDate),
    end: fmt(endDate),
    beginLabel: cn(beginDate),
    endLabel: cn(endDate),
    beginDate,
    endDate
  };
}

function shiftWeek(year, week, delta) {
  const d = new Date(year, 0, 1 + (week - 1) * 7 + delta * 7);
  return weekOfYear(d);
}

function csvYearLabel(year) {
  return `${year}年`;
}

function csvWeekLabel(week) {
  return `第${week}周`;
}

function isBeforeCutoff(year, week) {
  return year < SQL_CUTOFF.year || (year === SQL_CUTOFF.year && week < SQL_CUTOFF.week);
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

function buildSqls(vars) {
  const out = {};
  for (const [key, meta] of Object.entries(METRIC_SQL)) {
    out[key] = {
      label: meta.label,
      maxCU: meta.maxCU,
      waitMs: meta.waitMs,
      sql: fillSql(meta.sql, vars)
    };
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

async function fetchWeekMetrics(client, year, week, payerInList) {
  const range = weekRange(year, week);
  const prev = shiftWeek(year, week, -1);
  const prevRange = weekRange(prev.year, prev.week);
  const sqls = buildSqls({
    begin: range.begin,
    end: range.end,
    prevBegin: prevRange.begin,
    prevEnd: prevRange.end,
    payerInList
  });

  console.log(
    `\n-- ${csvYearLabel(year)}${csvWeekLabel(week)}（${range.begin} ~ ${range.end}）`
  );
  console.log(
    `   留存对照: ${csvYearLabel(prev.year)}${csvWeekLabel(prev.week)} → 当周`
  );

  const activeRow = await runOdpsSql(client, sqls.activeUsers.sql, sqls.activeUsers);
  const activeUsers = Number(activeRow.uv);
  console.log(`    活跃用户 = ${activeUsers}`);

  const newRow = await runOdpsSql(client, sqls.newUsers.sql, sqls.newUsers);
  const newUsers = Number(newRow.new_user_cnt);
  console.log(`    新用户 = ${newUsers}`);

  const retRow = await runOdpsSql(client, sqls.retention.sql, sqls.retention);
  const retention = pctFromRatio(retRow.retention_rate);
  console.log(
    `    次周留存率 = ${retention}（上期活跃 ${retRow.active_users} / 留存 ${retRow.retained_users}）`
  );

  const revRow = await runOdpsSql(client, sqls.revenue.sql, sqls.revenue);
  const revenue = Math.round(Number(revRow.revenue));
  const arpu = fmtArpu(revenue / activeUsers);
  console.log(`    营收=${revenue} ARPU=${arpu}（订单 ${revRow.order_cnt}，不写入 CSV）`);

  const depthRow = await runOdpsSql(client, sqls.depth.sql, sqls.depth);
  const depthUv = Number(depthRow.uv);
  const depthRate = pctFromRatio(depthUv / activeUsers);
  console.log(`    深度访问率 = ${depthRate}（详情 UV ${depthUv}）`);

  const usageRow = await runOdpsSql(client, sqls.usage.sql, sqls.usage);
  const usageUsers = Number(usageRow.user_count);
  const usageRate = pctFromRatio(usageUsers / activeUsers);
  console.log(`    使用率 = ${usageRate}（使用用户 ${usageUsers}）`);

  const vipRow = await runOdpsSql(client, sqls.vip.sql, sqls.vip);
  const vipRate = pctFromPercentNumber(vipRow.active_rate);
  console.log(
    `    大会员活跃率 = ${vipRate}（会员 ${vipRow.member_cnt} / 到访 ${vipRow.visit_cnt}）`
  );

  return {
    year,
    week,
    beginLabel: range.beginLabel,
    endLabel: range.endLabel,
    activeUsers,
    newUsers,
    retention,
    revenue,
    arpu,
    depthRate,
    usageRate,
    vipRate
  };
}

function detectCsvEncoding(buf) {
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return 'utf8';
  }
  try {
    const gbk = iconv.decode(buf, 'gbk');
    if (/[年月日周活跃用户]/.test(gbk)) return 'gbk';
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

const CSV_HEADER =
  '年份,周数,起始日期,结尾日期,活跃用户,新用户,次周留存率,营收,ARPU,深度访问率,使用率,大会员活跃率';

function upsertCsvRows(valuesList) {
  let text = `${CSV_HEADER}\n`;
  let encoding = 'gbk';
  if (fs.existsSync(CSV_PATH)) {
    const read = readCsvText(CSV_PATH);
    text = read.text;
    encoding = read.encoding === 'utf8' ? 'utf8' : 'gbk';
  }
  text = text.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter((l, i) => (i === 0 ? true : l.trim() !== ''));
  if (!lines[0] || !lines[0].includes('年份')) {
    lines.unshift(CSV_HEADER);
  }

  const actions = [];
  for (const v of valuesList) {
    const yearLabel = csvYearLabel(v.year);
    const weekLabel = csvWeekLabel(v.week);
    const row = [
      yearLabel,
      weekLabel,
      v.beginLabel,
      v.endLabel,
      v.activeUsers,
      v.newUsers,
      v.retention,
      v.revenue,
      v.arpu,
      v.depthRate,
      v.usageRate,
      v.vipRate
    ].join(',');

    const key = `${yearLabel},${weekLabel},`;
    let replaced = false;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].startsWith(key)) {
        lines[i] = row;
        replaced = true;
        break;
      }
    }
    if (!replaced) lines.push(row);
    actions.push({ yearLabel, weekLabel, action: replaced ? 'updated' : 'appended', row });
  }

  return { content: `${lines.join('\n')}\n`, encoding, actions };
}

function writeCsvOutputs(valuesList) {
  const { content, encoding, actions } = upsertCsvRows(valuesList);
  const outEnc = encoding === 'utf8' ? 'utf8' : 'gbk';
  const written = [];
  const failed = [];

  try {
    writeCsvText(CSV_PATH, content, outEnc);
    written.push(CSV_PATH);
  } catch (err) {
    failed.push(`${CSV_PATH} (${err.code || err.message})`);
    const pendingDir = path.join(BOARD_DIR, 'config');
    fs.mkdirSync(pendingDir, { recursive: true });
    const tag = valuesList.map((v) => `${v.year}W${v.week}`).join('_');
    const pending = path.join(pendingDir, `周度核心数据.pending-${tag}.csv`);
    writeCsvText(pending, content, outEnc);
    written.push(pending);
    console.warn(
      `  [WARN] 主 CSV 被占用（请关闭 WPS/Excel 后，用 config 下 pending 文件覆盖 ${CSV_NAME}）\n         ${pending}`
    );
  }

  return { written, failed, actions };
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
  const { dryRun, skipConvert, skipYoy, yw } = parseArgs(process.argv.slice(2));
  const target = yw ? parseYearWeek(yw) : prevCompleteWeek();
  const { year, week } = target;

  if (isBeforeCutoff(year, week)) {
    console.error(
      `目标 ${year}年第${week}周 早于 SQL 起点 ${SQL_CUTOFF.year}年第${SQL_CUTOFF.week}周，历史数据请勿用本脚本覆盖。`
    );
    process.exit(1);
  }

  const range = weekRange(year, week);
  const yoy = { year: year - 1, week };

  console.log('========================================');
  console.log('  周度核心数据 · MaxCompute 更新');
  console.log(`  SQL 模板: ${path.relative(ROOT, SQL_PATH)}`);
  console.log(
    `  目标周次: ${csvYearLabel(year)}${csvWeekLabel(week)}（${range.begin} ~ ${range.end}）`
  );
  if (!skipYoy) {
    const yoyRange = weekRange(yoy.year, yoy.week);
    console.log(
      `  去年同期: ${csvYearLabel(yoy.year)}${csvWeekLabel(yoy.week)}（${yoyRange.begin} ~ ${yoyRange.end}）`
    );
  } else {
    console.log('  去年同期: 跳过（--skip-yoy）');
  }
  if (dryRun) console.log('  模式: dry-run（不写文件）');
  console.log('========================================');

  if (!process.env.MCP_KEY && !process.env.X_MCP_KEY) {
    console.error('请先配置 MCP_KEY（与 Cursor mcp.json 的 X-MCP-Key 一致）');
    console.error('可写入仓库根 .env、用户行为看板（周度）/.env 或 核心数据看板（周度）/.env');
    process.exit(1);
  }

  const payerInList = loadExcludedPayers();
  const client = new McpHttpClient({
    url: process.env.MAXCOMPUTE_MCP_URL || 'https://test-dmp-mcp.xkw.com/maxcompute-mcp',
    apiKey: process.env.MCP_KEY || process.env.X_MCP_KEY
  });

  await client.initialize();
  try {
    const current = await fetchWeekMetrics(client, year, week, payerInList);
    const rows = [current];

    if (!skipYoy) {
      const yoyValues = await fetchWeekMetrics(client, yoy.year, yoy.week, payerInList);
      rows.push(yoyValues);
    }

    console.log('\n>> 目标行预览:');
    for (const v of rows) {
      console.log(
        `${csvYearLabel(v.year)},${csvWeekLabel(v.week)},${v.beginLabel},${v.endLabel},${v.activeUsers},${v.newUsers},${v.retention},${v.revenue},${v.arpu},${v.depthRate},${v.usageRate},${v.vipRate}`
      );
    }

    if (dryRun) {
      console.log('\n[dry-run] 未写入 CSV');
      return;
    }

    const { written, failed, actions } = writeCsvOutputs(rows);
    console.log('\n>> CSV 写入结果:');
    actions.forEach((a) =>
      console.log(`   ${a.yearLabel}${a.weekLabel}: ${a.action === 'updated' ? '更新' : '追加'}`)
    );
    written.forEach((p) => console.log(`   写入: ${p}`));
    if (failed.length) failed.forEach((p) => console.warn(`   失败: ${p}`));

    if (!skipConvert) convertCsvToJs();

    console.log('\n完成。B 端与日度趋势 CSV 未改动。');
    if (failed.some((f) => f.includes(CSV_PATH))) {
      console.log('注意：请关闭占用 CSV 的 WPS/Excel，再把 config 下 pending 文件覆盖到主 CSV。');
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('\n[失败]', err.message || err);
  process.exit(1);
});
