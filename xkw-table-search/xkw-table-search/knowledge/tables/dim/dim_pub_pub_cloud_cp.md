# `dim_pub_pub_cloud_cp`

- 层级：`dim`
- 本地表描述：站点英文简写
- 主题标签：other
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`site_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `site_id` | `STRING` | 站点英文简写 | ddl |
| `site_name` | `STRING` | 站点中文名 | ddl |
| `price_index` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：未解析

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 price_index 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
