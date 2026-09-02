# `dwd_pub_pub_fin_instant_consumption_di`

- 层级：`dwd`
- 本地表描述：订单编号
- 主题标签：finance
- 数据粒度：按 order_id ) b on a.app_sub_trade_no=b.order_id where 1=1 and paid_status = 1 and a.dt>='2000-01-01' and (app_id = 'app_xyzxxk' or app_id = 'app_live' or app_id = 'app_gktfb' or app_id = 'app_xkwdy' or app_id = 'app_aibook' or app_id = 'app_aixbs' or (app_id = 'app_xkwzujuan' and charge_label like '%扫码下载%') or (app_id = 'app_xkwzujuan' and subject like '%扫码下载%') or (app_id = 'app_xkwzujuan' and subject like '%下载券') or (app_id = 'app_xkwzujuan' and subject like '%专题打包下载') or (app_id = 'app_xkwzujuan' and subject like '%扫码支付下载%') or (app_id = 'app_xyzuoye' and ( subject not like '%提分vip月卡%' and subject not like '%作业服务一月版%' and subject not like '%作业服务一月版,提分vip月卡%' and subject not like '%作业系统(作业、资讯、视频、名校试卷)月卡%' and subject not like '%月卡%' and subject not like '%作业系统(作业、资讯、视频、名校试卷)1个月的全部功能%' and subject not like '%提分vip季卡%' and subject not like '%作业系统(作业)三个月使用卡%' and subject not like '%作业服务半年版,提分vip月卡%' and subject not like '%作业服务半年版,提分vip季卡%' and subject not like '%作业服务半年版%' and subject not like '%提分vip年卡%' and subject not like '%作业服务一年版%' and subject not like '%作业服务一年版,提分vip月卡%' and subject not like '%作业服务一年版,提分vip年卡%' and subject not like '%作业服务一月版,提分vip年卡%' and subject not like '%提分vip年卡,作业服务一年版%' and subject not like '%作业系统(作业)一年卡%' and subject not like '%作业系统(作业、资讯、视频、名校试卷)一年卡%' and subject not like '%作业系统(作业、视频)一年卡%' and subject not like '%作业系统(作业、名校试卷)一年卡%' and subject not like '%年卡%' and subject not like '%作业服务一年半,提分vip季卡%' )) or (app_id = 'app_mzujuan' and charge_label like '%扫码下载%') or (app_id = 'app_mzujuan' and subject like '%扫码支付下载%') or (app_id = 'app_xkwzj' and charge_label like '%扫码支付下载%') or (app_id = 'app_xkwzj' and charge_label like '%扫码下载%') or (app_id = 'app_xkwzj' and charge_label like '%付费下载%') or (app_id = 'app_modzujuan' and charge_label like '%扫码下载%') or (app_id = 'app_zuoyeai') or (app_id = 'app_xybk' and subject = '初中语文部编版（2016）七年级上册') or (app_id = 'app_beike' and charge_label like '%即时消费%') or app_id = 'app_xyyun' or app_id = 'app_xysc' or app_id = 'app_gkzhiyuan' or b.order_id is not null ) ), temp1_dt as ( select charge_id, order_no, payer_id, fin_io_actual, fin_io_time, transaction_no, product_id, channel_id, description, dt from temp1 where dt in (SELECT SUBSTRING( CAST(DATE_FORMAT(FROM_UNIXTIME(CAST(CAST(lv.create_time AS BIGINT) / 1000 AS BIGINT) - 8 * 3600),'yyyy-MM-dd HH:mm:ss') AS STRING) ,1,10) AS create_time FROM ${ods}.stg_dmp_dti_kafka_tbl_dmp_dti_data_change src LATERAL VIEW JSON_TUPLE(after,'create_time') lv AS `create_time` WHERE dt >= '${dt}' AND addr = 'rdsx0a60aa3mvdoptj3e915.mysql.rds.aliyuncs.com:3306' AND db = 'newpay' AND table = 'sub_trade' GROUP BY SUBSTRING( CAST(DATE_FORMAT(FROM_UNIXTIME(CAST(CAST(lv.create_time AS BIGINT) / 1000 AS BIGINT) - 8 * 3600),'yyyy-MM-dd HH:mm:ss') AS STRING) ,1,10) ) ), outlay_result as ( ---支出类型的数据 select charge_id, order_no, payer_id, fin_io_actual, fin_io_time, transaction_no, product_id, 'o' as fin_io_direction, 7 as fin_io_type, ----7：'资料下载' description, dt from temp1_dt ), income_result as ( ---收入类型的数据 select temp1_dt.charge_id as charge_id, temp1_dt.order_no as order_no, temp1_dt.payer_id as payer_id, temp1_dt.fin_io_actual as fin_io_actual, temp1_dt.fin_io_time as fin_io_time, temp1_dt.transaction_no as transaction_no, temp1_dt.product_id as product_id, 'i' as fin_io_direction, -----收入 ----pay_channel.fin_payment_source as fin_io_type, fin_io_type_tbl.io_type_id as fin_io_type, -----收支类型 case when description = 'null' or description is null then '' else description end as description, dt from temp1_dt left join ${dim}.dim_pub_pub_pay_channel pay_channel on temp1_dt.channel_id = pay_channel.channel_id left join ${dim}.dim_pub_pub_fin_io_type fin_io_type_tbl on pay_channel.fin_payment_source = fin_io_type_tbl.io_type_name -----暂且这样关联，有点不伦不类 ), -----------如下是退款的订单, begin------------- refund_order as ( select r.refund_id as charge_id, ----退单ID r.refund_no as order_no, ----退单号 case when c.payer_id is not null then c.payer_id when c.payer_id is null then '' end as payer_id, ----买方ID case when c.charge_id is not null then 0 - r.amount when c.charge_id is null then r.amount end as fin_io_actual, ----财务收支金额 substring(r.created, 1, 19) as fin_io_time, ----财务收支时间 r.transaction_no as transaction_no, case when c.charge_id is not null then c.product_id when c.charge_id is null then 'other' end as product_id, 'i' as fin_io_direction, ----收入 case when c.charge_id is not null then c.fin_io_type when c.charge_id is null then 15 ---15:'other' end as fin_io_type, ----收支类型 r.description as description, substring(r.created, 1, 10) as dt from (select CONCAT('re_20',refund_no) AS refund_id, CONCAT('ch_20', trade_no) AS charge_id, refund_amount AS amount, app_refund_no AS refund_no, create_time AS created, channel_trade_no AS transaction_no, description from ${dwd}.dwd_ump_pay_trd_refund_wide_df where substring(create_time,1, 10) in (SELECT SUBSTRING( CAST(DATE_FORMAT(FROM_UNIXTIME(CAST(CAST(lv.create_time AS BIGINT) / 1000 AS BIGINT) - 8 * 3600),'yyyy-MM-dd HH:mm:ss') AS STRING) ,1,10) AS create_time FROM ${ods}.stg_dmp_dti_kafka_tbl_dmp_dti_data_change src LATERAL VIEW JSON_TUPLE(after,'create_time') lv AS `create_time` WHERE dt >= '${dt}' AND addr = 'rdsx0a60aa3mvdoptj3e915.mysql.rds.aliyuncs.com:3306' AND db = 'newpay' AND table = 'sub_trade' GROUP BY SUBSTRING( CAST(DATE_FORMAT(FROM_UNIXTIME(CAST(CAST(lv.create_time AS BIGINT) / 1000 AS BIGINT) - 8 * 3600),'yyyy-MM-dd HH:mm:ss') AS STRING) ,1,10) ) -----补数据时，需要改成substring(created,1, 10)='${dt}' and succeed = 1 ) r inner join (select paid.payer_id, paid.charge_id, paid.product_id, fin_io_type_tbl.io_type_id as fin_io_type ---收支类型(支付宝，财付通)，不是资料下载 from temp1 paid ---关联全量表 left join ${dim}.dim_pub_pub_pay_channel pay_channel on paid.channel_id = pay_channel.channel_id left join ${dim}.dim_pub_pub_fin_io_type fin_io_type_tbl on pay_channel.fin_payment_source = fin_io_type_tbl.io_type_name ) c on r.charge_id = c.charge_id ) ------------退款订单, end--------------------- 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`charge_id`、`payer_id`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `charge_id` | `STRING` | 订单编号 | ddl |
| `order_no` | `STRING` | 订单号 | ddl |
| `payer_id` | `STRING` | 买方ID | ddl |
| `fin_io_actual` | `DECIMAL(20,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 天分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_ump_pay_trd_trade_wide_di`, `dwd.dwd_yx_yx_trd_train_bill_df`, `temp1`, `ods.stg_dmp_dti_kafka_tbl_dmp_dti_data_change`, `temp1_dt`, `dim.dim_pub_pub_pay_channel`, `dim.dim_pub_pub_fin_io_type`, `dwd.dwd_ump_pay_trd_refund_wide_df`, `outlay_result`, `income_result`, `refund_order`
- 关联条件：temp1_dt.channel_id = pay_channel.channel_id
    left；pay_channel.fin_payment_source = fin_io_type_tbl.io_type_name  -----暂且这样关联，有点不伦不类
    ),

-----------如下是退款的订单, begin-------------
    refund_order as (
select  r.refund_id  as  charge_id,     ----退单ID
    r.refund_no  as  order_no,     ----退单号
    case
    when c.payer_id is not null then c.payer_id
    when c.payer_id is null then ''
    end as payer_id,         ----买方ID
    case when c.charge_id is not null then 0 - r.amount
    when c.charge_id is null  then r.amount
    end as fin_io_actual,           ----财务收支金额
    substring(r.created, 1, 19) as fin_io_time,      ----财务收支时间
    r.transaction_no  as  transaction_no,
    case
    when c.charge_id is not null then c.product_id
    when c.charge_id is null then  'other'
    end as product_id,
    'i'  as fin_io_direction, ----收入
    case
    when c.charge_id is not null then c.fin_io_type
    when c.charge_id is null then 15    ---15:'other'
    end as fin_io_type,      ----收支类型
    r.description               as description,
    substring(r.created, 1, 10) as dt
from  (select CONCAT('re_20',refund_no) AS refund_id,
    CONCAT('ch_20', trade_no) AS charge_id,
    refund_amount AS amount,
    app_refund_no AS refund_no,
    create_time AS created,
    channel_trade_no AS transaction_no,
    description
    from ${dwd}.dwd_ump_pay_trd_refund_wide_df；paid.channel_id = pay_channel.channel_id
    left；pay_channel.fin_payment_source = fin_io_type_tbl.io_type_name
    ) c  on r.charge_id = c.charge_id
    )
------------退款订单, end---------------------

INSERT overwrite TABLE ${dwd}.dwd_pub_pub_fin_instant_consumption_di partition (dt)
select charge_id,
       order_no,
       payer_id,
       fin_io_actual,
       substring(fin_io_time,1, 19) as fin_io_time,
       transaction_no,
       product_id,
       fin_io_direction,
       fin_io_type,
       coalesce(description, '') as description,
       dt
from outlay_result
- 过滤条件：pay_status=2 and pay_type in (1,2,5) and source_type_no in (1,3,4)；1=1 and paid_status = 1 and a.dt>='2000-01-01' and (app_id = 'app_xyzxxk' or app_id = 'app_live' or app_id = 'app_gktfb' or app_id = 'app_xkwdy' or app_id = 'app_aibook' or app_id = 'app_aixbs' or (app_id = 'app_xkwzujuan' and charge_label like '%扫码下载%') or (app_id = 'app_xkwzujuan' and subject like '%扫码下载%') or (app_id = 'app_xkwzujuan' and subject like '%下载券') or (app_id = 'app_xkwzujuan' and subject like '%专题打包下载') or (app_id = 'app_xkwzujuan' and subject like '%扫码支付下载%') or (app_id = 'app_xyzuoye' and ( subject not like '%提分vip月卡%' and subject not like '%作业服务一月版%' and subject not like '%作业服务一月版,提分vip月卡%' and subject not like '%作业系统(作业、资讯、视频、名校试卷)月卡%' and subject not like '%月卡%' and subject not like '%作业系统(作业、资讯、视频、名校试卷)1个月的全部功能%' and subject not like '%提分vip季卡%' and subject not like '%作业系统(作业)三个月使用卡%' and subject not like '%作业服务半年版,提分vip月卡%' and subject not like '%作业服务半年版,提分vip季卡%' and subject not like '%作业服务半年版%' and subject not like '%提分vip年卡%' and subject not like '%作业服务一年版%' and subject not like '%作业服务一年版,提分vip月卡%' and subject not like '%作业服务一年版,提分vip年卡%' and subject not like '%作业服务一月版,提分vip年卡%' and subject not like '%提分vip年卡,作业服务一年版%' and subject not like '%作业系统(作业)一年卡%' and subject not like '%作业系统(作业、资讯、视频、名校试卷)一年卡%' and subject not like '%作业系统(作业、视频)一年卡%' and subject not like '%作业系统(作业、名校试卷)一年卡%' and subject not like '%年卡%' and subject not like '%作业服务一年半,提分vip季卡%' )) or (app_id = 'app_mzujuan' and charge_label like '%扫码下载%') or (app_id = 'app_mzujuan' and subject like '%扫码支付下载%') or (app_id = 'app_xkwzj' and charge_label like '%扫码支付下载%') or (app_id = 'app_xkwzj' and charge_label like '%扫码下载%') or (app_id = 'app_xkwzj' and charge_label like '%付费下载%') or (app_id = 'app_modzujuan' and charge_label like '%扫码下载%') or (app_id = 'app_zuoyeai') or (app_id = 'app_xybk' and subject = '初中语文部编版（2016）七年级上册') or (app_id = 'app_beike' and charge_label like '%即时消费%') or app_id = 'app_xyyun' or app_id = 'app_xysc' or app_id = 'app_gkzhiyuan' or b.order_id is not null ) ), temp1_dt as ( select charge_id, order_no, payer_id, fin_io_actual, fin_io_time, transaction_no, product_id, channel_id, description, dt from temp1 where dt in (SELECT SUBSTRING( CAST(DATE_FORMAT(FROM_UNIXTIME(CAST(CAST(lv.create_time AS BIGINT) / 1000 AS BIGINT) - 8 * 3600),'yyyy-MM-dd HH:mm:ss') AS STRING) ,1,10) AS create_time FROM ${ods}.stg_dmp_dti_kafka_tbl_dmp_dti_data_change src LATERAL VIEW JSON_TUPLE(after,'create_time') lv AS `create_time` WHERE dt >= '${dt}' AND addr = 'rdsx0a60aa3mvdoptj3e915.mysql.rds.aliyuncs.com:3306' AND db = 'newpay' AND table = 'sub_trade'；substring(create_time,1, 10) in (SELECT SUBSTRING( CAST(DATE_FORMAT(FROM_UNIXTIME(CAST(CAST(lv.create_time AS BIGINT) / 1000 AS BIGINT) - 8 * 3600),'yyyy-MM-dd HH:mm:ss') AS STRING) ,1,10) AS create_time FROM ${ods}.stg_dmp_dti_kafka_tbl_dmp_dti_data_change src LATERAL VIEW JSON_TUPLE(after,'create_time') lv AS `create_time` WHERE dt >= '${dt}' AND addr = 'rdsx0a60aa3mvdoptj3e915.mysql.rds.aliyuncs.com:3306' AND db = 'newpay' AND table = 'sub_trade'

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 fin_io_actual 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
