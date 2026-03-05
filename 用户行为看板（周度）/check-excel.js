import XLSX from 'xlsx';
import fs from 'fs';

const fileName = '26年3月3日用户行为日志.xlsx';

if (fs.existsSync(fileName)) {
  try {
    console.log(`检查文件: ${fileName}`);
    const workbook = XLSX.readFile(fileName);
    
    console.log('工作表列表:', workbook.SheetNames);
    
    workbook.SheetNames.forEach(sheetName => {
      console.log(`\n=== 工作表: ${sheetName} ===`);
      const worksheet = workbook.Sheets[sheetName];
      
      // 检查工作表是否为空
      if (!worksheet['!ref']) {
        console.log('工作表为空（没有数据）');
        return;
      }
      
      console.log('工作表范围:', worksheet['!ref']);
      
      // 尝试不同的解析方式
      const data1 = XLSX.utils.sheet_to_json(worksheet);
      console.log('JSON解析结果行数:', data1.length);
      
      const data2 = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log('数组解析结果行数:', data2.length);
      
      if (data2.length > 0) {
        console.log('前3行数据:');
        data2.slice(0, 3).forEach((row, i) => {
          console.log(`第${i+1}行:`, row);
        });
      }
    });
    
  } catch (error) {
    console.error('读取失败:', error);
  }
} else {
  console.log('文件不存在:', fileName);
}

// 创建测试数据
console.log('\n=== 创建测试数据 ===');
const testData = [
  { '用户ID': '22564264', '时间': '2026-03-03 10:00:00', '页面': '/home', '操作': 'visit' },
  { '用户ID': '22564264', '时间': '2026-03-03 10:01:00', '页面': '/search', '操作': 'search' },
  { '用户ID': '22564264', '时间': '2026-03-03 10:02:00', '页面': '/detail', '操作': 'view' },
  { '用户ID': '12345678', '时间': '2026-03-03 11:00:00', '页面': '/home', '操作': 'visit' },
  { '用户ID': '12345678', '时间': '2026-03-03 11:01:00', '页面': '/login', '操作': 'login' }
];

const newWorkbook = XLSX.utils.book_new();
const newWorksheet = XLSX.utils.json_to_sheet(testData);
XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, '用户行为数据');
XLSX.writeFile(newWorkbook, '测试数据.xlsx');
console.log('已创建测试数据文件: 测试数据.xlsx');