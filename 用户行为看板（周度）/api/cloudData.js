/**
 * 从云存储读取数据的公共逻辑
 * 环境变量 DATA_BASE_URL：数据根地址，如 https://your-bucket.s3.amazonaws.com/data/ 或 https://your-oss.aliyuncs.com/data/
 * 文件约定：stats.json（统计）、{date}.json（按日期的数据，格式 { date, recordCount, userGroups }）
 */

function getDataBaseUrl() {
  const url = process.env.DATA_BASE_URL || '';
  return url.replace(/\/?$/, '/'); // 保证末尾一个 /
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

/**
 * 从云存储获取统计信息
 * 需要事先上传 stats.json，格式：{ totalUsers, totalRecords, availableDates, dateRange: { start, end } }
 */
export async function fetchStats() {
  const base = getDataBaseUrl();
  if (!base) {
    throw new Error('未配置 DATA_BASE_URL，请在 Vercel 环境变量中设置云存储数据根地址');
  }
  const url = `${base}stats.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`获取统计失败: ${res.status} ${url}`);
  }
  return res.json();
}

/**
 * 从云存储按日期、用户拉取行为数据并合并
 * 每个日期文件格式：{ date, recordCount, userGroups: { [userId]: [records] } }
 */
export async function fetchUserBehavior(userIds, startDate, endDate) {
  const base = getDataBaseUrl();
  if (!base) {
    throw new Error('未配置 DATA_BASE_URL，请在 Vercel 环境变量中设置云存储数据根地址');
  }
  const dates = getDateRange(startDate, endDate);
  const userIdSet = new Set(Array.isArray(userIds) ? userIds : [userIds].map(String));
  const results = [];

  for (const date of dates) {
    const fileUrl = `${base}${date}.json`;
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) continue;
      const data = await res.json();
      const userGroups = data.userGroups || {};
      for (const uid of userIdSet) {
        const list = userGroups[String(uid)] || userGroups[uid];
        if (list && Array.isArray(list)) results.push(...list);
      }
    } catch (e) {
      console.warn(`拉取 ${fileUrl} 失败:`, e.message);
    }
  }

  results.sort((a, b) => {
    const t1 = a.xyio_client_time ?? a.xyio_backend_time ?? 0;
    const t2 = b.xyio_client_time ?? b.xyio_backend_time ?? 0;
    return t1 - t2;
  });
  return results;
}
