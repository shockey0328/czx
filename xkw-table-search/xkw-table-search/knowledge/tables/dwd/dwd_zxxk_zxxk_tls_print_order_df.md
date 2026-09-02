# `dwd_zxxk_zxxk_tls_print_order_df`

- 层级：`dwd`
- 本地表描述：id
- 主题标签：transaction_payment
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`user_id`、`address_id`、`order_num`、`order_status`、`status_description`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | id | ddl |
| `user_id` | `INT` | 用户id | ddl |
| `address_id` | `INT` | 用户地址id | ddl |
| `order_num` | `STRING` | 订单号 | ddl |
| `order_status` | `INT` | 订单状态 | ddl |
| `status_description` | `STRING` | 物流信息(订单描述信息) | ddl |
| `express_no` | `STRING` | 物流单号 | ddl |
| `total_price` | `DECIMAL(10,3` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zxxk_zxxk_user_asset_tbl_print_order`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 total_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
