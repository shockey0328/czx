# `dwd_cmp_mss_cont_blank_block_grading_di`

- 层级：`dwd`
- 本地表描述：自增ID
- 主题标签：content_resource
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `dt` | `STRING` | 日分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.stg_dmp_dti_kafka_tbl_dmp_dti_data_change`, `ods.ods_cmp_mss_mss_tbl_blank_block_grading`, `stgt`
- 过滤条件：dt >= '${dt}' AND addr = '10.111.109.142:3307' AND db = 'mss' AND table = 'blank_block_grading' )；dt IN ( SELECT dt FROM stgt ) ;

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 未匹配到 INSERT SQL，来源与指标逻辑待补充
- 未解析到普通字段
