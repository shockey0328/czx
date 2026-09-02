# `bi_zxxk_zxxk_user_stats`

- 层级：`bi`
- 本地表描述：指标名称
- 主题标签：user, log_behavior
- 数据粒度：按 aru.time_grain, aru.period_tag ), indicators_with_history AS ( SELECT ib.metric_name, ib.time_grain, pc.start_dt AS stat_date, ib.period_tag, CAST(CASE ib.metric_name WHEN '登录活跃用户数（总）' THEN 1 WHEN '登录活跃用户数（B端）' THEN 2 WHEN '登录活跃用户数（C端）' THEN 3 WHEN '下载用户数（总）' THEN 4 WHEN '下载用户数（B端）' THEN 5 WHEN '下载用户数（C端）' THEN 6 WHEN 'C端消费用户数' THEN 7 WHEN 'C端纯免费下载用户数' THEN 8 WHEN '注册用户数（总）' THEN 9 WHEN '注册用户数（C端）' THEN 10 WHEN 'PC新增注册（C端）' THEN 11 WHEN 'APP新增注册（C端）' THEN 12 WHEN 'M站新增注册（C端）' THEN 13 WHEN '小程序新增注册（C端）' THEN 14 WHEN '注册用户数（B端）' THEN 15 ELSE 99 END AS INT) AS display_order, ib.current_period_value FROM indicators_base AS ib JOIN period_config pc ON ib.time_grain = pc.time_grain AND ib.period_tag = pc.period_tag ), indicators_pivoted AS ( SELECT metric_name, time_grain, CAST(MAX(CASE WHEN period_tag IN ('week_current', 'month_current') THEN stat_date END) AS STRING) AS stat_date, MAX(display_order) AS display_order, MAX(CASE WHEN period_tag IN ('week_current', 'month_current') THEN current_period_value ELSE 0 END) AS current_value, MAX(CASE WHEN period_tag IN ('week_last_year_same', 'month_last_year_same') THEN current_period_value ELSE 0 END) AS last_year_value, MAX(CASE WHEN period_tag IN ('week_last', 'month_last') THEN current_period_value ELSE 0 END) AS last_value, MAX(CASE WHEN period_tag IN ('week_last_year_last', 'month_last_year_last') THEN current_period_value ELSE 0 END) AS last_year_last_value, MAX(CASE WHEN period_tag IN ('week_last_last', 'month_last_last') THEN current_period_value ELSE 0 END) AS last_last_value, MAX(CASE WHEN period_tag IN ('week_last_year_last_last', 'month_last_year_last_last') THEN current_period_value ELSE 0 END) AS last_year_last_last_value, MAX(CASE WHEN period_tag IN ('week_last_last_last', 'month_last_last_last') THEN current_period_value ELSE 0 END) AS last_last_last_value, MAX(CASE WHEN period_tag IN ('week_last_year_last_last_last', 'month_last_year_last_last_last') THEN current_period_value ELSE 0 END) AS last_year_last_last_last_value FROM indicators_with_history GROUP BY metric_name, time_grain ) 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`time_grain`、`stat_date`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `metric_name` | `STRING` | 指标名称 | ddl |
| `time_grain` | `STRING` | 统计粒度（周/月） | ddl |
| `stat_date` | `STRING` | 统计周期日期（周为周一日期，月为月初日期） | ddl |
| `display_order` | `INT` | 控制展示顺序 | ddl |
| `current_value` | `DECIMAL(20,4` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`params`, `time_calc`, `period_flat`, `period_config`, `dwd.dwd_ump_uc_ssm_log_school_product_df`, `blacklist_schools`, `school_log_ranked`, `active_schools_by_period`, `dim.dim_ump_uc_school_users`, `dwd.dwd_zxxk_zxxk_trd_b_plusorder_df`, `dwd.dim_pub_pub_user`, `all_period_dts`, `all_reg_users_tagged`, `dim.dim_zxxk_zxxk_blacklist_user`, `dwd.dwd_pub_io_log_xyiolog_di`, `dwd.dwd_pub_io_log_xyiolog_app_di`, `dwd.dwd_pub_io_log_xyiolog_miniprogram_di`, `all_login_active_tagged`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `dwd.dwd_zxxk_zxxk_log_student_download_df`, `temp_czx_paid_users`, `all_consume_tagged`, `all_reg_users`, `temp_b_end_users`, `all_login_active`, `all_download_tagged`, `all_consume`, `all_free_download_tagged`, `indicators_base`, `indicators_with_history`, `indicators_pivoted`, `bi.bi_zxxk_zxxk_user_stats`, `active_wxt_schools_by_period`, `dwd.dwd_ump_uc_log_t_userlogin_di`, `b_import_users_tagged`, `user_login_success`, `b_import_stats_by_period`, `indicators_with_date`, `current_month_stats`, `historical_stats`
- 关联条件：1=1 
    LEFT；s.school_id = b.school_id；t0.school_id = u.user_school_id；TO_DATE(u.user_reg_time) >= p.start_dt AND TO_DATE(u.user_reg_time) <= p.end_dt；t.user_id = b.user_id AND b.reg_dt <= TO_DATE('${dt}')；all_login_active_raw.dt >= p.start_dt AND all_login_active_raw.dt <= p.end_dt
),
all_login_active AS (
    SELECT t.user_id, t.is_tob, t.period_tag, t.time_grain, t.start_dt AS stat_date
    FROM all_login_active_tagged t
),
all_download_tagged AS (
    SELECT /*+ MAPJOIN(p) */
        DISTINCT user_id, consume_type, down_interface_istob, p.period_tag, p.time_grain, p.start_dt, p.end_dt
    FROM (
        SELECT DISTINCT consumer_id AS user_id, dt, consume_type, down_interface_istob
        FROM ${dwd}.dwd_zxxk_zxxk_log_consume_log_di AS c；all_download_raw.dt >= p.start_dt AND all_download_raw.dt <= p.end_dt
),
all_consume_tagged AS (
    SELECT /*+ MAPJOIN(p) */
        DISTINCT user_id, p.period_tag, p.time_grain, p.start_dt, p.end_dt
    FROM (
        SELECT DISTINCT consumer_id AS user_id, dt
        FROM ${dwd}.dwd_zxxk_zxxk_log_consume_log_di AS c；t2.user_id = c.user_id
- 过滤条件：(s.product_id LIKE '%wxt%' OR s.product_id IN ('zzggk','zzzyk')) AND b.school_id IS NULL ), active_schools_by_period AS ( SELECT 'week_current' AS period_tag, '周' AS time_grain, school_id, product_id FROM school_log_ranked WHERE rn_wc=1 AND m_wc AND closed IN (0,2)；rn_wl=1 AND m_wl AND closed IN (0,2)；rn_wll=1 AND m_wll AND closed IN (0,2)；rn_wlll=1 AND m_wlll AND closed IN (0,2)；rn_wlys=1 AND m_wlys AND closed IN (0,2)；rn_wlyl=1 AND m_wlyl AND closed IN (0,2)；rn_wlyll=1 AND m_wlyll AND closed IN (0,2)；rn_wlylll=1 AND m_wlylll AND closed IN (0,2)
- 聚合函数：MIN(substring(pay_time,1,10), COUNT(DISTINCT user_id), COUNT(DISTINCT aru.user_id), COUNT(DISTINCT afd.user_id), MAX(CASE WHEN period_tag IN ('week_current', 'month_current'), MAX(display_order), MAX(CASE WHEN period_tag IN ('week_last_year_same', 'month_last_year_same'), MAX(CASE WHEN period_tag IN ('week_last', 'month_last'), MAX(CASE WHEN period_tag IN ('week_last_year_last', 'month_last_year_last'), MAX(CASE WHEN period_tag IN ('week_last_last', 'month_last_last'), MAX(CASE WHEN period_tag IN ('week_last_year_last_last', 'month_last_year_last_last'), MAX(CASE WHEN period_tag IN ('week_last_last_last', 'month_last_last_last')

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 current_value 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
