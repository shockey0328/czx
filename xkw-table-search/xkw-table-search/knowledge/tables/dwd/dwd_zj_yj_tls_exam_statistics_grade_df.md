# `dwd_zj_yj_tls_exam_statistics_grade_df`

- 层级：`dwd`
- 本地表描述：ID
- 主题标签：log_behavior, exam_question
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`exam_id`、`school_id`、`miss_num`、`no_num`、`dont_num`、`zero_num`、`student_num`、`examine_num`、`statistical_num`、`wonder_num`、`excel_num`、`good_num`、`pass_num`、`tired_num`、`feeble_num`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `STRING` | ID | ddl |
| `exam_id` | `STRING` | 考试编码 | ddl |
| `subject_code` | `STRING` | 学科 | ddl |
| `school_id` | `STRING` | 学校主键 | ddl |
| `miss_num` | `INT` | 缺考人数 | ddl |
| `no_num` | `INT` | 无名氏人数 | ddl |
| `dont_num` | `INT` | 免考人数 | ddl |
| `zero_num` | `INT` | 0分人数 | ddl |
| `student_num` | `INT` | 班级总人数 | ddl |
| `examine_num` | `INT` | 考试人数 | ddl |
| `statistical_num` | `INT` | 统计人数 | ddl |
| `wonder_num` | `INT` | 极高分人数 | ddl |
| `excel_num` | `INT` | 优秀分人数 | ddl |
| `good_num` | `INT` | 良好分人数 | ddl |
| `pass_num` | `INT` | 合格分人数 | ddl |
| `tired_num` | `INT` | 学困分人数 | ddl |
| `feeble_num` | `INT` | 学弱分人数 | ddl |
| `max_score` | `DECIMAL(20,4` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zj_yj_marking_statistics_tbl_exam_statistics_grade`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 max_score 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
