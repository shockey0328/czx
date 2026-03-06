# Vercel方案A部署指南

## 📋 方案概述

使用Vercel Serverless Functions + GitHub Releases存储数据

### 架构
```
用户浏览器
    ↓
Vercel (前端 + Serverless API)
    ↓
GitHub Releases (数据文件)
    ↓
DeepSeek API (AI分析)
```

### 优势
- ✅ 完全免费（Vercel + GitHub）
- ✅ 无需额外云存储服务
- ✅ 自动部署（Git推送即部署）
- ✅ 全球CDN加速

---

## 🚀 部署步骤

### 步骤1：上传数据到GitHub Releases

1. **访问GitHub仓库**
   ```
   https://github.com/shockey0328/czx/releases
   ```

2. **创建新Release**
   - 点击"Create a new release"
   - Tag: `data-v1.0`
   - Title: `用户行为数据 v1.0`

3. **上传数据文件**
   上传以下7个文件：
   ```
   用户行为看板（周度）/data/2026-02-26.json
   用户行为看板（周度）/data/2026-02-27.json
   用户行为看板（周度）/data/2026-02-28.json
   用户行为看板（周度）/data/2026-03-01.json
   用户行为看板（周度）/data/2026-03-02.json
   用户行为看板（周度）/data/2026-03-03.json
   用户行为看板（周度）/data/2026-03-04.json
   ```

4. **发布Release**
   - 点击"Publish release"
   - 等待上传完成（约10-30分钟）

### 步骤2：推送代码到GitHub

```bash
# 添加新文件
git add .

# 提交
git commit -m "添加Vercel方案A：使用GitHub Releases存储数据"

# 推送
git push origin main
```

### 步骤3：部署到Vercel

1. **登录Vercel**
   ```
   https://vercel.com
   ```

2. **导入项目**
   - 点击"Add New" → "Project"
   - 选择GitHub仓库：shockey0328/czx
   - 点击"Import"

3. **配置环境变量**
   - 点击"Environment Variables"
   - 添加：
     - `DEEPSEEK_API_KEY`：DeepSeek API 密钥（必填）
     - `GITHUB_RELEASE_BASE_URL`（可选）：若 Release 不是默认地址，填完整下载前缀，如 `https://github.com/你的用户名/czx/releases/download/data-v1.0`

4. **部署**
   - 点击"Deploy"
   - 等待部署完成（约2-3分钟）

### 步骤4：测试

访问Vercel生成的URL：
```
https://your-project.vercel.app/user-behavior
```

---

## 📁 新增文件说明

### 1. API 文件（整站部署时使用根目录 api）

**根目录 api/getData.js**
- 从 GitHub Releases 读取数据（默认 `data-v1.0`）
- 支持日期范围筛选、多用户查询
- 可选环境变量：`GITHUB_RELEASE_BASE_URL`（若 Release 地址不同可覆盖）

**根目录 api/analyze.js**
- 接收前端传入的 `logs` + `userDescription`，调用 DeepSeek 返回分析结果

### 2. 前端文件

**用户行为看板（周度）/dashboard-vercel.html**
- Vercel专用前端页面
- 调用Serverless API
- 显示数据和AI分析

### 3. 配置文件

**vercel.json**
- Vercel部署配置
- API路由配置
- 内存和超时设置

---

## 🔗 访问地址

### Vercel部署后

- **主看板：** https://your-project.vercel.app/
- **用户行为看板：** https://your-project.vercel.app/user-behavior

### 本地测试

```bash
# 安装Vercel CLI
npm install -g vercel

# 本地运行
cd 用户行为看板（周度）
vercel dev
```

---

## ⚙️ 工作原理

### 数据查询流程

1. 用户输入查询条件
2. 前端调用 `/api/getData`
3. API从GitHub Releases下载对应日期的JSON文件
4. 筛选指定用户的数据
5. 返回结果给前端

### AI分析流程

1. 用户点击"AI分析"
2. 前端调用 `/api/analyze`
3. API将数据发送给DeepSeek
4. 返回AI分析结果

---

## 💡 性能优化

### 首次加载优化

由于数据从GitHub下载，首次加载可能需要10-30秒。可以：

1. **添加缓存**
   ```javascript
   // 在Vercel Edge Config中缓存数据
   ```

2. **预加载常用数据**
   ```javascript
   // 在API中预加载最近7天的数据
   ```

3. **使用CDN**
   - GitHub Releases自带CDN
   - 全球访问速度较快

### Vercel限制

- **执行时间：** 最多10秒（Hobby计划）
- **内存：** 最多1GB
- **响应大小：** 最多4.5MB

如果单个文件超过4.5MB，需要分批返回数据。

---

## 🔄 更新数据

### 添加新数据

1. **创建新Release**
   - Tag: `data-v1.1`
   - 上传新的JSON文件

2. **更新API代码**
   ```javascript
   // 修改 getData.js
   const GITHUB_RELEASE_BASE_URL = 'https://github.com/shockey0328/czx/releases/download/data-v1.1';
   
   const AVAILABLE_DATES = [
     '2026-02-26',
     // ... 添加新日期
     '2026-03-05'
   ];
   ```

3. **推送代码**
   ```bash
   git add .
   git commit -m "更新数据到v1.1"
   git push origin main
   ```

4. **Vercel自动部署**

---

## 🆚 方案对比

### Vercel方案A vs Railway

| 特性 | Vercel方案A | Railway |
|------|-------------|---------|
| 成本 | 免费 | 免费（500小时/月） |
| 数据存储 | GitHub Releases | Git LFS |
| 首次加载 | 10-30秒 | 即时 |
| 执行时间 | 10秒限制 | 无限制 |
| 内存 | 1GB | 可配置 |
| 部署 | 自动 | 自动 |
| 维护 | 简单 | 简单 |

### 推荐

- **数据量小（<100MB）：** Vercel方案A
- **数据量大（>100MB）：** Railway
- **需要长时间处理：** Railway
- **追求简单免费：** Vercel方案A

---

## 🐛 故障排查

### 问题1：数据加载失败

**错误：** Failed to fetch data from GitHub

**解决：**
1. 检查Release是否已发布
2. 确认文件URL是否正确
3. 检查网络连接

### 问题2：API超时

**错误：** Function execution timed out

**解决：**
1. 减少日期范围
2. 优化数据加载逻辑
3. 考虑使用Railway

### 问题3：AI分析失败

**错误：** DeepSeek API error

**解决：**
1. 检查环境变量DEEPSEEK_API_KEY
2. 确认API额度充足
3. 查看Vercel日志

---

## 📊 成本分析

### 完全免费方案

- **Vercel：** 免费（Hobby计划）
  - 100GB带宽/月
  - 100GB-小时执行时间/月
  - 无限部署

- **GitHub：** 免费
  - 无限Releases
  - 无限下载次数
  - 2GB单文件限制

- **DeepSeek API：** 按使用付费
  - 约￥0.001/次分析
  - 月使用成本<￥10

### 总成本

**月成本：** ￥0-10（仅AI API费用）

---

## ✅ 部署检查清单

- [ ] 数据文件已上传到GitHub Releases
- [ ] Release已发布（tag: data-v1.0）
- [ ] 代码已推送到GitHub
- [ ] Vercel项目已创建
- [ ] 环境变量已配置（DEEPSEEK_API_KEY）
- [ ] 部署成功
- [ ] 访问 /user-behavior 页面正常
- [ ] 数据查询功能正常
- [ ] AI分析功能正常

---

## 🎯 下一步

1. **上传数据到GitHub Releases**
2. **推送代码到GitHub**
3. **部署到Vercel**
4. **测试功能**

---

**准备好了吗？开始上传数据到GitHub Releases吧！**
