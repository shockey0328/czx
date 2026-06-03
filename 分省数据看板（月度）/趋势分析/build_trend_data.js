/**
 * 从 趋势分析 文件夹下的各月 Excel 读取全国省份核心指标，生成 trend-data.js 供看板使用。
 * 运行：在「分省数据看板（月度）」目录下执行  node 趋势分析/build_trend_data.js
 * 或  npm run build-trend
 */
const fs = require('fs');
const path = require('path');

let XLSX;
try {
  XLSX = require('xlsx');
} catch (e) {
  console.error('请先安装依赖: npm install');
  process.exit(1);
}

const SCRIPT_DIR = __dirname;
// 输出到看板根目录，与 index.html 同目录，避免 file:// 下路径问题
const OUTPUT_JS = path.join(SCRIPT_DIR, '..', 'trend-data.js');

// 表头对应：省份名称、活跃用户、新用户、营收、使用用户、ARPU、使用率
const PROVINCE_KEYS = ['省份名称', '地区', '省份', '省', '区域', 'province'];
const ACTIVE_KEYS = ['活跃用户'];
const NEW_USER_KEYS = ['新用户'];
const REVENUE_KEYS = ['营收', '订单营收', '收入', 'revenue'];
const RATE_KEYS = ['使用率', '使用率%', '渗透率'];
const ARPU_KEYS = ['ARPU', 'arpu'];

/** 统一省份名称，避免「山东」与「山东省」同时出现 */
function normalizeProvinceName(name) {
  if (!name || typeof name !== 'string') return name;
  const s = name.trim();
  if (s.endsWith('省')) return s.slice(0, -1);
  if (s === '广西壮族自治区' || s === '广西') return '广西';
  if (s === '内蒙古自治区' || s === '内蒙古') return '内蒙古';
  if (s === '新疆维吾尔自治区' || s === '新疆') return '新疆';
  if (s === '宁夏回族自治区' || s === '宁夏') return '宁夏';
  if (s === '西藏自治区' || s === '西藏') return '西藏';
  return s;
}

function findColumnIndex(header, keys) {
  for (let i = 0; i < header.length; i++) {
    const cell = header[i];
    if (cell == null || (typeof cell === 'number' && isNaN(cell))) continue;
    const s = String(cell).trim();
    for (const k of keys) {
      if (s.includes(k) || k.includes(s)) return i;
    }
  }
  return -1;
}

/** 解析单元格数值：支持纯数字、带%的字符串、千分位逗号、Excel 小数率(0.72→72) */
function parseNumber(val, opts = {}) {
  if (val == null || val === '') return 0;
  const { asRate } = opts; // 使用率等，Excel 可能存为 0.72 表示 72%
  if (typeof val === 'number') {
    if (!isNaN(val) && asRate && val > 0 && val <= 1) return Math.round(val * 1000) / 10;
    return isNaN(val) ? 0 : val;
  }
  const s = String(val).trim().replace(/,/g, '');
  if (s === '') return 0;
  if (s.endsWith('%')) {
    const n = Number(s.slice(0, -1));
    return isNaN(n) ? 0 : n;
  }
  const n = Number(s);
  if (!isNaN(n) && asRate && n > 0 && n <= 1) return Math.round(n * 1000) / 10;
  return isNaN(n) ? 0 : n;
}

function parseMonthLabel(label) {
  const m = String(label).match(/^(\d{2})年(\d{1,2})月$/);
  if (!m) return null;
  return { year: parseInt(m[1], 10), month: parseInt(m[2], 10) };
}

function formatMonthLabel(year, month) {
  const yy = String(year).padStart(2, '0').slice(-2);
  return `${yy}年${month}月`;
}

function prevMonthLabel(label) {
  const p = parseMonthLabel(label);
  if (!p) return null;
  if (p.month === 1) return formatMonthLabel(p.year - 1, 12);
  return formatMonthLabel(p.year, p.month - 1);
}

function yoyMonthLabel(label) {
  const p = parseMonthLabel(label);
  if (!p) return null;
  return formatMonthLabel(p.year - 1, p.month);
}

function readMonthSheet(filePath) {
  const wb = XLSX.readFile(filePath, { cellDates: false, raw: false });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  if (!data || data.length < 2) return [];

  const header = data[0];
  let provIdx = findColumnIndex(header, PROVINCE_KEYS);
  if (provIdx < 0) provIdx = 0;
  const activeIdx = findColumnIndex(header, ACTIVE_KEYS);
  const newUserIdx = findColumnIndex(header, NEW_USER_KEYS);
  const revIdx = findColumnIndex(header, REVENUE_KEYS);
  const rateIdx = findColumnIndex(header, RATE_KEYS);
  const arpuIdx = findColumnIndex(header, ARPU_KEYS);

  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let prov = row[provIdx];
    if (prov == null || (typeof prov === 'number' && isNaN(prov))) continue;
    prov = normalizeProvinceName(String(prov).trim());
    if (!prov || prov.startsWith('同比') || prov.startsWith('环比')) continue;

    const num = (idx, opts) => {
      if (idx < 0 || idx >= row.length) return 0;
      return parseNumber(row[idx], opts);
    };
    const numOptional = (idx) => {
      if (idx < 0 || idx >= row.length) return null;
      const val = row[idx];
      if (val == null || String(val).trim() === '') return null;
      return parseNumber(val);
    };

    rows.push({
      prov,
      active: num(activeIdx),
      newUser: numOptional(newUserIdx),
      rev: num(revIdx),
      rate: num(rateIdx, { asRate: true }),
      arpu: num(arpuIdx),
    });
  }
  return rows;
}

function main() {
  const inspect = process.argv.includes('--inspect');
  const files = fs.readdirSync(SCRIPT_DIR)
    .filter((f) => /^\d{2}年\d{1,2}月\.xlsx$/.test(f))
    .sort((a, b) => {
      const ma = a.match(/^(\d{2})年(\d{1,2})月/);
      const mb = b.match(/^(\d{2})年(\d{1,2})月/);
      if (!ma || !mb) return 0;
      const na = parseInt(ma[1], 10) * 100 + parseInt(ma[2], 10);
      const nb = parseInt(mb[1], 10) * 100 + parseInt(mb[2], 10);
      return na - nb;
    });

  if (files.length === 0) {
    console.log('未找到 趋势分析/*.xlsx 文件');
    return;
  }

  if (inspect) {
    const firstPath = path.join(SCRIPT_DIR, files[0]);
    const wb = XLSX.readFile(firstPath);
    const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null });
    const header = data[0] || [];
    console.log('【调试】文件:', files[0]);
    console.log('表头(第1行):', header);
    console.log('前3行数据:', data.slice(1, 4));
    console.log('识别到的列索引 - 省份:', findColumnIndex(header, PROVINCE_KEYS), '活跃:', findColumnIndex(header, ACTIVE_KEYS), '新用户:', findColumnIndex(header, NEW_USER_KEYS), '营收:', findColumnIndex(header, REVENUE_KEYS), '使用率:', findColumnIndex(header, RATE_KEYS), 'ARPU:', findColumnIndex(header, ARPU_KEYS));
    return;
  }

  const monthFiles = files.map((f) => {
    const m = f.match(/^(\d{2})年(\d{1,2})月/);
    return [path.join(SCRIPT_DIR, f), m ? `${m[1]}年${m[2]}月` : ''];
  }).filter(([, label]) => label);

  const provinceTrend = {};
  const coreData = {};

  for (const [filePath, monthLabel] of monthFiles) {
    coreData[monthLabel] = {};
    const rows = readMonthSheet(filePath);
    for (const { prov, active, newUser, rev, rate, arpu } of rows) {
      if (!provinceTrend[prov]) provinceTrend[prov] = [];
      const fmtInt = (v) => (v == null ? null : (Number.isInteger(v) ? v : Math.round(v * 100) / 100));
      provinceTrend[prov].push({
        月份: monthLabel,
        活跃用户: fmtInt(active) ?? 0,
        新用户: fmtInt(newUser),
        营收: Math.round(rev * 100) / 100,
        使用率: Math.round(rate * 10) / 10,
        ARPU: Math.round(arpu * 100) / 100,
      });
      coreData[monthLabel][prov] = {
        活跃用户: fmtInt(active) ?? 0,
        新用户: fmtInt(newUser),
        订单营收: Math.round(rev * 100) / 100,
        使用率: Math.round(rate * 10) / 10,
        ARPU: Math.round(arpu * 100) / 100,
        深度访问率: 0,
        老用户: 0,
        同比活跃: null,
        环比活跃: null,
        同比新用户: null,
        环比新用户: null,
        同比营收: null,
        环比营收: null,
        同比使用率: null,
        环比使用率: null,
        同比ARPU: null,
        环比ARPU: null,
      };
    }
  }

  const allMonths = monthFiles.map(([, m]) => m);
  for (const prov of Object.keys(provinceTrend)) {
    const byMonth = {};
    provinceTrend[prov].forEach((item) => { byMonth[item.月份] = item; });
    provinceTrend[prov] = allMonths.map((m) =>
      byMonth[m] || { 月份: m, 活跃用户: 0, 新用户: null, 营收: 0, 使用率: 0, ARPU: 0 }
    );
  }

  // 根据趋势序列计算同比、环比（按月份标签匹配，非数组下标）
  const pctChange = (cur, prev) => {
    if (prev == null || prev === 0) return null;
    return Math.round((cur - prev) / prev * 100);
  };
  const ppChange = (cur, prev) => {
    if (prev == null) return null;
    return Math.round((cur - prev) * 10) / 10;
  };
  for (const prov of Object.keys(provinceTrend)) {
    const arr = provinceTrend[prov];
    const byMonth = {};
    arr.forEach((item) => { byMonth[item.月份] = item; });
    for (let i = 0; i < arr.length; i++) {
      const m = arr[i].月份;
      if (!coreData[m] || !coreData[m][prov]) continue;
      const cur = arr[i];
      const prevMonth = byMonth[prevMonthLabel(m)] || null;
      const lastYear = byMonth[yoyMonthLabel(m)] || null;
      coreData[m][prov].同比活跃 = lastYear ? pctChange(cur.活跃用户, lastYear.活跃用户) : null;
      coreData[m][prov].环比活跃 = prevMonth ? pctChange(cur.活跃用户, prevMonth.活跃用户) : null;
      coreData[m][prov].同比新用户 = (lastYear && cur.新用户 != null && lastYear.新用户 != null)
        ? pctChange(cur.新用户, lastYear.新用户) : null;
      coreData[m][prov].环比新用户 = (prevMonth && cur.新用户 != null && prevMonth.新用户 != null)
        ? pctChange(cur.新用户, prevMonth.新用户) : null;
      coreData[m][prov].同比营收 = lastYear ? pctChange(cur.营收, lastYear.营收) : null;
      coreData[m][prov].环比营收 = prevMonth ? pctChange(cur.营收, prevMonth.营收) : null;
      coreData[m][prov].同比使用率 = lastYear ? ppChange(cur.使用率, lastYear.使用率) : null;
      coreData[m][prov].环比使用率 = prevMonth ? ppChange(cur.使用率, prevMonth.使用率) : null;
      coreData[m][prov].同比ARPU = lastYear ? pctChange(cur.ARPU, lastYear.ARPU) : null;
      coreData[m][prov].环比ARPU = prevMonth ? ppChange(cur.ARPU, prevMonth.ARPU) : null;
    }
  }

  const provinces = Object.keys(provinceTrend).sort();
  console.log('共', provinces.length, '个省份/地区，', allMonths.length, '个月份');
  console.log('省份:', provinces.slice(0, 10).join('、'), provinces.length > 10 ? '...' : '');

  const jsContent = `// 由 趋势分析/build_trend_data.js 自动生成，请勿直接编辑
// 全国各省份趋势数据与核心指标（25年1月～26年2月）
// 使用 window 挂载，保证在 file:// 下被 app.js 正确读取

window.TREND_PROVINCES = ${JSON.stringify(provinces, null, 2)};
window.provinceTrendData = ${JSON.stringify(provinceTrend, null, 2)};
window.coreDataFromTrend = ${JSON.stringify(coreData, null, 2)};
window.TREND_MONTHS = ${JSON.stringify(allMonths, null, 2)};
`;

  fs.writeFileSync(OUTPUT_JS, jsContent, 'utf8');
  console.log('已生成:', OUTPUT_JS);
}

main();
