# `dim_yx_yx_train_course`

- 层级：`dim`
- 本地表描述：主键
- 主题标签：other
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`type_course_category_id`、`tag_course_category_id`、`grade_id`、`subject_id`、`publish_status`、`recommend_status`、`recommend_num`、`top_status`、`pay_type`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 主键 | ddl |
| `type_course_category_id` | `BIGINT` | 课程类别Id（分类） | ddl |
| `tag_course_category_id` | `BIGINT` | 课程类别Id（标签） | ddl |
| `grade_id` | `BIGINT` | 年级Id | ddl |
| `subject_id` | `BIGINT` | 学科Id | ddl |
| `name` | `STRING` | 标题（名称） | ddl |
| `second_name` | `STRING` | 副标题 | ddl |
| `publish_status` | `INT` | 发布状态： 1. 发布 2.不发布 | ddl |
| `recommend_status` | `INT` | 推荐状态： 1推荐 2：不推荐 | ddl |
| `recommend_num` | `INT` | 推荐顺序 | ddl |
| `top_status` | `INT` | 置顶状态 | ddl |
| `pay_type` | `INT` | 支付类型： 1. 免费观看 2. 会员免费观看  3.支付观看 | ddl |
| `price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE, overwrite
- 上游表：`ods.ods_yx_yx_hwk_teacher_train_tbl_train_course`, `ods.ods_yx_yx_hwk_teacher_train_tbl_train_course_category`, `ods.ods_yx_yx_hwk_teacher_train_tbl_train_course_video_info`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
