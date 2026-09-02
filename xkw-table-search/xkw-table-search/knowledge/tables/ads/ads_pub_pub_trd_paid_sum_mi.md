# `ads_pub_pub_trd_paid_sum_mi`

- 层级：`ads`
- 本地表描述：支付方式（财付通，支付宝）
- 主题标签：transaction_payment
- 数据粒度：按 substring(time_paid, 1, 7), case when channel_id like 'wx%' then 'wx' when channel_id like 'ali%' then 'alipay' end ), amount_refunded_tbl as ( select substr(a.create_time, 1,7) as `mth`, case when b.channel_id like 'wx%' then 'wx' when b.channel_id like 'ali%' then 'alipay' end as channel_id, cast(sum(a.refund_amount)/100 as decimal(20,2)) as amount_refunded from ${dwd}.dwd_ump_pay_trd_refund_wide_df a inner join ${dwd}.dwd_ump_pay_trd_trade_wide_di b on b.dt>='2000-01-01' and a.app_sub_trade_no =b.app_sub_trade_no where a.succeed = '1' and substring(a.create_time, 1, 10) >= to_date('${mth}-01') and substring(a.create_time, 1, 10) < to_date(add_months('${mth}-01',1)) and (b.channel_id like 'wx%' or b.channel_id like 'ali%') group by substr(a.create_time, 1, 7), case when b.channel_id like 'wx%' then 'wx' when b.channel_id like 'ali%' then 'alipay' end ), paid_amount_tob_tbl as ( select substring(time_paid,1,7) as `mth`, case when channel_id like 'wx%' then 'wx' when channel_id like 'ali%' then 'alipay' end as channel_id, cast(sum(amount)/100 as decimal(20, 2)) as paid_amount_tob from dmp_cdm.dwd_ump_pay_trd_trade_wide_di where dt>='2000-01-01' and substring(time_paid, 1, 10) >= to_date('${mth}-01') and substring(time_paid, 1, 10) < to_date(add_months('${mth}-01',1)) and (channel_id like 'wx%' or channel_id like 'ali%') and paid_status = 1 and app_id = 'app_xyssm' group by substring(time_paid, 1, 7), case when channel_id like 'wx%' then 'wx' when channel_id like 'ali%' then 'alipay' end ), paid_amount_minisale_tbl as ( select substr(time_paid,1,7) as `mth`, case when channel_id like 'wx%' then 'wx' when channel_id like 'ali%' then 'alipay' end as channel_id, cast(sum(amount)/100 as decimal(20,2)) as paid_amount_minisale from dmp_cdm.dwd_ump_pay_trd_trade_wide_di where dt>='2000-01-01' and substring(time_paid, 1, 10) >= to_date('${mth}-01') and substring(time_paid, 1, 10) < to_date(add_months('${mth}-01',1)) and (channel_id like 'wx%' or channel_id like 'ali%') and paid_status = 1 and app_id = 'app_minisale' group by substr(time_paid, 1, 7), case when channel_id like 'wx%' then 'wx' when channel_id like 'ali%' then 'alipay' end ) 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`channel_id`、`paid_amount_total`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `channel_id` | `STRING` | 支付方式（财付通，支付宝） | ddl |
| `paid_amount_total` | `DECIMAL(20,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_ump_pay_trd_trade_wide_di`, `dwd.dwd_ump_pay_trd_refund_wide_df`, `dmp_cdm.dwd_ump_pay_trd_trade_wide_di`, `paid_amount_total_tbl`, `amount_refunded_tbl`, `paid_amount_tob_tbl`, `paid_amount_minisale_tbl`, `ads.ads_pub_pub_trd_paid_sum_mi`
- 关联条件：b.dt>='2000-01-01' and a.app_sub_trade_no =b.app_sub_trade_no；a.mth = b.mth and a.channel_id = b.channel_id
          full；a.mth=  c.mth and a.channel_id = c.channel_id
          full；a.mth = d.mth and a.channel_id = d.channel_id
- 过滤条件：dt>='2000-01-01' and substring(time_paid, 1, 10) >= to_date('${mth}-01') and substring(time_paid, 1, 10) < to_date(add_months('${mth}-01',1)) and (channel_id like 'wx%' or channel_id like 'ali%') and paid_status = 1 and app_id != 'app_jsxygs'；a.succeed = '1' and substring(a.create_time, 1, 10) >= to_date('${mth}-01') and substring(a.create_time, 1, 10) < to_date(add_months('${mth}-01',1)) and (b.channel_id like 'wx%' or b.channel_id like 'ali%')；dt>='2000-01-01' and substring(time_paid, 1, 10) >= to_date('${mth}-01') and substring(time_paid, 1, 10) < to_date(add_months('${mth}-01',1)) and (channel_id like 'wx%' or channel_id like 'ali%') and paid_status = 1 and app_id = 'app_xyssm'；dt>='2000-01-01' and substring(time_paid, 1, 10) >= to_date('${mth}-01') and substring(time_paid, 1, 10) < to_date(add_months('${mth}-01',1)) and (channel_id like 'wx%' or channel_id like 'ali%') and paid_status = 1 and app_id = 'app_minisale'；mth < '${mth}'
- 聚合函数：SUM(amount), SUM(a.refund_amount)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 paid_amount_total 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
