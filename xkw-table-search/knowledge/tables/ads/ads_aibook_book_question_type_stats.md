# `ads_aibook_book_question_type_stats`

- 层级：`ads`
- 本地表描述：书籍ID
- 主题标签：content_resource, log_behavior, exam_question
- 数据粒度：按 t.book_id ,t.id ,t.name ) 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`book_id`、`type_id`、`type_name`、`type_ratio`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `book_id` | `BIGINT` | 书籍ID | ddl |
| `type_id` | `STRING` | 题型ID | ddl |
| `type_name` | `STRING` | 题型名称 | ddl |
| `question_count` | `BIGINT` | 试题数 | ddl |
| `book_question_count` | `BIGINT` | 本书试题总数 | ddl |
| `type_ratio` | `DECIMAL(16,4` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dim.dim_zxxk_aibook_book_qbm`, `dim.dim_cmp_qbm_book_catalog`, `dim.dim_cmp_qbm_question`, `t0`, `dim.dim_cmp_qbm_question_type`, `t1`, `t2`, `t4`, `t3`
- 关联条件：t1.qbm_id = t2.book_id
                LEFT；t2.paper_id = t3.paper_id；t2.paper_id = t3.paper_id
                LEFT；t3.merge_to = t4.question_id；t0.type_id = t4.id；t4.parent_id = t5.id；t1.qbm_id = t2.book_id
    LEFT；t4.book_id = t3.book_id
;
- 过滤条件：t3.ques_status = 'P4'；t3.ques_status = 'P0' ) AS t ) ,t1 AS ( SELECT t0.book_id ,t4.id ,t4.name ,COUNT(DISTINCT t0.question_id) AS question_count FROM t0 LEFT JOIN ${dim}.dim_cmp_qbm_question_type AS t4 ON t0.type_id = t4.id WHERE t4.parent_id = '0'；parent_id <> '0' ) AS t4 ON t0.type_id = t4.id LEFT JOIN ${dim}.dim_cmp_qbm_question_type AS t5 ON t4.parent_id = t5.id；t3.ques_status IN ('P0','P4')
- 聚合函数：COUNT(DISTINCT t0.question_id), COUNT(DISTINCT t3.question_id), SUM(t.question_count)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 type_ratio 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
