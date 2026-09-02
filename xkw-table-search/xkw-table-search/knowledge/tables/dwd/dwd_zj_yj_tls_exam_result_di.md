# `dwd_zj_yj_tls_exam_result_di`

- 层级：`dwd`
- 本地表描述：主键
- 主题标签：content_resource, exam_question
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`exam_id`、`school_id`、`grade_id`、`class_id`、`subject_id`、`stud_id`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `STRING` | 主键 | ddl |
| `exam_id` | `STRING` | 考试ID | ddl |
| `school_id` | `STRING` | 学校id | ddl |
| `grade_id` | `STRING` | 年级id | ddl |
| `class_id` | `STRING` | 班级id | ddl |
| `subject_id` | `STRING` | 科目id 字典取得 | ddl |
| `stud_id` | `STRING` | 学生id | ddl |
| `phase` | `INT` | 阶段（1=小学 2=初中 3=高中） | ddl |
| `sub_score` | `DECIMAL(20,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 天分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dmp_ods.stg_dmp_dti_kafka_tbl_dmp_dti_data_change`, `ods.ods_zj_yj_marking_exam01_tbl_exam_result`, `stgt`
- 过滤条件：dt >= '${dt}' and connector = 'tidb' and addr = 'yansan_tidb_topic' and `db` = 'marking_exam01' and table = 'exam_result' ) src LATERAL VIEW JSON_TUPLE(src.after,'ID','create_time') dst AS id ,create_time )；a.dt IN ( SELECT DISTINCT dt FROM stgt ) ;

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 sub_score 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
