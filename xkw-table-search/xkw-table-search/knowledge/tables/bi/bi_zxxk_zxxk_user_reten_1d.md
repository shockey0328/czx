# `bi_zxxk_zxxk_user_reten_1d`

- 层级：`bi`
- 本地表描述：日期：天
- 主题标签：user
- 数据粒度：按 dt,application_name 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `dt` | `STRING` | 日期：天 | ddl |
| `application_name` | `STRING` | 终端：PC站,M站,全部 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`bi.bi_zxxk_zxxk_user_action_1d`, `t1`, `t2`, `bi.bi_zxxk_zxxk_user_reten_1d`
- 过滤条件：a.dt>=date_add('${dt}',-31) and a.dt<='${dt}'；a.dt >= date_add('${dt}',-31) and a.dt <= '${dt}'；a.dt >= substring(cast(add_months(date_add('${dt}',-31),-12) as string), 1, 10) and a.dt <= substring(cast(add_months('${dt}',-12) as string), 1, 10)；a.dt >= substring(cast(add_months(date_add('${dt}',-31),-24) as string), 1, 10) and a.dt <= substring(cast(add_months('${dt}',-24) as string), 1, 10) ) w；dt < date_add('${dt}',-31)
- 聚合函数：COUNT(DISTINCT IF (user_reg_date = dt
                                  and dateDiff(IF (user_next_active_date = ''
                                                       or user_next_active_date is null, '9999-12-31', user_next_active_date), COUNT(distinct IF(user_reg_date = dt, user_id, NULL), COUNT(DISTINCT IF (user_reg_date = cast(dt as String), COUNT(DISTINCT IF(from_tbl >= 100
                                     and is_tob = 0, user_id, null), COUNT(DISTINCT IF (from_tbl >= 100
                                      and is_tob = 0
                                      and dateDiff(IF (user_next_active_date = ''
                                                           or user_next_active_date is null, '9999-12-31', user_next_active_date), COUNT(DISTINCT IF(from_tbl >= 100
                                                                                                                                                                                       and is_tob = 0, user_id, null), COUNT(DISTINCT IF (from_tbl >= 100
                                  and is_tob = 0
                                  and dateDiff(IF (user_next_active_date = ''
                                                       or user_next_active_date is null, '9999-12-31', user_next_active_date), COUNT(DISTINCT IF(from_tbl >= 100
                                                                                                                                                                                      and is_tob = 0, user_id, null), MAX(case when flag=1 then 7day_reguser_reten_cnt end), MAX(case when flag=2 then 7day_reguser_reten_cnt end), MAX(case when flag=3 then 7day_reguser_reten_cnt end), MAX(case when flag=1 then 7day_reguser_retenrate end)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 未匹配到 INSERT SQL，来源与指标逻辑待补充
