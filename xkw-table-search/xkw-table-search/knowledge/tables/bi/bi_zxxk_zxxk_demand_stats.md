# `bi_zxxk_zxxk_demand_stats`

- 层级：`bi`
- 本地表描述：指标名称
- 主题标签：log_behavior
- 数据粒度：按 metric_name, time_grain ) 聚合
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
- 上游表：`params`, `time_calc`, `period_flat`, `period_config`, `dwd.dwd_ump_uc_ssm_log_school_product_df`, `blacklist_schools`, `school_log_base`, `school_log_period_filtered`, `school_log_ranked`, `dim.dim_pub_pub_organization`, `dim.dim_cmp_pub_organization_types`, `active_schools_by_period`, `school_org_info`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `all_period_dts`, `base_consume_log_total`, `consume_log_total_tagged`, `base_consume_log_school`, `consume_log_school_tagged`, `cooperating_schools`, `download_by_school`, `stats_download_total`, `stats_download_school`, `stage_consume_log`, `dim.dim_pub_pub_course`, `stage_download_tagged`, `school_stage_mapping`, `stage_download_by_school`, `stats_download`, `stats_school_count`, `stats_stage_avg`, `indicators_unpivoted`, `indicators_with_date`, `indicators_pivoted`, `bi.bi_zxxk_zxxk_demand_stats`, `temp0`, `base_consume_log`, `consume_log_tagged`, `temp1`, `temp2`, `current_month_dts`, `base_c_consume_log`, `c_consume_log_tagged`, `dim.dim_cmp_rbm_resource`, `c_consume_with_subject`, `dwd.dwd_zxxk_zxxk_log_student_download_df`, `base_student_download`, `student_download_tagged`, `student_download_with_subject`, `t1`, `t2`, `c_consume_by_subject`, `c_consume_zhongzhi`, `b_company_stats`, `c_consume_total`, `current_month_stats`, `historical_stats`
- 关联条件：s.school_id = b.school_id；s.start_date <= p.end_dt AND s.end_date >= p.start_dt
),
school_log_ranked AS (
    SELECT
        school_id, product_id, closed, period_tag, time_grain,
        ROW_NUMBER() OVER (PARTITION BY school_id, product_id, start_date, period_tag；s.type_id = d.id
),
cooperating_schools AS (
    SELECT DISTINCT
        t.time_grain,
        t.period_tag,
        t.school_id
    FROM active_schools_by_period t；t.school_id = org.school_id；c.dt >= p.start_dt AND c.dt <= p.end_dt
),
stats_download_total AS (
    SELECT
        time_grain,
        period_tag,
        COUNT(resource_id) AS total_b_download_cnt
    FROM consume_log_total_tagged；c.dt >= p.start_dt AND c.dt <= p.end_dt
),
download_by_school AS (
    SELECT
        time_grain,
        period_tag,
        school_id,
        COUNT(resource_id) AS download_cnt
    FROM consume_log_school_tagged；cs.school_id = d.school_id
        AND cs.period_tag = d.period_tag
        AND cs.time_grain = d.time_grain；t.time_grain = s.time_grain
        AND t.period_tag = s.period_tag
),
stats_school_count AS (
    SELECT
        time_grain,
        period_tag,
        COUNT(DISTINCT school_id) AS school_count
    FROM cooperating_schools
- 过滤条件：s.trial = 0 AND (s.product_id LIKE '%wxt%' OR s.product_id IN ('zzggk','zzzyk')) AND b.school_id IS NULL ), school_log_period_filtered AS ( SELECT /*+ MAPJOIN(p) */ s.school_id, s.product_id, s.closed, s.start_date, s.end_date, s.update_time, p.period_tag, p.time_grain, p.start_dt AS period_start, p.end_dt AS period_end FROM school_log_base s JOIN period_config p ON s.start_date <= p.end_dt AND s.end_date >= p.start_dt ), school_log_ranked AS ( SELECT school_id, product_id, closed, period_tag, time_grain, ROW_NUMBER() OVER (PARTITION BY school_id, product_id, start_date, period_tag；rn = 1 AND closed IN (0,2) ), school_org_info AS ( SELECT s.id AS school_id, CASE WHEN d.name IN ('学校','高职院校','中职学校','师范院校') THEN '学校' ELSE '其他' END AS org_type FROM ${dim}.dim_pub_pub_organization AS s LEFT JOIN ${dim}.dim_cmp_pub_organization_types AS d ON s.type_id = d.id ), cooperating_schools AS ( SELECT DISTINCT t.time_grain, t.period_tag, t.school_id FROM active_schools_by_period t JOIN school_org_info org ON t.school_id = org.school_id WHERE org.org_type = '学校' ), base_consume_log_total AS ( SELECT c.dt, c.consumer_id, c.resource_id FROM ${dwd}.dwd_zxxk_zxxk_log_consume_log_di c WHERE c.dt IN (SELECT dt_str FROM all_period_dts) AND c.resource_type NOT IN (3,5) AND c.product <> 9 AND ((c.down_interface_istob = 1 AND (c.consume_type IN (4,50,502,55,56,57) OR c.consume_type IS NULL)) OR c.consume_type IN (8,9,12)) ), consume_log_total_tagged AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag, p.time_grain, c.resource_id FROM base_consume_log_total c JOIN period_config p ON c.dt >= p.start_dt AND c.dt <= p.end_dt ), stats_download_total AS ( SELECT time_grain, period_tag, COUNT(resource_id) AS total_b_download_cnt FROM consume_log_total_tagged；c.dt IN (SELECT dt_str FROM all_period_dts) AND c.resource_type NOT IN (3,5) AND c.product <> 9 AND ((c.down_interface_istob = 1 AND (c.consume_type IN (4,50,502,55,56,57) OR c.consume_type IS NULL)) OR c.consume_type IN (8,9,12)) ), consume_log_school_tagged AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag, p.time_grain, c.school_id, c.resource_id FROM base_consume_log_school c JOIN period_config p ON c.dt >= p.start_dt AND c.dt <= p.end_dt ), download_by_school AS ( SELECT time_grain, period_tag, school_id, COUNT(resource_id) AS download_cnt FROM consume_log_school_tagged；c.dt IN (SELECT dt_str FROM all_period_dts) AND c.resource_type <> 3 AND c.consumer_identity BETWEEN 12 AND 25 AND c.consume_type IN (4,50,502) ), stage_download_tagged AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag, p.time_grain, s.school_id, CASE WHEN cd.subject_id = 25 THEN '中职专业课' WHEN s.stage_id = 6 AND (cd.subject_id IS NULL OR cd.subject_id <> 25) THEN '中职公共课' ELSE s.stage_name END AS stage_type FROM stage_consume_log s JOIN period_config p ON s.dt >= p.start_dt AND s.dt <= p.end_dt LEFT JOIN ${dim}.dim_pub_pub_course cd ON s.course_id = cd.course_id ), school_stage_mapping AS ( SELECT DISTINCT t.period_tag, t.time_grain, t.school_id, CASE WHEN t.product_id LIKE 'xx%' THEN '小学' WHEN t.product_id LIKE 'cz%' THEN '初中' WHEN t.product_id LIKE 'gz%' THEN '高中' WHEN t.product_id LIKE 'zzwxt%' OR t.product_id = 'zzggk' THEN '中职公共课' WHEN t.product_id = 'zzzyk' THEN '中职专业课' END AS stage_type FROM active_schools_by_period t JOIN school_org_info org ON t.school_id = org.school_id WHERE org.org_type = '学校' ), stage_download_by_school AS ( SELECT d.period_tag, d.time_grain, d.school_id, d.stage_type, COUNT(*) AS school_download_cnt FROM stage_download_tagged d；m.stage_type IS NOT NULL；stat_date IS NOT NULL；hist.dt < '${dt}' AND NOT EXISTS ( SELECT 1 FROM indicators_pivoted curr WHERE curr.time_grain = hist.time_grain AND curr.stat_date = hist.stat_date AND curr.metric_name = hist.metric_name );；s.trial = 0 AND ( s.product_id LIKE '%wxt%' OR s.product_id IN ('zzggk','zzzyk') ) AND b.school_id IS NULL ) ,school_log_period_filtered AS ( SELECT /*+ MAPJOIN(p) */ s.school_id ,s.product_id ,s.closed ,s.start_date ,s.end_date ,s.update_time ,p.period_tag ,p.time_grain ,p.start_dt AS period_start ,p.end_dt AS period_end FROM school_log_base s JOIN period_config p ON s.start_date <= p.end_dt AND s.end_date >= p.start_dt ) ,school_log_ranked AS ( SELECT school_id ,product_id ,closed ,period_tag ,time_grain ,start_date ,ROW_NUMBER() OVER (PARTITION BY school_id,product_id,start_date,period_tag
- 聚合函数：COUNT(resource_id), SUM(COALESCE(d.download_cnt, 0), COUNT(DISTINCT CASE WHEN d.school_id IS NOT NULL THEN cs.school_id END), COUNT(DISTINCT school_id), COUNT(*), SUM(COALESCE(d.school_download_cnt, 0), COUNT(DISTINCT d.school_id), MAX(CASE WHEN period_tag IN ('week_current', 'month_current'), MAX(display_order), MAX(CASE WHEN period_tag IN ('week_last_year_same', 'month_last_year_same'), MAX(CASE WHEN period_tag IN ('week_last', 'month_last'), MAX(CASE WHEN period_tag IN ('week_last_year_last', 'month_last_year_last')

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 current_value 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
