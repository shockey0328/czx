// 修复3月3日数据 - 将Excel转换为JSON
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelFile = '用户行为看板（周度）/2026年3月3日用户行为日志.xlsx';
const outputFile = '用户行为看板（周度）/data/2026-03-03.json';

console.log('开始转换3月3日数据...');
console.log(`读取文件: ${excelFile}`);

try {
    // 读取Excel文件
    const workbook = XLSX.readFile(excelFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 转换为JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`读取到 ${jsonData.length} 条记录`);
    
    // 写入JSON文件
    fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2));
    
    // 检查文件大小
    const stats = fs.statSync(outputFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ 转换成功！`);
    console.log(`输出文件: ${outputFile}`);
    console.log(`文件大小: ${fileSizeMB} MB`);
    console.log(`记录数: ${jsonData.length}`);
    
} catch (error) {
    console.error('❌ 转换失败:', error.message);
    process.exit(1);
}
