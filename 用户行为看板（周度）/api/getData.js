// Vercel Serverless - 用户行为数据
// DATA_SOURCE=warehouse 时走数仓 MCP；否则走云存储 DATA_BASE_URL

import { fetchUserBehavior } from './cloudData.js';
import { loadEnv } from '../../lib/loadEnv.js';
import {
  fetchUserBehaviorFromWarehouse,
  isWarehouseDataSource
} from '../../lib/warehouseData.js';

loadEnv();

function cors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { startDate, endDate, userIds } = req.body || {};
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, error: '请提供用户ID' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: '请提供 startDate 和 endDate' });
    }

    const useWarehouse = isWarehouseDataSource();
    const results = useWarehouse
      ? await fetchUserBehaviorFromWarehouse(userIds, startDate, endDate)
      : await fetchUserBehavior(userIds, startDate, endDate);

    return res.status(200).json({
      success: true,
      data: results,
      totalRecords: results.length,
      userIds,
      dateRange: { startDate, endDate },
      dataSource: useWarehouse ? 'warehouse' : 'cloud'
    });
  } catch (error) {
    console.error('getData API 错误:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '获取数据失败'
    });
  }
}
