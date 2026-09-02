# `ads_zxxk_zxxk_user_user_profile_df`

- 层级：`ads`
- 本地表描述：用户id
- 主题标签：user
- 数据粒度：按 area_id) i on b.zxxk_90d_most_ip_city_id=i.area_id left join ${dim}.dim_pub_pub_stage j on b.zxxk_90d_most_stage_id=j.stage_id left join ${dim}.dim_pub_pub_subject k on b.zxxk_90d_most_subject_id=k.subject_id left join qingxiang_mbr l on a.user_id = l.user_id left join premium_mbr m on a.user_id = m.user_id left join monthly_mbr n on a.user_id = n.user_id left join qingxiang_mbr_expired_days o on a.user_id = o.user_id and o.num = 1 left join spending_after_qingxiang_mbr_expired p on a.user_id = p.user_id left join (select a.id,max(a.name) school_name from dmp_cdm.dim_pub_pub_organization a group by a.id) q on a.user_school_id=q.id left join last_login_time_cte r on a.user_id = r.user_id where substring(a.last_login_time,1,10)>=date_add('${dt}',-730) 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`user_id`、`reg_area`、`reg_time`、`user_account_balance`、`user_school_name`、`last_login_time`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `user_id` | `INT` | 用户id | ddl |
| `reg_area` | `STRING` | 注册地 | ddl |
| `reg_time` | `STRING` | 注册时间 | ddl |
| `zxxk_90d_most_ip_city` | `STRING` | 常用登录地 | ddl |
| `zxxk_90d_most_stage` | `STRING` | 学段 | ddl |
| `zxxk_90d_most_subject` | `STRING` | 学科 | ddl |
| `row_info_b` | `STRING` | b端身份 | ddl |
| `row_info_zxxk_c` | `STRING` | c端身份-学科网 | ddl |
| `user_account_balance` | `DECIMAL(20,2` | 未提供字段注释 | ddl |
| `has_purchased_qingxiang_mbr` | `int` | 是否购买过轻享会员 | alter |
| `has_purchased_gaoji_mbr` | `int` | 是否购买过高级会员 | alter |
| `has_purchased_monthly_mbr` | `int` | 是否购买过包月会员 | alter |
| `qingxiang_mbr_expired_days` | `int` | 轻享会员过期天数。使用时可以结合“是否购买轻享会员”来使用，比如查询当天过期的用户，需要：是否购买过轻享会员=是 且 轻享会员过期天数=0 | alter |
| `spending_after_qingxiang_mbr_expired` | `decimal(10,2` | 未提供字段注释 | alter |
| `profession_name` | `string` | 工作角色 | alter |
| `education_years` | `int` | 教龄 | alter |
| `user_school_name` | `string` | 工作单位 | alter |
| `last_login_time` | `string` | 最后一次登录时间 | alter |
| `dt` | `STRING` | 日分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dws.dws_zxxk_zxxk_user_dl_stats_1d_di`, `dws.dws_zxxk_zxxk_user_res_pv_1d_di`, `t1`, `t2`, `t3`, `dwd.dwd_ump_uc_user_user_role_df`, `dim.dim_pub_pub_ssm_product`, `dim.dim_pub_pub_user`, `dwd.dwd_zxxk_zxxk_mbr_b_monthlyproduct_df`, `dwd.dwd_zxxk_zxxk_mbr_b_plusproduct_df`, `dwd.dwd_zxxk_zxxk_mbr_member_benefit_record_df`, `dwd.dwd_ump_pay_trd_trade_wide_di`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `dim.dim_pub_pub_course`, `dwd.dwd_zxxk_zxxk_trd_cl_payment_df`, `dwd.dwd_zxxk_zxxk_trd_b_plusorder_df`, `dwd.dwd_zxxk_zxxk_user_cl_uservoucher_df`, `dwd.dwd_pub_pub_fin_mbr_ord_di`, `mbr_tbl`, `qingxiang_mbr_expired_days`, `ads.ads_zxxk_zxxk_user_user_profile_df`, `dwd.dwd_ump_uc_log_t_userlogin_di`, `login_time`, `max_rlt`, `user_role_b`, `user_role_c`, `mbr_qingxiang_end`, `voucher_qingxiang`, `mbr_gaoji_qingxiang`, `user_dl`, `dim.dim_pub_pub_area`, `dim.dim_pub_pub_stage`, `dim.dim_pub_pub_subject`, `qingxiang_mbr`, `premium_mbr`, `monthly_mbr`, `spending_after_qingxiang_mbr_expired`, `dmp_cdm.dim_pub_pub_organization`, `last_login_time_cte`
- 关联条件：a.role_id=b.role_id；a.course_id=b.course_id；t2.dt>='2010-01-01' and t1.user_id = t2.consumer_id；a.user_id=b.user_id
         left；a.user_id=c.user_id
         left；a.user_id=d.user_id
         left；a.user_id=e.user_id
         left；a.user_id=f.user_id
         left
- 过滤条件：a.dt>=date_sub('${dt}',90) and a.dt<='${dt}'；user_group_id=8 and user_account_balance>0；end_time>'${dt}'；source_type = 1 and end_time>'${dt}' ) qx_mbr JOIN (select * from ${dwd}.dwd_ump_pay_trd_trade_wide_di where dt is not null and app_id in ('app_wxzxxk','app_xkwczx','app_xuebei') and paid_status = 1) charges on if(substr(reverse(charges.app_sub_trade_no),3,1) in ('R','D','P'), substr(charges.app_sub_trade_no,1,instr(charges.app_sub_trade_no,substr(reverse(charges.app_sub_trade_no),3,1)) - 1), charges.app_sub_trade_no) = qx_mbr.order_no ) w；a.dt>=date_sub('${dt}',30) and a.dt<='${dt}' and a.product!=9 and a.resource_type not in (3,5)；dt>=date_sub('${dt}', 30) and dt<='${dt}' and paid_status=1 and app_id in ('app_zxxkcashier','app_wxzxxk') -- 高级会员 app_zxxkcashier 轻享 app_wxzxxk；product=10 -- ios支付 and status=1 and substring (pay_time, 1, 10)>=date_sub('${dt}', 30) and substring (pay_time, 1, 10)<='${dt}'；product=10 -- ios支付 and product_type=4 -- 轻享会员 and pay_status=1 and substring (pay_time, 1, 10)>=date_sub('${dt}', 30) and substring (pay_time, 1, 10)<='${dt}'
- 聚合函数：SUM(download_cnt), SUM(res_view_cnt), SUM(total_cnt), COUNT(case when resource_price=0 and dt>date_sub('${dt}',3), COUNT(case when resource_price=0 and dt>date_sub('${dt}',7), COUNT(case when resource_price=0 and dt>date_sub('${dt}',30), COUNT(case when resource_price>0 and dt>date_sub('${dt}',3), COUNT(case when resource_price>0 and dt>date_sub('${dt}',7), COUNT(case when resource_price>0 and dt>date_sub('${dt}',30), COUNT(case when consume_type in (1,2,3,5,6,541,520,521), SUM(case when consume_type in (1,2,3,5,6,541,520,521), COUNT(distinct case when down_interface_istob=0 and dt>date_sub('${dt}',3)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 spending_after_qingxiang_mbr_expired 缺少注释
- 字段 user_account_balance 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
