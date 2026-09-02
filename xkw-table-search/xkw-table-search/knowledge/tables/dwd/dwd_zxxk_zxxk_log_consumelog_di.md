# `dwd_zxxk_zxxk_log_consumelog_di`

- 层级：`dwd`
- 本地表描述：主键id
- 主题标签：log_behavior
- 数据粒度：按 city_name ) ,courses AS ( SELECT * FROM ${ods}.ods_cmp_mdm_mdm_tbl_courses ) ,stages AS ( SELECT * FROM ${ods}.ods_cmp_mdm_mdm_tbl_stages ) ,subjects AS ( SELECT * FROM ${ods}.ods_cmp_mdm_mdm_tbl_subjects ) ,grades AS ( SELECT * FROM ${ods}.ods_cmp_mdm_mdm_tbl_grades ) ,operator AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_resource_operator WHERE type='RESOURCE' ) ,rt AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_resource_timeline ) ,tag AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_tag ) ,resource_biz AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_resource_biz ) 聚合
- 分区字段：dt, application_id
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`user_id`、`resource_id`、`resource_type_id`、`course_id`、`user_org_id`、`download_time`、`stage_id`、`grade_id`、`provider`、`provider_id`、`uploader_id`、`ch_status`、`dt`、`application_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 主键id | ddl |
| `user_id` | `INT` | 用户id | ddl |
| `resource_id` | `INT` | rbm资料id | ddl |
| `resource_type_id` | `INT` | rbm资料类型id | ddl |
| `course_id` | `INT` | 课程id | ddl |
| `user_org_id` | `INT` | 用户所属的学校id | ddl |
| `download_time` | `STRING` | 下载时间 | ddl |
| `resource_price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `subject_name` | `string` | 学科名称 | alter |
| `stage_id` | `int` | 学段id | alter |
| `stage_name` | `string` | 学段名称 | alter |
| `course_name` | `string` | 课程名称 | alter |
| `grade_id` | `int` | 年级ID | alter |
| `grade_name` | `string` | 年级名称 | alter |
| `commercial` | `string` | 商业等级：普通，精品，特供 | alter |
| `provider` | `string` | 提供者 | alter |
| `provider_id` | `bigint` | 提供者ID | alter |
| `uploader` | `string` | 上传人 | alter |
| `uploader_id` | `bigint` | 上传人ID | alter |
| `last_auditor` | `string` | 审核人 | alter |
| `exam_scope_name` | `string` | 考试范围名称 | alter |
| `ch_status` | `string` | 状态名称，P0_1:退稿，P0_2:废除 | alter |
| `dt` | `STRING` | 天分区 | ddl / 分区 |
| `application_id` | `STRING` | 应用ID | ddl / 分区 |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dim.dim_pub_pub_area`, `ods.ods_cmp_mdm_mdm_tbl_courses`, `ods.ods_cmp_mdm_mdm_tbl_stages`, `ods.ods_cmp_mdm_mdm_tbl_subjects`, `ods.ods_cmp_mdm_mdm_tbl_grades`, `ods.ods_cmp_rbm_rbm_tbl_resource_operator`, `ods.ods_cmp_rbm_rbm_tbl_resource_timeline`, `ods.ods_cmp_rbm_rbm_tbl_tag`, `ods.ods_cmp_rbm_rbm_tbl_resource_biz`, `ods.ods_zxxk_zxxk_zxxk_log_tbl_cl_consumelog_delta`, `ods.ods_cmp_rbm_rbm_tbl_resource`, `ods.ods_zxxk_zxxk_zxxk_log_tbl_down_interface`, `city_name_temp`, `courses`, `stages`, `subjects`, `grades`, `operator`, `rt`, `resource_biz`, `tag`
- 关联条件：a.infoid = b.id
            LEFT；a.downinterface = c.value；t1.city_name = t2.city_name
LEFT；t1.course_id = courses.id
LEFT；courses.stageid = stages.id
LEFT；courses.subjectid = subjects.id
LEFT；t1.grade_id = grades.id
LEFT；t1.resource_id = operator.resource_id
LEFT
- 过滤条件：level = 'CITY'；level = 'CITY' ) t；type='RESOURCE' ) ,rt AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_resource_timeline ) ,tag AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_tag ) ,resource_biz AS ( SELECT * FROM ${ods}.ods_cmp_rbm_rbm_tbl_resource_biz )；a.dt = '${dt}' ) t1 LEFT JOIN city_name_temp t2 ON t1.city_name = t2.city_name LEFT JOIN courses ON t1.course_id = courses.id LEFT JOIN stages ON courses.stageid = stages.id LEFT JOIN subjects ON courses.subjectid = subjects.id LEFT JOIN grades ON t1.grade_id = grades.id LEFT JOIN operator ON t1.resource_id = operator.resource_id LEFT JOIN rt ON t1.resource_id = rt.resource_id LEFT JOIN resource_biz ON t1.resource_id = resource_biz.resource_id LEFT JOIN tag ON resource_biz.exam_scope = tag.id LEFT JOIN tag AS tag2 ON t1.commercial_level = tag2.id ;
- 聚合函数：MIN(area_id)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 resource_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
