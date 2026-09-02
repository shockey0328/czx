# `dwd_cmp_themis_cont_competitor_resource_df`

- 层级：`dwd`
- 本地表描述：自增id
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`source_id`、`cloud_id`、`source_publish_time`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 自增id | ddl |
| `source_id` | `STRING` | 资料在竞品的id | ddl |
| `cloud_id` | `STRING` | 资料在云图的id | ddl |
| `competitor` | `STRING` | 竞品名称 | ddl |
| `res_link` | `STRING` | 资料链接 | ddl |
| `res_stage` | `STRING` | 学段 | ddl |
| `res_grade` | `STRING` | 年级 | ddl |
| `res_course` | `STRING` | 课程 | ddl |
| `source_publish_time` | `STRING` | 资料在竞品系统发布的时间 | ddl |
| `res_price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_cmp_themis_themis_tbl_competitor_resource`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 res_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
