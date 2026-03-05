import express from 'express';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 缓存数据
let dataCache = {};
let cacheTimestamp = {};

// 读取Excel文件
function readExcelFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    console.log(`  - 工作表: ${sheetName}, 行数: ${data.length}`);
    if (data.length > 0) {
      console.log(`  - 列名: ${Object.keys(data[0]).join(', ')}`);
    }
    return data;
  } catch (error) {
    throw new Error(`读取文件失败: ${error.message}`);
  }
}

// 获取日期范围内的数据
app.post('/api/getData', async (req, res) => {
  console.log('\n=== 收到数据请求 ===');
  console.log('请求体:', req.body);
  
  try {
    const { startDate, endDate } = req.body;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    console.log(`查询日期范围: ${startDate} 到 ${endDate}`);
    
    let allData = [];
    let loadedFiles = 0;
    let errorFiles = 0;
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      
      // 尝试多种文件格式和年份格式
      const fileNames = [
        `${year}年${month}月${day}日用户行为日志.xlsx`,
        `${year}年${month}月${day}日用户行为日志.csv`,
        `${year}年${month}月${day}日用户行为日志.xls`,
        `${String(year).slice(-2)}年${month}月${day}日用户行为日志.xlsx`,
        `${String(year).slice(-2)}年${month}月${day}日用户行为日志.csv`,
        `${String(year).slice(-2)}年${month}月${day}日用户行为日志.xls`
      ];
      
      let fileLoaded = false;
      
      for (const fileName of fileNames) {
        const filePath = path.join(__dirname, fileName);
        const cacheKey = fileName;
        
        if (!fs.existsSync(filePath)) continue;
        
        console.log(`找到文件: ${fileName}`);
        
        const fileStats = fs.statSync(filePath);
        
        if (dataCache[cacheKey] && cacheTimestamp[cacheKey] === fileStats.mtimeMs) {
          // 使用缓存
          console.log(`使用缓存: ${fileName} (${dataCache[cacheKey].length} 条记录)`);
          allData = allData.concat(dataCache[cacheKey]);
          loadedFiles++;
          fileLoaded = true;
          break;
        } else {
          // 读取文件并缓存
          try {
            console.log(`读取文件: ${fileName}`);
            const data = readExcelFile(filePath);
            dataCache[cacheKey] = data;
            cacheTimestamp[cacheKey] = fileStats.mtimeMs;
            allData = allData.concat(data);
            loadedFiles++;
            fileLoaded = true;
            console.log(`成功读取: ${fileName} (${data.length} 条记录)`);
            break;
          } catch (error) {
            console.error(`读取失败: ${fileName}`, error.message);
          }
        }
      }
      
      if (!fileLoaded) {
        errorFiles++;
        console.log(`未找到文件: ${String(year).slice(-2)}年${month}月${day}日 (尝试了${fileNames.length}种格式)`);
      }
    }
    
    console.log(`\n查询结果: 加载${loadedFiles}个文件, ${errorFiles}个文件未找到, 总计${allData.length}条记录\n`);
    
    res.json({
      success: true,
      data: allData,
      loadedFiles,
      errorFiles,
      totalRecords: allData.length
    });
  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 启动时预加载数据
async function preloadData() {
  console.log('开始预加载数据...');
  try {
    const files = fs.readdirSync(__dirname).filter(f => 
      f.includes('用户行为日志') && (f.endsWith('.xlsx') || f.endsWith('.csv') || f.endsWith('.xls'))
    );
    
    console.log(`找到文件: ${files.join(', ')}`);
    
    for (const fileName of files) {
      const filePath = path.join(__dirname, fileName);
      try {
        const data = readExcelFile(filePath);
        const fileStats = fs.statSync(filePath);
        dataCache[fileName] = data;
        cacheTimestamp[fileName] = fileStats.mtimeMs;
        console.log(`已加载: ${fileName} (${data.length} 条记录)`);
      } catch (error) {
        console.error(`加载失败: ${fileName}`, error.message);
      }
    }
    console.log(`\n预加载完成！共加载 ${Object.keys(dataCache).length} 个文件`);
    console.log(`总记录数: ${Object.values(dataCache).reduce((sum, data) => sum + data.length, 0)} 条\n`);
  } catch (error) {
    console.error('预加载失败:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`\n========================================`);
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`请访问: http://localhost:${PORT}/dashboard.html`);
  console.log(`========================================\n`);
  await preloadData();
});
