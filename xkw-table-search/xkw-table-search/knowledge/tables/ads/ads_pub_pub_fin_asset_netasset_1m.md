# `ads_pub_pub_fin_asset_netasset_1m`

- 层级：`ads`
- 本地表描述：月份
- 主题标签：finance
- 数据粒度：按 mth,product_id,cost_type ; 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`product_id`、`cost_type`、`cost_amount_begin`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `mth` | `STRING` | 月份 | ddl |
| `product_id` | `STRING` | 产品 | ddl |
| `cost_type` | `INT` | 成本类型 | ddl |
| `cost_amount_begin` | `DECIMAL(24,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 日分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ads.ads_pub_pub_fin_asset_cost_1m`, `ads.ads_pub_pub_fin_asset_cost_change_1m`, `ads.ads_pub_pub_fin_asset_cost_amortization_1m`, `dmp_ads.ads_pub_pub_fin_asset_cost_amortization_1m`
- 过滤条件：a.asset_type=1 and a.dt='${mth}-01'；a.dt='${mth}-01'；a.dt='${mth}-01' and a.amort_mth<='${mth}'；a.dt='${mth}-01' ) a inner join (select DISTINCT concat(amort_mth,'-01') mth from dmp_ads.ads_pub_pub_fin_asset_cost_amortization_1m a where a.dt='${mth}-01' and a.amort_mth<='${mth}') b on a.mth <=substring(ADD_MONTHS(b.mth,-24),1,7) where a.rn=1 ) w
- 聚合函数：SUM(cost_amount_lj), SUM(cost_amount_real_lj), SUM(cost_amount), SUM(cost_amount_real), SUM(cost_amount_amorth_lj_begin), SUM(cost_amount_amorth), SUM(cost_amount_asset), SUM(cost_amount_real_asset)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 cost_amount_begin 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
