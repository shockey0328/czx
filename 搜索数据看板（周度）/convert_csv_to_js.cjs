/**
 * CSV 转看板数据（Node 版）
 * 用法：在「搜索数据看板（周度）」目录下执行 node convert_csv_to_js.js
 *
 * 输出：
 *   data/dashboard-core.json  — 漏斗/转化率/留存等小数据（HTTP fetch）
 *   data/data-core.js         — 同上，script 同步加载（兼容 file:// 本地打开）
 *   data/keywords-{N}.json    — 每周热搜词（HTTP fetch）
 *   data/keywords-{N}.js      — 每周热搜词（file:// 回退）
 *   data/manifest.json        — 版本与最新周次（门户可 prefetch）
 */
const fs = require('fs');
const path = require('path');
let iconvLite;
try { iconvLite = require('iconv-lite'); } catch (_) { iconvLite = null; }

const dir = __dirname;
const dataDir = path.join(dir, 'data');
const csvFiles = fs.readdirSync(dir).filter(f => f.endsWith('.csv'));
const DATA_VERSION = new Date().toISOString().slice(0, 10).replace(/-/g, '');

function decodeContent(buf) {
  const utf8 = buf.toString('utf8');
  const hasReplacement = utf8.includes('\uFFFD');
  const hasValidChinese = /[\u4e00-\u9fa5]/.test(utf8);
  const likelyMojibake = !hasValidChinese && buf.length > 50;
  if (!hasReplacement && (hasValidChinese || !iconvLite)) return utf8;
  if (iconvLite) {
    const gbk = iconvLite.decode(buf, 'gbk');
    if (/[\u4e00-\u9fa5]/.test(gbk) || hasReplacement || likelyMojibake) return gbk;
  }
  return utf8;
}

/** 修复导出工具偶发在关键词末尾写入的 \",pv,uv 脏格式 */
function repairCsvContent(content) {
  return content.replace(/^(?!\\")(.+?)\\",(\d+),(\d+)\s*$/gm, (full, kw, pv, uv) => {
    if (/["'\u201c\u201d\u2018\u2019「」]/.test(kw)) return full;
    return `${kw},${pv},${uv}`;
  });
}

/** RFC4180 风格：支持引号字段内逗号、双引号转义 */
function parseCSV(content) {
  content = content.replace(/^\uFEFF/, '');
  const rows = [];
  let i = 0;
  let field = '';
  let row = [];
  let inQ = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };

  while (i < content.length) {
    const c = content[i];
    if (inQ) {
      if (c === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQ = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQ = true;
      i++;
      continue;
    }
    if (c === ',') {
      pushField();
      i++;
      continue;
    }
    if (c === '\n' || c === '\r') {
      pushField();
      if (row.some((x) => String(x).trim())) rows.push(row);
      row = [];
      if (c === '\r' && content[i + 1] === '\n') i++;
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field || row.length) {
    pushField();
    rows.push(row);
  }
  if (!rows.length) return [];

  const headers = rows[0].map((h) => String(h).trim());
  return rows.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((h, j) => {
      obj[h] = cells[j] != null ? String(cells[j]).trim() : '';
    });
    return obj;
  });
}

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const coreData = {};
const keywordWeeks = [];

for (const file of csvFiles) {
  const name = path.basename(file, '.csv');
  const weekMatch = name.match(/^第(\d+)周搜索词$/);
  try {
    const buf = fs.readFileSync(path.join(dir, file));
    const content = repairCsvContent(decodeContent(buf));
    const data = parseCSV(content);

    if (weekMatch) {
      const week = parseInt(weekMatch[1], 10);
      keywordWeeks.push(week);
      const outPath = path.join(dataDir, `keywords-${week}.json`);
      fs.writeFileSync(outPath, JSON.stringify(data), 'utf8');
      const jsPath = path.join(dataDir, `keywords-${week}.js`);
      fs.writeFileSync(
        jsPath,
        `// 第${week}周搜索词（file:// 与 fetch 回退）\nwindow.__searchKw${week}=${JSON.stringify(data)};\n`,
        'utf8'
      );
      const mb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(2);
      console.log(`  ✓ 第${week}周搜索词 → data/keywords-${week}.json (${data.length} 条, ${mb} MB)`);
    } else {
      coreData[name] = data;
      console.log(`  ✓ ${name}: ${data.length} 条`);
    }
  } catch (e) {
    console.log(`  ✗ ${file}: ${e.message}`);
  }
}

keywordWeeks.sort((a, b) => a - b);
coreData._keywordWeeks = keywordWeeks;
coreData._dataVersion = DATA_VERSION;

const corePath = path.join(dataDir, 'dashboard-core.json');
function writeFileRetry(filePath, content, encoding = 'utf8') {
  let lastErr;
  for (let i = 0; i < 6; i++) {
    try {
      const tmp = `${filePath}.tmp.${process.pid}`;
      fs.writeFileSync(tmp, content, encoding);
      fs.renameSync(tmp, filePath);
      return;
    } catch (err) {
      lastErr = err;
      const end = Date.now() + 400 * (i + 1);
      while (Date.now() < end) { /* spin */ }
    }
  }
  throw lastErr;
}
writeFileRetry(corePath, JSON.stringify(coreData));
console.log(`  ✓ dashboard-core.json (${(fs.statSync(corePath).size / 1024).toFixed(1)} KB)`);

const coreJsPath = path.join(dataDir, 'data-core.js');
writeFileRetry(
  coreJsPath,
  `// 由 convert_csv_to_js.js 自动生成\nwindow.searchDashboardCore=${JSON.stringify(coreData)};\n`
);
console.log(`  ✓ data-core.js (${(fs.statSync(coreJsPath).size / 1024).toFixed(1)} KB)`);

const manifest = {
  dataVersion: DATA_VERSION,
  keywordWeeks,
  latestWeek: keywordWeeks.length ? keywordWeeks[keywordWeeks.length - 1] : null,
};
writeFileRetry(path.join(dataDir, 'manifest.json'), JSON.stringify(manifest));
console.log(`  ✓ manifest.json（最新第 ${manifest.latestWeek} 周）`);

console.log('\n已生成分片数据（请部署 data/ 目录；不再生成单体 data.js）');
