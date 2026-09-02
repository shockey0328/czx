# `dim_zxxk_ccm_creator`

- 层级：`dim`
- 本地表描述：自增ID
- 主题标签：other
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`creator_id`、`user_type`、`province_id`、`city_id`、`county_id`、`stage_ids`、`subject_ids`、`course_ids`、`org_type_ids`、`org_type_tags`、`studio_level_ids`、`tag_ids`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 自增ID | ddl |
| `creator_id` | `BIGINT` | 创作者用户ID | ddl |
| `creator_name` | `STRING` | 创作者名称 | ddl |
| `user_type` | `BIGINT` | 作者类型 0个人 1组织 | ddl |
| `province_id` | `STRING` | 省（基础数据） | ddl |
| `city_id` | `STRING` | 市（基础数据） | ddl |
| `county_id` | `STRING` | 区县（基础数据） | ddl |
| `stage_ids` | `STRING` | 学段集合，用逗号分割 | ddl |
| `subject_ids` | `STRING` | 学科集合，使用逗号分割 | ddl |
| `course_ids` | `STRING` | 课程 | ddl |
| `org_type_ids` | `STRING` | 组织类型集合，用逗号分割 | ddl |
| `org_type_tags` | `STRING` | 组织标签集合，用逗号分割 | ddl |
| `studio_level_ids` | `STRING` | 工作室级别(1=省级官方，2=市级官方，3=县级官方，4=校级，5=教师自发，6=机构，7=国家级，8=非官方) | ddl |
| `tag_ids` | `STRING` | 标签ids | ddl |
| `income` | `DECIMAL(38,18` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zxxk_zxxk_ccm_tbl_creator`, `ods.ods_zxxk_zxxk_ccm_tbl_creator_type`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 income 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
