# `bi_zxxk_zxxk_log_course_consume_cm`

- 层级：`bi`
- 本地表描述：学段名称
- 主题标签：log_behavior
- 数据粒度：按 stage_name ,CONCAT(stage_name,'(总)') ) ,last_month AS ( SELECT stage_name ,course_name ,all_current_c_consume AS all_last_week_c_consume ,all_current_bc_downcnt AS all_last_week_bc_downcnt ,excellent_current_c_consume AS excellent_last_week_c_consume ,excellent_current_bc_downcnt AS excellent_last_week_bc_downcnt FROM ${bi}.bi_zxxk_zxxk_log_course_consume_cm WHERE SUBSTRING(stat_date,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-2),1,7) ) ,last_year AS ( SELECT stage_name ,course_name ,all_current_c_consume AS all_last_year_c_consume ,all_current_bc_downcnt AS all_last_year_bc_downcnt ,excellent_current_c_consume AS excellent_last_year_c_consume ,excellent_current_bc_downcnt AS excellent_last_year_bc_downcnt FROM ${bi}.bi_zxxk_zxxk_log_course_consume_cm WHERE SUBSTRING(stat_date,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-13),1,7) ) ,total_month AS ( SELECT t1.stage_name ,t1.course_name ,t1.all_current_c_consume ,t3.all_last_year_c_consume ,ROUND((COALESCE(t1.all_current_c_consume,0) - COALESCE(t3.all_last_year_c_consume,0)) / NULLIF(COALESCE(t3.all_last_year_c_consume,0),0),4) AS yoy_c_consume_percent ,ROUND((COALESCE(t1.all_current_c_consume,0) - COALESCE(t2.all_last_week_c_consume,0)) / NULLIF(COALESCE(t2.all_last_week_c_consume,0),0),4) AS mom_c_consume_percent ,t1.all_current_bc_downcnt ,t3.all_last_year_bc_downcnt ,ROUND((COALESCE(t1.all_current_bc_downcnt,0) - COALESCE(t3.all_last_year_bc_downcnt,0)) / NULLIF(COALESCE(t3.all_last_year_bc_downcnt,0),0),4) AS yoy_bc_downcnt_percent ,ROUND((COALESCE(t1.all_current_bc_downcnt,0) - COALESCE(t2.all_last_week_bc_downcnt,0)) / NULLIF(COALESCE(t2.all_last_week_bc_downcnt,0),0),4) AS mom_bc_downcnt_percent ,t2.all_last_week_c_consume ,t2.all_last_week_bc_downcnt ,t4.excellent_current_c_consume ,t3.excellent_last_year_c_consume ,ROUND((COALESCE(t4.excellent_current_c_consume,0) - COALESCE(t3.excellent_last_year_c_consume,0)) / NULLIF(COALESCE(t3.excellent_last_year_c_consume,0),0),4) AS yoy_ex_c_consume_percent ,ROUND((COALESCE(t4.excellent_current_c_consume,0) - COALESCE(t2.excellent_last_week_c_consume,0)) / NULLIF(COALESCE(t2.excellent_last_week_c_consume,0),0),4) AS mom_ex_c_consume_percent ,t4.excellent_current_bc_downcnt ,t3.excellent_last_year_bc_downcnt ,ROUND((COALESCE(t4.excellent_current_bc_downcnt,0) - COALESCE(t3.excellent_last_year_bc_downcnt,0)) / NULLIF(COALESCE(t3.excellent_last_year_bc_downcnt,0),0),4) AS yoy_ex_bc_downcnt_percent ,ROUND((COALESCE(t4.excellent_current_bc_downcnt,0) - COALESCE(t2.excellent_last_week_bc_downcnt,0)) / NULLIF(COALESCE(t2.excellent_last_week_bc_downcnt,0),0),4) AS mom_ex_bc_downcnt_percent ,t2.excellent_last_week_c_consume ,t2.excellent_last_week_bc_downcnt ,'月' AS time_grain ,DATE(SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) || '-01') AS stat_date FROM all_current_m t1 LEFT JOIN last_month t2 ON t1.stage_name = t2.stage_name AND t1.course_name = t2.course_name LEFT JOIN last_year t3 ON t1.stage_name = t3.stage_name AND t1.course_name = t3.course_name LEFT JOIN excellent_current_m t4 ON t1.stage_name = t4.stage_name AND t1.course_name = t4.course_name 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`all_current_c_consume`、`all_last_year_c_consume`、`yoy_c_consume_percent`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `stage_name` | `STRING` | 学段名称 | ddl |
| `course_name` | `STRING` | 课程名称 | ddl |
| `all_current_c_consume` | `BIGINT` | 用户本期消费额 | ddl |
| `all_last_year_c_consume` | `BIGINT` | 用户上年同期消费额 | ddl |
| `yoy_c_consume_percent` | `DECIMAL(16,4` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dwd.dwd_zxxk_zxxk_log_consume_log_di`, `dim.dim_cmp_rbm_resource`, `base`, `bi.bi_zxxk_zxxk_log_course_consume_cm`, `all_current_m`, `last_month`, `last_year`, `excellent_current_m`, `total_month`
- 关联条件：c.resource_id = r.res_id；t1.stage_name = t2.stage_name
    AND     t1.course_name = t2.course_name
    LEFT；t1.stage_name = t3.stage_name
    AND     t1.course_name = t3.course_name
    LEFT；t1.stage_name = t4.stage_name
    AND     t1.course_name = t4.course_name
- 过滤条件：c.dt >= DATETRUNC(CAST(ADD_MONTHS(DATE_ADD('${dt}',1),-2) AS DATE),'MONTH') AND c.dt <= '${dt}' AND c.resource_type not in (3,5) ) ,all_current_m AS ( SELECT stage_name ,course_name ,CAST(SUM(consume_price) AS BIGINT) AS all_current_c_consume ,COUNT(1) AS all_current_bc_downcnt FROM base WHERE SUBSTRING(dt,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7)；SUBSTRING(dt,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7)；SUBSTRING(dt,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) AND commercial = '精品' AND biz_brand_series_id IS NOT NULL AND biz_brand_series_id NOT IN (0,2321) AND uploader NOT IN ('xy01640','xy04774','xy06317','xy06378','xy08417','xy07970','xy08536','xy08626','xy05195','xy04707','xy05777','xy08955','xy05463','xy08797')；SUBSTRING(stat_date,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-2),1,7) ) ,last_year AS ( SELECT stage_name ,course_name ,all_current_c_consume AS all_last_year_c_consume ,all_current_bc_downcnt AS all_last_year_bc_downcnt ,excellent_current_c_consume AS excellent_last_year_c_consume ,excellent_current_bc_downcnt AS excellent_last_year_bc_downcnt FROM ${bi}.bi_zxxk_zxxk_log_course_consume_cm WHERE SUBSTRING(stat_date,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-13),1,7) ) ,total_month AS ( SELECT t1.stage_name ,t1.course_name ,t1.all_current_c_consume ,t3.all_last_year_c_consume ,ROUND((COALESCE(t1.all_current_c_consume,0) - COALESCE(t3.all_last_year_c_consume,0)) / NULLIF(COALESCE(t3.all_last_year_c_consume,0),0),4) AS yoy_c_consume_percent ,ROUND((COALESCE(t1.all_current_c_consume,0) - COALESCE(t2.all_last_week_c_consume,0)) / NULLIF(COALESCE(t2.all_last_week_c_consume,0),0),4) AS mom_c_consume_percent ,t1.all_current_bc_downcnt ,t3.all_last_year_bc_downcnt ,ROUND((COALESCE(t1.all_current_bc_downcnt,0) - COALESCE(t3.all_last_year_bc_downcnt,0)) / NULLIF(COALESCE(t3.all_last_year_bc_downcnt,0),0),4) AS yoy_bc_downcnt_percent ,ROUND((COALESCE(t1.all_current_bc_downcnt,0) - COALESCE(t2.all_last_week_bc_downcnt,0)) / NULLIF(COALESCE(t2.all_last_week_bc_downcnt,0),0),4) AS mom_bc_downcnt_percent ,t2.all_last_week_c_consume ,t2.all_last_week_bc_downcnt ,t4.excellent_current_c_consume ,t3.excellent_last_year_c_consume ,ROUND((COALESCE(t4.excellent_current_c_consume,0) - COALESCE(t3.excellent_last_year_c_consume,0)) / NULLIF(COALESCE(t3.excellent_last_year_c_consume,0),0),4) AS yoy_ex_c_consume_percent ,ROUND((COALESCE(t4.excellent_current_c_consume,0) - COALESCE(t2.excellent_last_week_c_consume,0)) / NULLIF(COALESCE(t2.excellent_last_week_c_consume,0),0),4) AS mom_ex_c_consume_percent ,t4.excellent_current_bc_downcnt ,t3.excellent_last_year_bc_downcnt ,ROUND((COALESCE(t4.excellent_current_bc_downcnt,0) - COALESCE(t3.excellent_last_year_bc_downcnt,0)) / NULLIF(COALESCE(t3.excellent_last_year_bc_downcnt,0),0),4) AS yoy_ex_bc_downcnt_percent ,ROUND((COALESCE(t4.excellent_current_bc_downcnt,0) - COALESCE(t2.excellent_last_week_bc_downcnt,0)) / NULLIF(COALESCE(t2.excellent_last_week_bc_downcnt,0),0),4) AS mom_ex_bc_downcnt_percent ,t2.excellent_last_week_c_consume ,t2.excellent_last_week_bc_downcnt ,'月' AS time_grain ,DATE(SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) || '-01') AS stat_date FROM all_current_m t1 LEFT JOIN last_month t2 ON t1.stage_name = t2.stage_name AND t1.course_name = t2.course_name LEFT JOIN last_year t3 ON t1.stage_name = t3.stage_name AND t1.course_name = t3.course_name LEFT JOIN excellent_current_m t4 ON t1.stage_name = t4.stage_name AND t1.course_name = t4.course_name；stat_date != DATE(SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) || '-01') ;
- 聚合函数：SUM(consume_price), COUNT(1)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 yoy_c_consume_percent 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
