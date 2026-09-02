# `ads_zj_user_downloadques_stat_di`

- 层级：`ads`
- 本地表描述：用户id
- 主题标签：user, log_behavior
- 数据粒度：按 dt ,user_id ) ,downloadques_cnt_30d AS ( SELECT dt ,user_id ,COUNT(zj_ques_id) AS downloadques_cnt FROM ${dwd}.dwd_zj_zj_log_userdownloadques_di WHERE dt > TO_DATE(DATE_SUB('${dt}',30)) AND dt <= '${dt}' GROUP BY dt ,user_id ) ,day_cnt_7d_1000 AS ( SELECT user_id ,COUNT(dt) AS day_cnt_7d_1000 FROM downloadques_cnt_7d WHERE downloadques_cnt >= 1000 GROUP BY user_id ) ,day_cnt_7d_800 AS ( SELECT user_id ,COUNT(dt) AS day_cnt_7d_800 FROM downloadques_cnt_7d WHERE downloadques_cnt >= 800 GROUP BY user_id ) ,day_cnt_30d_1000 AS ( SELECT user_id ,COUNT(dt) AS day_cnt_30d_1000 FROM downloadques_cnt_30d WHERE downloadques_cnt >= 1000 GROUP BY user_id ) ,day_cnt_30d_800 AS ( SELECT user_id ,COUNT(dt) AS day_cnt_30d_800 FROM downloadques_cnt_30d WHERE downloadques_cnt >= 800 GROUP BY user_id ) ,dl_cnt_7d_avg AS ( SELECT user_id ,SUM(downloadques_cnt) / 7 AS dl_cnt_7d_avg FROM downloadques_cnt_7d GROUP BY user_id ) ,all_users AS ( SELECT user_id FROM dl_cnt_7d_avg 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`user_id`、`dl_cnt_7d_avg`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `user_id` | `INT` | 用户id | ddl |
| `dl_cnt_7d_avg` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 天分区-统计日期 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dwd.dwd_zj_zj_log_userdownloadques_di`, `downloadques_cnt_7d`, `downloadques_cnt_30d`, `dl_cnt_7d_avg`, `day_cnt_30d_800`, `all_users`, `day_cnt_7d_1000`, `day_cnt_7d_800`, `day_cnt_30d_1000`
- 关联条件：a.user_id = f.user_id
LEFT；a.user_id = b.user_id
LEFT；a.user_id = c.user_id
LEFT；a.user_id = d.user_id
LEFT；a.user_id = e.user_id
;
- 过滤条件：dt > TO_DATE(DATE_SUB('${dt}',7)) AND dt <= '${dt}'；dt > TO_DATE(DATE_SUB('${dt}',30)) AND dt <= '${dt}'；downloadques_cnt >= 1000；downloadques_cnt >= 800
- 聚合函数：COUNT(zj_ques_id), COUNT(dt), SUM(downloadques_cnt)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 dl_cnt_7d_avg 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
