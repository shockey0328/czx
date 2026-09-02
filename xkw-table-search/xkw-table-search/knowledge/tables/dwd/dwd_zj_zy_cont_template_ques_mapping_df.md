# `dwd_zj_zy_cont_template_ques_mapping_df`

- 层级：`dwd`
- 本地表描述：自增id
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`source_type`、`qbm_id`、`ques_id`、`sub_ques_id`、`num`、`template_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 自增id | ddl |
| `source_type` | `STRING` | TEACHING-教辅，SELFSELECT-自选试题 | ddl |
| `source` | `STRING` | 教辅节点id或选题雪花id | ddl |
| `qbm_id` | `STRING` | 试题的QBMid | ddl |
| `ques_id` | `INT` | 试题id | ddl |
| `sub_ques_id` | `INT` | 小题号 | ddl |
| `num` | `INT` | 小题在答题卡模板中的序号 | ddl |
| `scene` | `INT` | 阅卷场景，3-网络，4-有痕 | ddl |
| `template_id` | `STRING` | 阅卷答题卡模板id | ddl |
| `score` | `DECIMAL(5,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_zj_zy_app_home_work_tbl_template_ques_mapping`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 score 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
