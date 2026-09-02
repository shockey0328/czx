# `ads_pub_pub_trd_mbr_advance_ord_1m`

- 层级：`ads`
- 本地表描述：订单月
- 主题标签：user, transaction_payment
- 数据粒度：按 product_id,order_month), t2 AS ( SELECT substr(begin_time,1,7) as begin_month,--预收订单开始分摊的月份 product_id, sum(fin_io_actual) AS price, --本期转入分摊的预收订单金额 sum(if(pay_way='xuebei',fin_io_actual,null)) as xuebei_price,--本期转入分摊的学贝预收订单金额 sum(if(pay_way='apple_iap',fin_io_actual,null)) as ios_price --本期转入分摊的ios预收订单金额 FROM ${dwd}.dwd_pub_pub_fin_mbr_ord_di WHERE (order_month < '${mth}' or (order_month = '${mth}' and fin_io_type = 2)) and substr(begin_time,1,7) = '${mth}' GROUP BY product_id,substr(begin_time,1,7) ), tmp_results_0 as ( SELECT coalesce(t1.order_month,t2.begin_month) as order_month, coalesce(t1.product_id,t2.product_id) as product_id, nvl(t1.price,0) AS advance_order_amount, nvl(t1.ios_price,0) as advance_iap_amount, nvl(t1.xuebei_price,0) as advance_xuebei_amount, nvl(t2.price,0) AS begin_share_order_amount , nvl(t2.ios_price,0) as begin_share_iap_amount, nvl(t2.xuebei_price,0) as begin_share_xuebei_amount FROM t1 FULL JOIN t2 ON t1.product_id = t2.product_id and t1.order_month=t2.begin_month ), tmp_results_1 as ( select coalesce(tmp_results_0.order_month,'${mth}') as order_month, coalesce(tmp_results_0.product_id,t0.product_id) as product_id, coalesce(tmp_results_0.advance_order_amount,0) as advance_order_amount, coalesce(tmp_results_0.advance_iap_amount,0) as advance_iap_amount, coalesce(tmp_results_0.advance_xuebei_amount,0) as advance_xuebei_amount, coalesce(tmp_results_0.begin_share_order_amount,0) as begin_share_order_amount, coalesce(tmp_results_0.begin_share_iap_amount,0) as begin_share_iap_amount, coalesce(tmp_results_0.begin_share_xuebei_amount,0) as begin_share_xuebei_amount from tmp_results_0 full join t0 on t0.product_id = tmp_results_0.product_id ) 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`product_id`、`advance_order_amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `order_month` | `STRING` | 订单月 | ddl |
| `product_id` | `STRING` | 产品名称 | ddl |
| `advance_order_amount` | `DECIMAL(20,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dwd.dwd_pub_pub_fin_mbr_ord_di`, `t1`, `t2`, `tmp_results_0`, `t0`, `tmp_results_1`, `ads.ads_pub_pub_trd_mbr_advance_ord_1m`
- 关联条件：t1.product_id = t2.product_id and t1.order_month=t2.begin_month
     ),
     tmp_results_1 as (
         select coalesce(tmp_results_0.order_month,'${mth}') as order_month,
                coalesce(tmp_results_0.product_id,t0.product_id) as product_id,
                coalesce(tmp_results_0.advance_order_amount,0) as advance_order_amount,
                coalesce(tmp_results_0.advance_iap_amount,0) as advance_iap_amount,
                coalesce(tmp_results_0.advance_xuebei_amount,0) as advance_xuebei_amount,
                coalesce(tmp_results_0.begin_share_order_amount,0) as begin_share_order_amount,
                coalesce(tmp_results_0.begin_share_iap_amount,0) as begin_share_iap_amount,
                coalesce(tmp_results_0.begin_share_xuebei_amount,0) as begin_share_xuebei_amount
         from tmp_results_0
                  full；t0.product_id = tmp_results_0.product_id
     )
INSERT OVERWRITE TABLE ${ads}.ads_pub_pub_trd_mbr_advance_ord_1m
select * from tmp_results_1
- 过滤条件：order_month = '${mth}' AND substr(begin_time,1,7)>substr(fin_io_time,1,7)；(order_month < '${mth}' or (order_month = '${mth}' and fin_io_type = 2)) and substr(begin_time,1,7) = '${mth}'；order_month < '${mth}';
- 聚合函数：SUM(fin_io_actual), SUM(if(pay_way='xuebei',fin_io_actual,null), SUM(if(pay_way='apple_iap',fin_io_actual,null)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 advance_order_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
