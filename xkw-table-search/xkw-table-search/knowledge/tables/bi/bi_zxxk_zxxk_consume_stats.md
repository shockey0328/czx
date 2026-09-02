# `bi_zxxk_zxxk_consume_stats`

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
- 上游表：`params`, `time_calc`, `period_flat`, `dwd.dwd_zxxk_zxxk_trd_b_plusorder_df`, `period_config`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `all_period_dts`, `base_consume_log`, `dwd.dwd_zxxk_zxxk_user_cl_uservoucher_df`, `consume_log_tagged`, `normal_user_consume_by_period`, `dwd.dwd_zxxk_zxxk_log_student_download_df`, `temp0`, `teacher_consume_by_period`, `student_consume_by_period`, `consume_by_period`, `total_consume_by_period`, `consume_detail_by_period`, `voucher_stats_by_period`, `indicators_unpivoted`, `indicators_with_date`, `bi.bi_zxxk_zxxk_consume_stats`, `current_month_stats`, `historical_stats`, `indicators_pivoted`, `temp0_by_period`
- 关联条件：c.dt >= p.start_dt
    AND     c.dt <= p.end_dt
) -- 普通用户总消费金额 / 普通用户现金扫码金额（identity 51、52 及扫码口径见内层表达式）
,normal_user_consume_by_period AS
(
    SELECT  /*+ MAPJOIN(p) */
            p.period_tag
            ,p.time_grain
            ,CAST(SUM(
                CASE WHEN x.consumer_identity IN (51,52) THEN
                    CASE WHEN x.consume_type IN (1,2,5,6) THEN x.consume_price
                         WHEN x.consume_type = 3 THEN x.consume_price * 0.4
                         WHEN x.consume_type = 541 THEN 1.5
                         WHEN x.consume_type = 520 THEN 1
                         WHEN x.consume_type = 521 AND x.consumer_identity = 50 THEN x.resource_price
                         WHEN x.consume_type = 521 AND x.consumer_identity <> 50 AND x.resource_price > 0.5 THEN x.resource_price * 2
                         WHEN x.consume_type = 521 AND x.consumer_identity <> 50 AND x.resource_price <= 0.5 THEN 1.5
                         ELSE 0
                    END
                ELSE 0
                END
            ) AS DECIMAL(20,4)) AS normal_user_total_consume_amount
            ,CAST(SUM(IF(x.consume_type = 5 AND x.consumer_identity IN (51,52),x.consume_price,0)) AS DECIMAL(20,4)) AS normal_user_scan_consume_amount
    FROM    ${dwd}.dwd_zxxk_zxxk_log_consume_log_di x；x.dt >= p.start_dt
    AND     x.dt <= p.end_dt；TO_DATE(cl.end_time) >= p.start_dt
    AND     TO_DATE(cl.end_time) <= p.end_dt；c.period_tag = nu.period_tag
            AND c.time_grain = nu.time_grain；TO_DATE(c.download_time) >= p.start_dt
    AND     TO_DATE(c.download_time) <= p.end_dt
    INNER；c.user_id = t0.user_id；i.period_tag = p.period_tag
)
,current_month_stats AS
(
    SELECT  metric_name
            ,time_grain
            ,CAST(MAX(start_dt) AS STRING) AS stat_date
            ,MAX(display_order) AS display_order
            ,MAX(value) AS current_value
    FROM    indicators_with_date；c.metric_name = h.metric_name
    AND     c.time_grain = h.time_grain
- 过滤条件：TO_DATE(pay_time) <= ( SELECT MAX(end_dt) FROM period_config ) AND pay_status = 1 AND product_type = 5 ) -- 计算当前月的消费金额 ,all_period_dts AS ( SELECT DISTINCT TO_CHAR(date_val,'yyyy-MM-dd') AS dt_str FROM period_config p LATERAL VIEW EXPLODE(SEQUENCE(CAST(p.start_dt AS DATE),CAST(p.end_dt AS DATE))) seq AS date_val ) ,base_consume_log AS ( SELECT c.dt ,c.consumer_id ,c.consume_type ,c.consume_price ,c.consumer_identity ,c.resource_price FROM ${dwd}.dwd_zxxk_zxxk_log_consume_log_di c WHERE c.dt IN ( SELECT dt_str FROM all_period_dts ) AND c.resource_type <> 3 AND c.product <> 9 AND c.consume_type IN (1,2,3,5,6,520,521,541) ) ,consume_log_tagged AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag ,p.time_grain ,c.consumer_id ,c.consume_type ,c.consume_price ,c.consumer_identity ,c.resource_price FROM base_consume_log c JOIN period_config p ON c.dt >= p.start_dt AND c.dt <= p.end_dt ) -- 普通用户总消费金额 / 普通用户现金扫码金额（identity 51、52 及扫码口径见内层表达式） ,normal_user_consume_by_period AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag ,p.time_grain ,CAST(SUM( CASE WHEN x.consumer_identity IN (51,52) THEN CASE WHEN x.consume_type IN (1,2,5,6) THEN x.consume_price WHEN x.consume_type = 3 THEN x.consume_price * 0.4 WHEN x.consume_type = 541 THEN 1.5 WHEN x.consume_type = 520 THEN 1 WHEN x.consume_type = 521 AND x.consumer_identity = 50 THEN x.resource_price WHEN x.consume_type = 521 AND x.consumer_identity <> 50 AND x.resource_price > 0.5 THEN x.resource_price * 2 WHEN x.consume_type = 521 AND x.consumer_identity <> 50 AND x.resource_price <= 0.5 THEN 1.5 ELSE 0 END ELSE 0 END ) AS DECIMAL(20,4)) AS normal_user_total_consume_amount ,CAST(SUM(IF(x.consume_type = 5 AND x.consumer_identity IN (51,52),x.consume_price,0)) AS DECIMAL(20,4)) AS normal_user_scan_consume_amount FROM ${dwd}.dwd_zxxk_zxxk_log_consume_log_di x JOIN period_config p ON x.dt >= p.start_dt AND x.dt <= p.end_dt WHERE x.dt IN ( SELECT dt_str FROM all_period_dts ) AND x.resource_type <> 3 AND x.product <> 9；cl.voucher_id = 199；time_grain = '月' AND SUBSTRING(stat_date,1,7) IN ( SELECT SUBSTRING(CAST(ADD_MONTHS(TO_DATE('${dt}'),-1) AS STRING),1,7)；stat_date IS NOT NULL；indicators_pivoted.metric_name IS NULL ;；o.pay_status = 1 AND o.product_type = 5；c.dt IN ( SELECT dt_str FROM all_period_dts ) AND c.resource_type <> 3 AND c.product <> 9 AND c.consume_type IN (1,2,3,5,6,520,521,541) ) ,consume_log_tagged AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag ,p.time_grain ,c.consumer_id ,c.consume_type ,c.consume_price ,c.consumer_identity ,c.resource_price FROM base_consume_log c JOIN period_config p ON c.dt >= p.start_dt AND c.dt <= p.end_dt ) -- 普通用户总消费金额 / 普通用户现金扫码金额（identity 51、52 及扫码口径见内层表达式） ,normal_user_consume_by_period AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag ,p.time_grain ,CAST(SUM( CASE WHEN x.consumer_identity IN (51,52) THEN CASE WHEN x.consume_type IN (1,2,5,6) THEN x.consume_price WHEN x.consume_type = 3 THEN x.consume_price * 0.4 WHEN x.consume_type = 541 THEN 1.5 WHEN x.consume_type = 520 THEN 1 WHEN x.consume_type = 521 AND x.consumer_identity = 50 THEN x.resource_price WHEN x.consume_type = 521 AND x.consumer_identity <> 50 AND x.resource_price > 0.5 THEN x.resource_price * 2 WHEN x.consume_type = 521 AND x.consumer_identity <> 50 AND x.resource_price <= 0.5 THEN 1.5 ELSE 0 END ELSE 0 END ) AS DECIMAL(20,4)) AS normal_user_total_consume_amount ,CAST(SUM(IF(x.consume_type = 5 AND x.consumer_identity IN (51,52),x.consume_price,0)) AS DECIMAL(20,4)) AS normal_user_scan_consume_amount FROM ${dwd}.dwd_zxxk_zxxk_log_consume_log_di x JOIN period_config p ON x.dt >= p.start_dt AND x.dt <= p.end_dt WHERE x.dt IN ( SELECT dt_str FROM all_period_dts ) AND x.resource_type <> 3 AND x.product <> 9
- 聚合函数：MAX(end_dt), SUM(CASE WHEN x.consumer_identity IN (51,52), SUM(IF(x.consume_type = 5 AND x.consumer_identity IN (51,52), COUNT(1), SUM(CASE WHEN cl.is_use = 0 THEN 1 ELSE 0 END), COUNT(CASE WHEN c.consume_type = 541 THEN c.consumer_id END), SUM(CASE WHEN c.consume_type = 5 AND c.consumer_identity = 54 THEN c.consume_price ELSE 0 END), SUM(CASE WHEN c.consume_type = 1 AND c.consumer_identity <> 52 THEN c.consume_price ELSE 0 END), MAX(nu.normal_user_total_consume_amount), MAX(nu.normal_user_scan_consume_amount), SUM(CASE WHEN c.consume_type = 1 AND c.consumer_identity = 52 THEN c.consume_price ELSE 0 END), SUM(CASE    WHEN consume_type IN (1,2,5,6)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 current_value 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
