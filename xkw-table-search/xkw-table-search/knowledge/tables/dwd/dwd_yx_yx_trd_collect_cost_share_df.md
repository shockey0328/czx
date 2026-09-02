# `dwd_yx_yx_trd_collect_cost_share_df`

- 层级：`dwd`
- 本地表描述：主键(train_user_permission_log表的data_id)
- 主题标签：transaction_payment, finance
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`user_id`、`vip_start_time`、`vip_end_time`、`dw_vip_start_time`、`dw_vip_end_time`、`pay_type`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 主键(train_user_permission_log表的data_id) | ddl |
| `user_id` | `INT` | 用户id | ddl |
| `vip_start_time` | `BIGINT` | 会员开始时间 | ddl |
| `vip_end_time` | `BIGINT` | 会员结束时间 | ddl |
| `dw_vip_start_time` | `STRING` | 会员开始时间,标准格式,数仓计算 | ddl |
| `dw_vip_end_time` | `STRING` | 会员结束时间,标准格式,数仓计算 | ddl |
| `pay_type` | `INT` | 支付类型 1:微信,2：支付宝 3：苹果内购 4: 储值 5：易宝 6：其他(train_bill表的pay_type) | ddl |
| `pay_price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_yx_yx_hwk_teacher_train_tbl_collect_cost_share`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 pay_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
