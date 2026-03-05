import XLSX from 'xlsx';
import fs from 'fs';

const files = fs.readdirSync('.').filter(f => 
  f.includes('2026年') && f.includes('用户行为日志') && f.endsWith('.xlsx')
);

console.log('检查所有Excel文件的字段名...\n');

for (const fileName of files) {
  try {
    console.log(`=== ${fileName} ===`);
    const workbook = XLSX.readFile(fileName);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet['!ref']) {
      console.log('工作表为空');
      continue;
    }
    
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    
    if (data.length > 0) {
      console.log('字段名:', Object.keys(data[0]));
      console.log('记录数:', data.length);
      
      // 显示第一条记录的部分数据
      const firstRecord = data[0];
      console.log('第一条记录示例:');
      Object.entries(firstRecord).slice(0, 5).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    } else {
      console.log('没有数据');
    }
    
    console.log('');
  } catch (error) {
    console.error(`读取失败: ${fileName}`, error.message);
  }
}