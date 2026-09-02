# `ads_pub_pub_fin_asset_cost_1m`

- 层级：`ads`
- 本地表描述：月份
- 主题标签：finance
- 数据粒度：按 mth,res_id,paper_id,cost_type,product_id ,case when substring(qbm_publish_time,1,7)=mth then 1 when mth=substring(cast(add_months(substring(a.first_asset_time,1,10),6) as string),1,7) then 2 else 0 end ) ,t2 as ( select product_id,cost_type,mth,case when is_asset=1 then 1 else 0 end asset_type ,sum(cost_amount) cost_amount from t1 group by product_id,cost_type,mth,case when is_asset=1 then 1 else 0 end ) ,t3 as ( select product_id,cost_type,mth, asset_type ,cost_amount cost_amount ,CASE WHEN mth<'2025-10' THEN (cost_amount*(1-0.07)*1.063)/1.06 *0.06 ELSE 0 END tax_amount ,CASE WHEN mth<'2025-10' THEN cost_amount-(cost_amount*(1-0.07)*1.063)/1.06 *0.06 ELSE cost_amount-0 END cost_amount_real from t2 ) 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`product_id`、`cost_type`、`asset_type`、`cost_amount`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `mth` | `STRING` | 月份 | ddl |
| `product_id` | `STRING` | 产品 | ddl |
| `cost_type` | `INT` | 成本类型 | ddl |
| `asset_type` | `INT` | 资产类型 1 无形资产 0 开发支出 | ddl |
| `cost_amount` | `DECIMAL(24,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 日分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ads.ads_pub_pub_fin_asset_cost_detail_1m`, `t1`, `t2`, `t3`
- 过滤条件：1=1 and a.mth>='2024-01'
- 聚合函数：SUM(cost_amount), SUM(cast(cost_amount as decimal(24,2), SUM(cast(cost_amount_real as decimal(24,2)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 cost_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
