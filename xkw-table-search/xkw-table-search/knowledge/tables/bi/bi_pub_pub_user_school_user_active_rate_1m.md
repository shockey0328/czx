# `bi_pub_pub_user_school_user_active_rate_1m`

- 层级：`bi`
- 本地表描述：月份
- 主题标签：user, device_school
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`month_dt`、`user_active_rate`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `month_dt` | `STRING` | 月份 | ddl |
| `user_active_rate` | `DECIMAL(10,5` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dmp_ads.bi_pub_pub_user_active_school_user_1d`, `dmp_ads.bi_pub_pub_user_grant_school_user_1d`, `bi.bi_pub_pub_user_school_user_active_rate_1m`, `t1`, `t2`
- 关联条件：a.flag=b.flag
;
- 过滤条件：mth>='2000-01' and dt >= concat(substr('${dt}',1,7),'-01') AND dt <= '${dt}' ), t2 as (select 1 flag, count(distinct user_id) total_users, count(DISTINCT school_id) total_schools from dmp_ads.bi_pub_pub_user_grant_school_user_1d where start_date <= '${dt}' AND end_date >= concat(substr('${dt}',1,7),'-01') )；month_dt != concat(substr('${dt}',1,7),'-01')
- 聚合函数：COUNT(DISTINCT user_id), COUNT(DISTINCT school_id), COUNT(distinct user_id)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 user_active_rate 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
