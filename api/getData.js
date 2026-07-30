// Vercel Serverless - 用户行为数据
// DATA_SOURCE=warehouse 时实时数仓；默认从 GitHub Releases 读取已导出的按日 JSON

import {
  fetchUserBehaviorFromWarehouse,
  isWarehouseDataSource
} from '../lib/warehouseData.js';
import behaviorDates from './behavior-dates.json' with { type: 'json' };

const GITHUB_RELEASE_BASE =
  process.env.GITHUB_RELEASE_BASE_URL ||
  'https://github.com/shockey0328/czx/releases/download/data-v1.0';

const AVAILABLE_DATES = Array.isArray(behaviorDates) ? behaviorDates : [];

function cors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function useWarehouse() {
  // 仅显式 DATA_SOURCE=warehouse 时走实时数仓
  return isWarehouseDataSource();
}

function dayCount(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.floor((end - start) / 86400000) + 1;
}

async function fetchFromRelease(userIds, startDate, endDate) {
  const datesToLoad = AVAILABLE_DATES.filter((d) => d >= startDate && d <= endDate);
  if (datesToLoad.length > 1) {
    const err = new Error(
      '为避免 Vercel 超时，请将起始/结束日期设为同一天后再试。'
    );
    err.status = 400;
    throw err;
  }
  if (datesToLoad.length === 0) {
    return {
      data: [],
      loadedDates: [],
      message: `所选日期无已发布数据。当前可用: ${AVAILABLE_DATES.join(', ') || '无'}`
    };
  }

  const userIdSet = new Set(userIds.map(String));
  const results = [];
  const loadedDates = [];

  for (const date of datesToLoad) {
    const url = `${GITHUB_RELEASE_BASE}/${date}.json`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    try {
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!resp.ok) continue;
      const data = await resp.json();
      const userGroups = data.userGroups || {};
      for (const uid of userIdSet) {
        const list = userGroups[String(uid)] || userGroups[uid];
        if (list && Array.isArray(list)) results.push(...list);
      }
      loadedDates.push(date);
    } catch (e) {
      clearTimeout(timeoutId);
      const msg = e.name === 'AbortError' ? '请求超时（单日文件较大）' : e.message;
      throw new Error('拉取 Release 数据失败：' + msg);
    }
  }

  results.sort((a, b) => {
    const t1 = String(a.xyio_client_time ?? a.xyio_backend_time ?? '');
    const t2 = String(b.xyio_client_time ?? b.xyio_backend_time ?? '');
    return t1.localeCompare(t2);
  });

  return { data: results, loadedDates };
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

    if (useWarehouse()) {
      const days = dayCount(startDate, endDate);
      if (days > 7) {
        return res.status(400).json({
          success: false,
          error: '数仓查询建议日期跨度不超过 7 天，请缩小范围后重试。'
        });
      }
      const data = await fetchUserBehaviorFromWarehouse(userIds, startDate, endDate);
      return res.status(200).json({
        success: true,
        data,
        totalRecords: data.length,
        dataSource: 'warehouse',
        dateRange: { startDate, endDate }
      });
    }

    const { data, loadedDates, message } = await fetchFromRelease(
      userIds,
      startDate,
      endDate
    );
    return res.status(200).json({
      success: true,
      data,
      totalRecords: data.length,
      loadedDates,
      message,
      dataSource: 'release',
      availableDates: AVAILABLE_DATES
    });
  } catch (error) {
    console.error('getData 错误:', error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      error: error.message || '获取数据失败'
    });
  }
}
