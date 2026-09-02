# `dwd_zj_zy_cont_scan_record_df`

- 层级：`dwd`
- 本地表描述：自增主键
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`home_work_id`、`class_id`、`status`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 自增主键 | ddl |
| `home_work_id` | `BIGINT` | 作业id | ddl |
| `class_id` | `INT` | 班级ID（冗余字段方便统计） | ddl |
| `student_no` | `STRING` | 学号 | ddl |
| `student_name` | `STRING` | 学生名字 | ddl |
| `img_url` | `STRING` | 答题卡图片地址 | ddl |
| `page` | `INT` | 答题卡页号 | ddl |
| `status` | `STRING` | 识别状态，SUCCESS：成功；FAIL：失败 | ddl |
| `gain_score` | `decimal(5, 2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_zj_zy_app_home_work_tbl_scan_record`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 gain_score 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
