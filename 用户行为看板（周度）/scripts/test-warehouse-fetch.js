/**
 * 本地验证：数仓 MCP 拉取 czx+xueban 行为日志
 * 用法（在「用户行为看板（周度）」目录）：
 *   node scripts/test-warehouse-fetch.js 88560289 2026-07-16 2026-07-17
 */
import { loadEnv } from '../lib/loadEnv.js';
import { fetchUserBehaviorFromWarehouse } from '../lib/warehouseData.js';

loadEnv();

const userId = process.argv[2] || '88560289';
const startDate = process.argv[3] || '2026-07-16';
const endDate = process.argv[4] || '2026-07-17';

const rows = await fetchUserBehaviorFromWarehouse([userId], startDate, endDate);
const byProduct = rows.reduce((acc, r) => {
  acc[r.product_id || '(empty)'] = (acc[r.product_id || '(empty)'] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({
  total: rows.length,
  byProduct,
  sample: rows.slice(0, 3)
}, null, 2));
