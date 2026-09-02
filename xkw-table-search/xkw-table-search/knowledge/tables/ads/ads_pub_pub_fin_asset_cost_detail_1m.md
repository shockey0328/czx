# `ads_pub_pub_fin_asset_cost_detail_1m`

- 层级：`ads`
- 本地表描述：rbm的资料id
- 主题标签：finance
- 数据粒度：按 res_id ) w group by res_id ) c on a.res_id=c.res_id where case when a.mth>=substring(cast(add_months(c.first_time,7) as string),1,7) then 2 when a.mth>=substring(cast(add_months(aaa.publish_time,1) as string),1,7) then 1 else 0 end = 0 ; 聚合
- 分区字段：mth
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`res_id`、`paper_id`、`question_id`、`cost_type`、`cost_amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `res_id` | `BIGINT` | rbm的资料id | ddl |
| `paper_id` | `BIGINT` | qbm的试卷id | ddl |
| `question_id` | `BIGINT` | qbm的试题id | ddl |
| `res_title` | `STRING` | rbm的资料标题 | ddl |
| `cost_type` | `INT` | 成本类型  关联dim2.dim_fin_asset_dimesion | ddl |
| `cost_amount` | `DECIMAL(20,2` | 未提供字段注释 | ddl |
| `mth` | `STRING` | 月分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ads.ads_pub_pub_fin_rbm_asset_cost_1m`, `dim.dim_cmp_qbm_paper`, `ads.ads_pub_pub_fin_qbm_asset_cost_1m`, `ads.ads_pub_pub_fin_qbm_asset_cost_share_1m`, `t1`, `ads.ads_pub_pub_fin_asset_cost_detail_1m`
- 关联条件：cast(a.res_id as string)=aaa.paper_source_id
        and aaa.source_application_id='zxxk'；cast(a.res_id as string)=aaa.paper_source_id
    and aaa.source_application_id='zxxk'
         left
- 过滤条件：mth = '${mth}'；mth = '${mth}' )；case when a.mth>=substring(cast(add_months(c.first_time,7) as string),1,7) then 2 when a.mth>=substring(cast(add_months(aaa.publish_time,1) as string),1,7) then 1 else 0 end = 0 ;
- 聚合函数：MIN(create_time)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 cost_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
