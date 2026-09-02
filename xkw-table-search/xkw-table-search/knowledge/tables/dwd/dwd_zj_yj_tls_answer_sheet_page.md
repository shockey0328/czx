# `dwd_zj_yj_tls_answer_sheet_page`

- 层级：`dwd`
- 本地表描述：主键
- 主题标签：other
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`answer_sheet_template_id`、`create_time`、`update_time`、`exam_no_recognition_type`、`second_exam_no_recognition_type`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `STRING` | 主键 | ddl |
| `answer_sheet_template_id` | `STRING` | 关联的模板id | ddl |
| `page_index` | `INT` | 页的索引 | ddl |
| `is_obverse` | `INT` | 是否为正面 | ddl |
| `image_url` | `STRING` | 合成页图片地址 | ddl |
| `source_image_url` | `STRING` | 第三方制卡原始图片 | ddl |
| `recognized_exam_no` | `STRING` | 识别出的学生信息 | ddl |
| `del_flag` | `INT` | 删除标志位 | ddl |
| `create_time` | `STRING` | 创建时间 | ddl |
| `update_time` | `STRING` | 修改时间 | ddl |
| `exam_no_recognition_type` | `INT` | 考号识别类型 | ddl |
| `recognized_second_exam_no` | `STRING` | 第二种学生考号 | ddl |
| `second_exam_no_recognition_type` | `INT` | 第二种考号识别类型 | ddl |
| `angle` | `DECIMAL(18,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zj_yj_marking_exam01_tbl_answer_sheet_page`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 angle 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
