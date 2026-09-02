/**
 * 从 MaxCompute 拉取「上一自然月」各模块渗透率，写入 各模块渗透率.csv 并转 data.js
 *
 * 用法（仓库根或本看板目录）：
 *   node 各模块渗透率看板（月度）/scripts/update_penetration_from_odps.mjs
 *   node 各模块渗透率看板（月度）/scripts/update_penetration_from_odps.mjs 2026-07
 *
 * 26年7月起走 SQL；历史月份列不改。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { spawnSync } from 'child_process';
import { loadEnv } from '../../lib/loadEnv.js';
import { createWarehouseClient } from '../../lib/warehouseClient.js';

loadEnv();
{
  const localEnv = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARD_DIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(BOARD_DIR, '..');
const CSV_PATH = path.join(BOARD_DIR, '各模块渗透率.csv');
const SQL_CUTOFF = { year: 2026, month: 7 };
const MONTH_COL_RE = /^(\d{4})年(\d{1,2})月$/;

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    skipConvert: argv.includes('--skip-convert'),
    ym: argv.find((a) => /^\d{4}-\d{1,2}$/.test(a))
  };
}

function prevCalendarMonth(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
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

function fullMonthLabel(year, month) {
  return `${year}年${month}月`;
}

const require = createRequire(import.meta.url);
function loadIconv() {
  const candidates = [
    path.join(ROOT, '搜索数据看板（周度）', 'node_modules', 'iconv-lite'),
    path.join(ROOT, '用户增长数据看板（周度）', 'node_modules', 'iconv-lite')
  ];
  for (const p of candidates) {
    try {
      return require(p);
    } catch {
      /* next */
    }
  }
  return null;
}
const iconv = loadIconv();

function readCsvFile(filePath) {
  const buf = fs.readFileSync(filePath);
  let encoding = 'gbk';
  let text;
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    text = buf.toString('utf8').replace(/^\uFEFF/, '');
    encoding = 'utf8';
  } else if (iconv) {
    const gbk = iconv.decode(buf, 'gbk');
    if (gbk.includes('一级模块') || gbk.includes('二级模块')) {
      text = gbk;
      encoding = 'gbk';
    } else {
      text = buf.toString('utf8');
      encoding = 'utf8';
    }
  } else {
    text = buf.toString('utf8');
    encoding = 'utf8';
  }
  return { text, encoding };
}

function writeCsvFile(filePath, text, encoding) {
  const body = text.replace(/^\uFEFF/, '');
  if (encoding === 'gbk' && iconv) {
    fs.writeFileSync(filePath, iconv.encode(body, 'gbk'));
  } else {
    fs.writeFileSync(filePath, body, 'utf8');
  }
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

function buildPenetrationSql(begin, end) {
  return `
WITH module_uv AS (
    SELECT
        SUBSTR(dt, 1, 7) AS month,
        module_name,
        COUNT(DISTINCT user_id) AS module_user_count
    FROM (
        SELECT
            dt,
            user_id,
            CASE
                WHEN request_url = 'https://c.xkw.com/paper-list?paperType=zk'
                  OR request_url = 'https://c.xkw.com/paper-list?paperType=gk'
                  OR request_url = 'https://c.zxxk.com/paper-list?paperType=zk'
                  OR request_url = 'https://c.zxxk.com/paper-list?paperType=gk'
                  OR request_url LIKE 'https://c.zxxk.com/doc-list/%'
                  OR request_url LIKE 'https://c.xkw.com/doc-list/%'
                THEN '刷真题'
                WHEN request_url LIKE 'https://xb.xkw.com/photo-search%'
                THEN '拍照答疑'
                WHEN request_url LIKE 'https://c.xkw.com/search%'
                  OR request_url LIKE 'https://c.zxxk.com/search%'
                THEN '搜索'
                WHEN request_url IN (
                    'https://c.zxxk.com/template/mnjzq','https://c.xkw.com/template/mnjzq',
                    'https://c.zxxk.com/template/lkj','https://c.xkw.com/template/lkj'
                ) THEN '推广图'
                WHEN request_url IN ('https://c.xkw.com/template/tbx','https://c.zxxk.com/template/tbx')
                THEN '同步学'
                WHEN request_url IN (
                    'https://c.xkw.com/template/bqz','https://c.zxxk.com/template/bqz',
                    'https://c.xkw.com/template/bqm','https://c.zxxk.com/template/bqm',
                    'https://c.xkw.com/phreview/bqz','https://c.zxxk.com/phreview/bqz',
                    'https://c.zxxk.com/phreview/bqm','https://c.xkw.com/phreview/bqm'
                ) THEN '阶段复习'
                WHEN request_url IN (
                    'https://c.xkw.com/template/xsc','https://c.zxxk.com/template/xsc',
                    'https://c.zxxk.com/template/bzk','https://c.xkw.com/template/bzk',
                    'https://c.zxxk.com/template/bgk','https://c.xkw.com/template/bgk',
                    'https://c.xkw.com/upstage/ylfx','https://c.zxxk.com/upstage/ylfx',
                    'https://c.xkw.com/upstage/elfx','https://c.zxxk.com/upstage/elfx',
                    'https://c.xkw.com/upstage/slfx','https://c.zxxk.com/upstage/slfx',
                    'https://c.xkw.com/upstage/xscfx','https://c.zxxk.com/upstage/xscfx'
                ) THEN '升学备考'
                WHEN request_url IN (
                    'https://c.xkw.com/template/hj','https://c.zxxk.com/template/hj',
                    'https://c.xkw.com/template/sj','https://c.zxxk.com/template/sj'
                ) THEN '寒暑假'
                WHEN request_url IN ('https://c.zxxk.com/template/bxk','https://c.xkw.com/template/bxk')
                THEN '学考'
                WHEN request_url IN (
                    'https://c.zxxk.com/template/tb','https://c.xkw.com/template/tb',
                    'https://c.xkw.com/template/bk','https://c.zxxk.com/template/bk',
                    'https://c.xkw.com/template/zsdk','https://c.zxxk.com/template/zsdk',
                    'https://c.zxxk.com/template/zxk','https://c.xkw.com/template/zxk'
                ) THEN '视频'
                WHEN request_url IN ('https://c.zxxk.com/template/zsqd','https://c.xkw.com/template/zsqd')
                THEN '知识清单'
                WHEN request_url IN ('https://c.zxxk.com/template/dyj','https://c.xkw.com/template/dyj')
                THEN '单元卷'
                WHEN request_url IN (
                    'https://c.xkw.com/template/tbl','https://c.zxxk.com/template/tbl',
                    'https://c.zxxk.com/template/zxl','https://c.xkw.com/template/zxl',
                    'https://c.xkw.com/template/zzl','https://c.zxxk.com/template/zzl',
                    'https://c.zxxk.com/template/ylzxl','https://c.xkw.com/template/ylzxl',
                    'https://c.xkw.com/template/elzxl','https://c.zxxk.com/template/elzxl',
                    'https://c.xkw.com/template/sxzxl','https://c.zxxk.com/template/sxzxl'
                ) THEN '练习'
                WHEN request_url IN (
                    'https://c.zxxk.com/template/zxx','https://c.xkw.com/template/zxx',
                    'https://c.zxxk.com/template/zwjq','https://c.xkw.com/template/zwjq',
                    'https://c.zxxk.com/template/xzts','https://c.xkw.com/template/xzts',
                    'https://c.zxxk.com/template/tbzt','https://c.xkw.com/template/tbzt',
                    'https://c.xkw.com/template/yyk','https://c.zxxk.com/template/yyk',
                    'https://c.xkw.com/template/ydbj','https://c.zxxk.com/template/ydbj',
                    'https://c.xkw.com/template/xzk','https://c.zxxk.com/template/xzk',
                    'https://c.xkw.com/template/swyd','https://c.zxxk.com/template/swyd',
                    'https://c.xkw.com/template/swts','https://c.zxxk.com/template/swts',
                    'https://c.xkw.com/template/mzbd','https://c.zxxk.com/template/mzbd',
                    'https://c.xkw.com/template/jisuan','https://c.zxxk.com/template/jisuan',
                    'https://c.xkw.com/template/dck','https://c.zxxk.com/template/dck'
                ) THEN '特色内容'
                ELSE NULL
            END AS module_name
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE dt >= '${begin}' AND dt <= '${end}'
          AND product_id IN ('czx', 'xueban')
          AND is_spider = false
    ) t
    WHERE module_name IS NOT NULL
    GROUP BY SUBSTR(dt, 1, 7), module_name
),
monthly_total_uv AS (
    SELECT SUBSTR(dt, 1, 7) AS month, COUNT(DISTINCT user_id) AS total_user_count
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE dt >= '${begin}' AND dt <= '${end}'
      AND product_id IN ('czx', 'xueban')
      AND is_spider = false
    GROUP BY SUBSTR(dt, 1, 7)
)
SELECT
    CASE
        WHEN m.module_name IN ('拍照答疑', '搜索') THEN '功能'
        WHEN m.module_name = '刷真题' THEN '真题试卷'
        WHEN m.module_name IN ('推广图', '阶段复习', '升学备考', '学考') THEN '备考'
        WHEN m.module_name IN ('同步学', '寒暑假', '单元卷', '知识清单', '视频', '练习', '特色内容') THEN '同步'
    END AS level1,
    m.module_name AS level2,
    ROUND(m.module_user_count * 100.0 / t.total_user_count, 2) AS rate
FROM module_uv m
JOIN monthly_total_uv t ON m.month = t.month
ORDER BY level1, rate DESC
`.trim();
}

// （已弃用）原 MaxCompute 异步查询逻辑见 lib/warehouseClient.js。
// 本脚本现统一走 createWarehouseClient().runSql（Hologres 同步查询）。

function parseCsvTable(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim());
  const headers = lines[0].split(',').map((h) => h.trim());
  let lastLevel1 = '';
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (cols[i] ?? '').trim();
    });
    if (obj['一级模块']) lastLevel1 = obj['一级模块'];
    else obj['一级模块'] = lastLevel1;
    return obj;
  });
  return { headers, rows };
}

function formatRate(v) {
  if (v == null || Number.isNaN(Number(v))) return 'null';
  const n = Number(v);
  return Number.isInteger(n) ? String(n) : String(n);
}

function recalcAverage(row, monthHeaders) {
  const vals = [];
  for (const h of monthHeaders) {
    const v = row[h];
    if (v === undefined || v === null || v === '' || v === 'null') continue;
    const n = Number(v);
    if (!Number.isNaN(n)) vals.push(n);
  }
  if (!vals.length) return 'null';
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return (Math.round(avg * 100) / 100).toFixed(2);
}

function upsertMonthColumn({ headers, rows }, monthLabel, rateByModule) {
  const avgIdx = headers.indexOf('平均渗透率');
  let newHeaders = [...headers];
  if (!newHeaders.includes(monthLabel)) {
    if (avgIdx >= 0) newHeaders.splice(avgIdx, 0, monthLabel);
    else newHeaders.push(monthLabel);
  }

  const monthHeaders = newHeaders.filter((h) => MONTH_COL_RE.test(h));

  const newRows = rows.map((row) => {
    const module2 = row['二级模块'] || '';
    const next = { ...row };
    if (rateByModule.has(module2)) {
      next[monthLabel] = formatRate(rateByModule.get(module2));
    } else if (next[monthLabel] === undefined) {
      next[monthLabel] = 'null';
    }
    next['平均渗透率'] = recalcAverage(next, monthHeaders);
    return next;
  });

  // 若 SQL 出现 CSV 没有的模块，追加行
  const existing = new Set(rows.map((r) => r['二级模块']));
  for (const [module2, rate] of rateByModule.entries()) {
    if (existing.has(module2)) continue;
    const level1 =
      ['拍照答疑', '搜索'].includes(module2)
        ? '功能'
        : module2 === '刷真题'
          ? '真题试卷'
          : ['推广图', '阶段复习', '升学备考', '学考'].includes(module2)
            ? '备考'
            : '同步';
    const row = { 一级模块: level1, 二级模块: module2 };
    for (const h of monthHeaders) row[h] = h === monthLabel ? formatRate(rate) : 'null';
    row['平均渗透率'] = formatRate(rate);
    newRows.push(row);
    console.warn(`  [WARN] CSV 原无模块「${module2}」，已追加`);
  }

  return { headers: newHeaders, rows: newRows };
}

function serializeCsv({ headers, rows }) {
  const lines = [headers.join(',')];
  // 保持「一级模块」仅在分组首行填写（与历史 CSV 一致）
  let lastLevel1 = '';
  for (const row of rows) {
    const cols = headers.map((h) => {
      if (h === '一级模块') {
        const v = row[h] || '';
        if (v && v === lastLevel1) return '';
        if (v) lastLevel1 = v;
        return v;
      }
      const v = row[h];
      return v === undefined || v === null ? '' : String(v);
    });
    lines.push(cols.join(','));
  }
  return `${lines.join('\n')}\n`;
}

function convertCsvToJs() {
  const conv = path.join(ROOT, 'convert_csv_to_js_v2.ps1');
  if (!fs.existsSync(conv)) {
    console.warn(`未找到 ${conv}，跳过 data.js`);
    return false;
  }
  console.log('\n>> 转换 CSV → data.js');
  const r = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', conv, '-FolderPath', BOARD_DIR],
    { encoding: 'utf8', cwd: ROOT }
  );
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) throw new Error(`convert_csv_to_js_v2 失败 exit=${r.status}`);
  return true;
}

async function main() {
  const { dryRun, skipConvert, ym } = parseArgs(process.argv.slice(2));
  const target = ym ? parseYearMonth(ym) : prevCalendarMonth();
  const { year, month } = target;

  if (year < SQL_CUTOFF.year || (year === SQL_CUTOFF.year && month < SQL_CUTOFF.month)) {
    console.error(
      `目标 ${year}-${month} 早于 SQL 起点 ${SQL_CUTOFF.year}-${SQL_CUTOFF.month}，历史请勿用本脚本覆盖。`
    );
    process.exit(1);
  }

  const { begin, end } = monthRange(year, month);
  const monthLabel = fullMonthLabel(year, month);

  console.log('========================================');
  console.log('  各模块渗透率 · Hologres 更新');
  console.log(`  目标月份: ${monthLabel}（${begin} ~ ${end}）`);
  if (dryRun) console.log('  模式: dry-run');
  console.log('========================================\n');

  if (!process.env.MCP_KEY && !process.env.X_MCP_KEY) {
    console.error('请先配置 MCP_KEY');
    process.exit(1);
  }
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`未找到 CSV: ${CSV_PATH}`);
    process.exit(1);
  }

  const client = await createWarehouseClient();
  try {
    const sql = buildPenetrationSql(begin, end);
    const resultRows = await client.runSql(sql, { label: '渗透率' });

    const rateByModule = new Map();
    for (const r of resultRows) {
      const name = String(r.level2 || r['二级模块'] || '').trim();
      if (!name) continue;
      rateByModule.set(name, Number(r.rate));
    }
    console.log('>> 模块渗透率:');
    [...rateByModule.entries()].forEach(([k, v]) => console.log(`   ${k}: ${v}`));

    const { text, encoding } = readCsvFile(CSV_PATH);
    const table = parseCsvTable(text);
    const updated = upsertMonthColumn(table, monthLabel, rateByModule);
    const out = serializeCsv(updated);

    if (dryRun) {
      console.log('\n[dry-run] 未写入文件');
      return;
    }

    writeCsvFile(CSV_PATH, out, encoding);
    console.log(`\n>> 已写入: ${CSV_PATH}（编码 ${encoding}）`);
    if (!skipConvert) convertCsvToJs();
    console.log('\n完成。前端月份会自动识别新列；全量月度更新可再跑「月度更新.bat」。');
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('\n[失败]', err.message || err);
  process.exit(1);
});
