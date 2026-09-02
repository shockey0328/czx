# `dim_cmp_rbm_resource_timeline`

- 层级：`dim`
- 本地表描述：资料编号，主键，同zxxk.cl_soft表softid关联
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`resource_id`、`course_id`、`first_p1_end_time`、`first_p2_end_time`、`audit_times`、`reward_provider`、`reward_provider_amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `resource_id` | `BIGINT` | 资料编号，主键，同zxxk.cl_soft表softid关联 | ddl |
| `course_id` | `INT` | 课程id | ddl |
| `first_p1_end_time` | `STRING` | 首待审时间 yyyy-MM-dd HH:mm:ss.SSS | ddl |
| `first_p2_end_time` | `STRING` | 首次审核结束时间 yyyy-MM-dd HH:mm:ss.SSS | ddl |
| `first_p2_duration` | `INT` | 审核时长(分钟），据此发放站长奖励 | ddl |
| `last_auditor` | `STRING` | 审核人 | ddl |
| `audit_times` | `INT` | 审核次数，从1开始 | ddl |
| `reward_provider` | `STRING` | 资料审核通过奖励的提供者 | ddl |
| `reward_provider_amount` | `DECIMAL(16,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_cmp_rbm_rbm_tbl_resource_timeline`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 reward_provider_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
