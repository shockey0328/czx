# `ads_zxxk_zxxk_trd_mbr_save_amount_td`

- 层级：`ads`
- 本地表描述：用户id
- 主题标签：user, transaction_payment
- 数据粒度：按 user_id,consume_type; 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`user_id`、`member_type`、`save_amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `user_id` | `INT` | 用户id | ddl |
| `member_type` | `INT` | 会员类型 | ddl |
| `member_name` | `STRING` | 会员类型名称 | ddl |
| `save_amount` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_zxxk_zxxk_log_consume_log_di`, `ads.ads_zxxk_zxxk_trd_mbr_save_amount_td`, `consume_log`, `member_save_statistics`
- 过滤条件：dt = '${dt}' and consume_type in (1,6) ), member_save_statistics as ( select * from ${ads}.ads_zxxk_zxxk_trd_mbr_save_amount_td )
- 聚合函数：SUM(save_amount), SUM(scan_price - 0.8), SUM(scan_price - consume_price)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 save_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
