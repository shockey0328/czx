# `ads_zxxk_zxxk_user_dl_stats_1d`

- 层级：`ads`
- 本地表描述：学校id
- 主题标签：user, log_behavior
- 数据粒度：按 ssm_school_id, user_id, stage_id, subject_id, resource_type_id, down_interface, dt ; 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`ssm_school_id`、`user_id`、`stage_id`、`subject_id`、`resource_type_id`、`download_cnt`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `ssm_school_id` | `INT` | 学校id | ddl |
| `user_id` | `INT` | 用户id | ddl |
| `stage_id` | `INT` | 学段id | ddl |
| `subject_id` | `INT` | 学科id | ddl |
| `resource_type_id` | `INT` | 资源类型 | ddl |
| `download_cnt` | `INT` | 下载次数 | ddl |
| `resource_price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 日分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_zxxk_zxxk_log_consume_log_di`, `dim.dim_pub_pub_course`, `dim.dim_cmp_rbm_resource`, `t1`
- 关联条件：a.course_id=c.course_id
             left；a.resource_id=d1.res_id
- 过滤条件：a.dt = '${dt}' and coalesce(a.resource_type,0)<>3；a.dt = '${dt}' and a.down_permission_istob = 1 and a.ssm_school_id is not null
- 聚合函数：SUM(cast((unix_timestamp(a.consume_time), SUM(case when a.consume_time<a.resource_publish_time
                       then cast((unix_timestamp(a.consume_time), COUNT(case when a.consume_time<a.resource_publish_time then a.id end), COUNT(a.id), SUM(a.resource_price), SUM(a.consume_price), SUM(coalesce(download_count,0)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 resource_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
