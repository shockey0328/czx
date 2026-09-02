# `dim_cmp_qbm_question`

- 层级：`dim`
- 本地表描述：主键ID
- 主题标签：content_resource, exam_question
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`question_id`、`source_id`、`create_date`、`trick_ids`、`type_feature_ids`、`scene_ids`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `question_id` | `STRING` | 主键ID | ddl |
| `source_id` | `STRING` | 来源 | ddl |
| `source_name` | `STRING` | 来源名称 | ddl |
| `merge_to` | `STRING` | 合并题ID | ddl |
| `ques_year` | `INT` | 年份 | ddl |
| `multi_explanation` | `INT` | 是否多解 | ddl |
| `create_date` | `STRING` | 创建时间 | ddl |
| `born_with_exp` | `INT` | 原题带解析 | ddl |
| `media` | `INT` | 试题中是否有多媒体内容，0没有，1有音频，2有视频，3都有 | ddl |
| `born_without_answer` | `INT` | 表示试题是否在入库时没有答案，解析收入结算时会用到 | ddl |
| `difficulty` | `DECIMAL(20,16` | 未提供字段注释 | ddl |
| `fresh_score` | `INT` | 试题新鲜度:值从0-100，0表示完全新题（库里没有和它相似的题），100表示绝对不是新题（库里有很多和它相似的题） | alter |
| `en_words` | `STRING` | 所选取单词含义的Json数组，id:单词的id， meaningIds：选取的单词含义，json格式如下： [{ "id": 1, "word":"hello", "meaningIds": [1, 2, 3] }, {"id": 2, "word":"world", "meaningIds": [4, 5, 6] }] | alter |
| `trick_ids` | `string` | 多个方法id，逗号拼接。 | alter |
| `type_feature_ids` | `string` | 题型特征,多值用逗号分隔 | alter |
| `scene_ids` | `string` | 试题打标的适用场景ID集合 | alter |

## ETL 与查询提示

- 写入方式：OVERWRITE, overwrite
- 上游表：`ods.ods_cmp_qbm_qbm_tbl_questions`, `ods.ods_cmp_qbm_qbm_tbl_question_biz`, `ods.ods_cmp_qbm_qbm_tbl_question_tricks`, `ods.ods_cmp_qbm_qbm_tbl_question_aigc_policies`, `dim.dim_cmp_qbm_question_catalogs`, `dim.dim_cmp_mdm_textbook_catalog`, `dim.dim_cmp_pub_textbooks`, `ods.ods_cmp_qbm_qbm_tbl_question_catalogs`, `ods.ods_cmp_qbm_qbm_tbl_question_diff`, `ods.ods_cmp_qbm_qbm_tbl_question_kpoints`, `dim.dim_cmp_qbm_question_kpoints`, `ods.ods_cmp_qbm_qbm_tbl_question_sub_diff`, `ods.ods_cmp_qbm_qbm_tbl_question_tag`, `ods.ods_cmp_qbm_qbm_tbl_question_types`
- 关联条件：a.id = b.questionid
LEFT；a.id = c.questionid
;

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 difficulty 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
