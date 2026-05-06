/**
 * CSV 转 data.js（核心数据看板周度）
 * 用法：在本目录执行 node convert_csv_to_js.js
 * 支持 UTF-8 与 GBK，自动检测。
 */
const fs = require('fs');
const path = require('path');
let iconvLite;
try { iconvLite = require('iconv-lite'); } catch (_) {
  try { iconvLite = require(path.join(__dirname, '../搜索数据看板（周度）/node_modules/iconv-lite')); } catch (_2) { iconvLite = null; }
}

const dir = __dirname;
const csvFiles = fs.readdirSync(dir).filter(f => f.endsWith('.csv'));

function decodeContent(buf, filename) {
  // 首先尝试UTF-8
  const utf8 = buf.toString('utf8');
  const hasReplacement = utf8.includes('\uFFFD');
  const hasValidChinese = /[\u4e00-\u9fa5]/.test(utf8);
  const likelyMojibake = !hasValidChinese && buf.length > 50;
  
  // 对于B端核心数据文件，优先尝试GBK编码
  if (filename.includes('B端核心数据')) {
    if (iconvLite) {
      try {
        const gbk = iconvLite.decode(buf, 'gbk');
        if (/[\u4e00-\u9fa5]/.test(gbk)) {
          return gbk;
        }
      } catch (e) {
        console.log('    GBK解码失败，尝试UTF-8');
      }
    }
  }
  
  if (!hasReplacement && (hasValidChinese || !iconvLite)) return utf8;
  if (iconvLite) {
    const gbk = iconvLite.decode(buf, 'gbk');
    if (/[\u4e00-\u9fa5]/.test(gbk) || hasReplacement || likelyMojibake) return gbk;
  }
  return utf8;
}

function parseCSV(content) {
  content = content.replace(/^\uFEFF/, '');
  const lines = content.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const obj = {};
    headers.forEach((h, j) => { obj[h] = values[j] != null ? values[j].trim() : ''; });
    data.push(obj);
  }
  return data;
}

const dashboardData = {};
for (const file of csvFiles) {
  const name = path.basename(file, '.csv');
  try {
    const buf = fs.readFileSync(path.join(dir, file));
    const content = decodeContent(buf, file);
    const data = parseCSV(content);
    dashboardData[name] = data;
    console.log('  ✓ ' + name + ': ' + data.length + ' 条');
  } catch (e) {
    console.log('  ✗ ' + file + ': ' + e.message);
  }
}

const js = 'const dashboardData = ' +
  JSON.stringify(dashboardData, null, 2) + ';\n';

fs.writeFileSync(path.join(dir, 'data.js'), js, 'utf8');
console.log('已生成 data.js');
