# `bi_zj_zj_trd_rev_stats`

- 层级：`bi`
- 本地表描述：日：统计日；周/月起始日
- 主题标签：transaction_payment, log_behavior
- 数据粒度：按 dt ,application_name ,revenue_type ) ,week_sum AS ( SELECT DATE_SUB(TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8)),6) AS stat_date ,application_name AS application_name ,revenue_type AS revenue_type ,SUM(order_amount) / 100 AS order_amount_sum ,'周' AS time_grain FROM a WHERE product_name = '组卷网' AND dt >= DATE_SUB(TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8)),6) AND dt <= TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8)) GROUP BY application_name ,revenue_type ) ,month_sum AS ( SELECT DATE(SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) || '-01') AS stat_date ,application_name AS application_name ,revenue_type AS revenue_type ,SUM(order_amount) / 100 AS order_amount_sum ,'月' AS time_grain FROM a WHERE product_name = '组卷网' AND SUBSTRING(dt,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) GROUP BY application_name ,revenue_type ) ,total AS ( SELECT * FROM day_sum 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`stat_date`、`revenue_type`、`order_amount_sum`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `stat_date` | `STRING` | 日：统计日；周/月起始日 | ddl |
| `application_name` | `STRING` | 终端名称 | ddl |
| `revenue_type` | `STRING` | 收入类型 | ddl |
| `order_amount_sum` | `DECIMAL(28,4` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dws.dws_pub_pub_trd_rev_ord_1d_di`, `trd_rev_ord`, `dim.dim_pub_pub_product`, `dim.dim_pub_pub_application`, `a`, `day_sum`, `week_sum`, `month_sum`, `total`, `bi.bi_zj_zj_trd_rev_stats`
- 关联条件：dim_product.product_id = trd_rev_ord.product_id；dim_application.application_id = trd_rev_ord.application_id；a.stat_date = b.stat_date
AND     a.time_grain = b.time_grain
- 过滤条件：dt >= DATETRUNC(CAST(ADD_MONTHS(DATE_ADD('${dt}',1),-2) AS DATE),'MONTH') AND dt <= '${dt}' ) ,a AS ( SELECT date(trd_rev_ord.dt) AS dt ,dim_product.product_name AS product_name ,dim_application.application_name AS application_name ,trd_rev_ord.revenue_type AS revenue_type ,COALESCE(trd_rev_ord.order_amount,0) AS order_amount ,COALESCE(trd_rev_ord.order_quantities,0) AS order_quantities ,COALESCE(trd_rev_ord.order_users,0) AS order_users FROM trd_rev_ord JOIN ${dim}.dim_pub_pub_product dim_product ON dim_product.product_id = trd_rev_ord.product_id JOIN ${dim}.dim_pub_pub_application dim_application ON dim_application.application_id = trd_rev_ord.application_id WHERE dim_product.product_name IS NOT NULL AND dim_application.application_name IS NOT NULL AND trd_rev_ord.revenue_type IS NOT NULL ) ,day_sum AS ( SELECT dt AS stat_date ,application_name AS application_name ,revenue_type AS revenue_type ,SUM(order_amount) / 100 AS order_amount_sum ,'日' AS time_grain FROM a WHERE product_name = '组卷网' AND dt = '${dt}'；product_name = '组卷网' AND dt >= DATE_SUB(TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8)),6) AND dt <= TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8))；product_name = '组卷网' AND SUBSTRING(dt,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7)；b.stat_date IS NULL;
- 聚合函数：SUM(order_amount)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 order_amount_sum 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
