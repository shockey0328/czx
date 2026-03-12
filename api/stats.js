// Vercel Serverless - 返回用户行为看板统计（总用户数、总记录数、可用天数等）
// 优先读仓库内 stats.json；未配置 DATA_BASE_URL 时也可用

import { readFile } from 'fs/promises';
import { join } from 'path';

function cors(res) {
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
    // 优先从仓库内用户行为看板的 cloud-upload/stats.json 读取
    const localPath = join(process.cwd(), '用户行为看板（周度）', 'cloud-upload', 'stats.json');
    const raw = await readFile(localPath, 'utf8');
    const stats = JSON.parse(raw);
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json({ success: true, stats });
  } catch (err) {
    // 可选：若配置了 DATA_BASE_URL，可在此从云拉取 stats.json（此处保持简单，仅用本地文件）
    console.error('stats API:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || '读取统计失败'
    });
  }
}
