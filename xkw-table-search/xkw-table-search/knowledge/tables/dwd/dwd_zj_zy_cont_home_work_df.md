# `dwd_zj_zy_cont_home_work_df`

- 层级：`dwd`
- 本地表描述：自增主键
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`class_id`、`user_id`、`ques_num`、`bank_id`、`paper_xml_id`、`sheet_id`、`plain_collect_num`、`real_collect_num`、`read_status`、`create_time`、`last_update_time`、`sheet_num`、`sf_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 自增主键 | ddl |
| `name` | `STRING` | 作业名 | ddl |
| `class_id` | `INT` | 班级ID | ddl |
| `user_id` | `INT` | 布置人ID | ddl |
| `ques_num` | `INT` | 题量 | ddl |
| `bank_id` | `INT` | 学科id | ddl |
| `score` | `INT` | 总分值 | ddl |
| `paper_xml_id` | `INT` | xmlId | ddl |
| `zip_url` | `STRING` | 作业下载压缩包地址 | ddl |
| `pdf_url` | `STRING` | 答题卡pdf地址 | ddl |
| `sheet_html` | `STRING` | 答题卡html文本 | ddl |
| `sheet_metadata` | `STRING` | 答题卡元数据 | ddl |
| `ques_metadata` | `STRING` | 试题原数据-保存题型、知识点等，方便查询 | ddl |
| `class_name` | `STRING` | 班级名称 | ddl |
| `sheet_id` | `INT` | 答题卡id | ddl |
| `plain_collect_num` | `INT` | 计划收取答题卡数量 | ddl |
| `real_collect_num` | `INT` | 实际收取答题卡数量 | ddl |
| `answer_card_style` | `STRING` | 答题卡样式，COMBINE：提卡合一，ALONE：题卡分离 | ddl |
| `terminal` | `STRING` | 布置终端，PC：电脑端；APP：app端 | ddl |
| `read_status` | `STRING` | 读取状态，READ：已读；UNREAD：未读 | ddl |
| `create_time` | `STRING` | 布置时间 | ddl |
| `last_update_time` | `STRING` | 最后更新时间 | ddl |
| `sheet_num` | `INT` | 答题卡总页数 | ddl |
| `sf_id` | `BIGINT` | 雪花ID | ddl |
| `card_html` | `STRING` | 答题卡html文本 | ddl |
| `avg_score` | `decimal(5, 2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_zj_zy_app_home_work_tbl_home_work`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 avg_score 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
