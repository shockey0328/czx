/**
 * 根据本地 data/ 目录生成 stats.json，用于上传到云存储（S3/OSS 等）
 * 使用：在「用户行为看板（周度）」目录下执行 node scripts/generate-stats-for-cloud.js
 * 输出：cloud-upload/stats.json（可将 cloud-upload 整目录或其中文件上传到云存储根）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const indexDir = path.join(dataDir, 'indexes');
const outDir = path.join(__dirname, '..', 'cloud-upload');

function getDateRange(startDate, endDate) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

async function main() {
  if (!fs.existsSync(dataDir)) {
    console.error('data/ 目录不存在，请先初始化本地数据库');
    process.exit(1);
  }

  const userIndexPath = path.join(indexDir, 'user_index.json');
  const dateIndexPath = path.join(indexDir, 'date_index.json');
  let totalUsers = 0;
  let availableDates = [];
  let totalRecords = 0;

  if (fs.existsSync(userIndexPath)) {
    const userIndex = JSON.parse(fs.readFileSync(userIndexPath, 'utf8'));
    totalUsers = Object.keys(userIndex).length;
  }
  if (fs.existsSync(dateIndexPath)) {
    const dateIndex = JSON.parse(fs.readFileSync(dateIndexPath, 'utf8'));
    availableDates = Object.keys(dateIndex).sort();
  }

  for (const date of availableDates) {
    const filePath = path.join(dataDir, `${date}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        totalRecords += data.recordCount || 0;
      } catch (e) {
        console.warn(`读取 ${date}.json 失败:`, e.message);
      }
    }
  }

  const stats = {
    totalUsers,
    totalRecords,
    availableDates,
    dateRange: availableDates.length > 0
      ? { start: availableDates[0], end: availableDates[availableDates.length - 1] }
      : null
  };

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, 'stats.json');
  fs.writeFileSync(outPath, JSON.stringify(stats, null, 2), 'utf8');
  console.log('已生成:', outPath);
  console.log('统计:', stats);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
