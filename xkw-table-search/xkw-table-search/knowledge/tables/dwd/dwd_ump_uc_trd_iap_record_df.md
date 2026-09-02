# `dwd_ump_uc_trd_iap_record_df`

- 层级：`dwd`
- 本地表描述：主键ID
- 主题标签：transaction_payment
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`user_id`、`product_id`、`type_id`、`charge_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 主键ID | ddl |
| `user_id` | `INT` | 用户ID | ddl |
| `product_id` | `STRING` | 产品ID | ddl |
| `type_id` | `INT` | 收支类型id | ddl |
| `transaction_no` | `STRING` | 交易流水号 | ddl |
| `charge_id` | `STRING` | 支付系统订单编号 | ddl |
| `remark` | `STRING` | 备注 | ddl |
| `operator` | `STRING` | 操作人ID | ddl |
| `income` | `DECIMAL(20,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_ump_uc_iaps_tbl_iap_record`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 income 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
