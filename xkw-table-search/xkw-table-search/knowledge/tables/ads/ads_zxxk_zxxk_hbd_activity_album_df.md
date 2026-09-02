# `ads_zxxk_zxxk_hbd_activity_album_df`

- 层级：`ads`
- 本地表描述：活动id
- 主题标签：content_resource
- 数据粒度：按 activity_id, album_id ) 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`activity_id`、`album_id`、`dl_cnt`、`dl_amount`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `activity_id` | `INT` | 活动id | ddl |
| `album_id` | `INT` | 专辑id | ddl |
| `pv` | `INT` | 浏览量 | ddl |
| `dl_cnt` | `INT` | 下载订单量 | ddl |
| `dl_amount` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 日分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dim.dim_zxxk_zxxk_activity_resource`, `dim.dim_zxxk_zxxk_activity`, `dwd.dwd_pub_io_log_xyiolog_di`, `dwd.dwd_pub_io_log_xyiolog_app_di`, `t_active`, `t_xyio_pc`, `t_xyio_m`, `t_xyio_app`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `ads.ads_zxxk_zxxk_hbd_activity_album_df`, `rlt`
- 关联条件：r.activity_id=a.id；t1.album_id=cast(t2.album_id as int)；t1.album_id=cast(t3.album_id as int)；t1.album_id=cast(t4.album_id as int)；ar.album_id = c.resource_id；a.activity_id=b.activity_id
    and a.album_id=b.album_id
- 过滤条件：r.resource_type=2 ), --计算pc站资料以及浏览的时间 t_xyio_pc as ( SELECT regexp_extract(request_url,'https://www\.zxxk\.com/docpack/([0-9]+)\.html',1) as album_id ,device_id ,xyio_backend_time from ${dwd}.dwd_pub_io_log_xyiolog_di where dt='${dt}' and product_id='xuekewang' and application_id='pczhan' and log_event_type='view' and request_url regexp 'https://www\.zxxk\.com/docpack/([0-9]+)\.html' ), --计算m站资料以及浏览的时间 t_xyio_m as ( SELECT regexp_extract(request_url,'https://m\.zxxk\.com/docpack/([0-9]+)\.html',1) as album_id ,device_id ,xyio_backend_time from ${dwd}.dwd_pub_io_log_xyiolog_di where dt='${dt}' and product_id='xuekewang' and application_id='mzhan' and log_event_type='view' and request_url regexp 'https://m\.zxxk\.com/docpack/([0-9]+)\.html' and is_spider=FALSE and env_improper=FALSE and env_open_devtool=FALSE ), --计算app资料以及浏览的时间 t_xyio_app as ( select get_json_object(extension,'$.album_id') as album_id,device_id,xyio_backend_time from ${dwd}.dwd_pub_io_log_xyiolog_app_di where dt='${dt}' and log_event_type='appear' and product_id='xuekewang' and page_name in ('com.zxxk.page.setresource.FeatureContentsFragment','XkwClient.AlbumBriefCatalogViewController_CN.XYIO','XkwClient.AlbumCatalogViewController_CN.XYIO') ), rlt as ( select activity_id,album_id ,sum(pv) as pv ,sum(dl_cnt) dl_cnt ,sum(dl_amount) dl_amount from (select activity_id, album_id, sum(pv) as pv, 0 dl_cnt, 0 dl_amount from ( select t1.album_id,t1.activity_id,count(if(t2.album_id is not null,1,null)) as pv from t_active as t1 join t_xyio_pc as t2 on t1.album_id=cast(t2.album_id as int) where t1.is_active = 1 and t2.xyio_backend_time>=t1.start_time and t2.xyio_backend_time<=t1.end_time；t1.is_active = 1 and t3.xyio_backend_time>=t1.start_time and t3.xyio_backend_time<=t1.end_time；t1.is_active = 1 and t4.xyio_backend_time>=t1.start_time and t4.xyio_backend_time<=t1.end_time；c.dt = '${dt}' and ar.is_active = 1 and c.consume_time>=ar.start_time and c.consume_time<=ar.end_time AND c.consume_type IN (1, 5, 8, 9) and c.resource_type=3；a.dt = date_sub('${dt}', 1) ) w
- 聚合函数：SUM(pv), SUM(dl_cnt), SUM(dl_amount), COUNT(if(t2.album_id is not null,1,null), COUNT(if(t3.album_id is not null,1,null), COUNT(if(t4.album_id is not null,1,null), COUNT(*), SUM(c.consume_price)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 dl_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
