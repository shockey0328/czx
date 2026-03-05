// Vercel Serverless Function - 获取用户行为数据
// 从GitHub Releases读取数据

const GITHUB_RELEASE_BASE_URL = 'https://github.com/shockey0328/czx/releases/download/data-v1.0';

// 可用的数据文件
const AVAILABLE_DATES = [
  '2026-02-26',
  '2026-02-27',
  '2026-02-28',
  '2026-03-01',
  '2026-03-02',
  '2026-03-03',
  '2026-03-04'
];

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { startDate, endDate, userIds } = req.body;

    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供用户ID' 
      });
    }

    console.log(`查询用户: ${userIds.join(', ')}`);
    console.log(`日期范围: ${startDate} 到 ${endDate}`);

    // 确定需要加载的日期文件
    const datesToLoad = AVAILABLE_DATES.filter(date => {
      return date >= startDate && date <= endDate;
    });

    if (datesToLoad.length === 0) {
      return res.json({
        success: true,
        data: [],
        totalRecords: 0,
        userIds: userIds,
        dateRange: { startDate, endDate },
        message: '指定日期范围内没有数据'
      });
    }

    console.log(`需要加载的日期: ${datesToLoad.join(', ')}`);

    // 并行加载所有需要的数据文件
    const dataPromises = datesToLoad.map(async (date) => {
      const url = `${GITHUB_RELEASE_BASE_URL}/${date}.json`;
      console.log(`正在加载: ${url}`);
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`加载失败: ${url}, 状态: ${response.status}`);
          return [];
        }
        const data = await response.json();
        console.log(`${date}: 加载了 ${data.length} 条记录`);
        return data;
      } catch (error) {
        console.error(`加载错误: ${url}`, error);
        return [];
      }
    });

    // 等待所有数据加载完成
    const allDataArrays = await Promise.all(dataPromises);
    const allData = allDataArrays.flat();

    console.log(`总共加载了 ${allData.length} 条记录`);

    // 筛选指定用户的数据
    const results = allData.filter(record => {
      return userIds.includes(record.user_id);
    });

    console.log(`筛选后: ${results.length} 条记录`);

    return res.json({
      success: true,
      data: results,
      totalRecords: results.length,
      userIds: userIds,
      dateRange: { startDate, endDate },
      loadedDates: datesToLoad
    });

  } catch (error) {
    console.error('API错误:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
