# `bi_zxxk_zxxk_paid_teacher_stats`

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
- 上游表：`params`, `time_calc`, `period_flat`, `period_config`, `dwd.dwd_zxxk_zxxk_trd_cl_payment_df`, `all_period_dts`, `payment_cl`, `dwd.dwd_zxxk_zxxk_trd_b_plusorder_df`, `payment_plus`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `payment_consume`, `payment_cl_tagged`, `payment_plus_tagged`, `payment_consume_tagged`, `payment_all`, `paid_by_period_channel`, `channel_order_config`, `indicators_unpivoted`, `indicators_with_date`, `bi.bi_zxxk_zxxk_paid_teacher_stats`, `current_month_stats`, `historical_stats`, `indicators_pivoted`
- 关联条件：TO_DATE(c.pay_time) >= p.start_dt
    AND     TO_DATE(c.pay_time) <= p.end_dt
) -- 来源2：dwd_zxxk_zxxk_trd_b_plusorder_df
,payment_plus AS
(
    SELECT  c.pay_time
            ,c.true_price AS revenue
            ,CASE   WHEN c.product = 1 THEN 'PC端'
                    WHEN c.product = 5 THEN 'M站'
                    WHEN c.product = 8 THEN '小程序'
                    WHEN c.product = 9 THEN '安卓APP'
                    WHEN c.product = 10 THEN 'IOSAPP'
                    WHEN c.product = 11 THEN '鸿蒙'
                    ELSE 'other'
            END AS channel_type
    FROM    ${dwd}.dwd_zxxk_zxxk_trd_b_plusorder_df c；TO_DATE(c.pay_time) >= p.start_dt
    AND     TO_DATE(c.pay_time) <= p.end_dt
) -- 来源3：dwd_zxxk_zxxk_log_consume_log_di
,payment_consume AS
(
    SELECT  c.dt
            ,c.consume_price AS revenue
            ,CASE   WHEN c.app_type = 1 THEN 'PC端'
                    WHEN c.app_type = 2 AND c.os_type = 2 THEN '安卓APP'
                    WHEN c.app_type = 2 AND c.os_type = 3 THEN 'IOSAPP'
                    WHEN c.app_type = 3 THEN 'M站'
                    WHEN c.app_type = 4 THEN '小程序'
                    WHEN c.app_type = 2 AND c.os_type = 6 THEN '鸿蒙'
                    ELSE 'other'
            END AS channel_type
    FROM    ${dwd}.dwd_zxxk_zxxk_log_consume_log_di c；c.dt >= p.start_dt
    AND     c.dt <= p.end_dt
) -- 合并所有来源的营收数据
,payment_all AS
(
    SELECT  period_tag
            ,time_grain
            ,channel_type
            ,revenue
    FROM    payment_cl_tagged；c.channel_type = ch.channel_type
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
- 过滤条件：TO_DATE(c.pay_time) IN ( SELECT dt_str FROM all_period_dts ) AND c.product IN (1,5,8,9,10,11) AND c.status = 1 ) ,payment_cl_tagged AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag ,p.time_grain ,c.channel_type ,c.revenue FROM payment_cl c JOIN period_config p ON TO_DATE(c.pay_time) >= p.start_dt AND TO_DATE(c.pay_time) <= p.end_dt ) -- 来源2：dwd_zxxk_zxxk_trd_b_plusorder_df ,payment_plus AS ( SELECT c.pay_time ,c.true_price AS revenue ,CASE WHEN c.product = 1 THEN 'PC端' WHEN c.product = 5 THEN 'M站' WHEN c.product = 8 THEN '小程序' WHEN c.product = 9 THEN '安卓APP' WHEN c.product = 10 THEN 'IOSAPP' WHEN c.product = 11 THEN '鸿蒙' ELSE 'other' END AS channel_type FROM ${dwd}.dwd_zxxk_zxxk_trd_b_plusorder_df c WHERE TO_DATE(c.pay_time) IN ( SELECT dt_str FROM all_period_dts ) AND c.product IN (1,5,8,9,10,11) AND c.pay_status = 1 AND c.product_type = 4 ) ,payment_plus_tagged AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag ,p.time_grain ,c.channel_type ,c.revenue FROM payment_plus c JOIN period_config p ON TO_DATE(c.pay_time) >= p.start_dt AND TO_DATE(c.pay_time) <= p.end_dt ) -- 来源3：dwd_zxxk_zxxk_log_consume_log_di ,payment_consume AS ( SELECT c.dt ,c.consume_price AS revenue ,CASE WHEN c.app_type = 1 THEN 'PC端' WHEN c.app_type = 2 AND c.os_type = 2 THEN '安卓APP' WHEN c.app_type = 2 AND c.os_type = 3 THEN 'IOSAPP' WHEN c.app_type = 3 THEN 'M站' WHEN c.app_type = 4 THEN '小程序' WHEN c.app_type = 2 AND c.os_type = 6 THEN '鸿蒙' ELSE 'other' END AS channel_type FROM ${dwd}.dwd_zxxk_zxxk_log_consume_log_di c WHERE c.dt IN ( SELECT dt_str FROM all_period_dts ) AND c.resource_type NOT IN (3,5) AND c.product <> 9 AND c.consume_type = 5 ) ,payment_consume_tagged AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag ,p.time_grain ,c.channel_type ,c.revenue FROM payment_consume c JOIN period_config p ON c.dt >= p.start_dt AND c.dt <= p.end_dt ) -- 合并所有来源的营收数据 ,payment_all AS ( SELECT period_tag ,time_grain ,channel_type ,revenue FROM payment_cl_tagged；time_grain = '月' AND SUBSTRING(stat_date,1,7) IN ( SELECT SUBSTRING(CAST(ADD_MONTHS(TO_DATE('${dt}'),-1) AS STRING),1,7)；stat_date IS NOT NULL；indicators_pivoted.metric_name IS NULL ;
- 聚合函数：SUM(revenue), MAX(start_dt), MAX(display_order), MAX(value), MAX(CASE    WHEN h.stat_date = DATE(SUBSTRING(CAST(ADD_MONTHS(TO_DATE('${dt}'), MAX(CASE    WHEN period_tag = 'week_current' THEN start_dt END), MAX(CASE    WHEN period_tag = 'week_current' THEN value ELSE 0 END), MAX(CASE    WHEN period_tag = 'week_last_year_same' THEN value ELSE 0 END), MAX(CASE    WHEN period_tag = 'week_last' THEN value ELSE 0 END), MAX(CASE    WHEN period_tag = 'week_last_year_last' THEN value ELSE 0 END), MAX(CASE    WHEN period_tag = 'week_last_last' THEN value ELSE 0 END), MAX(CASE    WHEN period_tag = 'week_last_year_last_last' THEN value ELSE 0 END)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 current_value 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
