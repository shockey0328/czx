# 橙子学数据看板 (CZX Dashboard)

一个现代化的数据可视化看板系统，用于展示和分析各类业务数据。

## 🌟 功能特性

### 多维度数据看板
- **月度核心数据看板** - 展示月度关键业务指标
- **周度核心数据看板** - 四宫格布局的周度数据分析
- **搜索数据看板** - 搜索行为和转化分析
- **用户行为看板** - 基于AI的用户行为分析系统
- **各模块渗透率看板** - 模块使用情况分析
- **分省数据看板** - 各省份核心数据和趋势分析

### 核心功能
- ✅ 实时数据展示
- ✅ 环比/同比数据对比
- ✅ 交互式图表（基于 Chart.js 和 ECharts）
- ✅ 时间范围筛选（3/6/12个月）
- ✅ AI 数据分析（DeepSeek API）
- ✅ 小橙子 AI 助手
- ✅ 响应式设计，支持移动端
- ✅ 统一的橙色主题设计

## 🚀 快速开始

### 在线访问
访问部署在 Vercel 的在线版本：[https://czx-dashboard.vercel.app](https://czx-dashboard.vercel.app)

### 本地运行

#### 方法一：完整系统启动（推荐 - 包含用户行为看板）

1. **一键启动所有服务**
```bash
# 双击运行
启动完整看板系统.bat
```

2. **访问看板**
```
在浏览器中打开: http://localhost:8000/index.html
```

**重要说明：**
- 主看板必须通过HTTP服务器访问（不能直接双击index.html）
- 用户行为看板需要Node.js服务器支持
- 其他看板（核心数据、搜索数据等）可直接访问

#### 方法二：仅启动主看板（不含用户行为看板）

1. **启动HTTP服务器**
```bash
# 使用Python
python -m http.server 8000

# 或双击运行
启动看板.bat
```

2. **访问看板**
```
在浏览器中打开: http://localhost:8000/index.html
```

3. **更新数据**
```bash
# Windows
更新数据.bat

# 或手动运行 PowerShell 脚本
powershell -ExecutionPolicy Bypass -File convert_csv_to_js_v2.ps1
```

## 📊 看板说明

### 1. 主看板 (index.html)
- 统一的导航入口
- 周度/月度切换
- 看板类型选择

### 2. 月度核心数据看板
**路径：** `核心数据看板（月度）/index-static.html`

**功能：**
- 6个核心指标卡片（环比+同比）
- 3个趋势图表（月活、营收、留存率）
- 时间范围切换（3/6/12个月）
- B端核心数据展示
- AI 数据分析
- 小橙子 AI 助手

### 3. 周度核心数据看板
**路径：** `核心数据看板（周度）/index.html`

**功能：**
- 四宫格布局
- 周度核心数据指标
- 趋势分析图表
- 用户留存热力图
- 小橙子 AI 助手

### 4. 搜索数据看板
**路径：** `搜索数据看板（周度）/index.html`

**功能：**
- 搜索行为漏斗
- 搜索转化率分析
- 搜索功能留存
- 热门搜索词云图

### 5. 用户行为看板
**路径：** `用户行为看板（周度）/dashboard-db.html`（需要服务器）

**功能：**
- 自动加载本地数据到高性能数据库
- 时间段筛选和多用户ID查询
- DeepSeek AI智能分析用户行为
- 对话式交互界面
- 支持标准分析和针对性问题分析
- 橙色主题设计

**启动方式：**
```bash
cd 用户行为看板（周度）
npm install  # 首次运行
node server-with-db.js
# 访问 http://localhost:3001/dashboard-db.html
```

### 6. 各模块渗透率看板
**路径：** `各模块渗透率看板（月度）/index.html`

**功能：**
- 模块渗透率趋势
- 环比增长分析
- 一级模块筛选
- 深色主题设计

### 7. 分省数据看板
**路径：** `分省数据看板（月度）/index.html`

**功能：**
- 各省核心指标展示
- 省份排名对比（活跃用户、营收、ARPU、使用率）
- 省份趋势分析（支持选择省份和时间周期）
- AI 数据分析报告
- 支持7个省份（福建、山东、江苏、广东、安徽、辽宁、河南）

## 🛠️ 技术栈

- **前端框架：** 纯 HTML/CSS/JavaScript
- **图表库：** 
  - Chart.js 3.9.1
  - ECharts 5.4.3
- **AI 服务：** DeepSeek API
- **部署平台：** Vercel
- **版本控制：** Git

## 📁 项目结构

```
czx-dashboard/
├── index.html                          # 主看板入口
├── styles.css                          # 全局样式
├── main.js                            # 主逻辑
├── logo.png                           # Logo 图片
├── 核心数据看板（月度）/
│   ├── index-static.html              # 月度看板
│   └── data.js                        # 月度数据
├── 核心数据看板（周度）/
│   ├── index.html                     # 周度看板
│   └── data.js                        # 周度数据
├── 搜索数据看板（周度）/
│   ├── index.html                     # 搜索看板
│   └── *.csv                          # CSV 数据文件
├── 用户行为看板（周度）/
│   ├── dashboard-db.html              # 用户行为看板
│   ├── server-with-db.js              # Node.js服务器
│   ├── database.js                    # 数据库逻辑
│   ├── db-manager.js                  # 数据库管理工具
│   └── data/                          # 数据存储目录
├── 各模块渗透率看板（月度）/
│   ├── index.html                     # 渗透率看板
│   ├── styles.css                     # 样式文件
│   └── data.js                        # 渗透率数据
├── 分省数据看板（月度）/
│   ├── index.html                     # 分省看板
│   ├── app.js                         # 主逻辑
│   ├── style.css                      # 样式文件
│   ├── 分省核心数据.csv               # 核心数据
│   └── 分省趋势数据（各省）.csv       # 趋势数据
├── convert_csv_to_js_v2.ps1          # 数据转换脚本
├── 更新数据.bat                       # 数据更新工具
└── README.md                          # 项目说明
```

## 🎨 设计规范

### 颜色主题
- **主色：** #FF6B35（橙色）
- **辅助色：** #FFA366（浅橙色）
- **背景色：** #FFFFFF（白色）
- **文字色：** #333333（深灰）

### 样式特点
- 统一的橙色主题
- 白色背景，简洁清爽
- 卡片式布局
- 中国风格数据展示（红涨绿跌）
- 响应式设计

## 🔧 数据更新

### 自动更新
运行 `更新数据.bat` 自动转换所有 CSV 文件为 JS 格式。

### 手动更新
1. 编辑对应的 CSV 文件
2. 运行转换脚本：
```bash
powershell -ExecutionPolicy Bypass -File convert_csv_to_js_v2.ps1
```

### 数据格式
CSV 文件需要包含以下列（根据看板类型）：
- 年份、月份/周次
- 各项指标数据
- 确保数据格式正确（数字、百分比等）

## 🤖 AI 功能

### DeepSeek API 配置
AI 功能需要 DeepSeek API 密钥。如需使用：

1. 获取 API 密钥：[https://platform.deepseek.com](https://platform.deepseek.com)
2. 在代码中配置密钥（已内置）
3. AI 功能包括：
   - 自动数据分析
   - 小橙子对话助手
   - 策略建议生成

## 📱 浏览器支持

- Chrome (推荐)
- Edge
- Firefox
- Safari
- 移动端浏览器

## 🚀 部署到 Vercel

### 方法一：通过 Vercel CLI

1. 安装 Vercel CLI
```bash
npm install -g vercel
```

2. 登录并部署
```bash
vercel login
vercel
```

### 方法二：通过 GitHub 集成

1. 将代码推送到 GitHub
2. 访问 [Vercel](https://vercel.com)
3. 导入 GitHub 仓库
4. 自动部署完成

## 📝 更新日志

### v2.1 (2026-03-03)
- ✅ 新增分省数据看板
- ✅ 集成到月度看板导航
- ✅ 更新各模块渗透率看板（添加26年2月数据）
- ✅ Chart.js本地化（分省看板）
- ✅ 完善文档和测试工具

### v2.0 (2026-02-27)
- ✅ 完成月度看板升级（8个功能）
- ✅ 统一所有看板样式
- ✅ 优化顶部导航栏
- ✅ 移除子看板 logo
- ✅ 统一白色背景主题
- ✅ 修复 AI 功能问题
- ✅ 添加完整文档

### v1.0
- 初始版本发布
- 基础看板功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👥 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- Email: your-email@example.com

---

**Made with ❤️ by CZX Team**
