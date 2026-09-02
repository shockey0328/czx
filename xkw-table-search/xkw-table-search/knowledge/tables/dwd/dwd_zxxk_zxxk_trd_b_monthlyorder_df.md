# `dwd_zxxk_zxxk_trd_b_monthlyorder_df`

- 层级：`dwd`
- 本地表描述：主键ID
- 主题标签：transaction_payment
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`order_num`、`user_id`、`username`、`member_type_id`、`product`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 主键ID | ddl |
| `order_num` | `STRING` | 订单编号 | ddl |
| `user_id` | `INT` | 用户ID | ddl |
| `username` | `STRING` | 用户名 | ddl |
| `member_type_id` | `INT` | 包月会员类型id | ddl |
| `product` | `STRING` | 支付通道 0未定义 1中学 2组卷 3书城 4作业通 5M站 6小学 8微信小程序 9安卓App 10IOSApp | ddl |
| `price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_zxxk_zxxk_zxxkpay_tbl_b_monthlyorder`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
