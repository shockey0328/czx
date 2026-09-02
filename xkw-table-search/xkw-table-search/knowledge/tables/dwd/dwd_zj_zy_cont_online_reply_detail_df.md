# `dwd_zj_zy_cont_online_reply_detail_df`

- 层级：`dwd`
- 本地表描述：自增id
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`reply_id`、`home_work_id`、`ques_id`、`sub_ques_id`、`student_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 自增id | ddl |
| `reply_id` | `BIGINT` | 作答表id | ddl |
| `home_work_id` | `BIGINT` | 作业id | ddl |
| `ques_id` | `INT` | 试题id | ddl |
| `sub_ques_id` | `INT` | 小题号，应对大题带小题的情况，如完型填空和阅读理解题型，同属于一个ques_id | ddl |
| `is_select` | `INT` | 是否为选择题，1：是，0：不是 | ddl |
| `knowledge_points` | `STRING` | 包含的知识点，多个知识点逗号分隔 | ddl |
| `score` | `decimal(5, 2` | 未提供字段注释 | ddl |
| `student_id` | `INT` | 学生id | alter |
| `optimal_solution` | `INT` | 优解，1-是，0-否 | alter |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_zj_zy_app_home_work_tbl_online_reply_detail`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 score 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
