# `bi_zxxk_zxxk_paid_stats`

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
- 上游表：`params`, `time_calc`, `period_flat`, `period_config`, `dwd.dwd_ump_pay_trd_charges_di`, `all_period_dts`, `base_paid_log`, `paid_log_tagged`, `dwd.dwd_zxxk_zxxk_trd_b_plusorder_df`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `dwd.dwd_zxxk_zxxk_trd_cl_payment_df`, `dwd.dwd_zxxk_user_asset_sub_order_df`, `a_with_order`, `b_with_order`, `combo_cd`, `vip_member_by_period`, `vip_scan_by_period`, `stored_by_period`, `normal_scan_by_period`, `combo_by_period`, `total_paid_by_period`, `teacher_paid_by_period`, `student_paid_by_period`, `zxxk_metrics_by_period`, `indicators_unpivoted`, `indicators_with_date`, `bi.bi_zxxk_zxxk_paid_stats`, `current_month_stats`, `historical_stats`, `indicators_pivoted`
- 关联条件：c.dt >= p.start_dt
    AND     c.dt <= p.end_dt
) -- 总营收统计
,total_paid_by_period AS
(
    SELECT  period_tag
            ,time_grain
            ,CAST(SUM(paid_amount * 0.01) AS DECIMAL(20,0)) AS paid_amount
            ,COUNT(DISTINCT payer_id) AS payer_cnt
    FROM    paid_log_tagged；TO_DATE(o.pay_time) >= p.start_dt
    AND     TO_DATE(o.pay_time) <= p.end_dt；c.dt >= p.start_dt
    AND     c.dt <= p.end_dt；TO_DATE(pay.pay_time) >= p.start_dt
    AND     TO_DATE(pay.pay_time) <= p.end_dt；TO_DATE(A.create_time) >= p.start_dt
            AND TO_DATE(A.create_time) <= p.end_dt
            AND A.product_type = 4
            AND A.pay_status = 1
    INNER；A.order_num = so.sub_order_num；TO_DATE(B.pay_time) >= p.start_dt
            AND TO_DATE(B.pay_time) <= p.end_dt
            AND B.status = 1
    INNER；B.payment_num = so.sub_order_num
- 过滤条件：c.dt IN ( SELECT dt_str FROM all_period_dts ) AND c.paid_status = 1 AND c.refunded = '0' ) ,paid_log_tagged AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag ,p.time_grain ,c.payer_id ,c.paid_amount ,c.app_id FROM base_paid_log c JOIN period_config p ON c.dt >= p.start_dt AND c.dt <= p.end_dt ) -- 总营收统计 ,total_paid_by_period AS ( SELECT period_tag ,time_grain ,CAST(SUM(paid_amount * 0.01) AS DECIMAL(20,0)) AS paid_amount ,COUNT(DISTINCT payer_id) AS payer_cnt FROM paid_log_tagged WHERE app_id IN ('app_wxzxxk','app_xyzxxk','app_zxxkcashier','app_zxxkplus','app_xuebei','app_xkwczx')；app_id IN ('app_wxzxxk','app_xyzxxk','app_zxxkcashier','app_zxxkplus','app_xuebei')；app_id = 'app_xkwczx'；TO_CHAR(TO_DATE(o.pay_time),'yyyy-MM-dd') IN ( SELECT dt_str FROM all_period_dts ) AND o.pay_status = 1 AND o.product_type = 4；c.dt IN ( SELECT dt_str FROM all_period_dts ) AND c.resource_type <> 3 AND c.product <> 9；TO_CHAR(TO_DATE(pay.pay_time),'yyyy-MM-dd') IN ( SELECT dt_str FROM all_period_dts ) AND pay.product IN (1,5,8,9,10,11) AND pay.status = 1；c.dt IN ( SELECT dt_str FROM all_period_dts ) AND c.consume_type = 5 AND c.resource_type <> 3 AND c.product <> 9 AND c.consumer_identity IN (50,52)；TO_CHAR(TO_DATE(A.create_time),'yyyy-MM-dd') IN ( SELECT dt_str FROM all_period_dts ) ) ,b_with_order AS ( SELECT /*+ MAPJOIN(p) */ p.period_tag ,p.time_grain ,so.order_id ,B.payment_num AS order_num ,B.true_money FROM period_config p INNER JOIN ${dwd}.dwd_zxxk_zxxk_trd_cl_payment_df B ON TO_DATE(B.pay_time) >= p.start_dt AND TO_DATE(B.pay_time) <= p.end_dt AND B.status = 1 INNER JOIN ${dwd}.dwd_zxxk_user_asset_sub_order_df so ON B.payment_num = so.sub_order_num WHERE TO_CHAR(TO_DATE(B.pay_time),'yyyy-MM-dd') IN ( SELECT dt_str FROM all_period_dts ) ) ,combo_cd AS ( SELECT c.period_tag ,c.time_grain ,c.order_id ,c.true_price ,d.true_money FROM a_with_order c INNER JOIN b_with_order d ON c.period_tag = d.period_tag AND c.time_grain = d.time_grain AND c.order_id = d.order_id ) ,combo_by_period AS ( SELECT period_tag ,time_grain ,CAST(SUM(true_price) + SUM(true_money) AS DECIMAL(20,4)) AS combo_total_rev ,CAST(COUNT(DISTINCT order_id) AS DECIMAL(20,4)) AS combo_order_cnt ,CAST(SUM(true_price) AS DECIMAL(20,4)) AS combo_vip_rev ,CAST(SUM(true_money) AS DECIMAL(20,4)) AS combo_stored_rev FROM combo_cd
- 聚合函数：SUM(paid_amount * 0.01), COUNT(DISTINCT payer_id), SUM(o.true_price), COUNT(DISTINCT o.user_id), COUNT(DISTINCT o.order_num), SUM(IF(c.consume_type = 5 AND c.consumer_identity = 54,c.consume_price,0), COUNT(DISTINCT IF(c.consume_type = 5 AND c.consumer_identity = 54,c.consumer_id,NULL), SUM(pay.true_money), COUNT(DISTINCT pay.user_id), SUM(c.consume_price), SUM(true_price), SUM(true_money)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 current_value 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
