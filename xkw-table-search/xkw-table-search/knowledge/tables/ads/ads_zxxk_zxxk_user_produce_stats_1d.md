# `ads_zxxk_zxxk_user_produce_stats_1d`

- 层级：`ads`
- 本地表描述：创作者id
- 主题标签：user, log_behavior
- 数据粒度：按 dt,provider_id ; 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`provider_id`、`resource_upload_cnt`、`resource_publish_cnt`、`resource_view_cnt`、`resource_dl_cnt`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `provider_id` | `INT` | 创作者id | ddl |
| `resource_upload_cnt` | `INT` | 上传资料数量 | ddl |
| `resource_publish_cnt` | `INT` | 发布资料数量 | ddl |
| `resource_view_cnt` | `INT` | 资料浏览量 | ddl |
| `resource_dl_cnt` | `INT` | 资料下载量 | ddl |
| `income` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 日分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dim.dim_cmp_rbm_resource`, `dwd.dwd_ump_uc_trd_incomerecord_di`, `rbm_resource`, `ads.ads_zxxk_zxxk_log_res_stats_1d`, `income_record`, `ads.ads_zxxk_zxxk_log_album_stats_1d`, `upload_cnt`, `res_stas`, `income_stats`, `album_stats`
- 关联条件：t1.provider_id = t2.user_id
- 过滤条件：mth = substring('${dt}',1,7) and substring(add_time,1,10) = '${dt}' AND type_id IN (7,10,11,15,32,34,36,41)；dt = '${dt}' or publish_time = '${dt}'；dt = '${dt}'
- 聚合函数：SUM(income), COUNT(DISTINCT if(dt = '${dt}',res_id,NULL), COUNT(DISTINCT if(publish_time = '${dt}' and status IN ('P4_2','P4_1_0'), SUM(view_cnt), SUM(dl_cnt), SUM(t2.income), SUM(page_view_cnt), SUM(resource_view_cnt), SUM(resource_dl_cnt), SUM(resource_upload_cnt), SUM(resource_publish_cnt), SUM(album_page_view_cnt)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 income 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
