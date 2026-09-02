# `dwd_yx_yx_trd_train_bill_df`

- 层级：`dwd`
- 本地表描述：主键
- 主题标签：transaction_payment
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`user_id`、`pay_time`、`pay_status`、`pay_type`、`supplement_status`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 主键 | ddl |
| `user_id` | `BIGINT` | 用户Id | ddl |
| `commodity_name` | `STRING` | 商品名称 | ddl |
| `pay_time` | `STRING` | 支付时间 | ddl |
| `pay_status` | `INT` | 支付状态  1：未支付 2：已支付 3：已退款（补单失败） | ddl |
| `pay_type` | `INT` | 支付类型 1:微信  2：支付宝 3：苹果内购 4: 储值 5：易宝 6：其他 | ddl |
| `supplement_status` | `INT` | 1. 无补单 2. 提交补单  3: 验证成功 4：验证失败 | ddl |
| `supplement_check_no` | `STRING` | 补单提交的第三方补单码 | ddl |
| `pay_price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_yx_yx_hwk_teacher_train_tbl_train_bill`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 pay_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
