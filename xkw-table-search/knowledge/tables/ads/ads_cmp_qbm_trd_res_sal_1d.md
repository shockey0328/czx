# `ads_cmp_qbm_trd_res_sal_1d`

- 层级：`ads`
- 本地表描述：唯一ID
- 主题标签：content_resource, transaction_payment
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`sal_id`、`user_id`、`user_name`、`course_id`、`sal_type`、`sal_amount`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `sal_id` | `INT` | 唯一ID | ddl |
| `user_id` | `BIGINT` | 用户ID | ddl |
| `user_name` | `STRING` | 用户名 | ddl |
| `course_id` | `INT` | 课程ID | ddl |
| `sal_type` | `STRING` | 账单明细的类型，比如拆解岗收入，解析岗收入，奖金，罚款等 | ddl |
| `sal_amount` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | create_time日期 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_cmp_qbm_trd_res_sal_di`
- 过滤条件：dt > DATEADD(date('${dt}'),-10,'dd') ;

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 sal_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
