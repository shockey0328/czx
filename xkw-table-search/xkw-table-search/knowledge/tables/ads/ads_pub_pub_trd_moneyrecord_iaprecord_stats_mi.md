# `ads_pub_pub_trd_moneyrecord_iaprecord_stats_mi`

- 层级：`ads`
- 本地表描述：收入
- 主题标签：transaction_payment, log_behavior
- 数据粒度：按 a.mth 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

暂无自动识别的关键字段

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `income` | `DECIMAL(20,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_pub_pub_fin_iap_record_df`, `dwd.dwd_pub_pub_fin_moneyrecord_di`, `t1`, `t11`, `t12`, `t2`, `t21`, `t22`, `ads.ads_pub_pub_trd_moneyrecord_iaprecord_stats_mi`
- 过滤条件：a.dt>=to_date('${mth}-01') and a.dt<to_date(add_months('${mth}-01',1)) ) ,t11 as (SELECT a.* ,substring(a.dt,1,7) mth ,row_number() over (partition by a.user_id；a.dt<to_date('${mth}-01') ) ,t12 as (SELECT a.* ,substring(a.dt,1,7) mth ,row_number() over (partition by a.user_id；a.dt<to_date(add_months('${mth}-01',1)) ) -- 储值 ,t2 as (SELECT a.* ,substring(a.dt,1,7) mth FROM ${dwd}.dwd_pub_pub_fin_moneyrecord_di a where a.dt>=to_date('${mth}-01') and a.dt<to_date(add_months('${mth}-01',1)) ) -- 期初余额 ,t21 as (SELECT a.* ,substring(a.dt,1,7) mth ,row_number() over (partition by a.user_id；a.dt<to_date('${mth}-01') ) -- 期末余额 ,t22 as (SELECT a.* ,substring(a.dt,1,7) mth ,row_number() over (partition by a.user_id；a.dt<to_date(add_months('${mth}-01',1)) )；desc_id = 1) b on 1 = 1 left join (select sum(case when desc_id = 1 then fin_io_actual_after else 0 end) month_end_balance from t12 a where desc_id = 1) c on 1 = 1；desc_id = 1 ) b on 1 = 1 left join (select sum(case when desc_id = 1 then fin_io_actual_after + fin_io_gift_after else 0 end) month_end_balance , sum(case when desc_id = 1 then fin_io_actual_after else 0 end) month_end_balance_actual , sum(case when desc_id = 1 then fin_io_gift_after else 0 end) month_end_balance_gift from t22 a where desc_id = 1 ) c on 1 = 1；a.mth < '${mth}' ) w
- 聚合函数：SUM(case when fin_io_direction = 'i' then fin_io_actual else 0 end), SUM(case when fin_io_direction = 'o' then fin_io_actual else 0 end), MAX(b.month_begin_balance), MAX(c.month_end_balance), SUM(case when fin_io_type = 9 then fin_io_actual else 0 end), SUM(case when desc_id = 1 then fin_io_actual_after else 0 end), SUM(case when fin_io_direction = 'i' then fin_io_actual + fin_io_gift else 0 end), SUM(case when fin_io_direction = 'o' then fin_io_actual + fin_io_gift else 0 end), MAX(b.month_begin_balance_actual), MAX(c.month_end_balance_actual), SUM(case when fin_io_direction = 'i' then fin_io_gift else 0 end), SUM(case when fin_io_direction = 'o' then fin_io_gift else 0 end)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 income 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
