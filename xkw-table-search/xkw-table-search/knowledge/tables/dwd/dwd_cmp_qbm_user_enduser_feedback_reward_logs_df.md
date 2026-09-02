# `dwd_cmp_qbm_user_enduser_feedback_reward_logs_df`

- 层级：`dwd`
- 本地表描述：发起人Id
- 主题标签：user, log_behavior
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`submitter_id`、`create_date`、`feedback_id`、`course_id`、`amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 未提供字段注释 | ddl |
| `submitter` | `STRING` | 未提供字段注释 | ddl |
| `submitter_id` | `INT` | 发起人Id | ddl |
| `create_date` | `STRING` | 发放时间 | ddl |
| `feedback_id` | `INT` | 挑错id | ddl |
| `editor` | `STRING` | 处理人 | ddl |
| `course_id` | `INT` | 任务所属课程 | ddl |
| `amount` | `DECIMAL(16,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_cmp_qbm_qbm_tbl_enduser_feedback_reward_logs`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 amount 缺少注释
- 字段 id 缺少注释
- 字段 submitter 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
