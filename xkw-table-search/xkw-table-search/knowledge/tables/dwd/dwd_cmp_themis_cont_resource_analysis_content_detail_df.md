# `dwd_cmp_themis_cont_resource_analysis_content_detail_df`

- 层级：`dwd`
- 本地表描述：自增id
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`analysis_id`、`resource_id`、`dup_resource_id`、`dup_file_id`、`contract_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 自增id | ddl |
| `analysis_id` | `BIGINT` | 资料分析主表id | ddl |
| `resource_id` | `INT` | Themis系统资料id | ddl |
| `dup_resource_id` | `INT` | 重复的资料id--目前只有rbm可以查重 | ddl |
| `has_copyright` | `INT` | 是否有权 0：否 1：是 | ddl |
| `dup_file_id` | `BIGINT` | 重复的文件ID--目前只有rbm可以查重 | ddl |
| `contract_id` | `INT` | 资料对应的真实合同id | ddl |
| `similarity` | `DECIMAL(9,6` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_cmp_themis_themis_tbl_resource_analysis_content_detail`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 similarity 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
