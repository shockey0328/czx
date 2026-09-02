# `ads_zj_zj_log_school_zj_stats_df`

- 层级：`ads`
- 本地表描述：学校id
- 主题标签：log_behavior, device_school
- 数据粒度：按 ssm_school_id, stage_id, subject_id grouping sets ((ssm_school_id, stage_id , subject_id) , (ssm_school_id, stage_id) , (ssm_school_id))) , ads_zj_user_dl_stats_1d as ( select coalesce (stage_id, 0) stage_id, coalesce (subject_id, 0) subject_id , sum (selectques_cnt) total_selectques_cnt_12m , count (distinct (ssm_school_id)) as total_school_count_12m , sum (createpaper_ques_sum_center)+ sum (createpaper_ques_sum_whole)+ sum (createpaper_ques_sum_special) + sum (createpaper_ques_sum_single) as total_ques_count_12m , sum (case when dt>=ADD_MONTHS('${dt}', -6) and dt<='${dt}' then selectques_cnt else 0 end) total_selectques_cnt_6m , count (distinct (case when dt>=ADD_MONTHS('${dt}', -6) and dt<='${dt}' then ssm_school_id end)) as total_school_count_6m , sum (case when dt>=ADD_MONTHS('${dt}', -6) and dt<='${dt}' then createpaper_ques_sum_center else 0 end) + sum (case when dt>=ADD_MONTHS('${dt}', -6) and dt<='${dt}' then createpaper_ques_sum_whole else 0 end) + sum (case when dt>=ADD_MONTHS('${dt}', -6) and dt<='${dt}' then createpaper_ques_sum_special else 0 end) + sum (case when dt>=ADD_MONTHS('${dt}', -6) and dt<='${dt}' then createpaper_ques_sum_single else 0 end) as total_ques_count_6m , sum (case when dt>=ADD_MONTHS('${dt}', -1) and dt<='${dt}' then selectques_cnt else 0 end) total_selectques_cnt_1m , count (distinct (case when dt>=ADD_MONTHS('${dt}', -1) and dt<='${dt}' then ssm_school_id end)) as total_school_count_1m , sum (case when dt>=ADD_MONTHS('${dt}', -1) and dt<='${dt}' then createpaper_ques_sum_center else 0 end) + sum (case when dt>=ADD_MONTHS('${dt}', -1) and dt<='${dt}' then createpaper_ques_sum_whole else 0 end) + sum (case when dt>=ADD_MONTHS('${dt}', -1) and dt<='${dt}' then createpaper_ques_sum_special else 0 end) + sum (case when dt>=ADD_MONTHS('${dt}', -1) and dt<='${dt}' then createpaper_ques_sum_single else 0 end) as total_ques_count_1m from dmp_ads.ads_zj_zj_user_dl_stats_1d where dt >= ADD_MONTHS('${dt}' , -12) and dt <= '${dt}' group by stage_id, subject_id grouping sets ((stage_id, subject_id), (stage_id), ()) ) 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`ssm_school_id`、`stage_id`、`subject_id`、`selectques_cnt_12m`、`avg_selectques_cnt_12m`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `ssm_school_id` | `INT` | 学校id | ddl |
| `stage_id` | `INT` | 学段id | ddl |
| `subject_id` | `INT` | 科目id | ddl |
| `selectques_cnt_12m` | `INT` | 选题次数-近一年 | ddl |
| `ques_count_12m` | `INT` | 下载题量-近一年 | ddl |
| `avg_selectques_cnt_12m` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dmp_ads.ads_zj_zj_user_dl_stats_1d`, `ads_zj_user_dl_stats_1d_school_id`, `ads_zj_user_dl_stats_1d`
- 关联条件：t1.stage_id = t2.stage_id and t1.subject_id = t2.subject_id
- 过滤条件：dt >= ADD_MONTHS('${dt}', -12) and dt <= '${dt}'；dt >= ADD_MONTHS('${dt}' , -12) and dt <= '${dt}'
- 聚合函数：SUM(selectques_cnt), SUM(createpaper_ques_sum_center), SUM(createpaper_ques_sum_whole), SUM(createpaper_ques_sum_special), SUM(createpaper_ques_sum_single), SUM(case when dt >= ADD_MONTHS('${dt}', -6), SUM(case when dt >= ADD_MONTHS('${dt}', -1), COUNT(distinct (ssm_school_id), SUM(case when dt>=ADD_MONTHS('${dt}', -6), COUNT(distinct (case when dt>=ADD_MONTHS('${dt}', -6), SUM(case when dt>=ADD_MONTHS('${dt}', -1), COUNT(distinct (case when dt>=ADD_MONTHS('${dt}', -1)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 avg_selectques_cnt_12m 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
