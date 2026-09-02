# `ads_pub_pub_fin_mbr_share`

- 层级：`ads`
- 本地表描述：数据指标对应业务月份
- 主题标签：user, finance
- 数据粒度：按 order_month, product_id )pre_one_month_order left join ( select mth as stat_month, product_id, sum(if(pay_way = 'xuebei', share_amount, 0)) as xuebei_shared_amount, ----【5.学贝订单分摊到本月的金额】 sum(if(pay_way = 'apple_iap', share_amount, 0)) as apple_iap_shared_amount, ----【7.苹果内购订单分摊到本月的金额】 sum(share_amount) as shared_amount ----【8.分摊到本月的金额】 from ${dws}.dws_pub_pub_fin_mbr_share_1m_mi where mth = '${mth}' group by mth, product_id ) pre_one_month_xuebei_and_iaporder_share on pre_one_month_order.stat_month = pre_one_month_xuebei_and_iaporder_share.stat_month and pre_one_month_order.product_id = pre_one_month_xuebei_and_iaporder_share.product_id left join( ---【截止到start_month月份 累计还未分摊的剩余金额】 select product_id, sum(share_amount) - sum(refund_amount) as unshare_amount from ${dws}.dws_pub_pub_fin_mbr_share_1m_mi where order_month <= '${mth}' and mth > '${mth}' group by product_id ) unshare_order_amount on pre_one_month_order.product_id = unshare_order_amount.product_id 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`product_id`、`new_order_amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `stat_month` | `STRING` | 数据指标对应业务月份 | ddl |
| `product_id` | `STRING` | 产品id | ddl |
| `new_order_amount` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ads.ads_pub_pub_fin_mbr_share`, `before_prepre_month_share`, `dwd.dwd_pub_pub_fin_mbr_ord_di`, `dws.dws_pub_pub_fin_mbr_share_1m_mi`
- 过滤条件：--stat_month >= '2022-01' and stat_month < '${mth}' ---上上个月的数据 )；order_month = '${mth}' ----上一个月的数据；mth = '${mth}'；order_month <= '${mth}' and mth > '${mth}'
- 聚合函数：SUM(fin_io_actual), SUM(if(pay_way = 'xuebei', fin_io_actual, 0), SUM(if(pay_way = 'apple_iap', fin_io_actual, 0), SUM(if(pay_way = 'xuebei', share_amount, 0), SUM(if(pay_way = 'apple_iap', share_amount, 0), SUM(share_amount), SUM(refund_amount)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 new_order_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
