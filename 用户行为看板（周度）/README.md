# 用户行为分析看板

面向橙子学 / 学伴的**用户个案**行为分析看板：按用户 ID 与日期拉取真实埋点，并用 DeepSeek 生成可读的行为解读报告。  
这不是整体 UV / 留存大盘，而是「已知用户 ID 后还原路径、找卡点」的工具。

> **给产品 / 运营 / 教研看的使用与分享文档** → 请打开同目录 [`使用说明.md`](./使用说明.md)  
> 下文为技术架构、数据导入与运维说明。

## 能力概览

| 能力 | 说明 |
| --- | --- |
| **按用户取数** | 输入用户 ID + 日期区间，拉取橙子学（czx）与学伴（xueban）相关埋点 |
| **AI 解读** | DeepSeek 输出常规四段式报告，或针对具体问题深挖 |
| **数仓导出发布**（推荐线上） | 脚本按日导出 JSON → 上传 GitHub Releases / 云存储 → Vercel 读取 |
| **数仓 MCP 实时取数**（本机/内网） | `DATA_SOURCE=warehouse` 时按需查询，勿在 Vercel 上对全量做实时 MCP |
| **本地 JSON + 索引** | 按日分片、用户/日期双重索引，适合本机调试与历史 Excel 导入 |

## 数据源与部署

### 1. 数仓导出后发布（推荐线上方案）

用脚本从数仓按日导出 JSON → 上传到 GitHub Releases（或兼容的云存储）→ Vercel Serverless 按 `DATA_BASE_URL` 读取。

#### 从数仓导出（每周更新）

1. 配置本地 `用户行为看板（周度）/.env` 中的 `MCP_KEY`（可参考 `.env.example`）
2. 先单日试跑：

```bash
cd 用户行为看板（周度）
node scripts/export-from-warehouse.js 2026-07-16 2026-07-16
```

3. 确认无截断警告后，再导出区间（全量区间耗时较长，单日分片默认 256 次请求）：

```bash
node scripts/export-from-warehouse.js 2026-07-01 2026-07-29
```

4. 将 `data/YYYY-MM-DD.json` 上传到 GitHub Release / 云存储（勿把超大 JSON 直接提交进 Git）
5. 更新仓库内 `api/behavior-dates.json` 与 `cloud-upload/stats.json` 后 push，Vercel 即可识别新日期

注意：橙子学 + 学伴埋点量级很大（单日可达数十万～近两百万行量级）；不要用实时 MCP 在 Vercel 上查全量。云存储与 Vercel 环境变量细节见 [`CLOUD-STORAGE.md`](./CLOUD-STORAGE.md)。

### 2. 数仓 MCP 实时取数（本机 / 内网）

```bash
# .env
DATA_SOURCE=warehouse
MCP_KEY=你的密钥
WAREHOUSE_ENGINE=hologres   # 或 maxcompute
```

```bash
npm start   # 即 node server-with-db.js
# 访问 http://localhost:3001/dashboard-db.html
```

线上若 MCP 返回 403，请改用「导出后发布」方案。

### 3. 本地 JSON / Excel（调试与历史数据）

将 Excel（格式：`2026年3月3日用户行为日志.xlsx`）放在本目录后：

```bash
npm install
node db-manager.js init          # 首次全量初始化
# 或仅导入索引中尚无的日期：
node db-manager.js import-new
node server-with-db.js
```

打开：http://localhost:3001/dashboard-db.html

数据状态与增量导入注意点见 [`数据状态说明.md`](./数据状态说明.md)。

## 本地存储架构（JSON 模式）

### 存储方案

- **分片存储**：按日期分片，每天一个 JSON 文件（`data/YYYY-MM-DD.json`）
- **双重索引**：用户索引 + 日期索引，内存常驻
- **按用户分组**：同一用户的数据聚合存储，减少 IO

### 性能要点

- 按用户 + 日期区间查询（非全表扫描大盘）
- 索引常驻内存，本机查询一般为秒级或更快
- 支持批量处理与增量更新；文件修改时间戳用于缓存校验
- 活跃用户日志量大，建议单次分析日期范围 **≤ 7 天**

### 数据字段

```
xyio_client_time      - 客户端时间
user_id               - 用户ID
device_id             - 设备ID
url                   - 请求URL
referrer              - 来源页面
source                - 产品来源
platform              - 平台
element_class_name    - 元素类名
element_content       - 元素内容
element_id            - 元素ID
element_name          - 元素名称
log_event_type        - 事件类型
xyio_backend_time     - 后端时间
dt                    - 日期
```

## 数据库管理命令

```bash
# 查看统计信息
node db-manager.js stats

# 查询用户数据
node db-manager.js query <用户ID> [开始日期] [结束日期]
# 示例：node db-manager.js query 77821274 2026-02-26 2026-03-04

# 重建索引（扫描 data/ 下已有 JSON）
node db-manager.js rebuild

# 仅导入 date_index 中尚无的日期（从 Excel）
node db-manager.js import-new
```

大文件导入可用：`node --max-old-space-size=16384 db-manager.js import-new`

## AI 分析配置

系统使用 DeepSeek API。前端可显式选择 **常规性分析** / **针对性分析**；未指定时服务端也可按关键词自动判断。

密钥请走环境变量 `DEEPSEEK_API_KEY`（Vercel / Railway / 本地 `.env`），**不要**把密钥写进代码或提交进 Git。

### 1. 常规性分析（四段式）

面向「不知道具体问题、想看完整路径」的场景。输出模块：

1. 用户完整行为轨迹（时间线简述）
2. 用户使用习惯与特征
3. 产品问题与体验卡点（重点）
4. 产品&运营优化建议

要求：只写有日志依据的内容，不编造；不输出原始埋点表；语言面向产品 / 运营。

### 2. 针对性问题分析

用户在前端选择「针对性分析」，或描述中含问题导向关键词（如：为什么、问题、卡点、流失、转化、异常、错误、定位，以及短问句中的「分析」）时，按「问题定位 → 原因分析 → 数据支撑 → 解决建议」输出。

### 修改 AI Prompt

- 本机 Express：`server-with-db.js` 中的 `analyzeWithDeepSeek`
- Vercel Serverless：`api/analyze.js`

修改后重启本机服务，或重新部署 Vercel。

**关键参数**：

```javascript
{
  model: 'deepseek-chat',
  temperature: 0.7,      // 控制输出随机性，0-1
  max_tokens: 2000       // 最大输出长度
}
```

自动模式关键词判断（`analysisMode === 'auto'` 时）位于 `server-with-db.js` / `api/analyze.js` 的对应逻辑中，可按需增删。

## 使用流程（技术侧速览）

业务侧完整说明见 [`使用说明.md`](./使用说明.md)。

1. 确认数据源已就绪（本地索引 / 云端 `stats.json` / 数仓 MCP）
2. 选择日期（建议 ≤ 7 天）、填写用户 ID（多个用英文逗号分隔）
3. 选择分析模式，在对话框描述需求并发送
4. 阅读 AI 报告；结论为辅助解读，关键决策需结合业务复核

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 主前端 | 原生 HTML + CSS + JS（`dashboard-db.html` / `dashboard-vercel.html`） |
| 可选前端 | Vite 5 + React 18 + Ant Design（`src/`，非当前主入口） |
| 本机服务 | Node.js（ESM）+ Express（`server-with-db.js`） |
| 线上 API | Vercel Serverless（`api/stats`、`getData`、`analyze` 等） |
| 本地存储 | 按日 JSON + 内存索引（另有 better-sqlite3 依赖，按实际使用为准） |
| 数仓 | MCP（Hologres / MaxCompute） |
| 云数据 | GitHub Releases 或其他公网可读对象存储（`DATA_BASE_URL`） |
| AI | DeepSeek API |
| 离线导入 | xlsx 解析 Excel |

## 项目结构（摘要）

```
用户行为看板（周度）/
├── dashboard-db.html          # 本机 / Railway 主看板
├── dashboard-vercel.html      # 云端读取版页面
├── server-with-db.js          # Express 主服务（local / warehouse）
├── database.js / db-manager.js
├── api/                       # Vercel Serverless
├── lib/                       # 数仓 MCP、环境变量、SQL 等
├── scripts/
│   ├── export-from-warehouse.js
│   ├── generate-stats-for-cloud.js
│   └── test-warehouse-fetch.js
├── data/                      # 按日 JSON + indexes/
├── cloud-upload/              # 上传用 stats 等产物
├── src/                       # 可选 React 前端
├── .env.example
├── CLOUD-STORAGE.md
├── 使用说明.md
└── README.md
```

## 注意事项

1. Excel 命名格式：`YYYY年M月D日用户行为日志.xlsx`（与 `db-manager` 约定一致）
2. 本地数据更新后需 `init` / `import-new` / `rebuild`，保持索引与 `data/` 一致
3. `DEEPSEEK_API_KEY`、`MCP_KEY`、`DATA_BASE_URL` 等走环境变量；勿提交真实 `.env`
4. 单次查询建议限制在 7 天以内；特别活跃用户日志量很大
5. 本看板必须先有数字用户 ID，不支持按姓名 / 手机号检索
6. 发现乱码或明显异常数据时，排查源头，不要在前端掩盖

## 故障排查

### 本地初始化 / 索引异常

```bash
node db-manager.js stats
node db-manager.js rebuild
# 单用户试查
node db-manager.js query <用户ID> 2026-02-26 2026-03-04
```

详见 [`数据状态说明.md`](./数据状态说明.md)。

### 查询返回空数据

- 核对用户 ID 与日期是否在已有数据范围内
- warehouse 模式：确认 `MCP_KEY`、网络 / VPN、引擎配置
- 云端模式：确认 `DATA_BASE_URL` 下对应日期文件与 `stats.json` 可公网访问

### AI 分析失败

- 确认 `DEEPSEEK_API_KEY` 已配置且有效
- 检查网络与服务端 / Serverless 日志
- 缩短日期范围或减少用户数后重试

## 相关文档

| 文档 | 用途 |
| --- | --- |
| [`使用说明.md`](./使用说明.md) | 业务同学上手与分享 |
| [`CLOUD-STORAGE.md`](./CLOUD-STORAGE.md) | Vercel + 云存储部署 |
| [`数据状态说明.md`](./数据状态说明.md) | 本地导入与索引维护 |
| 仓库根目录 `README.md` / `DEPLOY.md` | 门户与整体发布 |

## 后续可改进方向

1. 分析结果一键导出 / 分享
2. 多用户对比视图（当前多 ID 为合并视角）
3. 与汇总类周度看板的人群下钻联动
4. 持续优化 AI Prompt 与产品背景描述（含学伴场景）
