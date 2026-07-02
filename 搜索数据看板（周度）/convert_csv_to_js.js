/**
 * CSV 转 data.js（Node 版）
 * 用法：在「搜索数据看板（周度）」目录下执行 node convert_csv_to_js.js
 * 支持 UTF-8 / GBK，正确处理引号内逗号（避免长搜索词被拆列错位）。
 */
const fs = require('fs');
const path = require('path');
let iconvLite;
try { iconvLite = require('iconv-lite'); } catch (_) { iconvLite = null; }

const dir = __dirname;
const csvFiles = fs.readdirSync(dir).filter(f => f.endsWith('.csv'));

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

const dashboardData = {};
for (const file of csvFiles) {
  const name = path.basename(file, '.csv');
  try {
    const buf = fs.readFileSync(path.join(dir, file));
    const content = repairCsvContent(decodeContent(buf));
    const data = parseCSV(content);
    dashboardData[name] = data;
    console.log('  ✓ ' + name + ': ' + data.length + ' 条');
  } catch (e) {
    console.log('  ✗ ' + file + ': ' + e.message);
  }
}

const js = '// 由 convert_csv_to_js.js 自动生成\n\nconst dashboardData = ' +
  JSON.stringify(dashboardData, null, 2) + ';\n\n' +
  'if (typeof module !== "undefined" && module.exports) { module.exports = dashboardData; }\n';

fs.writeFileSync(path.join(dir, 'data.js'), js, 'utf8');
console.log('已生成 data.js');
