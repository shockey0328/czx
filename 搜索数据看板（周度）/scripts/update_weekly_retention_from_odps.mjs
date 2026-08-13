/**
 * 从 MaxCompute 全量重算「搜索成功用户周留存」矩阵，覆写 搜索功能留存看板.csv。
 *
 * SQL：../sql/weekly_retention.mjs（buildRetentionSql）
 *
 * 用法：
 *   node .../update_weekly_retention_from_odps.mjs
 *   node .../update_weekly_retention_from_odps.mjs 2026-31
 *   node .../update_weekly_retention_from_odps.mjs --dry-run
 *   node .../update_weekly_retention_from_odps.mjs --skip-convert
 *
 * 自目标周结束日 ≥ 2026-07-30（第31周）起可写；
 * 每次按锚定日 2026-01-01 ~ 目标周结束 全量重算（未完整留存周为 null）。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { loadEnv } from '../../lib/loadEnv.js';
import { createWarehouseClient } from '../../lib/warehouseClient.js';
import { RETENTION_META, buildRetentionSql } from '../sql/weekly_retention.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARD_DIR = path.resolve(__dirname, '..');
const RETENTION_CSV = path.join(BOARD_DIR, '搜索功能留存看板.csv');
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
  const nextDate = new Date(year, 0, 1 + (week - 1) * 7 + 7);
  const iso = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };
  return { begin: iso(beginDate), end: iso(endDate), endNext: iso(nextDate) };
}

function toIsoDate(v) {
  const s = String(v ?? '').trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}

function normalizeCohortWeek(raw) {
  const s = String(raw ?? '').trim();
  const m = s.match(/(\d{4}-\d{2}-\d{2}).*?(\d{4}-\d{2}-\d{2})/);
  if (m) return `${m[1]} ~ ${m[2]}`;
  return s;
}

function formatRate(v) {
  if (v == null || v === '') return 'null';
  const s = String(v).trim();
  if (!s || s.toLowerCase() === 'null' || s === '\\N' || s === 'NULL') return 'null';
  const n = Number(s);
  if (!Number.isFinite(n)) return 'null';
  const r = Math.round(n * 100) / 100;
  if (Number.isInteger(r)) return String(r);
  return String(r);
}

function normalizeRows(rows) {
  const weekKeys = new Set();
  for (const r of rows) {
    Object.keys(r).forEach((k) => {
      if (/^week_\d+$/.test(k)) weekKeys.add(k);
    });
  }
  const sortedWeekKeys = [...weekKeys].sort(
    (a, b) => Number(a.slice(5)) - Number(b.slice(5))
  );

  const out = rows
    .map((r) => {
      const cohort_week = normalizeCohortWeek(r.cohort_week);
      const metric_period = String(r.metric_period || '').trim();
      const cohort_size = Number(r.cohort_size);
      if (!cohort_week || !Number.isFinite(cohort_size)) return null;
      const row = { cohort_week, metric_period, cohort_size };
      for (const k of sortedWeekKeys) row[k] = formatRate(r[k]);
      return row;
    })
    .filter(Boolean)
    .sort((a, b) => a.cohort_week.localeCompare(b.cohort_week));

  return { rows: out, weekKeys: sortedWeekKeys };
}

function writeRetentionCsv(rows, weekKeys) {
  const header = ['cohort_week', 'metric_period', 'cohort_size', ...weekKeys];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.cohort_week,
        r.metric_period,
        r.cohort_size,
        ...weekKeys.map((k) => r[k] ?? 'null')
      ].join(',')
    );
  }
  const content = `${lines.join('\n')}\n`;
  const tmp = `${RETENTION_CSV}.tmp.${process.pid}`;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, RETENTION_CSV);
  return RETENTION_CSV;
}

function rebuildCoreAssets() {
  const script = path.join(BOARD_DIR, 'convert_csv_to_js.js');
  if (!fs.existsSync(script)) {
    console.warn('未找到 convert_csv_to_js.js，跳过');
    return;
  }
  console.log('\n>> 重建 data/data-core.js（convert_csv_to_js）');
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

  if (range.end < SQL_CUTOFF_DATE) {
    console.error(
      `目标周结束日 ${range.end} 早于 ${SQL_CUTOFF_DATE}，留存更新自第31周起开放。`
    );
    process.exit(1);
  }

  const sql = buildRetentionSql({ endExclusive: range.endNext });

  console.log('========================================');
  console.log('  搜索看板 · 周留存数仓更新');
  console.log(
    `  目标周: ${target.year}年第${target.week}周（${range.begin} ~ ${range.end}）`
  );
  console.log(
    `  矩阵窗口: ${RETENTION_META.startDate} ≤ dt < ${range.endNext}（全量重算）`
  );
  if (dryRun) console.log('  模式: dry-run');
  console.log('========================================');

  if (!process.env.MCP_KEY && !process.env.X_MCP_KEY) {
    console.error('请配置 MCP_KEY');
    process.exit(1);
  }

  const client = await createWarehouseClient();

  try {
    const raw = await client.runSql(sql, { label: RETENTION_META.label });
    const { rows, weekKeys } = normalizeRows(raw);
    if (!rows.length) throw new Error('未返回留存数据');

    console.log(`\n  cohort 数: ${rows.length}，列: week_0..${weekKeys[weekKeys.length - 1]}`);
    const preview = [rows[0], rows[rows.length - 3], rows[rows.length - 2], rows[rows.length - 1]].filter(
      Boolean
    );
    preview.forEach((r) => {
      console.log(
        `    ${r.cohort_week}  size=${r.cohort_size}  w0=${r.week_0} w1=${r.week_1 ?? 'null'} w2=${r.week_2 ?? 'null'}  [${r.metric_period}]`
      );
    });

    if (dryRun) {
      console.log('\n[dry-run] 未写入 CSV');
      return;
    }

    writeRetentionCsv(rows, weekKeys);
    console.log(`\n  已覆写 搜索功能留存看板.csv（${rows.length} 行）`);

    if (!skipConvert) rebuildCoreAssets();
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
