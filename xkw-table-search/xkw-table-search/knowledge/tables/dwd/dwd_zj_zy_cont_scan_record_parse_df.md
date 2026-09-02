# `dwd_zj_zy_cont_scan_record_parse_df`

- 层级：`dwd`
- 本地表描述：自增主键
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`home_work_id`、`scan_record_id`、`source_id`、`sub_source_id`、`recognition_type`、`item_type`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 自增主键 | ddl |
| `home_work_id` | `BIGINT` | 作业ID | ddl |
| `scan_record_id` | `BIGINT` | 扫描记录ID | ddl |
| `source_id` | `BIGINT` | 应用端来源ID,用于保存试题ID | ddl |
| `sub_source_id` | `INT` | 用于保存小题ID | ddl |
| `knowledge_points` | `STRING` | 包含的知识点，多个知识点逗号分隔 | ddl |
| `recognition_type` | `STRING` | 识别类型，手写，填涂 | ddl |
| `item_type` | `STRING` | 识别项类型，学号、姓名、选择题、填空题 | ddl |
| `position` | `STRING` | 识别区域 | ddl |
| `content_pic_path` | `STRING` | 识别项图路径 | ddl |
| `score` | `decimal(5, 2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_zj_zy_app_home_work_tbl_scan_record_parse`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 score 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
