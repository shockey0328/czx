# `ads_zxxk_aibook_order_stat`

- 层级：`ads`
- 本地表描述：图书ID
- 主题标签：content_resource, transaction_payment, log_behavior
- 数据粒度：按 book_id ) ,aibook_order_week AS ( SELECT book_id ,SUM(pay_amount) AS pay_amount ,COUNT(DISTINCT user_id) AS user_cnt ,COUNT(*) AS payment_cnt ,'周' AS time_grain ,DATE_ADD(NEXT_DAY('${dt}','MO'),-7) AS stat_date FROM aibook_order WHERE create_date >= DATE_ADD(NEXT_DAY('${dt}','MO'),-7) AND create_date < DATEADD(DATE_ADD(NEXT_DAY('${dt}','MO'),-7),7,'dd') GROUP BY book_id ) ,aibook_order_month AS ( SELECT book_id ,SUM(pay_amount) AS pay_amount ,COUNT(DISTINCT user_id) AS user_cnt ,COUNT(*) AS payment_cnt ,'月' AS time_grain ,DATE(SUBSTRING('${dt}',1,7) || '-01') AS stat_date FROM aibook_order WHERE SUBSTRING(create_date,1,7) = SUBSTRING('${dt}',1,7) GROUP BY book_id ) ,aibook_order_all AS ( SELECT * FROM aibook_order_day 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`book_id`、`pay_amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `book_id` | `BIGINT` | 图书ID | ddl |
| `pay_amount` | `DECIMAL(10,3` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dwd.dwd_zxxk_aibook_order_df`, `aibook_order`, `aibook_order_day`, `aibook_order_week`, `aibook_order_month`, `aibook_order_all`, `ads.ads_zxxk_aibook_order_stat`
- 关联条件：a.book_id = b.book_id
AND     a.time_grain = b.time_grain
AND     a.stat_date = b.stat_date
- 过滤条件：order_status = 1 ) ,aibook_order_day AS ( SELECT book_id ,SUM(pay_amount) AS pay_amount ,COUNT(DISTINCT user_id) AS user_cnt ,COUNT(*) AS payment_cnt ,'日' AS time_grain ,DATE('${dt}') AS stat_date FROM aibook_order WHERE create_date = '${dt}'；create_date >= DATE_ADD(NEXT_DAY('${dt}','MO'),-7) AND create_date < DATEADD(DATE_ADD(NEXT_DAY('${dt}','MO'),-7),7,'dd')；SUBSTRING(create_date,1,7) = SUBSTRING('${dt}',1,7)；b.book_id IS NULL ;
- 聚合函数：SUM(pay_amount), COUNT(DISTINCT user_id), COUNT(*)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 pay_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
