# `dwd_cmp_qbm_trd_account_records_di`

- 层级：`dwd`
- 本地表描述：ID
- 主题标签：user, transaction_payment
- 数据粒度：按 question_id) ques on a.questionid=ques.question_id where a.`year` in ( SELECT DISTINCT substr(cast(FROM_UNIXTIME(cast(lv.createdate / 1000 - 8 * 60 * 60 as bigint)) as string),1,4) createyear FROM ${ods}.stg_dmp_dti_kafka_tbl_dmp_dti_data_change src LATERAL VIEW JSON_TUPLE(after,'id','username','createdate','taskid','type','courseid','amount','balance','description', 'paperid', 'questionid') lv AS `id`,`username`,`createdate`,`taskid`,`type`,`courseid`,`amount`,`balance`,`description`,`paperid`,`questionid` WHERE dt >= '${dt}' AND addr = '10.111.119.135:3306' AND db = 'qbm' AND table = 'account_records' ) ; 聚合
- 分区字段：year
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`user_name`、`create_date`、`task_id`、`type`、`course_id`、`amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | ID | ddl |
| `user_name` | `STRING` | 用户名 | ddl |
| `create_date` | `STRING` | 创建时间 | ddl |
| `task_id` | `STRING` | 账单变动任务标志 | ddl |
| `type` | `STRING` | 账单明细的类型，比如拆解岗收入，解析岗收入，奖金，罚款等 | ddl |
| `course_id` | `INT` | 课程ID | ddl |
| `amount` | `DECIMAL(20,2` | 未提供字段注释 | ddl |
| `year` | `STRING` | 年分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_cmp_qbm_qbm_tbl_account_records_delta`, `dim.dim_cmp_qbm_question`, `ods.stg_dmp_dti_kafka_tbl_dmp_dti_data_change`
- 过滤条件：a.`year` in ( SELECT DISTINCT substr(cast(FROM_UNIXTIME(cast(lv.createdate / 1000 - 8 * 60 * 60 as bigint)) as string),1,4) createyear FROM ${ods}.stg_dmp_dti_kafka_tbl_dmp_dti_data_change src LATERAL VIEW JSON_TUPLE(after,'id','username','createdate','taskid','type','courseid','amount','balance','description', 'paperid', 'questionid') lv AS `id`,`username`,`createdate`,`taskid`,`type`,`courseid`,`amount`,`balance`,`description`,`paperid`,`questionid` WHERE dt >= '${dt}' AND addr = '10.111.119.135:3306' AND db = 'qbm' AND table = 'account_records' ) ;
- 聚合函数：MAX(paper_id)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
