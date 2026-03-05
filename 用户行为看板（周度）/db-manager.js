import UserBehaviorDB from './database.js';

const db = new UserBehaviorDB();

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      console.log('初始化数据库...');
      await db.initialize();
      break;
      
    case 'stats':
      console.log('获取数据库统计信息...');
      await db.initialize();
      const stats = await db.getStats();
      console.log('\n=== 数据库统计 ===');
      console.log(`总用户数: ${stats.totalUsers}`);
      console.log(`总记录数: ${stats.totalRecords}`);
      console.log(`可用日期: ${stats.availableDates.length} 天`);
      if (stats.dateRange) {
        console.log(`日期范围: ${stats.dateRange.start} 到 ${stats.dateRange.end}`);
      }
      console.log(`可用日期列表: ${stats.availableDates.join(', ')}`);
      break;
      
    case 'query':
      const userId = process.argv[3];
      const startDate = process.argv[4] || '2026-02-26';
      const endDate = process.argv[5] || '2026-03-04';
      
      if (!userId) {
        console.log('用法: node db-manager.js query <用户ID> [开始日期] [结束日期]');
        process.exit(1);
      }
      
      console.log(`查询用户 ${userId} 在 ${startDate} 到 ${endDate} 的行为数据...`);
      await db.initialize();
      const results = await db.queryUserBehavior(userId, startDate, endDate);
      console.log(`\n找到 ${results.length} 条记录:`);
      
      if (results.length > 0) {
        console.log('\n前5条记录:');
        results.slice(0, 5).forEach((record, i) => {
          console.log(`${i + 1}. 时间: ${record.xyio_client_time}, URL: ${record.url}, 事件: ${record.log_event_type}`);
        });
      }
      break;
      
    case 'rebuild':
      console.log('重建索引...');
      await db.rebuildIndexes();
      break;
      
    default:
      console.log('用法:');
      console.log('  node db-manager.js init          # 初始化数据库');
      console.log('  node db-manager.js stats         # 查看统计信息');
      console.log('  node db-manager.js query <用户ID> [开始日期] [结束日期]  # 查询用户数据');
      console.log('  node db-manager.js rebuild       # 重建索引');
      break;
  }
}

main().catch(console.error);