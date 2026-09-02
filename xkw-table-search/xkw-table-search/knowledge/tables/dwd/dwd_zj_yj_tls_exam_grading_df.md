# `dwd_zj_yj_tls_exam_grading_df`

- 层级：`dwd`
- 本地表描述：主键
- 主题标签：exam_question
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`exam_id`、`school_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `STRING` | 主键 | ddl |
| `exam_id` | `STRING` | 考试主键 | ddl |
| `question` | `STRING` | 题号 | ddl |
| `school_id` | `STRING` | 学校ID | ddl |
| `diff_value` | `DECIMAL(20,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zj_yj_marking_exam01_tbl_exam_grading`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 diff_value 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
