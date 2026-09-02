# `dwd_zj_zy_cont_online_student_reply_df`

- 层级：`dwd`
- 本地表描述：自增id
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`home_work_id`、`student_id`、`bank_id`、`wrong_num`、`ques_num`、`review_num`、`class_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 自增id | ddl |
| `name` | `STRING` | 作业名 | ddl |
| `home_work_id` | `BIGINT` | 作业id | ddl |
| `student_id` | `INT` | 学生id | ddl |
| `student_no` | `STRING` | 学号 | ddl |
| `student_name` | `STRING` | 学生姓名 | ddl |
| `bank_id` | `INT` | 学科id | ddl |
| `wrong_num` | `INT` | 答错题数量 | ddl |
| `ques_num` | `INT` | 题量，等于批改总量 | ddl |
| `review_num` | `INT` | 已批改试题数量 | ddl |
| `gain_score` | `decimal(10, 2` | 未提供字段注释 | ddl |
| `class_id` | `INT` | 学生班级id | alter |
| `paper_source` | `STRING` | 试卷来源，TEACHING-教辅，SELFSELECT-自选试题 | alter |
| `flag` | `INT` | 区分在线作业还是在线练习，1-在线作业，2-在线练习，3-一次性活动，4-线下作业 | alter |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_zj_zy_app_home_work_tbl_online_student_reply`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 gain_score 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
