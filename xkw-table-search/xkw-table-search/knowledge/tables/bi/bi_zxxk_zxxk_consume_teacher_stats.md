# `bi_zxxk_zxxk_consume_teacher_stats`

- 层级：`bi`
- 本地表描述：指标名称
- 主题标签：log_behavior
- 数据粒度：按 c.metric_name ,c.time_grain ,c.stat_date ,c.display_order ,c.current_value ) 聚合
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
- 上游表：`params`, `time_calc`, `period_flat`, `period_config`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `all_period_dts`, `base_consume_log`, `consume_log_tagged`, `consume_by_period_app`, `app_order_config`, `indicators_unpivoted`, `indicators_with_date`, `bi.bi_zxxk_zxxk_consume_teacher_stats`, `current_month_stats`, `historical_stats`, `indicators_pivoted`
- 关联条件：c.dt >= p.start_dt
    AND     c.dt <= p.end_dt
)
,consume_by_period_app AS
(
    SELECT  period_tag
            ,time_grain
            ,app_name
            ,CAST(SUM(consume_money) AS DECIMAL(20,0)) AS total_consume
    FROM    consume_log_tagged；c.app_name = a.app_name
)
,indicators_with_date AS
(
    SELECT  /*+ MAPJOIN(p) */
            i.metric_name
            ,i.time_grain
            ,i.period_tag
            ,i.display_order
            ,i.value
            ,p.start_dt
    FROM    indicators_unpivoted i；i.period_tag = p.period_tag
)
,current_month_stats AS
(
    SELECT  metric_name
            ,time_grain
            ,CAST(MAX(start_dt) AS STRING) AS stat_date
            ,MAX(display_order) AS display_order
            ,MAX(value) AS current_value
    FROM    indicators_with_date；c.metric_name = h.metric_name
    AND     c.time_grain = h.time_grain；hist.metric_name = indicators_pivoted.metric_name
AND     hist.time_grain = indicators_pivoted.time_grain
AND     hist.stat_date = indicators_pivoted.stat_date；i.period_tag = p.period_tag
)
,indicators_pivoted AS
(
    SELECT  metric_name
            ,time_grain
            ,CAST(MAX(CASE    WHEN period_tag = 'week_current' THEN start_dt END) AS STRING) AS stat_date
            ,MAX(display_order) AS display_order
            ,MAX(CASE    WHEN period_tag = 'week_current' THEN value ELSE 0 END) AS current_value
            ,MAX(CASE    WHEN period_tag = 'week_last_year_same' THEN value ELSE 0 END) AS last_year_value
            ,MAX(CASE    WHEN period_tag = 'week_last' THEN value ELSE 0 END) AS last_value
            ,MAX(CASE    WHEN period_tag = 'week_last_year_last' THEN value ELSE 0 END) AS last_year_last_value
            ,MAX(CASE    WHEN period_tag = 'week_last_last' THEN value ELSE 0 END) AS last_last_value
            ,MAX(CASE    WHEN period_tag = 'week_last_year_last_last' THEN value ELSE 0 END) AS last_year_last_last_value
            ,MAX(CASE    WHEN period_tag = 'week_last_last_last' THEN value ELSE 0 END) AS last_last_last_value
            ,MAX(CASE    WHEN period_tag = 'week_last_year_last_last_last' THEN value ELSE 0 END) AS last_year_last_last_last_value
    FROM    indicators_with_date
- 过滤条件：c.dt IN ( SELECT dt_str FROM all_period_dts ) AND c.resource_type <> 3 AND c.product <> 9 AND c.consume_type IN (1,2,3,5,6,520,521,541) ) ,consume_log_tagged AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag ,p.time_grain ,CASE WHEN c.app_type = 1 THEN 'PC端' WHEN c.app_type = 2 AND c.os_type = 2 THEN '安卓APP' WHEN c.app_type = 2 AND c.os_type = 3 THEN 'IOSAPP' WHEN c.app_type = 3 THEN 'M站' WHEN c.app_type = 4 THEN '小程序' WHEN c.app_type = 2 AND c.os_type = 6 THEN '鸿蒙' ELSE 'other' END AS app_name ,CASE WHEN c.consume_type IN (1,2,5,6) THEN c.consume_price WHEN c.consume_type = 520 THEN 1 WHEN c.consume_type = 3 THEN c.consume_price * 0.4 WHEN c.consume_type = 541 THEN 1.5 WHEN c.consume_type = 521 AND c.consumer_identity = 50 THEN c.resource_price WHEN c.consume_type = 521 AND c.consumer_identity <> 50 AND c.resource_price > 0.5 THEN c.resource_price * 2 WHEN c.consume_type = 521 AND c.consumer_identity <> 50 AND c.resource_price <= 0.5 THEN 1.5 ELSE 0 END AS consume_money FROM base_consume_log c JOIN period_config p ON c.dt >= p.start_dt AND c.dt <= p.end_dt ) ,consume_by_period_app AS ( SELECT period_tag ,time_grain ,app_name ,CAST(SUM(consume_money) AS DECIMAL(20,0)) AS total_consume FROM consume_log_tagged；time_grain = '月' AND SUBSTRING(stat_date,1,7) IN ( SELECT SUBSTRING(CAST(ADD_MONTHS(TO_DATE('${dt}'),-1) AS STRING),1,7)；stat_date IS NOT NULL；indicators_pivoted.metric_name IS NULL ;
- 聚合函数：SUM(consume_money), MAX(start_dt), MAX(display_order), MAX(value), MAX(CASE    WHEN h.stat_date = DATE(SUBSTRING(CAST(ADD_MONTHS(TO_DATE('${dt}'), MAX(CASE    WHEN period_tag = 'week_current' THEN start_dt END), MAX(CASE    WHEN period_tag = 'week_current' THEN value ELSE 0 END), MAX(CASE    WHEN period_tag = 'week_last_year_same' THEN value ELSE 0 END), MAX(CASE    WHEN period_tag = 'week_last' THEN value ELSE 0 END), MAX(CASE    WHEN period_tag = 'week_last_year_last' THEN value ELSE 0 END), MAX(CASE    WHEN period_tag = 'week_last_last' THEN value ELSE 0 END), MAX(CASE    WHEN period_tag = 'week_last_year_last_last' THEN value ELSE 0 END)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 current_value 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
