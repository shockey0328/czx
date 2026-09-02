# `dwd_pub_pub_fin_moneyrecord_di`

- 层级：`dwd`
- 本地表描述：资产表id储值流水号
- 主题标签：transaction_payment, finance
- 数据粒度：按 substring(b.add_time,1,10)) ) 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`user_id`、`product_id`、`fin_io_type`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 资产表id储值流水号 | ddl |
| `user_id` | `INT` | 用户id | ddl |
| `product_id` | `STRING` | 产品id | ddl |
| `fin_io_direction` | `STRING` | （财务口径的）收支方向：收入，支出根据source和type_id判断。 | ddl |
| `fin_io_type` | `INT` | 收支类型 | ddl |
| `fin_io_actual` | `DECIMAL(20,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 数据分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.mid_dwd_pub_pub_fin_moneyrecord_di`, `dwd.dwd_ump_uc_trd_moneyrecord_di`, `dwd.dwd_ump_pay_trd_trade_wide_di`, `dwd.dwd_ump_pay_trd_cash_payment_di`, `dwd.dwd_ump_pay_trd_cash_payment_ex_df`, `dwd.dwd_pub_pub_fin_moneyrecord_di`, `t1`, `dim.dim_pub_pub_fin_io_type`, `--`, `dwd.dwd_uc_uc_t_moneyrecord`, `t0`
- 关联条件：a.trade_no=b.trade_no
                        inner；b.payment_no=c.payment_no
- 过滤条件：dt>=date_sub('${dt}',30) and dt<='${dt}' ) b on a.id=b.id left join (select app_sub_trade_no,max(c.xpay_type) xpay_type from ${dwd}.dwd_ump_pay_trd_trade_wide_di a inner join ${dwd}.dwd_ump_pay_trd_cash_payment_di b on a.trade_no=b.trade_no inner join ${dwd}.dwd_ump_pay_trd_cash_payment_ex_df c on b.payment_no=c.payment_no where a.dt>=date_sub('${dt}',30) and b.dt>=date_sub('${dt}',30) and c.xpay_type in (1,2)；a.dt in (select substring(b.add_time,1,10) from ${dwd}.mid_dwd_pub_pub_fin_moneyrecord_di a inner join (select id,add_time from ${dwd}.dwd_ump_uc_trd_moneyrecord_di where dt>='2000-01-01' ) b on a.id=b.id；is_moneyrecord=1) b on a.fin_io_type=b.io_type_name where rn = 1 ; truncate table ${dwd}.mid_dwd_pub_pub_fin_moneyrecord_di; -- 初始化2020年数据 -- with t0 as ( -- select * -- from -- (SELECT a.id,a.user_id,a.after_num,transaction_no,a.add_time -- ,a.censor_id,a.censor_name,a.remark -- ,row_number() over (partition by user_id；a.dt_month<'2021-01' -- -- and income>0 -- -- and a.user_id=33052617 -- ) w -- where w.rn=1 ) --
- 聚合函数：MAX(c.xpay_type)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 fin_io_actual 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
