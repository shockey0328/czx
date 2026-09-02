# `dwd_cmp_qbm_cont_question_tasks_df`

- 层级：`dwd`
- 本地表描述：自增主键
- 主题标签：content_resource, exam_question
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`qid`、`course_id`、`create_time`、`start_time`、`end_time`、`start_revision_id`、`end_revision_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 自增主键 | ddl |
| `qid` | `STRING` | 试题id | ddl |
| `course_id` | `INT` | 课程id | ddl |
| `sub_course` | `INT` | 细分领域id | ddl |
| `emergency` | `INT` | 紧急程度 | ddl |
| `creator` | `STRING` | 任务创建者的用户名 | ddl |
| `requirement` | `STRING` | 任务特殊要求 | ddl |
| `create_time` | `STRING` | 创建时间 | ddl |
| `start_time` | `STRING` | 任务领取时间 | ddl |
| `end_time` | `STRING` | 任务完成时间 | ddl |
| `start_revision_id` | `INT` | 领取任务时的修订版本号 | ddl |
| `end_revision_id` | `INT` | 提交任务时的修订版本号 | ddl |
| `author_income` | `DECIMAL(16,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_cmp_qbm_qbm_tbl_question_tasks`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 author_income 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
