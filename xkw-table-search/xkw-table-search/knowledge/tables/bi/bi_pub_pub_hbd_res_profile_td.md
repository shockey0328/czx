# `bi_pub_pub_hbd_res_profile_td`

- 层级：`bi`
- 本地表描述：资料id
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`res_id`、`course_id`、`stage_id`、`subject_id`、`commercial_level_id`、`source_application_id`、`provider_id`、`provider_first_upload_time`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `res_id` | `INT` | 资料id | ddl |
| `course_id` | `INT` | 课程id | ddl |
| `stage_id` | `INT` | 学段id | ddl |
| `subject_id` | `INT` | 学科id | ddl |
| `commercial_level_id` | `INT` | 商业级别 | ddl |
| `exam_scope` | `STRING` | 考卷类型 | ddl |
| `source_application_id` | `STRING` | 来源 | ddl |
| `provider_id` | `INT` | 提供者 | ddl |
| `provider_first_upload_time` | `STRING` | 提供者首次上传时间 | ddl |
| `res_price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dim.dim_cmp_rbm_resource`, `dws.dws_zxxk_zxxk_log_res_stats_td`, `dim.dim_pub_pub_course`
- 关联条件：d1.res_id = d2.res_id and d2.dt = '${dt}'
left；d1.course_id=d3.course_id

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 res_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
