// Vercel Serverless - 用户行为看板统计

import { readFile } from 'fs/promises';
import { join } from 'path';
import { isWarehouseDataSource } from '../lib/warehouseData.js';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function useWarehouse() {
  return (
    isWarehouseDataSource() ||
    !!(process.env.MCP_KEY || process.env.X_MCP_KEY)
  );
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    if (useWarehouse()) {
      return res.status(200).json({
        success: true,
        stats: {
          dataSource: 'warehouse',
          totalUsers: 0,
          totalRecords: 0,
          availableDates: [],
          dateRange: null,
          note: '数仓 MCP 按需查询（橙子学 czx + 学伴 xueban）',
          products: ['czx', 'xueban'],
          applicationId: 'mzhan'
        }
      });
    }

    const localPath = join(
      process.cwd(),
      '用户行为看板（周度）',
      'cloud-upload',
      'stats.json'
    );
    const raw = await readFile(localPath, 'utf8');
    const stats = JSON.parse(raw);
    return res.status(200).json({ success: true, stats });
  } catch (err) {
    console.error('stats API:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || '读取统计失败'
    });
  }
}
