# `dwd_dmp_cloud_cont_cp_spider_df`

- 层级：`dwd`
- 本地表描述：站点id
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`site_id`、`res_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `site_id` | `STRING` | 站点id | ddl |
| `res_id` | `STRING` | 资料id | ddl |
| `res_price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_pub_pub_cloud_tbl_cp`, `dim.dim_pub_pub_subject_cloud`, `dim.dim_pub_pub_stage`, `dim.dim_pub_pub_grade_cloud`, `dim.dim_pub_pub_area_cloud`, `dim.dim_pub_pub_res_type_cloud`, `dim.dim_cmp_rbm_resource`, `dim.dim_pub_pub_course`, `dwd.dwd_dmp_cloud_cont_cp_spider_df`
- 关联条件：d1.res_subject = d2.subject_name
               left；d1.res_grade = d3.stage_name
               left；d1.res_class = d4.grade_name
               left；d1.res_province = d5.area_name
               left；d1.res_type = d6.res_type_cloud；d1.course_id = d2.course_id
- 过滤条件：d1.site_id != 'zxxk'；substr(d1.publish_time,1,10)>='${dt}' and substr(d1.publish_time,1,10) < date_add('${dt}', 1)；substr(res_publish_time,1,10) < '${dt}' and site_id = 'zxxk' ) t1

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 res_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
