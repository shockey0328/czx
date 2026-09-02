# `bi_pub_pub_fin_instant_consumption_revenue_1d`

- 层级：`bi`
- 本地表描述：产品事业部
- 主题标签：transaction_payment, finance
- 数据粒度：按 case when product_id in('xuekewang', 'ebeike','xuekewangdayin','aixiaoboshi') then '资源库' when product_id = 'zujuanwang' then '题库' when product_id = 'aiyanxiu' then 'AI研修' else '其他' end, payer_id, dt 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`product_dept_name`、`paid_type`、`paid_amount`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `product_dept_name` | `STRING` | 产品事业部 | ddl |
| `paid_type` | `STRING` | 支付类型 | ddl |
| `paid_amount` | `DECIMAL(20,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 天分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_pub_pub_fin_instant_consumption_di`
- 过滤条件：dt = '${dt}' and fin_io_direction = 'o'
- 聚合函数：SUM(fin_io_actual)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 paid_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
