# `ads_zxxk_aibook_order_detail`

- 层级：`ads`
- 本地表描述：所属图书id
- 主题标签：content_resource, transaction_payment
- 数据粒度：按 create_date ,book_id ,user_id ; 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`book_id`、`user_id`、`pay_amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `book_id` | `BIGINT` | 所属图书id | ddl |
| `user_id` | `BIGINT` | 购买的用户ID | ddl |
| `pay_amount` | `DECIMAL(38,18` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dwd.dwd_zxxk_aibook_order_df`, `aibook_order`
- 过滤条件：order_status = 1 )SELECT book_id ,user_id ,SUM(pay_amount) AS pay_amount ,COUNT(DISTINCT user_id) AS pay_user_cnt ,COUNT(id) AS id_cnt ,SUM(profit_share_amount) AS profit_share_amount ,create_date FROM aibook_order
- 聚合函数：SUM(pay_amount), COUNT(DISTINCT user_id), COUNT(id), SUM(profit_share_amount)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 pay_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
