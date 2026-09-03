# 项目长期笔记（用户行为看板）

## 数据源与字段认知
- 用户行为看板数据源：`dmp_cdm.dwd_pub_io_log_xyiolog_di`（前端埋点，不含接口响应状态/错误码/耗时）。
- **全埋点空字段（重要）**：`subject_id` / `stage_id` / `textbook_version_id` / `toc_rights` / `tob_rights` / `is_tob` / `user_school_id` 在用户行为路径上基本为空（有字段、无信息），**不可用于路径分析准确度提升**，评估字段补充时须排除。
- 路径场景真正可补的未接字段：`single_page_app`（SPA 路径还原关键）、`env_trust_click`（过滤误点）、`fp_id`（跨设备合并）、`title`（页面语义兜底）、`latest_inside_search_keyword` / `latest_traffic_source_type`（latest 类，接入前需先验证填充率）。

## 看板分析边界
- 个案放大镜定位（已知 user_id + 日期），非全站大盘；路径分析依赖真实埋点，AI 不编造。
- 提升路径准确度核心抓手：A1 会话切分、A2 page_name 映射、A3 content_id 解析、A5 停留时长派生（均无需研发）；A6 接口响应需研发新增。
