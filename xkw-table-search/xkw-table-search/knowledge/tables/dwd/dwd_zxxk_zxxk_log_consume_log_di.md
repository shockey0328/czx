# `dwd_zxxk_zxxk_log_consume_log_di`

- 层级：`dwd`
- 本地表描述：主键唯一标识符
- 主题标签：log_behavior
- 数据粒度：按 city_name ) ,courses AS ( SELECT * FROM ${ods}.ods_cmp_mdm_mdm_tbl_courses ) ,stages AS ( SELECT * FROM ${ods}.ods_cmp_mdm_mdm_tbl_stages ) ,subjects AS ( SELECT * FROM ${ods}.ods_cmp_mdm_mdm_tbl_subjects ) ,grades AS ( SELECT * FROM ${ods}.ods_cmp_mdm_mdm_tbl_grades ) ,operator AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_resource_operator WHERE type = 'RESOURCE' ) ,rt AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_resource_timeline ) ,tag AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_tag ) ,resource_biz AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_resource_biz ) 聚合
- 分区字段：dt, application_id
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`resource_id`、`resource_publish_time`、`resource_type`、`dt`、`application_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `int` | 主键唯一标识符 | ddl |
| `order_no` | `string` | 订单号 | ddl |
| `resource_id` | `int` | 资源ID | ddl |
| `resource_title` | `string` | 资源标题 | ddl |
| `resource_publish_time` | `string` | 资料发布时间 | ddl |
| `resource_source` | `string` | rbm资料来源 | ddl |
| `resource_type` | `int` | 资源类型 | ddl |
| `resource_price` | `decimal(8, 2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 天分区 | ddl / 分区 |
| `application_id` | `STRING` | 应用ID | ddl / 分区 |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dim.dim_pub_pub_area`, `ods.ods_cmp_mdm_mdm_tbl_courses`, `ods.ods_cmp_mdm_mdm_tbl_stages`, `ods.ods_cmp_mdm_mdm_tbl_subjects`, `ods.ods_cmp_mdm_mdm_tbl_grades`, `ods.ods_cmp_rbm_rbm_tbl_resource_operator`, `ods.ods_cmp_rbm_rbm_tbl_resource_timeline`, `ods.ods_cmp_rbm_rbm_tbl_tag`, `ods.ods_cmp_rbm_rbm_tbl_resource_biz`, `dmp_ods.ods_zxxk_zxxk_settle_log_tbl_consume_log`, `dmp_ods.ods_cmp_rbm_rbm_tbl_resource`, `dmp_ods.ods_zxxk_zxxk_zxxk_log_tbl_down_interface`, `city_name_temp`, `courses`, `stages`, `subjects`, `grades`, `operator`, `rt`, `resource_biz`, `tag`
- 关联条件：a.resource_id = b.id
                        LEFT；a.consumer_identity = c.value；t1.city_name = t2.city_name
            LEFT；t1.course_id = courses.id
            LEFT；courses.stageid = stages.id
            LEFT；courses.subjectid = subjects.id
            LEFT；t1.grade_id = grades.id
            LEFT；t1.resource_id = operator.resource_id
            LEFT
- 过滤条件：level = 'CITY'；level = 'CITY' ) t；type = 'RESOURCE' ) ,rt AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_resource_timeline ) ,tag AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_tag ) ,resource_biz AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_resource_biz )；a.dt = '${dt}' ) t1 LEFT JOIN city_name_temp t2 ON t1.city_name = t2.city_name LEFT JOIN courses ON t1.course_id = courses.id LEFT JOIN stages ON courses.stageid = stages.id LEFT JOIN subjects ON courses.subjectid = subjects.id LEFT JOIN grades ON t1.grade_id = grades.id LEFT JOIN operator ON t1.resource_id = operator.resource_id LEFT JOIN rt ON t1.resource_id = rt.resource_id LEFT JOIN resource_biz ON t1.resource_id = resource_biz.resource_id LEFT JOIN tag ON resource_biz.exam_scope = tag.id LEFT JOIN tag AS tag2 ON t1.commercial_level = tag2.id ;
- 聚合函数：MIN(area_id)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 resource_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
