// Vercel Serverless - 从云存储读取统计信息
// 需在云存储根目录放置 stats.json，并在 Vercel 配置环境变量 DATA_BASE_URL

import { fetchStats } from './cloudData.js';

function cors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
    const stats = await fetchStats();
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('获取统计失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '获取统计失败'
    });
  }
}
