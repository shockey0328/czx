# `dwd_ump_pay_trd_charges_di`

- 层级：`dwd`
- 本地表描述：订单编号
- 主题标签：transaction_payment
- 数据粒度：按 SUBSTRING(cast(date_format(cast(from_unixtime(unix_timestamp(regexp_replace(regexp_replace(created, 'T', ' '), 'Z', ''), 'yyyy-MM-dd HH:mm:ss') + 8*3600) as timestamp), 'yyyy-MM-dd HH:mm:ss') as string),1,10)) 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`charge_id`、`payer_id`、`product_id`、`application_id`、`revenue_type`、`paid_amount`、`paid_date`、`paid_status`、`app_id`、`channel_id`、`amount_refunded`、`status`、`time_paid`、`time_expire`、`time_settle`、`amount_settle`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `charge_id` | `STRING` | 订单编号 | ddl |
| `order_no` | `STRING` | 订单号 | ddl |
| `payer_id` | `STRING` | 买方ID | ddl |
| `product_id` | `STRING` | 产品id | ddl |
| `application_id` | `STRING` | 应用id | ddl |
| `revenue_type` | `STRING` | 营收类型 | ddl |
| `paid_amount` | `INT` | 支付金额 | ddl |
| `paid_date` | `STRING` | 支付日期 | ddl |
| `paid_status` | `INT` | 是否支付成功 | ddl |
| `client_ip` | `STRING` | 客户端iP | ddl |
| `app_id` | `STRING` | 应用id | ddl |
| `channel_id` | `STRING` | 渠道id | ddl |
| `amount_refunded` | `INT` | 已退款的金额 | ddl |
| `refunded` | `INT` | 交易是否完成了全部的退款 | ddl |
| `status` | `STRING` | 支付状态: SUCCEEDED,PENDING,FAILED | ddl |
| `transaction_no` | `STRING` | transaction_no | ddl |
| `time_paid` | `STRING` | 订单支付完成的时间戳 | ddl |
| `time_expire` | `INT` | 订单失效时间 | ddl |
| `charge_label` | `STRING` | 订单标签 | ddl |
| `last_modified` | `STRING` | 最后更改时间 | ddl |
| `currency` | `STRING` | ISO | ddl |
| `subject` | `STRING` | 商品标题 | ddl |
| `BODY` | `STRING` | 商品描述信息 | ddl |
| `customer` | `STRING` | 消费者登录名 | ddl |
| `description` | `STRING` | 订单附加说明 | ddl |
| `livemode` | `INT` | 是否为正式 | ddl |
| `metadata` | `STRING` | 元数据 | ddl |
| `time_settle` | `STRING` | 订单清算时间 | ddl |
| `amount_settle` | `DECIMAL(20,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 天分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_ump_pay_newpay_tbl_charges`, `ods.stg_dmp_dti_kafka_tbl_dmp_dti_data_change`
- 过滤条件：dt IN (select SUBSTRING(cast(date_format(cast(from_unixtime(unix_timestamp(regexp_replace(regexp_replace(created, 'T', ' '), 'Z', ''), 'yyyy-MM-dd HH:mm:ss') + 8*3600) as timestamp), 'yyyy-MM-dd HH:mm:ss') as string),1,10) from ${ods}.stg_dmp_dti_kafka_tbl_dmp_dti_data_change src lateral view json_tuple( after, 'created' ) lv as `created` WHERE 1=1 and dt >= '${dt}' and addr = 'rdsx0a60aa3mvdoptj3e915.mysql.rds.aliyuncs.com:3306' and db = 'newpay' and table = 'charges'

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 amount_settle 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
