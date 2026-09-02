# `dwd_zxxk_zxxk_mbr_member_benefit_detail_df`

- 层级：`dwd`
- 本地表描述：会员权益明细id
- 主题标签：user
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`benefit_id`、`package_benefit_id`、`consume_qty`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 会员权益明细id | ddl |
| `benefit_id` | `INT` | 会员权益id | ddl |
| `package_benefit_id` | `INT` | 套餐权益id | ddl |
| `model` | `INT` | 权益模式(1-免费, 2-付费, 3-付费或免费) | ddl |
| `consume_qty` | `decimal(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_zxxk_zxxk_user_asset_tbl_member_benefit_detail`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 consume_qty 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
