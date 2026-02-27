# 月度数据分析看板

一个现代化的React数据看板应用，集成了智能AI助手"小橙子"，用于展示和分析月度核心数据及B端业务数据。

## 🌐 在线演示

部署地址：[即将更新]

## ✨ 核心亮点

### 🍊 小橙子 AI 助手（新功能）
- **智能对话**: 基于DeepSeek AI的智能数据分析助手
- **成长学习**: 记忆对话历史，学习用户偏好，提供个性化分析
- **上下文理解**: 基于当前数据和历史对话提供精准回答
- **数据洞察积累**: 自动保存重要发现，持续优化分析质量
- **友好交互**: 固定在页面左侧，随时可用的对话界面

## 功能特性

### 📊 核心指标展示
- **用户模块**: 活跃用户数、月留存率
- **收入模块**: 营收、订单、ARPU、ARPPU
- **使用模块**: 深度访问率、使用率、大会员活跃率

### 📈 趋势分析
- 4个核心指标的趋势图表
- 支持3/6/12个月时间范围切换
- 交互式图表展示

### 🤖 AI数据分析
- 集成DeepSeek AI进行智能数据分析
- 关键变化分析
- 增长趋势分析
- 运营策略建议

### 🏢 B端核心指标
- 签约金额、开票金额、到款金额
- 订单数、新签、续签统计
- 关键比率分析

### 📱 响应式设计
- 支持桌面端和移动端
- 橙色主题设计
- 现代化UI组件

## 技术栈

- **前端框架**: React 18
- **图表库**: Recharts
- **数据解析**: PapaParse
- **HTTP客户端**: Axios
- **AI服务**: DeepSeek API
- **数据存储**: LocalStorage (用于AI记忆功能)
- **样式**: CSS3 + Flexbox/Grid

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置API密钥
创建 `.env` 文件并添加DeepSeek API密钥：
```env
REACT_APP_API_KEY=your-deepseek-api-key-here
```

### 3. 启动开发服务器
```bash
npm start
```

应用将在 http://localhost:3000 启动

### 4. 数据文件
确保以下文件位于 `public/` 目录：
- `月度核心数据.csv` - 月度数据
- `B端核心数据.csv` - B端数据
- `logo.png` - 应用Logo
- `小橙子.png` - AI助手头像

## 数据格式

### 月度核心数据.csv
| 字段 | 说明 |
|------|------|
| 年份 | 年份（如：25年） |
| 月份 | 月份（如：1月） |
| 月活 | 月活跃用户数 |
| 次月留存 | 次月留存率（%） |
| 营收 | 月度营收 |
| 订单 | 订单数量 |
| ARPU | 平均每用户收入 |
| ARPPU | 平均每付费用户收入 |
| 深度访问率 | 深度访问率（%） |
| 使用率 | 使用率（%） |
| 大会员活跃率 | 大会员活跃率（%） |

### B端核心数据.csv
| 字段 | 说明 |
|------|------|
| 年份 | 年份（如：25年） |
| 月份 | 月份（如：1月） |
| 签约金额 | 签约金额（万） |
| 开票金额 | 开票金额（万） |
| 到款金额 | 到款金额（万） |
| 订单数 | B端订单数 |
| 新签 | 新签订单数 |
| 续签 | 续签订单数 |

## 核心功能

### 🍊 小橙子AI助手详解

#### 功能特性
1. **智能对话分析**
   - 基于当前月份数据进行实时分析
   - 理解自然语言问题
   - 提供专业的数据洞察和建议

2. **成长学习能力**
   - **对话历史记忆**: 保存最近20条对话，理解上下文
   - **用户偏好学习**: 自动识别用户关注的指标（月活、营收、留存等）
   - **数据洞察积累**: 记录重要发现，持续优化分析质量
   - **个性化欢迎**: 根据历史交互提供定制化问候

3. **数据存储**
   - 使用LocalStorage保存记忆数据
   - 包含三类数据：
     - `orangeAssistant_history`: 对话历史（最近20条）
     - `orangeAssistant_preferences`: 用户偏好统计
     - `orangeAssistant_insights`: 数据洞察记录（最近50条）

4. **智能上下文构建**
   - 结合用户偏好
   - 引用相关历史对话
   - 关联同月份的历史分析
   - 提供更精准的回答

#### 使用方法
1. 点击页面左侧的小橙子头像
2. 在对话窗口中输入问题
3. 小橙子会基于当前数据和历史记忆回答
4. 支持的问题类型：
   - "本月用户活跃度如何？"
   - "营收相比上月有什么变化？"
   - "ARPU值偏低，有什么改进建议？"
   - "用户留存率需要关注哪些方面？"

#### 技术实现
- **组件**: `src/components/OrangeAssistant.js`
- **样式**: `src/components/OrangeAssistant.css`
- **AI模型**: DeepSeek Chat
- **记忆存储**: LocalStorage
- **状态管理**: React Hooks (useState, useEffect, useRef)

### 环比同比计算
- **环比**: 与上月数据对比
- **同比**: 与去年同月数据对比
- 数值型指标显示百分比变化
- 百分比型指标显示百分点变化

### 月度选择器
- 自动获取CSV中所有可用月份
- 支持跨年数据展示
- 数据联动更新

### AI分析
- 使用DeepSeek API进行智能分析
- 提供关键变化、趋势分析和策略建议
- 支持重新分析功能

## 项目结构

```
src/
├── components/
│   ├── Header.js              # 顶部导航栏
│   ├── Header.css
│   ├── MetricsCards.js        # 核心指标卡片
│   ├── MetricsCards.css
│   ├── TrendCharts.js         # 趋势图表
│   ├── TrendCharts.css
│   ├── AIAnalysis.js          # AI分析组件
│   ├── AIAnalysis.css
│   ├── BMetrics.js            # B端指标组件
│   ├── BMetrics.css
│   ├── OrangeAssistant.js     # 🍊 小橙子AI助手（新）
│   └── OrangeAssistant.css
├── utils/
│   └── testAPI.js             # API测试工具
├── App.js                     # 主应用组件
├── App.css                    # 全局样式
├── index.js                   # 应用入口
└── index.css                  # 全局基础样式

public/
├── 月度核心数据.csv           # 月度数据文件
├── B端核心数据.csv            # B端数据文件
├── logo.png                   # 应用Logo
└── 小橙子.png                 # AI助手头像

配置文件/
├── .env                       # 环境变量（API密钥）
├── .env.example               # 环境变量示例
├── package.json               # 项目依赖
├── README.md                  # 项目文档
├── DEPLOYMENT.md              # 部署指南
├── AI_SETUP.md                # AI配置指南
└── 小橙子助手使用说明.md      # 小橙子使用文档
```

## 自定义配置

### AI API配置

#### 方法1: 环境变量（推荐）
在 `.env` 文件中配置：
```env
REACT_APP_API_KEY=sk-your-deepseek-api-key-here
```

#### 方法2: 直接修改代码
在 `src/components/AIAnalysis.js` 和 `src/components/OrangeAssistant.js` 中修改：
```javascript
headers: {
  'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
  'Content-Type': 'application/json'
}
```

### 清除小橙子记忆
如果需要重置小橙子的学习数据，在浏览器控制台执行：
```javascript
localStorage.removeItem('orangeAssistant_history');
localStorage.removeItem('orangeAssistant_preferences');
localStorage.removeItem('orangeAssistant_insights');
```

### 主题颜色
在CSS文件中修改主题色：
- 主色: `#FF6B35`
- 辅助色: `#FFA366`

### 小橙子位置调整
在 `src/components/OrangeAssistant.css` 中修改：
```css
.orange-assistant-icon {
  left: 20px;  /* 距离左侧距离 */
  top: 50%;    /* 垂直位置 */
}
```

## 部署

### 环境变量配置
部署前确保配置以下环境变量：
- `REACT_APP_API_KEY`: DeepSeek API密钥

### 部署到Vercel（推荐）

1. **上传到GitHub**：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

2. **连接Vercel**：
   - 访问 [Vercel](https://vercel.com/)
   - 使用GitHub登录
   - 导入你的仓库

3. **配置环境变量**：
   - 在Vercel项目设置中添加：
   - `REACT_APP_API_KEY`: 你的DeepSeek API密钥

4. **部署完成**：
   - 获得部署地址
   - 每次推送代码自动重新部署

详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 构建生产版本
```bash
npm run build
```

构建文件将生成在 `build/` 目录中，可以部署到任何静态文件服务器。

## 常见问题

### Q: 小橙子不显示怎么办？
A: 检查以下几点：
1. 确保 `public/小橙子.png` 文件存在
2. 检查浏览器控制台是否有错误
3. 确认组件已正确导入到 `App.js`
4. 尝试清除浏览器缓存并刷新

### Q: AI分析不工作？
A: 
1. 检查 `.env` 文件中的API密钥是否正确
2. 确认网络连接正常
3. 查看浏览器控制台的错误信息
4. 使用"测试API"按钮检查连接状态

### Q: 如何重置小橙子的记忆？
A: 在浏览器控制台执行：
```javascript
localStorage.clear();
```
然后刷新页面。

### Q: 小橙子的记忆数据存在哪里？
A: 存储在浏览器的LocalStorage中，包括：
- 对话历史（最近20条）
- 用户偏好统计
- 数据洞察记录（最近50条）

### Q: 可以自定义小橙子的回答风格吗？
A: 可以在 `OrangeAssistant.js` 的 `handleSendMessage` 函数中修改system prompt来调整回答风格。

## 更新日志

### v2.0.0 (最新)
- ✨ 新增小橙子AI助手功能
- 🧠 实现AI记忆和学习能力
- 💾 添加LocalStorage数据持久化
- 🎨 优化用户界面和交互体验
- 📝 完善项目文档

### v1.0.0
- 📊 核心数据看板功能
- 📈 趋势图表展示
- 🤖 基础AI分析
- 🏢 B端数据展示

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 贡献指南

欢迎提交Issue和Pull Request！

## 相关文档

- [部署指南](./DEPLOYMENT.md) - 详细的部署步骤
- [AI配置指南](./AI_SETUP.md) - DeepSeek API配置说明
- [小橙子使用说明](./小橙子助手使用说明.md) - AI助手功能详解
- [小橙子技术文档](./小橙子AI助手技术文档.md) - 技术实现细节
- [小橙子成长计划](./小橙子成长计划.md) - 🌱 成长路线图和未来规划
- [设计更新文档](./DESIGN_UPDATE.md) - 设计变更记录
- [更新日志](./CHANGELOG.md) - 版本历史
- [项目总结](./项目总结.md) - 完整项目总结
- [文档索引](./文档索引.md) - 快速查找文档

## 技术支持

如有问题，请：
1. 查看相关文档
2. 检查浏览器控制台错误
3. 提交Issue到GitHub仓库

## 许可证

MIT License

---

**Made with ❤️ and 🍊**