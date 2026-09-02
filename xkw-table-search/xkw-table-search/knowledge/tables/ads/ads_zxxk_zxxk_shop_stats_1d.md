# `ads_zxxk_zxxk_shop_stats_1d`

- 层级：`ads`
- 本地表描述：店铺ID
- 主题标签：log_behavior
- 数据粒度：按 a.shop_id,c.dt ), tmp_bundle as( select a.shop_id,c.dt,count(distinct a.album_id)as cnt from ${dim}.dim_cmp_rbm_album a join calc_dt c on substring(a.publish_time,1,10) = c.dt where a.status = 'P4_2' and a.shop_id is not null group by a.shop_id,c.dt ), tmp_price1 as( select c.dt, f.shop_id, cast(sum(l.consume_price) as decimal(10, 2)) as sale_num from calc_dt c join ${dwd}.dwd_zxxk_zxxk_log_consume_log_di l on l.dt = c.dt and coalesce(l.resource_type,0) not in (3,5) join ( select user_id as shop_id, d.resource_id as res_id, substring_index(transaction_no,'-',1) as batchid, substring(add_time,1,10) as add_dt from ${dwd}.dwd_zxxk_zxxk_trd_feeback_1d_di d where d.mth >= '2023-07' and status = 0 and auther_type = 2 and fee_back_business_type in (0,3) and substring(add_time,1,10) >= date_add('${dt}',-1) and substring(add_time,1,10) <= date_add('${dt}',1) ) f on f.batchid = l.order_no and f.res_id = l.resource_id and f.add_dt >= c.dt and f.add_dt <= date_add(c.dt,1) group by c.dt,f.shop_id ), tmp_price as( select a.dt,a.shop_id,cast(sum(c_income) as decimal(10, 2)) as c_sale_num ,sum(view_num) as view_num ,sum(front_download_num) as front_download_num ,sum(c_download_num) as c_download_num ,sum(b_download_num) as b_download_num ,sum(download_num) as download_num ,sum(c_download_users) as c_download_users ,sum(b_download_users) as b_download_users ,sum(download_users) as download_users from ${ads}.ads_zxxk_zxxk_shop_res_1d a join calc_dt c on a.dt = c.dt where a.shop_id != 0 group by a.dt,a.shop_id ), tmp_income as( select a.shop_id,substring(a.create_time,1,10) dt ,sum(a.income) - sum(a.outlay) as c_shop_income_num ,sum(case when a.type_id in (1,3,4,5,6,7,8,9,11) then a.income else 0 end) as shop_income_num from ${dwd}.dwd_ump_uc_trd_shop_assets_df a join calc_dt c on substring(a.create_time,1,10) = c.dt where a.type_id != 2 group by a.shop_id,substring(a.create_time,1,10) ), --计算新增的数量 attention_add as( SELECT substr(add_time,1,10) dt,author_id shop_id,count(*) as add_cnt FROM ${dwd}.dwd_pub_io_log_zxxk_add_attention a join calc_dt c on a.dt = c.dt where attention_type='店铺' GROUP BY substr(add_time,1,10),author_id ), --计算取关的数量 attention_cancel as( SELECT substr(cancel_time,1,10) dt,author_id shop_id,count(*) as cancel_cnt FROM ${dwd}.dwd_pub_io_log_zxxk_cancel_attention a join calc_dt c on a.dt = c.dt where attention_type='店铺' GROUP BY substr(cancel_time,1,10),author_id ), attention_rlt as ( select coalesce(a.dt,b.dt) dt,coalesce(a.shop_id,b.shop_id) shop_id ,coalesce(a.add_cnt,0) add_attention_cnt ,coalesce(b.cancel_cnt,0) cancel_attention_cnt ,coalesce(a.add_cnt,0)-coalesce(b.cancel_cnt,0) increase_attention_cnt from attention_add a full join attention_cancel b on a.dt=b.dt and a.shop_id=b.shop_id ) 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`shop_id`、`resource_increase_num`、`album_increase_num`、`view_num`、`download_num`、`b_download_num`、`c_download_num`、`download_users`、`c_download_users`、`b_download_users`、`c_sale_num`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `shop_id` | `INT` | 店铺ID | ddl |
| `resource_increase_num` | `INT` | 日资料新增数 | ddl |
| `album_increase_num` | `INT` | 日专辑新增数 | ddl |
| `view_num` | `INT` | 资料浏览量 | ddl |
| `download_num` | `INT` | 日下载次数 | ddl |
| `b_download_num` | `INT` | B端日下载次数 | ddl |
| `c_download_num` | `INT` | C端日下载次数 | ddl |
| `download_users` | `INT` | 日下载人数 | ddl |
| `c_download_users` | `INT` | C端日下载人数 | ddl |
| `b_download_users` | `INT` | B端日下载人数 | ddl |
| `c_sale_num` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 日分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dim.dim_cmp_rbm_resource`, `calc_dt`, `dim.dim_cmp_rbm_album`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `dwd.dwd_zxxk_zxxk_trd_feeback_1d_di`, `ads.ads_zxxk_zxxk_shop_res_1d`, `dwd.dwd_ump_uc_trd_shop_assets_df`, `dwd.dwd_pub_io_log_zxxk_add_attention`, `dwd.dwd_pub_io_log_zxxk_cancel_attention`, `attention_add`, `attention_cancel`, `dim.dim_zxxk_zxxk_shop`, `tmp_res`, `tmp_bundle`, `tmp_price`, `tmp_price1`, `tmp_income`, `attention_rlt`
- 关联条件：substring(a.publish_time,1,10) = c.dt；l.dt = c.dt
                           and coalesce(l.resource_type,0) not in (3,5)；a.dt = c.dt；substring(a.create_time,1,10) = c.dt；a.dt=b.dt and a.shop_id=b.shop_id
)
insert overwrite table ${ads}.ads_zxxk_zxxk_shop_stats_1d partition(dt)
select
    t1.shop_id,
    nvl(t2.cnt,0) as resource_increase_num,
    nvl(t3.cnt,0) as album_increase_num,
    nvl(t4.view_num,0),
    nvl(t4.download_num,0),
    nvl(t4.b_download_num,0),
    nvl(t4.c_download_num,0),
    nvl(t4.download_users,0),
    nvl(t4.c_download_users,0),
    nvl(t4.b_download_users,0),
    nvl(t4.c_sale_num,0) as c_sale_num,
    cast(nvl(t6.c_shop_income_num,0) as decimal(10, 2)) as c_shop_income_num,
    nvl(t4.front_download_num,0),
    cast(nvl(t6.shop_income_num,0) as decimal(10, 2)) as shop_income_num,
    nvl(t41.sale_num,0) as sale_num,
    nvl(t7.add_attention_cnt,0)   add_attention_cnt,
    nvl(t7.cancel_attention_cnt,0)   cancel_attention_cnt,
    nvl(t7.increase_attention_cnt,0)   increase_attention_cnt,
    t1.dt
from (select a.shop_id,'${dt}' as dt
      from ${dim}.dim_zxxk_zxxk_shop a；t1.shop_id = t2.shop_id and t1.dt=t2.dt
         left；t1.shop_id = t3.shop_id and t1.dt=t3.dt
         left；t1.shop_id = t4.shop_id and t1.dt=t4.dt
         left
- 过滤条件：a.status = 'P4_2' and a.shop_id is not null and a.shop_id<>0；a.status = 'P4_2' and a.shop_id is not null；d.mth >= '2023-07' and status = 0 and auther_type = 2 and fee_back_business_type in (0,3) and substring(add_time,1,10) >= date_add('${dt}',-1) and substring(add_time,1,10) <= date_add('${dt}',1) ) f on f.batchid = l.order_no and f.res_id = l.resource_id and f.add_dt >= c.dt and f.add_dt <= date_add(c.dt,1)；a.shop_id != 0；a.type_id != 2；attention_type='店铺'
- 聚合函数：COUNT(distinct a.res_id), COUNT(distinct a.album_id), SUM(l.consume_price), SUM(c_income), SUM(view_num), SUM(front_download_num), SUM(c_download_num), SUM(b_download_num), SUM(download_num), SUM(c_download_users), SUM(b_download_users), SUM(download_users)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 c_sale_num 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
