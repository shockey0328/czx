import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UserBehaviorDB {
  constructor() {
    this.dbPath = path.join(__dirname, 'data');
    this.indexPath = path.join(__dirname, 'data', 'indexes');
    this.userIndex = new Map(); // 用户ID -> 文件列表映射
    this.dateIndex = new Map(); // 日期 -> 文件映射
    this.initialized = false;
    
    // 确保目录存在
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }
    if (!fs.existsSync(this.indexPath)) {
      fs.mkdirSync(this.indexPath, { recursive: true });
    }
  }

  // 初始化数据库
  async initialize() {
    if (this.initialized) return;
    
    console.log('初始化用户行为数据库...');
    
    // 加载索引
    await this.loadIndexes();
    
    // 如果没有数据，从Excel文件导入
    if (this.userIndex.size === 0) {
      await this.importFromExcel();
    }
    
    this.initialized = true;
    console.log(`数据库初始化完成！用户数: ${this.userIndex.size}, 日期数: ${this.dateIndex.size}`);
  }

  // 从Excel文件导入数据
  async importFromExcel() {
    console.log('开始从Excel文件导入数据...');
    
    const excelFiles = fs.readdirSync(__dirname).filter(f => 
      f.includes('用户行为日志') && f.endsWith('.xlsx') && !f.startsWith('~$')
    );
    
    let totalRecords = 0;
    
    for (const fileName of excelFiles) {
      try {
        console.log(`处理文件: ${fileName}`);
        const filePath = path.join(__dirname, fileName);
        const data = this.readExcelFile(filePath);
        
        if (data.length > 0) {
          // 提取日期（从文件名）
          const dateMatch = fileName.match(/(\d{2,4})年(\d{1,2})月(\d{1,2})日/);
          if (dateMatch) {
            let year = dateMatch[1];
            if (year.length === 2) year = '20' + year;
            const month = dateMatch[2].padStart(2, '0');
            const day = dateMatch[3].padStart(2, '0');
            const date = `${year}-${month}-${day}`;
            
            await this.saveDataByDate(date, data);
            totalRecords += data.length;
          }
        }
      } catch (error) {
        console.error(`处理文件失败: ${fileName}`, error.message);
      }
    }
    
    // 保存索引
    await this.saveIndexes();
    console.log(`导入完成！总记录数: ${totalRecords}`);
  }

  // 将单行数据标准化为统一字段（Excel/CSV 共用）
  _normalizeRow(row, logHeaderOnce = false) {
    if (logHeaderOnce && row && Object.keys(row).length) {
      console.log('  原始字段名:', Object.keys(row).slice(0, 10));
    }
    return {
      xyio_client_time: row.xyio_client_time ?? row['客户端时间'] ?? row.client_time ?? row.time ?? '',
      user_id: row.user_id ?? row['用户ID'] ?? row.userId ?? row.USER_ID ?? '',
      device_id: row.device_id ?? row['设备ID'] ?? row.deviceId ?? '',
      url: row.url ?? row.request_url ?? row['请求URL'] ?? row.URL ?? row.page_url ?? '',
      referrer: row.referrer ?? row['来源页面'] ?? row.ref ?? '',
      source: row.source ?? row.product_source_id ?? row['产品来源'] ?? row.src ?? '',
      platform: row.platform ?? row['平台'] ?? row.os ?? '',
      element_class_name: row.element_class_name ?? row.html_element_class_name ?? row['元素类名'] ?? row.class_name ?? '',
      element_content: row.element_content ?? row.html_element_content ?? row['元素内容'] ?? row.content ?? '',
      element_id: row.element_id ?? row.html_element_id ?? row['元素ID'] ?? row.id ?? '',
      element_name: row.element_name ?? row.html_element_name ?? row['元素名称'] ?? row.name ?? '',
      log_event_type: row.log_event_type ?? row['事件类型'] ?? row.event_type ?? row.event ?? '',
      xyio_backend_time: row.xyio_backend_time ?? row['后端时间'] ?? row.backend_time ?? row.server_time ?? '',
      dt: row.dt ?? row['日期'] ?? row.date ?? ''
    };
  }

  // 读取 CSV 文件（流式解析，大文件不卡顿，推荐 40MB+ 用 CSV）
  readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const rows = [];
      let first = true;
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          if (first) {
            console.log('  原始字段名:', Object.keys(row).slice(0, 10));
            first = false;
          }
          rows.push(this._normalizeRow(row, false));
        })
        .on('end', () => {
          console.log(`  已解析 ${rows.length} 行（CSV）`);
          resolve(rows);
        })
        .on('error', (err) => reject(new Error(`读取 CSV 失败: ${err.message}`)));
    });
  }

  // 读取Excel文件（大文件时使用 buffer + dense 降低内存）
  readExcelFile(filePath) {
    try {
      console.log('  读取文件中...');
      const buf = fs.readFileSync(filePath);
      const sizeMB = (buf.length / 1024 / 1024).toFixed(1);
      console.log(`  已读取 ${sizeMB} MB，正在解析 Excel（大文件可能需 1～5 分钟）...`);
      let workbook;
      try {
        workbook = XLSX.read(buf, { type: 'buffer', cellStyles: false });
      } catch (parseErr) {
        throw new Error(`Excel 解析失败，可能是文件损坏或格式不被支持: ${parseErr.message}`);
      }
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) return [];
      const sheetName = workbook.SheetNames[0];
      let worksheet = workbook.Sheets[sheetName];
      if (!worksheet && workbook.Sheets) {
        const firstKey = Object.keys(workbook.Sheets)[0];
        worksheet = workbook.Sheets[firstKey];
      }
      if (!worksheet || !worksheet['!ref']) return [];
      
      console.log('  正在转换为 JSON 行...');
      let data;
      try {
        data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      } catch (jsonErr) {
        throw new Error(`表格转 JSON 失败（可能内存不足）: ${jsonErr.message}`);
      }
      console.log(`  已解析 ${data.length} 行，正在标准化字段...`);
      return data.map((row, i) => this._normalizeRow(row, i === 0));
    } catch (error) {
      throw new Error(`读取Excel文件失败: ${error.message}`);
    }
  }

  // 按日期保存数据（分片存储）
  async saveDataByDate(date, data) {
    const dateFile = path.join(this.dbPath, `${date}.json`);
    console.log(`  正在按用户分组并写入 ${date}.json...`);
    
    // 按用户ID分组，便于后续查询
    const userGroups = {};
    data.forEach(record => {
      const userId = record.user_id;
      if (!userGroups[userId]) {
        userGroups[userId] = [];
      }
      userGroups[userId].push(record);
    });
    
    // 保存到文件（不格式化以省内存、省磁盘、加快写入）
    fs.writeFileSync(dateFile, JSON.stringify({
      date,
      recordCount: data.length,
      userGroups
    }));
    
    // 更新索引
    this.dateIndex.set(date, dateFile);
    
    // 更新用户索引
    Object.keys(userGroups).forEach(userId => {
      if (!this.userIndex.has(userId)) {
        this.userIndex.set(userId, new Set());
      }
      this.userIndex.get(userId).add(date);
    });
    
    console.log(`  保存 ${date}: ${data.length} 条记录, ${Object.keys(userGroups).length} 个用户`);
  }

  // 查询用户行为数据
  async queryUserBehavior(userIds, startDate, endDate) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const results = [];
    const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
    
    // 生成日期范围
    const dates = this.getDateRange(startDate, endDate);
    
    for (const date of dates) {
      if (!this.dateIndex.has(date)) continue;
      
      const dateFile = this.dateIndex.get(date);
      if (!fs.existsSync(dateFile)) continue;
      
      try {
        const dateData = JSON.parse(fs.readFileSync(dateFile, 'utf8'));
        
        // 查找指定用户的数据
        for (const userId of userIdArray) {
          if (dateData.userGroups[userId]) {
            results.push(...dateData.userGroups[userId]);
          }
        }
      } catch (error) {
        console.error(`读取日期文件失败: ${date}`, error.message);
      }
    }
    
    // 按时间排序
    results.sort((a, b) => {
      const timeA = String(a.xyio_client_time || a.xyio_backend_time || '');
      const timeB = String(b.xyio_client_time || b.xyio_backend_time || '');
      return timeA.localeCompare(timeB);
    });
    
    return results;
  }

  // 获取日期范围
  getDateRange(startDate, endDate) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    
    return dates;
  }

  // 获取统计信息
  async getStats() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    let totalRecords = 0;
    const availableDates = Array.from(this.dateIndex.keys()).sort();
    
    for (const date of availableDates) {
      const dateFile = this.dateIndex.get(date);
      if (fs.existsSync(dateFile)) {
        try {
          const dateData = JSON.parse(fs.readFileSync(dateFile, 'utf8'));
          totalRecords += dateData.recordCount || 0;
        } catch (error) {
          console.error(`读取统计信息失败: ${date}`, error.message);
        }
      }
    }
    
    return {
      totalUsers: this.userIndex.size,
      totalRecords,
      availableDates,
      dateRange: availableDates.length > 0 ? {
        start: availableDates[0],
        end: availableDates[availableDates.length - 1]
      } : null
    };
  }

  // 保存索引
  async saveIndexes() {
    // 保存用户索引
    const userIndexData = {};
    this.userIndex.forEach((dates, userId) => {
      userIndexData[userId] = Array.from(dates);
    });
    fs.writeFileSync(
      path.join(this.indexPath, 'user_index.json'),
      JSON.stringify(userIndexData, null, 2)
    );
    
    // 保存日期索引
    const dateIndexData = {};
    this.dateIndex.forEach((filePath, date) => {
      dateIndexData[date] = filePath;
    });
    fs.writeFileSync(
      path.join(this.indexPath, 'date_index.json'),
      JSON.stringify(dateIndexData, null, 2)
    );
  }

  // 加载索引（分别加载，避免一个失败导致全部为空、进而被误判为“全部要重新导入”）
  async loadIndexes() {
    // 先加载日期索引（小文件，且「仅导入新增」主要依赖它）
    const dateIndexFile = path.join(this.indexPath, 'date_index.json');
    if (fs.existsSync(dateIndexFile)) {
      try {
        const raw = fs.readFileSync(dateIndexFile, 'utf8').trim();
        if (raw) {
          const dateIndexData = JSON.parse(raw);
          Object.entries(dateIndexData).forEach(([date, filePath]) => {
            this.dateIndex.set(date, filePath);
          });
          console.log(`  已加载日期索引: ${this.dateIndex.size} 天`);
        }
      } catch (e) {
        console.error('加载 date_index.json 失败:', e.message);
      }
    }

    // 再加载用户索引（大文件，失败时仅影响查询，不影响「仅导入新增」）
    const userIndexFile = path.join(this.indexPath, 'user_index.json');
    if (fs.existsSync(userIndexFile)) {
      try {
        const userIndexData = JSON.parse(fs.readFileSync(userIndexFile, 'utf8'));
        Object.entries(userIndexData).forEach(([userId, dates]) => {
          this.userIndex.set(userId, new Set(dates));
        });
        console.log(`  已加载用户索引: ${this.userIndex.size} 个用户`);
      } catch (e) {
        console.error('加载 user_index.json 失败:', e.message, '（仅导入新增日期仍可继续，完成后会重建用户索引）');
      }
    }
  }

  // 重建索引（用于数据修复）
  async rebuildIndexes() {
    console.log('重建索引...');
    this.userIndex.clear();
    this.dateIndex.clear();
    
    const dataFiles = fs.readdirSync(this.dbPath).filter(f => f.endsWith('.json'));
    
    for (const fileName of dataFiles) {
      const date = fileName.replace('.json', '');
      const filePath = path.join(this.dbPath, fileName);
      
      try {
        const dateData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.dateIndex.set(date, filePath);
        
        Object.keys(dateData.userGroups || {}).forEach(userId => {
          if (!this.userIndex.has(userId)) {
            this.userIndex.set(userId, new Set());
          }
          this.userIndex.get(userId).add(date);
        });
      } catch (error) {
        console.error(`重建索引失败: ${fileName}`, error.message);
      }
    }
    
    await this.saveIndexes();
    console.log('索引重建完成');
  }

  // 强制从当前目录所有 Excel 重新导入（用于新增日期如 3月5日）
  async forceImportFromExcel() {
    console.log('强制从 Excel 重新导入...');
    this.userIndex.clear();
    this.dateIndex.clear();
    await this.importFromExcel();
    console.log(`导入完成。用户数: ${this.userIndex.size}, 日期数: ${this.dateIndex.size}`);
  }

  // 仅导入「新增日期」：先加载已有索引，只处理 data/ 里尚不存在的日期对应 Excel
  async importNewFromExcel() {
    console.log('仅导入新增日期的 Excel...');
    await this.loadIndexes();
    const excelFiles = fs.readdirSync(__dirname).filter(f =>
      f.includes('用户行为日志') && f.endsWith('.xlsx') && !f.startsWith('~$')
    );
    const toProcess = [];
    for (const fileName of excelFiles) {
      const dateMatch = fileName.match(/(\d{2,4})年(\d{1,2})月(\d{1,2})日/);
      if (dateMatch) {
        let year = dateMatch[1];
        if (year.length === 2) year = '20' + year;
        const date = `${year}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
        if (!this.dateIndex.has(date)) toProcess.push({ fileName, date });
      }
    }
    if (toProcess.length === 0) {
      console.log('没有新增日期需要导入（所有 Excel 对应日期已存在）。');
      return;
    }
    console.log(`发现 ${toProcess.length} 个新增日期: ${toProcess.map(p => p.date).join(', ')}`);
    let totalRecords = 0;
    for (const { fileName, date } of toProcess) {
      try {
        const baseName = fileName.replace(/\.xlsx$/i, '');
        const csvName = `${baseName}.csv`;
        const csvPath = path.join(__dirname, csvName);
        const xlsxPath = path.join(__dirname, fileName);
        let data;
        if (fs.existsSync(csvPath)) {
          console.log(`处理文件: ${csvName}（CSV 流式解析，大文件更快）`);
          data = await this.readCSVFile(csvPath);
        } else {
          console.log(`处理文件: ${fileName}`);
          data = this.readExcelFile(xlsxPath);
        }
        if (data.length > 0) {
          await this.saveDataByDate(date, data);
          totalRecords += data.length;
        }
      } catch (error) {
        console.error(`处理文件失败: ${fileName}`, error.message);
      }
    }
    await this.saveIndexes();
    console.log(`导入完成。本次新增 ${totalRecords} 条记录，当前共 ${this.dateIndex.size} 天。`);
  }
}

export default UserBehaviorDB;