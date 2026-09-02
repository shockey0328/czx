# `ads_zxxk_zxxk_log_res_stats_1d`

- 层级：`ads`
- 本地表描述：创作者id
- 主题标签：content_resource, log_behavior
- 数据粒度：按 provider_id,dt,res_id,create_time ; 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`provider_id`、`res_id`、`create_time`、`view_cnt`、`dl_cnt`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `provider_id` | `BIGINT` | 创作者id | ddl |
| `res_id` | `BIGINT` | 资料id | ddl |
| `create_time` | `STRING` | 资料创建时间 | ddl |
| `view_cnt` | `INT` | 浏览量 | ddl |
| `dl_cnt` | `INT` | 下载量 | ddl |
| `income` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 日分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dim.dim_cmp_rbm_resource`, `dwd.dwd_zxxk_zxxk_log_document_day_hit_di`, `dwd.dwd_cmp_rbm_cont_provider_reward_record_df`, `dwd.dwd_zxxk_zxxk_trd_feeback_1d_di`, `dim_rbm_resource`, `document_day_hits`, `rbm_provider_reward_record`, `tmp_res`
- 关联条件：t1.res_id = t2.document_id；t1.res_id=t3.resource_id and t1.provider_id = t3.provider_id
- 过滤条件：dt = '${dt}'；substring(create_time,1,10) = '${dt}'；mth = substring('${dt}',1,7) and substring(add_time,1,10) = '${dt}' and status = 0
- 聚合函数：SUM(pv), SUM(downloads), SUM(amount), SUM(fee_back_money), SUM(t2.pv), SUM(t2.downloads), SUM(t3.amount), SUM(view_cnt), SUM(dl_cnt), SUM(reward_amount)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 income 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
