/**
 * 从 MaxCompute 拉取「上一完整自然周」每日搜索转化率，
 * 追加/更新 搜索次数转化率.csv、搜索用户转化率.csv，并重建 data-core。
 *
 * SQL：../sql/daily_conversion.mjs
 *
 * 用法：
 *   node .../update_daily_conversion_from_odps.mjs
 *   node .../update_daily_conversion_from_odps.mjs 2026-31
 *   node .../update_daily_conversion_from_odps.mjs --dry-run
 *   node .../update_daily_conversion_from_odps.mjs --skip-convert
 *
 * 自 2026-07-30（第31周）起可写；此前历史冻结。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { loadEnv } from '../../lib/loadEnv.js';
import { createWarehouseClient } from '../../lib/warehouseClient.js';
import { DAILY_CONVERSION_SQL } from '../sql/daily_conversion.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARD_DIR = path.resolve(__dirname, '..');
const SQL_CUTOFF_DATE = '2026-07-30';
const HEADER = '日期,搜索次数,搜索点击次数,搜索点击转化率';

const FILES = {
  count: path.join(BOARD_DIR, '搜索次数转化率.csv'),
  user: path.join(BOARD_DIR, '搜索用户转化率.csv')
};

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

/** CSV 历史格式：2026/7/29（月日不补零） */
function toSlashDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return `${y}/${m}/${d}`;
}

function fillSql(template, vars) {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => {
    if (vars[key] == null) throw new Error(`缺少 \${${key}}`);
    return String(vars[key]);
  });
}

function normalizeRate(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '0';
  // 去掉多余尾零感：与历史一致保留最多 2 位
  const r = Math.round(n * 100) / 100;
  return String(r);
}

function normalizeRows(rows) {
  return rows
    .map((r) => {
      const dtIso = String(r.dt || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dtIso)) return null;
      return {
        dtIso,
        dateSlash: toSlashDate(dtIso),
        total_searches: Number(r.total_searches),
        success_searches: Number(r.success_searches),
        success_rate_by_search: normalizeRate(r.success_rate_by_search),
        total_users: Number(r.total_users),
        success_users: Number(r.success_users),
        success_rate_by_user: normalizeRate(r.success_rate_by_user)
      };
    })
    .filter(
      (r) =>
        r &&
        Number.isFinite(r.total_searches) &&
        Number.isFinite(r.success_searches) &&
        Number.isFinite(r.total_users) &&
        Number.isFinite(r.success_users)
    )
    .sort((a, b) => a.dtIso.localeCompare(b.dtIso));
}

function dateKeyFromLine(line) {
  const m = String(line).match(/^(\d{4}\/\d{1,2}\/\d{1,2}),/);
  return m ? m[1] : null;
}

function parseSlashDate(s) {
  const m = String(s).match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function upsertDailyCsv(filePath, newRows, pickLine) {
  const dateSet = new Set(newRows.map((r) => r.dateSlash));
  let lines = [HEADER];
  if (fs.existsSync(filePath)) {
    const text = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    lines = text
      .split(/\r?\n/)
      .filter((l, i) => (i === 0 ? true : l.trim() !== ''));
    if (!lines[0] || !lines[0].includes('日期')) lines.unshift(HEADER);
  }
  const kept = [lines[0]];
  let removed = 0;
  for (let i = 1; i < lines.length; i++) {
    const dk = dateKeyFromLine(lines[i]);
    if (dk && dateSet.has(dk)) {
      removed++;
      continue;
    }
    kept.push(lines[i]);
  }
  for (const r of newRows) kept.push(pickLine(r));

  const header = kept[0];
  const body = kept.slice(1).sort((a, b) => {
    const da = parseSlashDate(dateKeyFromLine(a) || '');
    const db = parseSlashDate(dateKeyFromLine(b) || '');
    if (!da || !db) return String(a).localeCompare(String(b));
    return da - db;
  });
  const content = `${[header, ...body].join('\n')}\n`;
  const tmp = `${filePath}.tmp.${process.pid}`;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
  return { removed, added: newRows.length, path: filePath };
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

  if (range.begin < SQL_CUTOFF_DATE) {
    console.error(
      `目标周 ${range.begin}~${range.end} 早于 ${SQL_CUTOFF_DATE}，日度转化率历史已冻结。`
    );
    process.exit(1);
  }

  console.log('========================================');
  console.log('  搜索看板 · 每日转化率数仓更新');
  console.log(
    `  目标: ${target.year}年第${target.week}周（${range.begin} ~ ${range.end}）`
  );
  if (dryRun) console.log('  模式: dry-run');
  console.log('========================================');

  if (!process.env.MCP_KEY && !process.env.X_MCP_KEY) {
    console.error('请配置 MCP_KEY');
    process.exit(1);
  }

  const client = await createWarehouseClient();

  try {
    const sql = fillSql(DAILY_CONVERSION_SQL.sql, {
      begin: range.begin,
      end: range.end
    });
    const rows = normalizeRows(
      await client.runSql(sql, { label: DAILY_CONVERSION_SQL.label })
    );
    if (!rows.length) throw new Error('未返回日度转化率数据');

    console.log('\n  预览:');
    rows.forEach((r) => {
      console.log(
        `    ${r.dateSlash}  次数 ${r.total_searches}/${r.success_searches} (${r.success_rate_by_search}%)  用户 ${r.total_users}/${r.success_users} (${r.success_rate_by_user}%)`
      );
    });

    if (dryRun) {
      console.log('\n[dry-run] 未写入 CSV');
      return;
    }

    const countOut = upsertDailyCsv(FILES.count, rows, (r) =>
      [r.dateSlash, r.total_searches, r.success_searches, r.success_rate_by_search].join(',')
    );
    const userOut = upsertDailyCsv(FILES.user, rows, (r) =>
      [r.dateSlash, r.total_users, r.success_users, r.success_rate_by_user].join(',')
    );
    console.log(
      `\n  写入 搜索次数转化率.csv（删旧 ${countOut.removed} / 新写 ${countOut.added}）`
    );
    console.log(
      `  写入 搜索用户转化率.csv（删旧 ${userOut.removed} / 新写 ${userOut.added}）`
    );

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
