/**
 * 从 MaxCompute 拉取「上一完整自然周」用户增长·周度核心，追加/更新到 normalized CSV。
 * SQL：../sql/weekly_user_core.mjs
 *
 * 规则：
 * - 自 2026 年第 31 周起可写；更早周次冻结
 * - 只写目标年（通常 2026）当周；已有 2025 同期行不覆盖、不重拉
 * - 累计用户 = CSV 中上一周累计 + 本周新增
 *
 * 用法：
 *   node 用户增长数据看板（周度）/scripts/update_weekly_user_core_from_odps.mjs
 *   node 用户增长数据看板（周度）/scripts/update_weekly_user_core_from_odps.mjs 2026-31
 *   node 用户增长数据看板（周度）/scripts/update_weekly_user_core_from_odps.mjs --dry-run
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { loadEnv } from '../../lib/loadEnv.js';
import { createWarehouseClient } from '../../lib/warehouseClient.js';
import { WEEKLY_USER_CORE_SQL } from '../sql/weekly_user_core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARD_DIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(BOARD_DIR, '..');
const CSV_PATH = path.join(BOARD_DIR, '周度用户核心数据.normalized.csv');
const RAW_CSV_PATH = path.join(BOARD_DIR, '周度用户核心数据.csv');
const SQL_PATH = path.join(BOARD_DIR, 'sql', 'weekly_user_core.mjs');

const SQL_CUTOFF = { year: 2026, week: 31 };

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

function shiftWeek(year, week, delta) {
  const d = new Date(year, 0, 1 + (week - 1) * 7 + delta * 7);
  return weekOfYear(d);
}

function weekRange(year, week) {
  const beginDate = new Date(year, 0, 1 + (week - 1) * 7);
  const endDate = new Date(year, 0, 1 + (week - 1) * 7 + 6);
  const iso = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };
  const slash = (d) => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  return {
    begin: iso(beginDate),
    end: iso(endDate),
    beginSlash: slash(beginDate),
    endSlash: slash(endDate),
    rangeLabel: `${iso(beginDate)} ~ ${iso(endDate)}`
  };
}

function isBeforeCutoff(year, week) {
  return year < SQL_CUTOFF.year || (year === SQL_CUTOFF.year && week < SQL_CUTOFF.week);
}

function fillSql(template, vars) {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => {
    if (vars[key] == null) throw new Error(`缺少占位符 \${${key}}`);
    return String(vars[key]);
  });
}

function readCoreCsv() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`找不到 ${CSV_PATH}`);
  }
  const text = fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter((l, i) => (i === 0 ? true : l.trim() !== ''));
  return { text, lines };
}

function findPrevCumulative(lines, year, week) {
  const prev = shiftWeek(year, week, -1);
  // 同行年上一周；跨年时取上年最后一周
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const w = Number(cols[0]);
    const start = cols[1] || '';
    const y = Number(String(start).split(/[\/\-]/)[0]);
    if (y === prev.year && w === prev.week) {
      const cum = Number(cols[9]);
      if (!Number.isFinite(cum)) throw new Error(`上一周累计用户无效: ${lines[i]}`);
      return cum;
    }
  }
  throw new Error(
    `CSV 中找不到上一周累计：${prev.year}年第${prev.week}周（写第${week}周需要它）`
  );
}

function formatShare(newUv, activeUv) {
  if (!activeUv) return '0.00%';
  return `${((newUv * 100) / activeUv).toFixed(2)}%`;
}

function formatRetention(retained, prevNew) {
  if (!prevNew) return '';
  return `${Math.round((retained * 100) / prevNew)}%`;
}

function upsertCoreRow(lines, rowLine, weekNo, beginSlash) {
  const year = Number(String(beginSlash).split(/[\/\-]/)[0]);
  let replaced = false;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const w = Number(cols[0]);
    const y = Number(String(cols[1] || '').split(/[\/\-]/)[0]);
    if (y === year && w === weekNo) {
      // 冻结：不允许覆盖 cutoff 之前；调用方已保证
      lines[i] = rowLine;
      replaced = true;
      break;
    }
  }
  if (!replaced) lines.push(rowLine);
  return replaced ? 'updated' : 'appended';
}

function rebuildEmbedded() {
  const script = path.join(BOARD_DIR, 'build-embedded-b64.js');
  if (!fs.existsSync(script)) {
    console.warn('未找到 build-embedded-b64.js，跳过内嵌生成');
    return;
  }
  console.log('\n>> 重建 embedded-csv-b64.js');
  const r = spawnSync(process.execPath, [script], {
    cwd: BOARD_DIR,
    encoding: 'utf8'
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) throw new Error(`build-embedded-b64.js 失败 exit=${r.status}`);
}

async function main() {
  const { dryRun, skipEmbed, yw } = parseArgs(process.argv.slice(2));
  const target = yw ? parseYearWeek(yw) : prevCompleteWeek();
  const { year, week } = target;

  if (isBeforeCutoff(year, week)) {
    console.error(
      `目标 ${year}年第${week}周 早于 SQL 起点 ${SQL_CUTOFF.year}年第${SQL_CUTOFF.week}周，历史已冻结。`
    );
    process.exit(1);
  }

  // 明确：不同步覆盖 2025；若误传 2025 且该周已存在则拒绝
  if (year < SQL_CUTOFF.year) {
    console.error('已有 2025 及更早同期数据冻结，请勿用本脚本覆盖。');
    process.exit(1);
  }

  const range = weekRange(year, week);
  const prev = shiftWeek(year, week, -1);
  const prevRange = weekRange(prev.year, prev.week);

  console.log('========================================');
  console.log('  用户增长 · 周度核心数仓更新');
  console.log(`  SQL: ${path.relative(ROOT, SQL_PATH)}`);
  console.log(
    `  目标: ${year}年第${week}周（${range.begin} ~ ${range.end}）`
  );
  console.log(
    `  留存对照: ${prev.year}年第${prev.week}周新增 → 本周活跃`
  );
  console.log('  2025 同期: 不覆盖（沿用 CSV 已有行）');
  if (dryRun) console.log('  模式: dry-run');
  console.log('========================================');

  if (!process.env.MCP_KEY && !process.env.X_MCP_KEY) {
    console.error('请配置 MCP_KEY');
    process.exit(1);
  }

  const { lines } = readCoreCsv();
  const prevCum = findPrevCumulative(lines, year, week);
  console.log(`  上一周累计用户 = ${prevCum}`);

  const vars = {
    begin: range.begin,
    end: range.end,
    prevBegin: prevRange.begin,
    prevEnd: prevRange.end
  };

  const client = await createWarehouseClient();

  try {
    const anMeta = WEEKLY_USER_CORE_SQL.activeNew;
    const anRows = await client.runSql(fillSql(anMeta.sql, vars), { label: anMeta.label });
    const an = anRows[0];
    const activeUv = Number(an.active_uv);
    const newUv = Number(an.new_uv);
    const oldUv = activeUv - newUv;
    const share = formatShare(newUv, activeUv);
    console.log(`    活跃=${activeUv} 新增=${newUv} 老用户=${oldUv} 占比=${share}`);

    const retMeta = WEEKLY_USER_CORE_SQL.newUserRetention;
    const retRows = await client.runSql(fillSql(retMeta.sql, vars), { label: retMeta.label });
    const ret = retRows[0];
    const prevNew = Number(ret.prev_week_new_uv);
    const retained = Number(ret.retained_uv);
    const retention = formatRetention(retained, prevNew);
    console.log(
      `    新用户次周留存=${retention || '—'}（上期新增 ${prevNew} / 留存 ${retained}）`
    );

    const cum = prevCum + newUv;
    console.log(`    累计用户=${cum}（${prevCum} + ${newUv}）`);

    const rowLine = [
      week,
      range.beginSlash,
      range.endSlash,
      range.rangeLabel,
      activeUv,
      newUv,
      oldUv,
      share,
      retention,
      cum
    ].join(',');

    console.log('\n>> 目标行预览:');
    console.log(rowLine);

    if (dryRun) {
      console.log('\n[dry-run] 未写入 CSV');
      return;
    }

    const header =
      '第n周,周开始日期,周结束日期,周区间,活跃用户,新增用户,老用户,新增用户占比,新用户次周留存,累计用户';
    if (!lines[0] || !lines[0].includes('第n周')) lines.unshift(header);
    const action = upsertCoreRow(lines, rowLine, week, range.beginSlash);
    const out = `${lines.join('\n')}\n`;
    fs.writeFileSync(CSV_PATH, out, 'utf8');
    console.log(`\n>> 已${action === 'updated' ? '更新' : '追加'} ${CSV_PATH}`);

    // 若存在 raw，同步一份，便于后续 build 脚本
    try {
      fs.writeFileSync(RAW_CSV_PATH, out, 'utf8');
      console.log(`   同步 ${RAW_CSV_PATH}`);
    } catch {
      /* ignore */
    }

    if (!skipEmbed) rebuildEmbedded();
    console.log('\n完成。日度 / 渠道表未改动。');
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('\n[失败]', err.message || err);
  process.exit(1);
});
