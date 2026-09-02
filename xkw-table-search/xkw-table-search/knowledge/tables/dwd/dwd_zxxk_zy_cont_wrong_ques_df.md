# `dwd_zxxk_zy_cont_wrong_ques_df`

- 层级：`dwd`
- 本地表描述：作业ID
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`home_work_id`、`class_id`、`user_id`、`ques_id`、`ques_type_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `int` | 未提供字段注释 | ddl |
| `home_work_id` | `int` | 作业ID | ddl |
| `home_work_name` | `string` | 作业名称 | ddl |
| `class_id` | `int` | 班级ID | ddl |
| `user_id` | `int` | 布置人ID | ddl |
| `ques_id` | `int` | 试题ID | ddl |
| `ques_type_id` | `string` | 题型Id,包含父级ID | ddl |
| `gain_rate` | `decimal(5, 2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_zxxk_zxxk_smark_book_tbl_wrong_ques`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 gain_rate 缺少注释
- 字段 id 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
