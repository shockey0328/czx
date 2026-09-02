# `dwd_zxxk_zxxk_tls_print_order_detail_df`

- 层级：`dwd`
- 本地表描述：id
- 主题标签：transaction_payment
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`print_info_id`、`print_order_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | id | ddl |
| `print_info_id` | `INT` | 打印文件信息id | ddl |
| `print_order_id` | `INT` | 打印订单id | ddl |
| `unit_price` | `DECIMAL(10,3` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zxxk_zxxk_user_asset_tbl_print_order_detail`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 unit_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
