/**
 * 拉取上一完整自然周的日度活跃/新老用户，追加到
 * 每天的活跃用户及新老用户.normalized.csv
 *
 * SQL：../sql/daily_active_new_old.mjs
 * 自 2026-07-30（第31周）起追加；此前冻结。2025 日数据不覆盖。
 *
 * 用法：
 *   node .../update_daily_active_new_old_from_odps.mjs
 *   node .../update_daily_active_new_old_from_odps.mjs 2026-31
 *   node .../update_daily_active_new_old_from_odps.mjs --dry-run
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { loadEnv } from '../../lib/loadEnv.js';
import { McpHttpClient, sleep } from '../../lib/mcpHttpClient.js';
import { DAILY_ACTIVE_NEW_OLD_SQL } from '../sql/daily_active_new_old.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARD_DIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(BOARD_DIR, '..');
const CSV_PATH = path.join(BOARD_DIR, '每天的活跃用户及新老用户.normalized.csv');
const RAW_CSV_PATH = path.join(BOARD_DIR, '每天的活跃用户及新老用户.csv');
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
  const skipEmbed = argv.includes('--skip-embed');
  const yw = argv.find((a) => /^\d{4}-W?\d{1,2}$/i.test(a));
  return { dryRun, skipEmbed, yw };
}

function parseYearWeek(yw) {
  const m = String(yw).match(/^(\d{4})-W?(\d{1,2})$/i);
  if (!m) throw new Error(`无法解析周次: ${yw}`);
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
  const iso = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };
  return { begin: iso(beginDate), end: iso(endDate) };
}

function formatCsvDate(isoOrDate) {
  const s = String(isoOrDate).slice(0, 10).replace(/-/g, '/');
  const [y, m, d] = s.split('/');
  return `${Number(y)}/${Number(m)}/${Number(d)}`;
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
    throw new Error(`CU 超限 estimated=${submitBody.estimatedCU}`);
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
    console.log(`完成 (${Math.round((Date.now() - t0) / 1000)}s, ${rows.length} 行)`);
    return rows;
  }
  throw new Error(`[${label}] 超时 instanceId=${instanceId}`);
}

function formatRate(newUv, activeUv) {
  if (!activeUv) return '0%';
  const pct = Math.round((newUv * 100) / activeUv);
  return `${pct}%`;
}

function mapRows(rows) {
  return rows.map((r) => {
    const active = Number(r.active_uv);
    const news = Number(r.new_uv);
    const old = Number(r.old_uv);
    const dt = formatCsvDate(r.dt);
    return {
      date: dt,
      line: `${dt},${active},${news},${old},${formatRate(news, active)}`
    };
  });
}

function upsertDailyCsv(mapped) {
  const header = 'dt,active_uv,new_uv,old_uv,new_user_rate';
  let lines = [header];
  if (fs.existsSync(CSV_PATH)) {
    const text = fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, '');
    lines = text.split(/\r?\n/).filter((l, i) => (i === 0 ? true : l.trim() !== ''));
    if (!lines[0] || !lines[0].includes('dt')) lines.unshift(header);
  }
  const indexByDate = new Map();
  for (let i = 1; i < lines.length; i++) {
    const d = formatCsvDate(lines[i].split(',')[0]);
    indexByDate.set(d, i);
  }
  let updated = 0;
  let appended = 0;
  for (const row of mapped) {
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
  return { content: `${lines.join('\n')}\n`, updated, appended };
}

function rebuildEmbedded() {
  const script = path.join(BOARD_DIR, 'build-embedded-b64.js');
  if (!fs.existsSync(script)) {
    console.warn('未找到 build-embedded-b64.js，跳过');
    return;
  }
  console.log('\n>> 重建 embedded-csv-b64.js');
  const r = spawnSync(process.execPath, [script], { cwd: BOARD_DIR, encoding: 'utf8' });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) throw new Error(`build-embedded-b64 失败 exit=${r.status}`);
}

async function main() {
  const { dryRun, skipEmbed, yw } = parseArgs(process.argv.slice(2));
  const target = yw ? parseYearWeek(yw) : prevCompleteWeek();
  const { begin, end } = weekRange(target.year, target.week);

  if (begin < SQL_CUTOFF_DATE) {
    console.error(`目标周 ${begin}~${end} 早于 ${SQL_CUTOFF_DATE}，历史日度已冻结。`);
    process.exit(1);
  }

  console.log('========================================');
  console.log('  用户增长 · 日度新老用户 MaxCompute 更新');
  console.log(`  目标周: ${target.year}年第${target.week}周（${begin} ~ ${end}）`);
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
    const meta = DAILY_ACTIVE_NEW_OLD_SQL;
    const rows = await runOdpsSql(
      client,
      fillSql(meta.sql, { begin, end }),
      meta
    );
    const mapped = mapRows(rows);
    console.log('    预览:');
    mapped.forEach((r) => console.log(`      ${r.line}`));

    if (dryRun) {
      console.log('\n[dry-run] 未写入 CSV');
      return;
    }

    const { content, updated, appended } = upsertDailyCsv(mapped);
    fs.writeFileSync(CSV_PATH, content, 'utf8');
    console.log(`\n>> 写入 ${CSV_PATH}（更新 ${updated} / 追加 ${appended}）`);
    try {
      fs.writeFileSync(RAW_CSV_PATH, content, 'utf8');
    } catch {
      /* ignore */
    }
    if (!skipEmbed) rebuildEmbedded();
    console.log('\n完成。');
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('\n[失败]', err.message || err);
  process.exit(1);
});
