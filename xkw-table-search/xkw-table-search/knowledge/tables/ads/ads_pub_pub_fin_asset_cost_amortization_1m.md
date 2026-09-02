# `ads_pub_pub_fin_asset_cost_amortization_1m`

- 层级：`ads`
- 本地表描述：月份
- 主题标签：finance
- 数据粒度：按 product_id,cost_type,mth) a inner join t1 b on a.id=b.id ) ,t3 as (select a.mth,a.share_mth,a.product_id ,a.cost_type ,case when a.rk<=23 then a.cost_amount_share else b.cost_amount_share end cost_amount_share from t2 a left join (select mth,product_id,cost_type,max(cost_amount_real)-sum(cost_amount_share) cost_amount_share from t2 group by mth,product_id,cost_type ) b on a.mth=b.mth and a.product_id=b.product_id and a.cost_type=b.cost_type ) 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`product_id`、`cost_type`、`cost_amount_amort`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `mth` | `STRING` | 月份 | ddl |
| `amort_mth` | `STRING` | 摊销月份 | ddl |
| `product_id` | `STRING` | 产品 | ddl |
| `cost_type` | `INT` | 成本类型 | ddl |
| `cost_amount_amort` | `DECIMAL(24,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 日分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dim.dim_pub_pub_area`, `ads.ads_pub_pub_fin_asset_cost_1m`, `ads.ads_pub_pub_fin_asset_cost_change_1m`, `t1`, `t2`, `t3`
- 关联条件：a.id=b.id
    )
    ,t3 as
    (select a.mth,a.share_mth,a.product_id
        ,a.cost_type
        ,case when a.rk<=23   then a.cost_amount_share
    else b.cost_amount_share   end cost_amount_share
from t2 a
    left
- 过滤条件：a.asset_type=1 and a.dt='${mth}-01'；1=1 and a.dt='${mth}-01' ) w
- 聚合函数：SUM(cost_amount_real), MAX(cost_amount_real), SUM(cost_amount_share), SUM(cast(cost_amount_share as decimal(24,2)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 cost_amount_amort 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
