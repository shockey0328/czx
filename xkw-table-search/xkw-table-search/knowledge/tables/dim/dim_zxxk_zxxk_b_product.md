# `dim_zxxk_zxxk_b_product`

- 层级：`dim`
- 本地表描述：产品id
- 主题标签：other
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`product_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `product_id` | `INT` | 产品id | ddl |
| `rmb` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zxxk_zxxk_zxxkpay_tbl_b_product`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 rmb 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
