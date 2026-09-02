# `bi_zxxk_zxxk_reg_active_user_reten_1m`

- 层级：`bi`
- 本地表描述：月份
- 主题标签：user
- 数据粒度：按 coalesce(concat(substring(cast(add_months('${dt}', -1) as string), 1, 7), '-01'), ''), case when coalesce(t1.application_id, t2.application_id, t3.application_id, '') = 'pczhan' then 'PC站' when coalesce(t1.application_id, t2.application_id, t3.application_id, '') = 'mzhan' then 'M站' when coalesce(t1.application_id, t2.application_id, t3.application_id, '') = 'androidapp' then '安卓app' when coalesce(t1.application_id, t2.application_id, t3.application_id, '') = 'iosapp' then 'iOSapp' when coalesce(t1.application_id, t2.application_id, t3.application_id, '') = 'weixinxiaochengxu' then '微信小程序' when coalesce(t1.application_id, t2.application_id, t3.application_id, '') = 'app' then 'App' when coalesce(t1.application_id, t2.application_id, t3.application_id, '') = 'other' then '其他' when coalesce(t1.application_id, t2.application_id, t3.application_id, '') = 'quanbu' then '全部' end ) A 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`reg_user_reten_cnt`、`reg_user_reten_cnt_last_1year`、`reg_user_reten_cnt_last_2year`、`reg_user_retenrate`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `mth` | `string` | 月份 | ddl |
| `application_name` | `string` | 终端：PC站,M站,全部 | ddl |
| `reg_user_reten_cnt` | `int` | 注册用户次月留存数 | ddl |
| `reg_user_reten_cnt_last_1year` | `int` | 去年同期：注册用户次月留存数 | ddl |
| `reg_user_reten_cnt_last_2year` | `int` | 前年同期：注册用户次月留存数 | ddl |
| `reg_user_retenrate` | `decimal(20,4` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dim.dim_pub_pub_user`, `dwd.dwd_pub_io_log_xyiolog_di`, `dwd.dwd_pub_io_log_xyiolog_app_di`, `bi.bi_zxxk_zxxk_reg_active_user_reten_1m`, `pre_xyio_log`, `prepre_user_reg`, `prepre_xyio_log`
- 关联条件：t2.user_id = t1.user_id and t2.application_id = t1.application_id and t2.premth = substring(cast(add_months(concat(t1.prepremth, '-01'), 1) as string), 1, 7)
                  full；t2.user_id = t3.user_id and t2.application_id = t3.application_id and t2.premth = substring(cast(add_months(concat(t3.prepremth, '-01'), 1) as string), 1, 7)
- 过滤条件：product_id = 'xuekewang' and ((substring(user_reg_time, 1, 7) = substring(cast(add_months('${dt}', -1) as string), 1, 7)) ----dt的上个月 or (substring(user_reg_time, 1, 7) = substring(cast(add_months('${dt}', -13) as string), 1, 7)) ----dt对应的去年: 的上个月 or (substring(user_reg_time, 1, 7) = substring(cast(add_months('${dt}', -25) as string), 1, 7))) ----dt对应的前年: 的上个月；product_id = 'xuekewang' and ((substring(user_reg_time, 1, 7) = substring(cast(add_months('${dt}', -1) as string), 1, 7)) ----dt的上个月 or (substring(user_reg_time, 1, 7) = substring(cast(add_months('${dt}', -13) as string), 1, 7)) ----dt对应的去年: 的上个月 or (substring(user_reg_time, 1, 7) = substring(cast(add_months('${dt}', -25) as string), 1, 7))) ----dt对应的前年：的上个月 ) A；((substring(dt, 1, 7) = substring(cast(add_months('${dt}', -1) as string), 1, 7)) ----上个月 or (substring(dt, 1, 7) = substring(cast(add_months('${dt}', -13) as string), 1, 7)) ----去年的上个月 or (substring(dt, 1, 7) = substring(cast(add_months('${dt}', -25) as string), 1, 7))) ----前年的上个月 AND product_id = 'xuekewang' AND log_event_type = 'view' AND coalesce(is_spider, false) = false AND user_id <> 0 and user_id is not null；((substring(dt, 1, 7) = substring(cast(add_months('${dt}', -1) as string), 1, 7)) ----上个月 or (substring(dt, 1, 7) = substring(cast(add_months('${dt}', -13) as string), 1, 7)) ----去年的上个月 or (substring(dt, 1, 7) = substring(cast(add_months('${dt}', -25) as string), 1, 7))) ----前年的上个月 AND product_id = 'xuekewang' AND user_id <> 0 and user_id is not null；((substring(dt, 1, 7) = substring(cast(add_months('${dt}', -1) as string), 1, 7)) ----上个月 or (substring(dt, 1, 7) = substring(cast(add_months('${dt}', -13) as string), 1, 7)) ----去年的上个月 or (substring(dt, 1, 7) = substring(cast(add_months('${dt}', -25) as string), 1, 7))) ----前年的上个月 AND product_id = 'xuekewang' AND user_id <> 0 and user_id is not null ) A；((substring(dt, 1, 7) = substring(cast(add_months('${dt}', 0) as string), 1, 7)) ----dt这个个月 or (substring(dt, 1, 7) = substring(cast(add_months('${dt}', -12) as string), 1, 7)) ----去年的dt这个月 or (substring(dt, 1, 7) = substring(cast(add_months('${dt}', -24) as string), 1, 7))) ----前年的dt这个月 AND product_id = 'xuekewang' AND log_event_type = 'view' AND coalesce(is_spider, false) = false AND user_id <> 0 and user_id is not null；((substring(dt, 1, 7) = substring(cast(add_months('${dt}', 0) as string), 1, 7)) ----dt这个月 or (substring(dt, 1, 7) = substring(cast(add_months('${dt}', -12) as string), 1, 7)) ----去年的：dt这个月 or (substring(dt, 1, 7) = substring(cast(add_months('${dt}', -24) as string), 1, 7))) ----前年的：dt这个月 AND product_id = 'xuekewang' AND log_event_type = 'view' AND coalesce(is_spider, false) = false AND user_id <> 0 and user_id is not null；((substring(dt, 1, 7) = substring(cast(add_months('${dt}', 0) as string), 1, 7)) ----dt这个月 or (substring(dt, 1, 7) = substring(cast(add_months('${dt}', -12) as string), 1, 7)) ----去年的：dt这个月 or (substring(dt, 1, 7) = substring(cast(add_months('${dt}', -24) as string), 1, 7))) ----前年的：dt这个月 AND product_id = 'xuekewang' AND user_id <> 0 and user_id is not null
- 聚合函数：COUNT(distinct if(t1.prepremth = substring(cast(add_months('${dt}', -1), COUNT(distinct if(t1.prepremth = substring(cast(add_months('${dt}', -13), COUNT(distinct if(t1.prepremth = substring(cast(add_months('${dt}', -25), COUNT(distinct if(t3.prepremth = substring(cast(add_months('${dt}', -1), COUNT(distinct if(t3.prepremth = substring(cast(add_months('${dt}', -13), COUNT(distinct if(t3.prepremth = substring(cast(add_months('${dt}', -25)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 reg_user_retenrate 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
