# `dwd_cmp_rbm_tls_feedback_df`

- 层级：`dwd`
- 本地表描述：自增ID
- 主题标签：other
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`course_id`、`application_id`、`source_id`、`entity_type`、`entity_id`、`provider`、`provider_bonus`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 自增ID | ddl |
| `course_id` | `INT` | 课程ID | ddl |
| `application_id` | `STRING` | 应用ID | ddl |
| `source_id` | `STRING` | 应用方提供的id,用以唯一标识此条建议 | ddl |
| `entity_type` | `STRING` | 1=资料，2=专辑 | ddl |
| `entity_id` | `INT` | 资料id或者bundle-id，取决于entity-type的值 | ddl |
| `provider` | `STRING` | 提供者 | ddl |
| `provider_bonus` | `DECIMAL(16,2` | 未提供字段注释 | ddl |
| `creator` | `STRING` | 资料或者专辑的创建人 | alter |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_cmp_rbm_rbm_tbl_feedback`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 provider_bonus 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
