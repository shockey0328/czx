# `dwd_cmp_rbm_user_tbl_account_record_df`

- 层级：`dwd`
- 本地表描述：自增id
- 主题标签：user
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`user_name`、`create_date`、`task_id`、`type`、`course_id`、`amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 自增id | ddl |
| `user_name` | `STRING` | 未提供字段注释 | ddl |
| `operator` | `STRING` | 操作人 | ddl |
| `create_date` | `STRING` | 未提供字段注释 | ddl |
| `task_id` | `STRING` | 任务id，比如资料或专辑id | ddl |
| `type` | `STRING` | 账单明细的类型 | ddl |
| `course_id` | `INT` | 课程ID | ddl |
| `amount` | `decimal(16, 2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_cmp_rbm_rbm_tbl_account_record`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 amount 缺少注释
- 字段 create_date 缺少注释
- 字段 user_name 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
