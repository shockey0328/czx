# `ads_zxxk_zxxk_trd_feeback_1d_di`

- 层级：`ads`
- 本地表描述：自增id
- 主题标签：transaction_payment
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`resource_id`、`user_id`、`user_name`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 自增id | ddl |
| `resource_id` | `INT` | 资料id | ddl |
| `user_id` | `INT` | 上传人id | ddl |
| `user_name` | `STRING` | 上传人名字 | ddl |
| `fee_back_money` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 按日分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_zxxk_zxxk_trd_feeback_1d_di`
- 过滤条件：a.mth=substring('${dt}',1,7) and substring(a.add_time,1,10)='${dt}' ;

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 fee_back_money 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
