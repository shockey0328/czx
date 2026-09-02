# `dwd_cmp_rbm_cont_resource_supervision_df`

- 层级：`dwd`
- 本地表描述：自增ID
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`resource_id`、`course_id`、`create_date`、`provider`、`provider_bonus`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 自增ID | ddl |
| `resource_id` | `INT` | 资源类型,参见tag表 | ddl |
| `course_id` | `INT` | 课程ID | ddl |
| `create_date` | `STRING` | 创建时间 yyyy-MM-dd HH:mm:ss.SSS | ddl |
| `result` | `STRING` | 督查结果 | ddl |
| `supervisor` | `STRING` | 督查人 | ddl |
| `provider` | `STRING` | 上传人 | ddl |
| `provider_bonus` | `DECIMAL(16,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_cmp_rbm_rbm_tbl_resource_supervision`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 provider_bonus 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
