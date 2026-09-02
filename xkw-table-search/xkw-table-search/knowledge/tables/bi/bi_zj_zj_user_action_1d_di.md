# `bi_zj_zj_user_action_1d_di`

- 层级：`bi`
- 本地表描述：组卷网用户指标按日汇总
- 主题标签：user, log_behavior
- 数据粒度：按 user_id,application_id,substr(dt,1,7)) t2 on t1.user_id = t2.user_id and substr(cast(add_months(t1.dt,1) as string),1,7) = t2.mth and t1.application_id = t2.application_id and coalesce(t1.next_active_month,'') = '' ), tmp_results_1 as ( select coalesce(t0.dt,t1.dt,t2.dt) as dt, coalesce(t0.user_id,t1.user_id,t2.user_id) as user_id, coalesce(t0.application_id,t1.application_id,t2.application_id) as application_id, coalesce(t0.is_tob, t1.is_tob, 0) as is_tob, t0.is_new_user as is_new_user, if((t1.rn is null or t1.rn = 1) and (t2.rn is null or t2.rn = 1),coalesce(t0.pv,0), 0) as pv, if(t2.rn is null or t2.rn = 1, coalesce(t1.dl_cnt,t0.dl_cnt,0),0) as dl_cnt, if(t2.rn is null or t2.rn = 1, coalesce(t1.zj_user_type_id,t0.user_type_id,-1), -1) as user_type_id, if(t2.rn is null or t2.rn = 1, coalesce(t1.zj_down_mode,t0.dl_mode,-1), -1) as dl_mode, coalesce(t0.pay_type, if((t1.rn is null or t1.rn = 1),coalesce(t2.pay_type,''), '')) as pay_type, coalesce(t0.pay_cnt, if((t1.rn is null or t1.rn = 1),coalesce(t2.pay_cnt,0), 0)) as pay_cnt, coalesce(t0.pay_amount, if((t1.rn is null or t1.rn = 1),coalesce(t2.pay_amount,0), 0)) as pay_amount, coalesce(t0.next_active_date,'') as next_active_date, coalesce(t0.next_active_month,'') as next_active_month from next_active_month t0 full join (select *,row_number() over(partition by dt,application_id,user_id 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`user_id`、`application_id`、`is_new_user`、`dl_cnt`、`user_type_id`、`pay_type`、`pay_cnt`、`pay_amount`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `user_id` | `INT             COMMENT'用户id'` | 未提供字段注释 | ddl |
| `application_id` | `STRING          COMMENT'终端：pczhan,mzhan'` | 未提供字段注释 | ddl |
| `is_tob` | `INT             COMMENT'BC端标志'` | 未提供字段注释 | ddl |
| `is_new_user` | `INT             COMMENT'是否是当日新用户'` | 未提供字段注释 | ddl |
| `pv` | `INT             COMMENT'xyio埋点日志中用户浏览次数'` | 未提供字段注释 | ddl |
| `dl_cnt` | `INT             COMMENT'当日下载次数'` | 未提供字段注释 | ddl |
| `user_type_id` | `INT             COMMENT'下载方式'` | 未提供字段注释 | ddl |
| `dl_mode` | `INT             COMMENT'组卷下载方式'` | 未提供字段注释 | ddl |
| `pay_type` | `STRING          COMMENT'支付类型'` | 未提供字段注释 | ddl |
| `pay_cnt` | `INT             COMMENT'当日支付次数'` | 未提供字段注释 | ddl |
| `pay_amount` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 天分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_pub_io_log_xyiolog_di`, `dwd.dwd_pub_io_log_xyiolog_app_di`, `dwd.dwd_zj_zj_log_usercreatedpaper_di`, `ods.ods_zj_zj_zujuanwebsitedata_tbl_001_orderlist`, `ods.ods_zj_zj_zujuanwebsitedata_tbl_001_c_userupgraderecord`, `dim.dim_pub_pub_user`, `bi.bi_zj_zj_user_action_1d_di`, `tmp_old_active_user`, `xyio_log`, `xyio_app`, `next_active_date`, `next_active_month`, `dl_res`, `tmp_orderlist`, `tmp_results_1`, `tmp_pub_user`, `tmp_results_2`
- 关联条件：order_list.order_no=c.paycode
- 过滤条件：user_id != 0 and user_id is not null and product_id = 'zujuanwang' and coalesce(is_spider,false) = false and dt = '${dt}'；dt = '${dt}' and product_id='zujuanwang' and user_id != 0 and user_id is not null；dt = '${dt}' AND user_id is not null and user_id != 0；to_date(order_list.buy_time) = '${dt}' and order_list.status = 1；dt >= date_add('${dt}',-62) and dt < '${dt}' ), next_active_date as ( select dt,application_id,user_id,is_tob,pv,dl_cnt,user_type_id,dl_mode,pay_type,pay_cnt, pay_amount,is_new_user, lead(dt, 1, '9999-12-31') over(partition by application_id, user_id, is_tob；rn = 1 and pv > 0；(rn = 1 and pv <= 0) or rn != 1 ) t0 full join (select * from tmp_pub_user where substr(zj_first_login_time,1,10) >= date_add('${dt}',-62) ) t1 on t0.user_id = t1.user_id and substr(t1.zj_first_login_time,1,10) = t0.dt )
- 聚合函数：COUNT(*), COUNT(distinct order_no), SUM(money)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 application_id 缺少注释
- 字段 dl_cnt 缺少注释
- 字段 dl_mode 缺少注释
- 字段 is_new_user 缺少注释
- 字段 is_tob 缺少注释
- 字段 pay_amount 缺少注释
- 字段 pay_cnt 缺少注释
- 字段 pay_type 缺少注释
- 字段 pv 缺少注释
- 字段 user_id 缺少注释
- 字段 user_type_id 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
