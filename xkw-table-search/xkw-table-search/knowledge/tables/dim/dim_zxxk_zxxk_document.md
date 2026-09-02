# `dim_zxxk_zxxk_document`

- 层级：`dim`
- 本地表描述：资料id
- 主题标签：other
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`course_id`、`school_id`、`type_id`、`scenario_id`、`province_id`、`area_ids`、`exam_area_id`、`school_level_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 资料id | ddl |
| `operation_tags` | `INT` | 运营标签，学科网应用端为资料打运营属性标签时使用，如：是否B端免费，二进制转十进制后存储，后期支持扩展同时打多个标签，如：同时打2个标签11，转十进制后为3存储进当前字段,详情请咨询研一 | ddl |
| `title` | `STRING` | 未提供字段注释 | ddl |
| `course_id` | `INT` | 课程id | ddl |
| `school_id` | `INT` | 学校id | ddl |
| `type_id` | `STRING` | 类型id | ddl |
| `scenario_id` | `STRING` | 应用场景 | ddl |
| `promotion_tags` | `STRING` | 推广标签，可以多个，以逗号分割 | ddl |
| `term` | `STRING` | 学期 | ddl |
| `province_id` | `STRING` | 省 | ddl |
| `area_ids` | `STRING` | 地区集合 | ddl |
| `exam_area_id` | `INT` | 考区 | ddl |
| `paper_media` | `STRING` | 试卷类型 | ddl |
| `paper_answer` | `INT` | 试卷是否有答案 | ddl |
| `paper_exp` | `INT` | 试卷是否有解析 | ddl |
| `school_level_id` | `STRING` | 学校等级 | ddl |
| `commercial_level` | `STRING` | 商业等级 | ddl |
| `price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite, OVERWRITE
- 上游表：`ods.ods_zxxk_zxxk_xkw_resource_tbl_document`, `ods.ods_zxxk_zxxk_hit_tbl_document_download`, `ods.ods_zxxk_zxxk_xkw_resource_tbl_document_operation`, `ods.ods_zxxk_zxxk_hit_tbl_document_pv`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 price 缺少注释
- 字段 title 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
