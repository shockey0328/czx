# `ads_zj_zj_log_school_user_stats_df`

- 层级：`ads`
- 本地表描述：学校id
- 主题标签：user, log_behavior, device_school
- 数据粒度：按 ssm_school_id), ads_pub_user_action_1d as ( select 1 flag , sum(login_cnt) total_login_cnt_12m , count(distinct (ssm_school_id)) total_school_count_12m , sum(session_times_sum) / 3600000 total_use_time_12m , sum(case when dt >= ADD_MONTHS('${dt}', -6) and dt <= '${dt}' then login_cnt else 0 end) total_login_cnt_6m , count(distinct (case when dt >= ADD_MONTHS('${dt}', -6) and dt <= '${dt}' then ssm_school_id end)) total_school_count_6m , sum(case when dt >= ADD_MONTHS('${dt}', -6) and dt <= '${dt}' then session_times_sum else 0 end) /3600000 total_use_time_6m , sum(case when dt >= ADD_MONTHS('${dt}', -1) and dt <= '${dt}' then login_cnt else 0 end) total_login_cnt_1m , count(distinct (case when dt >= ADD_MONTHS('${dt}', -1) and dt <= '${dt}' then ssm_school_id end)) total_school_count_1m , sum(case when dt >= ADD_MONTHS('${dt}', -1) and dt <= '${dt}' then session_times_sum else 0 end) /3600000 total_use_time_1m from dmp_ads.ads_pub_pub_user_action_1d where product_id = 'ejuantong' and dt >= ADD_MONTHS('${dt}', -12) and dt <= '${dt}' ) 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`ssm_school_id`、`login_cnt_12m`、`use_time_12m`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `ssm_school_id` | `INT` | 学校id | ddl |
| `login_cnt_12m` | `INT` | 登录次数-近一年 | ddl |
| `use_time_12m` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dmp_ads.ads_pub_pub_user_action_1d`, `ads_pub_user_action_1d_school_id`, `ads_pub_user_action_1d`
- 关联条件：t1.flag = t2.flag
- 过滤条件：product_id = 'ejuantong' and dt >= ADD_MONTHS('${dt}', -12) and dt <= '${dt}'；product_id = 'ejuantong' and dt >= ADD_MONTHS('${dt}', -12) and dt <= '${dt}' )
- 聚合函数：SUM(login_cnt), SUM(session_times_sum), SUM(case when dt >= ADD_MONTHS('${dt}', -6), SUM(case when dt >= ADD_MONTHS('${dt}', -1), COUNT(distinct (ssm_school_id), COUNT(distinct (case when dt >= ADD_MONTHS('${dt}', -6), COUNT(distinct (case when dt >= ADD_MONTHS('${dt}', -1)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 use_time_12m 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
