# `bi_zxxk_zxxk_user_action_1d`

- 层级：`bi`
- 本地表描述：数仓-更新时间
- 主题标签：user, log_behavior
- 数据粒度：按 dt,application_id,user_id,is_tob,from_tbl,user_next_active_date,c_user_next_active_month ) tmp ), c_user_reten_1 as ( select t1.dt, t1.application_id, t1.user_id, t1.is_tob, t1.from_tbl, t1.user_next_active_date, t1.c_user_next_active_date, nvl(t1.c_user_next_active_month,t2.mth) as c_user_next_active_month from c_user_reten t1 left join (select user_id,application_id,substr(dt,1,7) as mth from c_user_reten group by user_id,application_id,substr(dt,1,7)) t2 on t1.user_id = t2.user_id and substr(cast(add_months(t1.dt,1) as string),1,7) = t2.mth and t1.is_tob = 0 and t1.application_id = t2.application_id and t1.c_user_next_active_month is null ), tmp_results_0 as ( SELECT t0.application_id, t0.user_id, t1.user_reg_date, t0.user_next_active_date, t0.c_user_next_active_date, t0.c_user_next_active_month, t1.view_detail_page_cnt, t1.is_mbr, t1.buy_mbr, t1.paid_amount, t1.paid_cnt, t1.dl_consume_amount, t1.dl_cnt, t0.is_tob, t0.dt, coalesce(t1.from_tbl,t0.from_tbl) as from_tbl FROM c_user_reten_1 t0 left join tmp_old_active_user t1 on t0.user_id = t1.user_id and t0.application_id = t1.application_id and t0.dt = t1.dt and coalesce(t0.is_tob,9999) = coalesce(t1.is_tob,9999) ), tmp_results_1 as ( select coalesce(t0.application_id,t3.application_id,t4.application_id,t5.application_id,lower(t6.application_id)) as application_id, cast(coalesce(t0.user_id,t3.user_id,t4.user_id,t5.user_id,t6.user_id) as int) as user_id, cast(t0.dt as string) as user_reg_date, t0.user_next_active_date as user_next_active_date, t0.c_user_next_active_date as c_user_next_active_date, t0.c_user_next_active_month as c_user_next_active_month, coalesce(t4.toc_user_view_detail_page_uv,t0.view_detail_page_cnt) as view_detail_page_cnt, if(coalesce(t4.toc_rights,t0.is_mbr) = true,true,false) as is_mbr, if(coalesce(t5.toc_user_buy_mbr_uv,t0.buy_mbr) = true ,true,false) as buy_mbr, coalesce(t5.paid_amount,t0.paid_amount) as paid_amount, coalesce(t5.paid_cnt,t0.paid_cnt) as paid_cnt, coalesce(t6.toc_user_dl_amount,t0.dl_consume_amount) as dl_consume_amount, coalesce(t6.dl_cnt,t0.dl_cnt) as dl_cnt, coalesce(t0.dt,t3.dt,t4.dt,t5.dt,t6.dt) as dt, coalesce(t0.is_tob,-2) as is_tob, nvl(t0.from_tbl,0) + nvl(t5.from_tbl,0) + nvl(t6.from_tbl,0) as from_tbl from tmp_results_0 t0 full join (select * from user_reg where dt = '${dt}') t3 on t0.application_id = t3.application_id AND t0.dt = t3.dt and t0.user_id = t3.user_id full join c_active t4 on t0.application_id = t4.application_id AND t0.dt = t4.dt and t0.user_id = t4.user_id full join (select * from trd_paid where dt = '${dt}') t5 on t0.application_id = t5.application_id AND t0.dt = t5.dt and t0.user_id = t5.user_id and t0.is_tob != 1 full join zxxk_dl t6 on t0.application_id = lower(t6.application_id) AND t0.dt = t6.dt and t0.user_id = t6.user_id and t0.is_tob != 1 ), tmp_result_2 as ( select t1.application_id, t1.user_id, cast(t2.dt as string) as user_reg_date, t1.user_next_active_date, t1.c_user_next_active_date, t1.c_user_next_active_month, t1.view_detail_page_cnt, t1.is_mbr, t1.buy_mbr, t1.paid_amount, t1.paid_cnt, t1.dl_consume_amount, t1.dl_cnt, t1.dt, t1.is_tob, t1.from_tbl from ( select application_id, user_id, max(user_reg_date) as user_reg_date, max(user_next_active_date) as user_next_active_date, max(c_user_next_active_date) as c_user_next_active_date, max(c_user_next_active_month) as c_user_next_active_month, max(view_detail_page_cnt) as view_detail_page_cnt, max(is_mbr) as is_mbr, max(buy_mbr) as buy_mbr, max(paid_amount) as paid_amount, max(paid_cnt) as paid_cnt, max(dl_consume_amount) as dl_consume_amount, max(dl_cnt) as dl_cnt, max(from_tbl) as from_tbl, is_tob, dt from tmp_results_1 group by application_id,user_id,is_tob,dt ) t1 left join user_reg t2 on t1.application_id = t2.application_id and t1.user_id = t2.user_id ), tmp_result_3 as ( select application_id, user_id, user_reg_date, user_next_active_date, cast(view_detail_page_cnt as int) as view_detail_page_cnt, is_mbr, buy_mbr, cast(paid_amount as DECIMAL(10,2) ) as paid_amount, cast(paid_cnt as int) as paid_cnt, cast(dl_consume_amount as DECIMAL(10,2)) as dl_consume_amount, cast(dl_cnt as int) as dl_cnt, cast(from_tbl as int) as from_tbl, cast(is_tob as int) as is_tob, c_user_next_active_date, c_user_next_active_month, dt from tmp_result_2 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`application_id`、`user_id`、`user_reg_date`、`user_next_active_date`、`view_detail_page_cnt`、`paid_amount`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `application_id` | `STRING          COMMENT'终端：pczhan,mzhan,app'` | 未提供字段注释 | ddl |
| `user_id` | `BIGINT          COMMENT'用户id'` | 未提供字段注释 | ddl |
| `user_reg_date` | `STRING          COMMENT'用户注册日期'` | 未提供字段注释 | ddl |
| `user_next_active_date` | `STRING          COMMENT'用户不区分B/C端下一次活跃日期,相对于该dt的下一次，只计算dt后62天内数据'` | 未提供字段注释 | ddl |
| `view_detail_page_cnt` | `INT             COMMENT'浏览详情页次数'` | 未提供字段注释 | ddl |
| `is_mbr` | `BOOLEAN         COMMENT'是否是C端会员'` | 未提供字段注释 | ddl |
| `buy_mbr` | `BOOLEAN         COMMENT'是否购买会员'` | 未提供字段注释 | ddl |
| `paid_amount` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 天分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_pub_io_log_xyiolog_di`, `dwd.dwd_pub_io_log_xyiolog_app_di`, `dwd.dim_pub_pub_user`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `dwd.dwd_ump_pay_trd_trade_wide_di`, `xyio_log`, `app_xyio_log`, `bi.bi_zxxk_zxxk_user_action_1d`, `tmp_old_active_user`, `user_reg`, `c_user_reten`, `c_user_reten_1`, `tmp_results_0`, `c_active`, `trd_paid`, `zxxk_dl`, `tmp_results_1`, `tmp_result_2`, `tmp_result_3`
- 关联条件：t0.user_id = t1.user_id and t0.application_id  = t1.application_id and t0.dt = t1.dt  and coalesce(t0.is_tob,9999) = coalesce(t1.is_tob,9999)
     ),
     tmp_results_1 as (
         select  coalesce(t0.application_id,t3.application_id,t4.application_id,t5.application_id,lower(t6.application_id)) as application_id,
                 cast(coalesce(t0.user_id,t3.user_id,t4.user_id,t5.user_id,t6.user_id) as int) as user_id,
                 cast(t0.dt as string) as user_reg_date,
                 t0.user_next_active_date as user_next_active_date,
                 t0.c_user_next_active_date as c_user_next_active_date,
                 t0.c_user_next_active_month as c_user_next_active_month,
                 coalesce(t4.toc_user_view_detail_page_uv,t0.view_detail_page_cnt) as view_detail_page_cnt,
                 if(coalesce(t4.toc_rights,t0.is_mbr) = true,true,false) as is_mbr,
                 if(coalesce(t5.toc_user_buy_mbr_uv,t0.buy_mbr) = true ,true,false) as buy_mbr,
                 coalesce(t5.paid_amount,t0.paid_amount) as paid_amount,
                 coalesce(t5.paid_cnt,t0.paid_cnt) as paid_cnt,
                 coalesce(t6.toc_user_dl_amount,t0.dl_consume_amount) as dl_consume_amount,
                 coalesce(t6.dl_cnt,t0.dl_cnt) as dl_cnt,
                 coalesce(t0.dt,t3.dt,t4.dt,t5.dt,t6.dt) as dt,
                 coalesce(t0.is_tob,-2) as is_tob,
                 nvl(t0.from_tbl,0) + nvl(t5.from_tbl,0) + nvl(t6.from_tbl,0) as from_tbl
         from tmp_results_0 t0
                  full；t0.application_id = t4.application_id AND t0.dt = t4.dt and t0.user_id = t4.user_id
                  full；t0.application_id = lower(t6.application_id) AND t0.dt = t6.dt and t0.user_id = t6.user_id and t0.is_tob != 1
     ),
     tmp_result_2 as (
         select t1.application_id,
                t1.user_id,
                cast(t2.dt as string) as user_reg_date,
                t1.user_next_active_date,
                t1.c_user_next_active_date,
                t1.c_user_next_active_month,
                t1.view_detail_page_cnt,
                t1.is_mbr,
                t1.buy_mbr,
                t1.paid_amount,
                t1.paid_cnt,
                t1.dl_consume_amount,
                t1.dl_cnt,
                t1.dt,
                t1.is_tob,
                t1.from_tbl
         from (
                  select  application_id,
                          user_id,
                          max(user_reg_date) as user_reg_date,
                          max(user_next_active_date) as user_next_active_date,
                          max(c_user_next_active_date) as c_user_next_active_date,
                          max(c_user_next_active_month) as c_user_next_active_month,
                          max(view_detail_page_cnt) as view_detail_page_cnt,
                          max(is_mbr) as is_mbr,
                          max(buy_mbr) as buy_mbr,
                          max(paid_amount) as paid_amount,
                          max(paid_cnt) as paid_cnt,
                          max(dl_consume_amount) as dl_consume_amount,
                          max(dl_cnt) as dl_cnt,
                          max(from_tbl) as from_tbl,
                          is_tob,
                          dt
                  from tmp_results_1；t1.application_id = t2.application_id and t1.user_id = t2.user_id
     ),
    tmp_result_3 as (
        select  application_id,
            user_id,
            user_reg_date,
            user_next_active_date,
            cast(view_detail_page_cnt as int) as view_detail_page_cnt,
            is_mbr,
            buy_mbr,
            cast(paid_amount as DECIMAL(10,2) ) as paid_amount,
            cast(paid_cnt as int) as paid_cnt,
            cast(dl_consume_amount as DECIMAL(10,2)) as dl_consume_amount,
            cast(dl_cnt as int) as dl_cnt,
            cast(from_tbl as int) as from_tbl,
            cast(is_tob as int) as is_tob,
            c_user_next_active_date,
            c_user_next_active_month,
            dt
        from tmp_result_2；t0.dt = t1.dt and t0.application_id = t1.application_id and t0.user_id = t1.user_id
- 过滤条件：dt = '${dt}' AND product_id = 'xuekewang' AND log_event_type='view' AND coalesce(is_spider,false) = false AND user_id<>0 and user_id is not null ), app_xyio_log as ( select user_id,application_id,toc_rights,log_event_type,page_name,xyio_backend_time,is_tob,dt from ${dwd}.dwd_pub_io_log_xyiolog_app_di where dt = '${dt}' AND product_id = 'xuekewang' AND user_id<>0 and user_id is not null ), user_reg as ( select user_id,application_id, cast(to_date(user_reg_time) as string) dt from ${dwd}.dim_pub_pub_user where product_id = 'xuekewang' ), zxxk_dl as ( select dt,application_id,consumer_id AS user_id, count(1) as dl_cnt, sum(CASE WHEN consume_type IN (1,2,5,6) THEN consume_price WHEN consume_type =3 THEN consume_price*0.4 WHEN consume_type =520 THEN 1 WHEN consume_type =541 THEN 1.5 when consume_type =521 and consumer_identity=50 then resource_price when consume_type =521 and consumer_identity<>50 and resource_price>0.5 then resource_price*2 when consume_type in (521) and consumer_identity<>50 and resource_price<=0.5 then 1.5 else 0 END) as toc_user_dl_amount, 1 as from_tbl from ( select consumer_id,consume_price,consume_type ,application_id,dt,consumer_identity,resource_price from ${dwd}.dwd_zxxk_zxxk_log_consume_log_di where dt = '${dt}' AND down_interface_istob != 1 and case when dt>='2022-07-08' then product = 1 else 1=1 end and coalesce(resource_type,0) not in (3,5) ) tmp；dt >= concat(substr('${dt}',1,7),'-01') AND dt <= '${dt}' AND paid_status = 1 AND product_id = 'xuekewang' AND revenue_type in ('学科网包月会员','学科网高级会员','学科网即时消费','学科网plus会员','学科网iosapp内购会员','学科网iosapp其他')；is_tob = 0；is_tob = 0 and log_event_type='appear' )t1；dt >= date_add('${dt}',-62) and dt < '${dt}' ), c_user_reten as ( select dt, application_id, user_id, is_tob, from_tbl, nvl(user_next_active_date,lead(dt, 1, NULL) over(partition by application_id, user_id；rn = 1 and from_tbl >= 100；dt = '${dt}' )tmp1 )tmp2 where (cnt > 1 and is_tob != -1) or cnt = 1；dt = '${dt}') t3 on t0.application_id = t3.application_id AND t0.dt = t3.dt and t0.user_id = t3.user_id full join c_active t4 on t0.application_id = t4.application_id AND t0.dt = t4.dt and t0.user_id = t4.user_id full join (select * from trd_paid where dt = '${dt}') t5 on t0.application_id = t5.application_id AND t0.dt = t5.dt and t0.user_id = t5.user_id and t0.is_tob != 1 full join zxxk_dl t6 on t0.application_id = lower(t6.application_id) AND t0.dt = t6.dt and t0.user_id = t6.user_id and t0.is_tob != 1 ), tmp_result_2 as ( select t1.application_id, t1.user_id, cast(t2.dt as string) as user_reg_date, t1.user_next_active_date, t1.c_user_next_active_date, t1.c_user_next_active_month, t1.view_detail_page_cnt, t1.is_mbr, t1.buy_mbr, t1.paid_amount, t1.paid_cnt, t1.dl_consume_amount, t1.dl_cnt, t1.dt, t1.is_tob, t1.from_tbl from ( select application_id, user_id, max(user_reg_date) as user_reg_date, max(user_next_active_date) as user_next_active_date, max(c_user_next_active_date) as c_user_next_active_date, max(c_user_next_active_month) as c_user_next_active_month, max(view_detail_page_cnt) as view_detail_page_cnt, max(is_mbr) as is_mbr, max(buy_mbr) as buy_mbr, max(paid_amount) as paid_amount, max(paid_cnt) as paid_cnt, max(dl_consume_amount) as dl_consume_amount, max(dl_cnt) as dl_cnt, max(from_tbl) as from_tbl, is_tob, dt from tmp_results_1
- 聚合函数：COUNT(1), SUM(CASE
                        WHEN consume_type  IN (1,2,5,6), COUNT(user_id), SUM(if(status = 5, 0, amount), COUNT(distinct if(revenue_type like '%会员%',user_id,NULL), MAX(toc_rights_1), SUM(toc_user_view_detail_page_uv), MAX(user_reg_date), MAX(user_next_active_date), MAX(c_user_next_active_date), MAX(c_user_next_active_month), MAX(view_detail_page_cnt)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 application_id 缺少注释
- 字段 buy_mbr 缺少注释
- 字段 is_mbr 缺少注释
- 字段 paid_amount 缺少注释
- 字段 user_id 缺少注释
- 字段 user_next_active_date 缺少注释
- 字段 user_reg_date 缺少注释
- 字段 view_detail_page_cnt 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
