# A类字段补充需求清单（基于 dwd_pub_io_log_xyiolog_di）

> 目的：对照「让路径分析更准」的 6 项 A 类需求，依据数仓表 `dmp_cdm.dwd_pub_io_log_xyiolog_di` 实际字段，评估每项「能否补、怎么补、现阶段可行性」，供评估现阶段可定义/补充的字段。
> 口径：当前看板 `database.js` 的 `_normalizeRow` 仅接入 14 个字段（时间、user_id、device_id、url、referrer、source、platform、4 个元素字段、event_type）。下表其余字段当前均未接入。

## 一、A 类 6 项需求 × 表字段可行性对照

| 编号 | A 类需求 | 表内是否已有 | 补充 / 映射方式 | 现阶段可行性 | 说明 |
|---|---|---|---|---|---|
| A1 | 会话标识 session_id | 无 | 用 `user_id`+`device_id`+`xyio_client_time` 按间隔切分（如 >30min 新会话）；`single_page_app` 辅助识别路由切换 | **可补充（规则派生，无需研发）** | 优先级最高，直接解决跨会话误连 |
| A2 | 页面语义 page_name / module_name | 无结构化字段；有 `title`、`request_url`、`html_element_name` | 建 `request_url`→页面名 映射表（路由 + `title`）；SPA 下 `request_url` 可能不变，依赖 `title` | **可补充（需建映射规则）** | 映射需随页面迭代维护 |
| A3 | 内容实体 content_id + 名称 | 无独立字段；有 `extension`（扩展字段）、`request_url` 参数 | 解析 `request_url` 参数（paper_id/question_id 等）；或复用 `extension` 存内容 ID | **可补充（解析 URL；需先确认 extension/参数结构）** | 需先确认 extension 现有内容与 url 参数命名 |
| A4 | 事件类型标准化枚举 | 有 `log_event_type`（注释仅「浏览/点击」两类） | 直接采用，明确枚举 = page_view / click | **已具备（粒度偏粗）** | 无「曝光/停留」细分，难区分「曝光未点」与「浏览」 |
| A5 | 停留时长 stay_duration | 无；有 `xyio_client_time`、`env_scrolly` | 相邻事件时间差近似；`env_scrolly`（滚动距离）辅助判断阅读深度 | **可补充（计算派生）** | 依赖 A1 会话切分才准 |
| A6 | 接口响应状态 / 错误码 / 耗时 | 无（纯前端埋点，不采集接口响应） | 需研发在埋点层新增或接入后端日志 | **现阶段难（需研发新增）** | 区分「不想点」vs「点了报错/无响应」的关键缺口 |

## 二、表内已有、当前看板未接的字段（按路径可用性分两组）

> 经确认：学科 / 学段 / 教材版本 / 权益 / 学校等属于**全埋点字段**，在用户行为路径上基本为空（有字段、无信息），**不能用于提升路径分析准确度**，已单列排除。真正对路径还原 / 卡点识别有用的字段如下。

### 2.1 路径场景可用（建议优先接入，仅改解析层，无需研发）

| 字段 | 含义 | 路径分析价值 |
|---|---|---|
| `single_page_app` | 是否单页应用 | 关键：SPA 下 `request_url` 可能不变，决定路径还原策略 |
| `env_trust_click` | 是否真实点击 | 过滤机器 / 误点，提升路径可信度 |
| `fp_id` | 浏览器指纹 | 跨设备 / 多设备合并依据（配合 `device_id`） |
| `title` | 页面标题 | A2 页面语义识别的兜底来源（SPA 下尤其重要） |
| `latest_inside_search_keyword` | 最近一次站内搜索词 | 识别搜索型用户、搜索 → 转化路径（latest 类，需先验证填充率） |
| `latest_traffic_source_type` | 流量来源类型（direct/search_engine/other） | 比 `product_source_id` 更上层的来源分类（latest 类，需验证填充率） |

### 2.2 全埋点空字段（路径场景基本无信息，不纳入路径补充项）

| 字段 | 含义 | 说明 |
|---|---|---|
| `subject_id` | 学科 id | 全埋点字段，路径上基本为空 |
| `stage_id` | 学段 id | 同上 |
| `textbook_version_id` | 教材版本 id | 同上 |
| `toc_rights` / `tob_rights` / `is_tob` | C / B 端权益 | 同上，权益类在路径上基本为空 |
| `user_school_id` | 用户学校 id | 同上 |

## 三、评估优先级建议

1. **解析层已改（database.js `_normalizeRow`）**：已新增 2.1 六个字段映射（`title` / `single_page_app` / `env_trust_click` / `fp_id` / `latest_inside_search_keyword` / `latest_traffic_source_type`，DDL 名 + 中文别名双写）。**但当前 Excel/CSV 仅 14 列、无这些字段，光改解析层拿不到值**——必须由导出 SQL 把列 SELECT 出来（见第五节）。A4 `log_event_type` 已在 14 列中、解析层已接（枚举仅浏览/点击）。A1 会话切分属「需建规则」，按你的安排后续补充，本节课未做。
2. **需建规则 / 映射（轻量，后续）**：A1 会话切分规则、A2 `page_name` 映射表、A3 `content_id` URL 解析、A5 停留时长派生。
3. **需研发新增（长期，暂不处理）**：A6 接口响应状态 / 错误码。

## 四、与 C 类（支付核查）对接

用户提供支付 SQL（独立支付系统表，**不依赖埋点 `toc_rights`**，因权益类字段路径上基本为空）后，用 `user_id` + 时间窗 与行为路径交叉验证「卡在支付」是否真实（埋点丢失 vs 真未支付）。待支付 SQL 接入后补充验证流程。

## 五、立即可做落地（解析层已改 + 导出需补列）

### 5.1 解析层（database.js `_normalizeRow`，已改）
已新增 6 个字段映射（DDL 名 + 中文别名双写），数据含这些列后自动入库：
- `title`、`single_page_app`、`env_trust_click`、`fp_id`、`latest_inside_search_keyword`、`latest_traffic_source_type`

⚠️ **当前 Excel/CSV 仅 14 列，无上述字段，改解析层本身拿不到数据**。必须由导出 SQL 把这些列 SELECT 出来（5.2）。已入库的 `data/*.json` 需重新导出「含新列的 Excel」后执行「全量导入」才生效。

### 5.2 导出 SQL 需补充的列（你跑导出查询时追加）
注意：你现有导出对部分列做了别名（`request_url AS url`、`product_source_id AS source`、`html_element_class_name AS element_class_name` 等），新增列建议保持一致风格，解析层已双写兼容。在原有 14 列 SELECT 后追加：

```sql
-- 原有 14 列（保持别名与现有解析一致）
SELECT
  xyio_client_time,
  user_id,
  device_id,
  request_url                AS url,
  referrer,
  product_source_id          AS source,
  platform,
  html_element_class_name    AS element_class_name,
  html_element_content       AS element_content,
  html_element_id            AS element_id,
  html_element_name          AS element_name,
  log_event_type,
  xyio_backend_time,
  dt,
  -- ↓ A 类 2.1 新增：路径分析准确性补充字段
  title,
  single_page_app,
  env_trust_click,
  fp_id,
  latest_inside_search_keyword,
  latest_traffic_source_type
FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
WHERE ...   -- 你的原有过滤条件（含 is_spider = false 等）
```

### 5.3 A4 事件类型（已具备）
`log_event_type` 已在 14 列中、解析层已接。枚举仅「浏览 / 点击」两类，无曝光 / 停留细分；后续如需按事件类型过滤，直接用它即可（具体过滤规则待建）。

### 5.4 落地步骤顺序
1. 你按 5.2 改导出 SQL，重新导出含 6 新列的 Excel/CSV（覆盖或新增日期文件）。
2. 运行「全量导入」（或仅导入新增日期）重建 `data/*.json`。
3. 解析层已生效，路径分析即可用 `title` / `env_trust_click` / `fp_id` / `single_page_app` 等字段；`latest_*` 两类建议先抽样看填充率再正式使用。

