# 用户行为看板更新与发布 SOP

> 适用：按日/按周同步行为明细，保证看板可查、AI 可分析。  
> 原则：只用真实埋点；不编造行为；异常先溯源。

## 角色

| 角色 | 职责 |
| --- | --- |
| 数据维护方 | 从数仓导出或导入本地数据，校验无截断 |
| 服务维护方 | 保证 Node 服务 / 云端读取可用，配置环境变量 |
| 业务使用方 | 按用户 ID 做个案分析，反馈查不到或报告异常 |

## 标准流程 A：数仓导出后发布（推荐线上）

1. 配置 `用户行为看板（周度）/.env` 中的 `MCP_KEY`（参考 `.env.example`）  
2. 单日试跑：

```bash
cd 用户行为看板（周度）
node scripts/export-from-warehouse.js YYYY-MM-DD YYYY-MM-DD
```

3. 确认无截断警告后，再导出目标区间  
4. 将 `data/YYYY-MM-DD.json` 上传到 GitHub Release / 约定云存储（勿把超大 JSON 直接提交进 Git）  
5. 更新 `api/behavior-dates.json` 与 `cloud-upload/stats.json` 后发布  
6. 在看板页刷新统计，抽检一个已知用户 ID 是否可查

## 标准流程 B：本机 / 内网实时数仓（MCP）

```bash
# .env
DATA_SOURCE=warehouse
MCP_KEY=你的密钥
WAREHOUSE_ENGINE=hologres   # 或 maxcompute

npm start   # node server-with-db.js
# 访问 http://localhost:3001/dashboard-db.html
```

内网正式地址写入仓库根目录 `intranet-user-behavior.json` 的 `url` 字段后，公网门户 https://d1.fuxue.work/user-behavior.html 可引导跳转（需公司网/VPN）。

## 标准流程 C：历史 Excel 导入（调试）

1. 将 `YYYY年M月D日用户行为日志.xlsx` 放入看板目录  
2. `node db-manager.js init` 或 `import-new`  
3. 启动 `node server-with-db.js`  
4. 用 `node db-manager.js query <用户ID> [开始] [结束]` 抽检

## 业务侧使用 SOP（产品 / 运营 / 教研）

1. 打开 https://d1.fuxue.work/ → 周度 → 用户行为（或直达 user-behavior.html）  
2. 确认顶部可用数据范围  
3. 选择日期（建议 ≤ 7 天）→ 填写数字用户 ID  
4. 选择常规性分析或针对性分析 → 发送问题  
5. 重点阅读「轨迹」与「卡点」；AI 结论需人工复核后写入工单/周报  
6. 查无数据时先核 ID 与日期，再反馈维护方

## 抽检清单

- [ ] 顶部统计有用户数/记录数/可用天数  
- [ ] 已知用户在目标日期可返回记录  
- [ ] 常规分析能出四段式报告  
- [ ] 针对性分析能围绕问题作答  
- [ ] 无密钥泄露；失败时不返回伪造行为

## 异常速查

| 现象 | 优先排查 |
| --- | --- |
| 门户跳转后打不开 | 是否连公司网/VPN；intranet-user-behavior.json 是否正确；服务是否在跑 |
| 未找到行为数据 | ID、日期是否在已导入/已导出范围内 |
| AI 失败 | DEEPSEEK_API_KEY、网络、服务端日志 |
| 导出截断 | 缩小日期或按脚本分片重跑，勿当完整数据使用 |

## 版本记录（模板）

| 日期 | 数据区间 | 操作人 | 结果 |
| --- | --- | --- | --- |
| YYYY-MM-DD | YYYY-MM-DD ~ YYYY-MM-DD | 姓名 | 已发布 / 回滚原因 |
