# `dwd_zxxk_zxxk_trd_cl_payment_df`

- 层级：`dwd`
- 本地表描述：支付id
- 主题标签：transaction_payment
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`payment_id`、`user_id`、`user_name`、`user_type`、`order_id`、`payment_num`、`ebank_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `payment_id` | `INT` | 支付id | ddl |
| `user_id` | `INT` | 用户id | ddl |
| `user_name` | `STRING` | 用户名 | ddl |
| `user_type` | `INT` | 废弃 | ddl |
| `order_id` | `INT` | 订单id | ddl |
| `payment_num` | `STRING` | 支付编号(订单编号) | ddl |
| `ebank_id` | `INT` | 废弃 | ddl |
| `pay_mobile` | `STRING` | 废弃 | ddl |
| `pay_money` | `DECIMAL(20,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_zxxk_zxxk_zxxkpay_tbl_cl_payment`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 pay_money 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
