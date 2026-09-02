# `dwd_zxxk_zxxk_trd_subject_b_ordersoftdetail_df`

- 层级：`dwd`
- 本地表描述：自增主键
- 主题标签：transaction_payment, exam_question
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`detail_id`、`order_id`、`soft_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `detail_id` | `INT` | 自增主键 | ddl |
| `order_id` | `INT` | 订单id | ddl |
| `soft_id` | `INT` | 0或null-资料id，1-专辑id,2-专题id，3-资源包id，4-橙子学资源id | ddl |
| `money` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zxxk_zxxk_zxxksubject_tbl_b_ordersoftdetail`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 money 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
