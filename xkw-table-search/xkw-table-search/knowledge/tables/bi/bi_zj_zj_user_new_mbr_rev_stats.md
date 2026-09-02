# `bi_zj_zj_user_new_mbr_rev_stats`

- 层级：`bi`
- 本地表描述：日：统计日；周/月起始日
- 主题标签：user, log_behavior
- 数据粒度：按 CASE WHEN group_id = 6 THEN '尊享会员' WHEN group_id = 8 THEN '优享会员' ELSE '其他' END ) ,month_sum AS ( SELECT DATE(SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) || '-01') AS stat_date ,g.group_name ,COALESCE(r.user_cnt,0) AS user_cnt ,COALESCE(r.pay_amount_sum,0) AS pay_amount_sum ,'月' AS time_grain FROM mbr_groups g LEFT JOIN month_sum_raw r ON g.group_name = r.group_name ) ,total AS ( SELECT stat_date ,group_name ,COALESCE(user_cnt,0) AS user_cnt ,COALESCE(pay_amount_sum,0) AS pay_amount_sum ,time_grain FROM day_sum 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`stat_date`、`user_cnt`、`pay_amount_sum`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `stat_date` | `STRING` | 日：统计日；周/月起始日 | ddl |
| `group_name` | `STRING` | 会员类型：尊享会员/优享会员 | ddl |
| `user_cnt` | `BIGINT` | 新用户转会员用户数 | ddl |
| `pay_amount_sum` | `DECIMAL(28,4` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dim.dim_pub_pub_user`, `dwd.dwd_pub_io_log_xyiolog_di`, `dwd.dwd_pub_io_log_xyiolog_app_di`, `day_new_users`, `day_c_activity`, `dwd.dwd_zj_zj_trd_orderlist_df`, `day_new_c_users`, `mbr_groups`, `day_sum_raw`, `week_new_users`, `week_c_activity`, `week_new_c_users`, `week_sum_raw`, `month_new_users`, `month_c_activity`, `month_new_c_users`, `month_sum_raw`, `day_sum`, `week_sum`, `month_sum`, `total`, `bi.bi_zj_zj_user_new_mbr_rev_stats`
- 关联条件：n.user_id = c.user_id
)
,mbr_groups AS
(
    SELECT  '尊享会员' AS group_name；g.group_name = r.group_name
)
,week_new_users AS 
(
    SELECT  u.user_id
    FROM    ${dim}.dim_pub_pub_user u；n.user_id = c.user_id
)
,week_sum_raw AS
(
    SELECT  CASE   WHEN group_id = 6 THEN '尊享会员'
                   WHEN group_id = 8 THEN '优享会员'
                   ELSE '其他'
            END AS group_name
            ,COUNT(DISTINCT user_id) AS user_cnt
            ,SUM(pay_amount) AS pay_amount_sum
    FROM    ${dwd}.dwd_zj_zj_trd_orderlist_df；g.group_name = r.group_name
)
,month_new_users AS 
(
    SELECT  u.user_id
    FROM    ${dim}.dim_pub_pub_user u；n.user_id = c.user_id
)
,month_sum_raw AS
(
    SELECT  CASE   WHEN group_id = 6 THEN '尊享会员'
                   WHEN group_id = 8 THEN '优享会员'
                   ELSE '其他'
            END AS group_name
            ,COUNT(DISTINCT user_id) AS user_cnt
            ,SUM(pay_amount) AS pay_amount_sum
    FROM    ${dwd}.dwd_zj_zj_trd_orderlist_df；g.group_name = r.group_name
)
,total AS 
(
    SELECT  stat_date
            ,group_name
            ,COALESCE(user_cnt,0) AS user_cnt
            ,COALESCE(pay_amount_sum,0) AS pay_amount_sum
            ,time_grain
    FROM    day_sum；a.stat_date = b.stat_date
AND     a.time_grain = b.time_grain
- 过滤条件：SUBSTRING(u.zj_first_login_time,1,10) = '${dt}' ) ,day_c_activity AS ( SELECT DISTINCT user_id FROM ${dwd}.dwd_pub_io_log_xyiolog_di WHERE dt = '${dt}' AND user_id <> 0 AND product_id IN ('zujuanwang','ejuantong') AND is_tob = 0；dt = '${dt}' AND user_id <> 0 AND product_id IN ('zujuanwang','ejuantong') AND is_tob = 0 ) ,day_new_c_users AS ( SELECT DISTINCT n.user_id FROM day_new_users n JOIN day_c_activity c ON n.user_id = c.user_id ) ,mbr_groups AS ( SELECT '尊享会员' AS group_name；status = 1 AND product = 2 AND group_id IN (6,8) AND SUBSTRING(buy_time,1,10) = '${dt}' AND user_id IN ( SELECT user_id FROM day_new_c_users )；SUBSTRING(u.zj_first_login_time,1,10) >= DATE_SUB(TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8)),6) AND SUBSTRING(u.zj_first_login_time,1,10) <= TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8)) ) ,week_c_activity AS ( SELECT DISTINCT user_id FROM ${dwd}.dwd_pub_io_log_xyiolog_di WHERE dt >= DATE_SUB(TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8)),6) AND dt <= TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8)) AND user_id <> 0 AND product_id IN ('zujuanwang','ejuantong') AND is_tob = 0；dt >= DATE_SUB(TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8)),6) AND dt <= TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8)) AND user_id <> 0 AND product_id IN ('zujuanwang','ejuantong') AND is_tob = 0 ) ,week_new_c_users AS ( SELECT DISTINCT n.user_id FROM week_new_users n JOIN week_c_activity c ON n.user_id = c.user_id ) ,week_sum_raw AS ( SELECT CASE WHEN group_id = 6 THEN '尊享会员' WHEN group_id = 8 THEN '优享会员' ELSE '其他' END AS group_name ,COUNT(DISTINCT user_id) AS user_cnt ,SUM(pay_amount) AS pay_amount_sum FROM ${dwd}.dwd_zj_zj_trd_orderlist_df WHERE status = 1 AND product = 2 AND group_id IN (6,8) AND SUBSTRING(buy_time,1,10) >= DATE_SUB(TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8)),6) AND SUBSTRING(buy_time,1,10) <= TO_DATE(DATE_ADD(NEXT_DAY(DATE_ADD('${dt}',1),'MO'),-8)) AND user_id IN ( SELECT user_id FROM week_new_c_users )；SUBSTRING(u.zj_first_login_time,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) ) ,month_c_activity AS ( SELECT DISTINCT user_id FROM ${dwd}.dwd_pub_io_log_xyiolog_di WHERE SUBSTRING(dt,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) AND user_id <> 0 AND product_id IN ('zujuanwang','ejuantong') AND is_tob = 0；SUBSTRING(dt,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) AND user_id <> 0 AND product_id IN ('zujuanwang','ejuantong') AND is_tob = 0 ) ,month_new_c_users AS ( SELECT DISTINCT n.user_id FROM month_new_users n JOIN month_c_activity c ON n.user_id = c.user_id ) ,month_sum_raw AS ( SELECT CASE WHEN group_id = 6 THEN '尊享会员' WHEN group_id = 8 THEN '优享会员' ELSE '其他' END AS group_name ,COUNT(DISTINCT user_id) AS user_cnt ,SUM(pay_amount) AS pay_amount_sum FROM ${dwd}.dwd_zj_zj_trd_orderlist_df WHERE status = 1 AND product = 2 AND group_id IN (6,8) AND SUBSTRING(buy_time,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) AND user_id IN ( SELECT user_id FROM month_new_c_users )；b.stat_date IS NULL ;
- 聚合函数：COUNT(DISTINCT user_id), SUM(pay_amount)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 pay_amount_sum 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
