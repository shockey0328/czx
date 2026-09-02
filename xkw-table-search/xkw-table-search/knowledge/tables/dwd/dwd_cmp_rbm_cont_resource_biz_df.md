# `dwd_cmp_rbm_cont_resource_biz_df`

- 层级：`dwd`
- 本地表描述：资源ID
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`resource_id`、`course_id`、`type_id`、`catalog_ids`、`textbook_id`、`version_id`、`kpoint_ids`、`school_id`、`provider_school_id`、`exam_area_id`、`school_level_id`、`area_ids`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `resource_id` | `INT` | 资源ID | ddl |
| `course_id` | `INT` | 课程ID | ddl |
| `type_id` | `STRING` | 资源类型 | ddl |
| `catalog_ids` | `STRING` | 章节ID | ddl |
| `textbook_id` | `INT` | 教材ID | ddl |
| `version_id` | `INT` | 教材版本ID | ddl |
| `kpoint_ids` | `STRING` | 支持多个知识点，可以用逗号拼接 | ddl |
| `applicable_month` | `INT` | 适用月份 | ddl |
| `school_id` | `INT` | 学校编号 | ddl |
| `provider_school_id` | `INT` | 提供学校（商业等级是特供时有效） | ddl |
| `exam_area_id` | `INT` | 考区 | ddl |
| `school_level_id` | `STRING` | 学校级别，关联tags表 | ddl |
| `term` | `STRING` | 1=上学期，2=下学期 | ddl |
| `area_ids` | `STRING` | 城市编号或者区县编号。 | ddl |
| `paper_media` | `STRING` | 试卷媒介，关联tags表 | ddl |
| `paper_answer` | `INT` | 试卷是否有答案 | ddl |
| `paper_exp` | `INT` | 试卷是否有解析 | ddl |
| `promotion_tags` | `STRING` | 推广标签，可以多个，以逗号分割 | ddl |
| `file_count` | `INT` | 包含文件数量 | ddl |
| `main_file_count` | `INT` | 主文件数量 | ddl |
| `file_size` | `INT` | 文件总大小，以KB为单位 | ddl |
| `kickback_percent` | `INT` | 储值回扣百分比，存储整数，80=80% | ddl |
| `kickback_years` | `INT` | 回扣年数 | ddl |
| `price_mode` | `STRING` | 精品资料的合作模式（2601 收益分成，2602 保底+奖励，2603 一次性买断） | ddl |
| `buyout_price` | `DECIMAL(10,0` | 未提供字段注释 | ddl |
| `has_material` | `INT` | 是否有素材（0：无素材，1=有素材） | alter |
| `has_abstract` | `INT` | 是否有摘要（0：无摘要，1=有摘要） | alter |
| `has_outline` | `INT` | 是否有大纲（0：无大纲，1=有大纲） | alter |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_cmp_rbm_rbm_tbl_resource_biz`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 buyout_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
