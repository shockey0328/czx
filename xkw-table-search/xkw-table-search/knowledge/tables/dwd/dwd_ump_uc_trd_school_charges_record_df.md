# `dwd_ump_uc_trd_school_charges_record_df`

- 层级：`dwd`
- 本地表描述：自增主键
- 主题标签：transaction_payment, device_school
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`school_id`、`school_charge_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 自增主键 | ddl |
| `school_id` | `INT` | 学校Id | ddl |
| `school_charge_id` | `INT` | school_charge表主键 | ddl |
| `change_flag` | `INT` | 变更方向：1支出0收入 | ddl |
| `transaction_no` | `STRING` | 流水号 | ddl |
| `source` | `STRING` | 来源应用 | ddl |
| `balance_before` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_ump_uc_ssm_tbl_school_charges_record`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 balance_before 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
