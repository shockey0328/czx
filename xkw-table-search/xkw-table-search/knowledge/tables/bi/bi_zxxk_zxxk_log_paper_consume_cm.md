# `bi_zxxk_zxxk_log_paper_consume_cm`

- 层级：`bi`
- 本地表描述：学段（小学/初中/高中）
- 主题标签：content_resource, log_behavior, exam_question
- 数据粒度：按 stage_name ,name ) ,emp_base_detail AS ( SELECT stage_name ,exam_scope_name AS name ,SUM(c_consume) AS c_consume ,COUNT(1) AS c_downcnt FROM emp_base WHERE SUBSTRING(dt,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) GROUP BY stage_name ,exam_scope_name ) ,paper_month_all AS ( SELECT b.stage_name AS stage_name ,'试卷整体' AS paper_type ,CAST(SUM(b.c_consume) AS BIGINT) AS c_consume_all ,SUM(b.c_downcnt) AS c_downcnt_all FROM base_detail b GROUP BY b.stage_name ) ,off_paper_month_all AS ( SELECT b.stage_name AS stage_name ,'正式试卷整体' AS paper_type ,CAST(SUM(b.c_consume) AS BIGINT) AS c_consume_all ,SUM(b.c_downcnt) AS c_downcnt_all FROM base_detail b WHERE b.name IN ('校考','统考','校联考') GROUP BY b.stage_name ) ,un_paper_month_all AS ( SELECT b.stage_name AS stage_name ,'统考' AS paper_type ,CAST(SUM(b.c_consume) AS BIGINT) AS c_consume_all ,SUM(b.c_downcnt) AS c_downcnt_all FROM base_detail b WHERE b.name = '统考' GROUP BY b.stage_name ) ,unoff_paper_month_all AS ( SELECT a.stage_name AS stage_name ,'非正式试卷' AS paper_type ,a.c_consume_all - b.c_consume_all AS c_consume_all ,a.c_downcnt_all - b.c_downcnt_all AS c_downcnt_all FROM paper_month_all a LEFT JOIN off_paper_month_all b ON a.stage_name = b.stage_name ) ,emp_paper_month_all AS ( SELECT b.stage_name AS stage_name ,'重点校整体' AS paper_type ,CAST(SUM(b.c_consume) AS BIGINT) AS c_consume_all ,SUM(b.c_downcnt) AS c_downcnt_all FROM emp_base_detail b GROUP BY b.stage_name ) ,emp_off_paper_month_all AS ( SELECT b.stage_name AS stage_name ,'重点校正式' AS paper_type ,CAST(SUM(b.c_consume) AS BIGINT) AS c_consume_all ,SUM(b.c_downcnt) AS c_downcnt_all FROM emp_base_detail b WHERE b.name IN ('校考','统考','校联考') GROUP BY b.stage_name ) ,paper_all_month AS ( SELECT * FROM paper_month_all 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`paper_type`、`recent_c_consume`、`last_period_c_consume`、`mom_c_consume_percent`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `stage_name` | `STRING` | 学段（小学/初中/高中） | ddl |
| `paper_type` | `STRING` | 试卷类型（试卷整体/正式试卷整体/统考/非正式试卷） | ddl |
| `recent_c_consume` | `BIGINT` | 本期C端消费额 | ddl |
| `last_period_c_consume` | `BIGINT` | 上周期C端消费额 | ddl |
| `mom_c_consume_percent` | `DECIMAL(16,4` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dwd.dwd_zxxk_zxxk_log_consume_log_di`, `dim.dim_cmp_rbm_resource`, `dim.dim_cmp_rbm_tag`, `base`, `emp_base`, `base_detail`, `paper_month_all`, `off_paper_month_all`, `emp_base_detail`, `un_paper_month_all`, `unoff_paper_month_all`, `emp_paper_month_all`, `emp_off_paper_month_all`, `bi.bi_zxxk_zxxk_log_paper_consume_cm`, `paper_all_month`, `last_month`, `last_year`, `paper_consume_all`
- 关联条件：c.resource_id = r.res_id
    LEFT；r.exam_scope = b.id；c.resource_id = r.res_id；a.stage_name = b.stage_name
)
,emp_paper_month_all AS
(
    SELECT  b.stage_name AS stage_name
            ,'重点校整体' AS paper_type
            ,CAST(SUM(b.c_consume) AS BIGINT) AS c_consume_all
            ,SUM(b.c_downcnt) AS c_downcnt_all
    FROM    emp_base_detail b；a.stage_name = b.stage_name
    AND     a.paper_type = b.paper_type
    LEFT；a.stage_name = c.stage_name
    AND     a.paper_type = c.paper_type
)
INSERT OVERWRITE TABLE ${bi}.bi_zxxk_zxxk_log_paper_consume_cm
SELECT  stage_name
        ,paper_type
        ,c_consume_all
        ,c_consume_all_last_month
        ,mom_c_consume_all_percent
        ,c_consume_all_last_year_month
        ,yoy_c_consume_all_percent
        ,c_downcnt_all
        ,c_downcnt_all_last_month
        ,mom_c_downcnt_all_percent
        ,c_downcnt_all_last_year_month
        ,yoy_c_downcnt_all_percent
        ,time_grain
        ,stat_date
FROM    paper_consume_all
- 过滤条件：c.dt >= DATETRUNC(CAST(ADD_MONTHS(DATE_ADD('${dt}',1),-2) AS DATE),'MONTH') AND c.dt <= '${dt}' AND r.source_type_one_level_name = '试卷' AND c.resource_type not in (3,5) AND c.stage_name <> '中职'；c.dt >= DATETRUNC(CAST(ADD_MONTHS(DATE_ADD('${dt}',1),-2) AS DATE),'MONTH') AND c.dt <= '${dt}' AND r.stage_name IN ('高中','初中') AND r.source_type_one_level_name = '试卷' AND ( r.school_level_ids REGEXP '\\b24\\b' OR r.school_level_ids REGEXP '\\b23\\b' ) AND c.resource_type not in (3,5)；stage_name != '中职' AND SUBSTRING(dt,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7)；SUBSTRING(dt,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7)；b.name IN ('校考','统考','校联考')；b.name = '统考'；SUBSTRING(stat_date,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-13),1,7) ) ,last_month AS ( SELECT stage_name ,paper_type ,recent_c_consume ,recent_total_downcnt FROM ${bi}.bi_zxxk_zxxk_log_paper_consume_cm WHERE SUBSTRING(stat_date,1,7) = SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-2),1,7) ) ,paper_consume_all AS ( SELECT a.stage_name ,a.paper_type ,a.c_consume_all ,b.recent_c_consume AS c_consume_all_last_month ,ROUND((a.c_consume_all - COALESCE(b.recent_c_consume,0)) / NULLIF(COALESCE(b.recent_c_consume,0),0),4) AS mom_c_consume_all_percent ,c.recent_c_consume AS c_consume_all_last_year_month ,ROUND((a.c_consume_all - COALESCE(c.recent_c_consume,0)) / NULLIF(COALESCE(c.recent_c_consume,0),0),4) AS yoy_c_consume_all_percent ,a.c_downcnt_all ,b.recent_total_downcnt AS c_downcnt_all_last_month ,ROUND((a.c_downcnt_all - COALESCE(b.recent_total_downcnt,0)) / NULLIF(COALESCE(b.recent_total_downcnt,0),0),4) AS mom_c_downcnt_all_percent ,c.recent_total_downcnt AS c_downcnt_all_last_year_month ,ROUND((a.c_downcnt_all - COALESCE(c.recent_total_downcnt,0)) / NULLIF(COALESCE(c.recent_total_downcnt,0),0),4) AS yoy_c_downcnt_all_percent ,'月' AS time_grain ,DATE(SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) || '-01') AS stat_date FROM paper_all_month a LEFT JOIN last_month b ON a.stage_name = b.stage_name AND a.paper_type = b.paper_type LEFT JOIN last_year c ON a.stage_name = c.stage_name AND a.paper_type = c.paper_type )；stat_date != DATE(SUBSTRING(ADD_MONTHS(DATE_ADD('${dt}',1),-1),1,7) || '-01') ;
- 聚合函数：COUNT(1), SUM(c_consume), SUM(b.c_consume), SUM(b.c_downcnt)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 mom_c_consume_percent 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
