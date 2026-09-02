# `dim_cmp_qbm_question_aigc_policies`

- 层级：`dim`
- 本地表描述：自增ID
- 主题标签：content_resource, exam_question
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`questiontypeid`、`courseid`、`solvetype`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 自增ID | ddl |
| `questiontypeid` | `STRING` | 题型ID | ddl |
| `courseid` | `INT` | 课程 | ddl |
| `questionmode` | `INT` | 试题模式:0=纯文本试题,1=含图试题 | ddl |
| `solvetype` | `INT` | 解题模式：0=纯人工，1=AI辅助补答案，2=AI辅助答案解析 | ddl |
| `manualcorrectratio` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_cmp_qbm_qbm_tbl_question_aigc_policies`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 manualcorrectratio 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
