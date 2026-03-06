// Vercel Serverless - 方案 A：从 GitHub Releases 读取用户行为数据
// Release 需包含按日期的 JSON：{ date, recordCount, userGroups: { [userId]: [records] } }

const GITHUB_RELEASE_BASE = process.env.GITHUB_RELEASE_BASE_URL || 'https://github.com/shockey0328/czx/releases/download/data-v1.0';

const AVAILABLE_DATES = [
  '2026-02-26', '2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04'
];

function cors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getDateRange(startDate, endDate) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
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

    const datesToLoad = AVAILABLE_DATES.filter(d => d >= startDate && d <= endDate);
    const userIdSet = new Set(userIds.map(String));
    const results = [];
    const loadedDates = [];

    for (const date of datesToLoad) {
      const url = `${GITHUB_RELEASE_BASE}/${date}.json`;
      try {
        const resp = await fetch(url);
        if (!resp.ok) continue;
        const data = await resp.json();
        const userGroups = data.userGroups || {};
        for (const uid of userIdSet) {
          const list = userGroups[String(uid)] || userGroups[uid];
          if (list && Array.isArray(list)) results.push(...list);
        }
        loadedDates.push(date);
      } catch (e) {
        console.warn(`拉取 ${url} 失败:`, e.message);
      }
    }

    results.sort((a, b) => {
      const t1 = a.xyio_client_time ?? a.xyio_backend_time ?? 0;
      const t2 = b.xyio_client_time ?? b.xyio_backend_time ?? 0;
      return t1 - t2;
    });

    return res.status(200).json({
      success: true,
      data: results,
      totalRecords: results.length,
      loadedDates
    });
  } catch (error) {
    console.error('getData 错误:', error);
    return res.status(500).json({ success: false, error: error.message || '获取数据失败' });
  }
}
