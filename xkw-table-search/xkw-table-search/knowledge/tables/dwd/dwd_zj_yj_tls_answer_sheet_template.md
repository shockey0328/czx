# `dwd_zj_yj_tls_answer_sheet_template`

- 层级：`dwd`
- 本地表描述：主键
- 主题标签：other
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`exam_id`、`school_id`、`open_status`、`template_type`、`ab_type`、`exam_no_recognition_types`、`paper_snapshot_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `STRING` | 主键 | ddl |
| `exam_id` | `STRING` | 考试id | ddl |
| `school_id` | `STRING` | 学校id | ddl |
| `grade` | `INT` | 年级1-12 | ddl |
| `subject_code` | `STRING` | 科目 | ddl |
| `template_name` | `STRING` | 模板名称 | ddl |
| `is_hen` | `INT` | 阅卷方式 | ddl |
| `is_merged_question` | `INT` | 是否题卡合一 | ddl |
| `used_scope` | `INT` | 模板使用场景 | ddl |
| `open_status` | `INT` | 发布状态 | ddl |
| `template_type` | `INT` | 模板类型 | ddl |
| `ab_type` | `INT` | ab卷类型 | ddl |
| `exam_no_recognition_types` | `INT` | 考号识别方式 | ddl |
| `sheet_count` | `INT` | 答题卡张数 | ddl |
| `paper_snapshot_id` | `STRING` | 组卷试卷快照id | ddl |
| `exam_no_length` | `INT` | 考号长度 | ddl |
| `question_count` | `INT` | 试题总数 | ddl |
| `total_score` | `DECIMAL(20,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zj_yj_marking_exam01_tbl_answer_sheet_template`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 total_score 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
