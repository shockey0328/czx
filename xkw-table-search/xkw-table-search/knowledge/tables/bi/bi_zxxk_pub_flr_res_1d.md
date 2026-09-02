# `bi_zxxk_pub_flr_res_1d`

- 层级：`bi`
- 本地表描述：资料id
- 主题标签：content_resource
- 数据粒度：按 resource_id, dt ), -----学段id和学科id---- stageid_and_subjectid as( select resource.res_id as res_id, resource.course_id as course_id, case when resource.commercial_level_id = '1202' then '普通' when resource.commercial_level_id = '1203' and (resource.provider_id = 13421203 or resource.source_application_id = 'qbm') then '精品解析' when resource.commercial_level_id = '1203' and resource.provider_id != 13421203 and resource.source_application_id != 'qbm' then '精品创作' when resource.commercial_level_id = '1204' then '特供' when resource.commercial_level_id = '1205' then '第三方' else '其他' end as commercial_level_extend, course.stage_id as stage_id, course.subject_id as subject_id from ${dim}.dim_cmp_rbm_resource resource left join ${dim}.dim_pub_pub_course course on resource.course_id = course.course_id ) 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`res_id`、`stage_id`、`subject_id`、`dl_cnt`、`dl_cnt_b`、`dl_cnt_c`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `res_id` | `INT` | 资料id | ddl |
| `stage_id` | `INT` | 学段ID | ddl |
| `subject_id` | `INT` | 学科ID | ddl |
| `commercial_level_extend_name` | `STRING` | 商业级别-扩展 | ddl |
| `dl_cnt` | `INT` | 日下载次数 | ddl |
| `dl_cnt_b` | `INT` | B端日下载次数 | ddl |
| `dl_cnt_c` | `INT` | C端日下载次数 | ddl |
| `income_c` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 天分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_zxxk_zxxk_log_consume_log_di`, `dim.dim_cmp_rbm_resource`, `dim.dim_pub_pub_course`, `t1_res`, `stageid_and_subjectid`
- 关联条件：resource.course_id = course.course_id
)

INSERT overwrite TABLE ${bi}.bi_zxxk_pub_flr_res_1d partition(dt)
select
    resource_id,
    stageid_and_subjectid.stage_id as stage_id,
    stageid_and_subjectid.subject_id as subject_id,
    stageid_and_subjectid.commercial_level_extend as commercial_level_extend_name,
    CAST(dl_cnt AS INT) as dl_cnt,
    CAST(dl_cnt_b AS INT) as dl_cnt_b,
    CAST(dl_cnt_c AS INT) as dl_cnt_c,
    CAST(income_c AS DECIMAL(10,2)) as income_c,
    CAST(dl_user_cnt_c AS INT) as dl_user_cnt_c,
    CAST(dl_user_cnt_b AS INT) as dl_user_cnt_b,
    CAST(dl_user_cnt AS INT) as dl_user_cnt,
    CAST(dl_cnt_b_right AS INT) as dl_cnt_b_right,
    CAST(dl_cnt_resprice_free_c AS INT) as dl_cnt_resprice_free_c,
    CAST(dl_cnt_c_fee AS INT) as dl_cnt_c_fee,
    CAST(dl_cnt_c_kaquan AS INT) as dl_cnt_c_kaquan,
    CAST(paid_sum_c_right AS DECIMAL(10,2)) as paid_sum_c_right,
    CAST(paid_sum_b_right AS DECIMAL(10,2)) as paid_sum_b_right,
    CAST(paid_sum_resprice_free_c AS DECIMAL(10,2)) as paid_sum_resprice_free_c,
    CAST(paid_sum_c_fee AS DECIMAL(10,2)) as paid_sum_c_fee,
    CAST(paid_sum_c_kaquan AS DECIMAL(10,2)) as paid_sum_c_kaquan,
    stageid_and_subjectid.course_id as course_id,
    CAST(dl_cnt_c_right AS INT) as dl_cnt_c_right,
    CAST(current_timestamp() AS STRING) dw_update_time,
    dt
from t1_res
left；t1_res.resource_id = stageid_and_subjectid.res_id;
- 过滤条件：dt = '${dt}' and coalesce(a.product,0)<>9 AND resource_type NOT IN (3,5)
- 聚合函数：COUNT(a.id), COUNT(if (down_interface_istob = 1,a.id,null), COUNT(if (down_interface_istob = 0,a.id,null), SUM(case when consume_type in(1,2,5,8), COUNT(DISTINCT if (down_interface_istob = 0,consumer_id,null), COUNT(DISTINCT if (down_interface_istob = 1,consumer_id,null), COUNT(DISTINCT consumer_id), COUNT(if(case when a.consume_type in (8,9), COUNT(if(down_interface_istob = 0 and resource_price = 0, a.id,null), COUNT(if(consume_type in (1,2,3,5,6,520,521,541), COUNT(if(consume_type = 7, a.id,null), SUM(case when consume_type in (1,2,5,6)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 income_c 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
