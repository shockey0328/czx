# 用户行为看板：Vercel + 云存储方案

通过将数据文件上传到云存储（如 AWS S3、阿里云 OSS），在 Vercel 上仅部署前端与 Serverless API，从云端读取数据，无需自建数据库或 Railway 常驻服务。

## 一、数据存储约定

在云存储中创建一个「数据目录」，并保证可通过公网 URL 访问。推荐结构：

```
你的存储桶或前缀/
├── stats.json          # 统计信息（见下方格式）
├── 2026-02-26.json     # 按日期的数据文件
├── 2026-02-27.json
├── 2026-02-28.json
└── ...
```

### 1. stats.json 格式

```json
{
  "totalUsers": 12345,
  "totalRecords": 500000,
  "availableDates": ["2026-02-26", "2026-02-27", "2026-02-28"],
  "dateRange": {
    "start": "2026-02-26",
    "end": "2026-02-28"
  }
}
```

- 可由本地脚本生成：在「用户行为看板（周度）」目录下执行  
  `node scripts/generate-stats-for-cloud.js`  
  会生成 `cloud-upload/stats.json`，将该文件上传到云存储数据根目录即可。

### 2. 按日期文件格式（与本地 data/ 一致）

每个 `YYYY-MM-DD.json` 格式为：

```json
{
  "date": "2026-02-26",
  "recordCount": 1000,
  "userGroups": {
    "用户ID1": [ { "user_id": "用户ID1", "xyio_client_time": ..., "url": "...", ... }, ... ],
    "用户ID2": [ ... ]
  }
}
```

- 可直接将本地 `用户行为看板（周度）/data/` 下的 `2026-02-26.json`、`2026-02-27.json` 等上传到云存储同一目录（与 stats.json 同级）。

## 二、云存储根地址（DATA_BASE_URL）

「数据目录」对应一个**根 URL**，末尾可有可无 `/`，部署时会自动规范。

示例：

- **AWS S3（桶为公开读）**  
  `https://your-bucket.s3.amazonaws.com/data/`  
  或带区域：`https://your-bucket.s3.ap-northeast-1.amazonaws.com/data/`

- **阿里云 OSS**  
  `https://your-bucket.oss-cn-hangzhou.aliyuncs.com/data/`

- **腾讯云 COS**  
  `https://your-bucket-1234567890.cos.ap-guangzhou.myqcloud.com/data/`

- **又拍云 / 其他**  
  只要最终访问形式为：  
  `{DATA_BASE_URL}stats.json`、`{DATA_BASE_URL}2026-02-26.json` 等可被公网 GET 即可。

## 三、Vercel 配置

### 1. 环境变量

在 Vercel 项目 **Settings → Environment Variables** 中新增：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATA_BASE_URL` | 云存储数据根地址 | `https://your-bucket.s3.amazonaws.com/data/` |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥（用于 AI 分析） | `sk-xxx` |

保存后重新部署一次，使 Serverless 使用新变量。

### 2. 部署方式

- **方式 A：整站部署（推荐）**  
  仓库根目录即项目根，根目录下已有 `api/`（stats、getData、analyze、cloudData）。  
  前端访问：`https://你的域名/用户行为看板（周度）/dashboard-db.html`  
  此时页面内请求的 `/api/stats`、`/api/analyze` 会走到根目录的 Serverless。

- **方式 B：仅部署「用户行为看板」子目录**  
  将 Vercel 的 **Root Directory** 设为 `用户行为看板（周度）`，则 `api/` 来自该子目录。  
  前端访问：`https://你的域名/dashboard-db.html`。  
  同样需要在 Vercel 中配置 `DATA_BASE_URL` 和 `DEEPSEEK_API_KEY`。

## 四、前端请求方式

看板页面已支持「同源 /api」：

- 线上（Vercel）：`API_BASE` 为空，请求 `/api/stats`、`/api/analyze` 等会发往当前站点，即 Vercel Serverless。
- 本地调试：`API_BASE = 'http://localhost:3001'`，请求会发往本地 `server-with-db.js`。

无需改前端代码，只要部署后同源下存在 `/api/stats`、`/api/getData`、`/api/analyze`，且配置好 `DATA_BASE_URL` 和 `DEEPSEEK_API_KEY` 即可。

## 五、数据更新流程

1. 本地更新 `data/`（或通过 Excel 导入后执行 `node db-manager.js init`）。
2. 运行 `node scripts/generate-stats-for-cloud.js`，得到最新的 `cloud-upload/stats.json`。
3. 将 `stats.json` 与有变动的 `YYYY-MM-DD.json` 上传到云存储数据根目录（覆盖旧文件）。
4. 无需重新部署 Vercel；下次打开看板或刷新即可读到新数据。

## 六、简要检查清单

- [ ] 云存储中已有 `stats.json` 和若干 `YYYY-MM-DD.json`，且格式符合上文。
- [ ] 存储桶/目录已设为**公开读**（或配置了正确的 CORS），浏览器或 Vercel 能通过 GET 访问。
- [ ] Vercel 环境变量中已配置 `DATA_BASE_URL`（云存储数据根 URL）和 `DEEPSEEK_API_KEY`。
- [ ] 部署后访问看板页面，打开开发者工具 Network：  
  - `/api/stats` 返回 200 且为 JSON；  
  - 选择用户与日期后发起分析，`/api/analyze` 返回 200 且含 `analysis`。

若 `/api/stats` 报错「未配置 DATA_BASE_URL」或「获取统计失败」，请检查环境变量是否生效（修改后需重新部署）。
