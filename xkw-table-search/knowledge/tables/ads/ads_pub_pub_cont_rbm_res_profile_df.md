# `ads_pub_pub_cont_rbm_res_profile_df`

- 层级：`ads`
- 本地表描述：资料ID
- 主题标签：content_resource
- 数据粒度：按 resource_id ), t4 as ( SELECT soft_id,count(*) as exposure_cnt FROM t1 group by soft_id ), t5 as ( SELECT soft_id,count(*) as click_cnt FROM ( SELECT t1.soft_id,t1.client_time FROM t1 JOIN t2 ON t1.user_id=t2.user_id AND t1.url=t2.request_url AND t1.soft_id = t2.soft_id WHERE t2.xyio_client_time>=t1.client_time AND t2.xyio_client_time<=t1.etime group by t1.soft_id,t1.client_time ) tmp group by soft_id ) 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`res_id`、`res_type`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `res_id` | `INT` | 资料ID | ddl |
| `res_title` | `STRING` | 资料标题 | ddl |
| `res_applicable_year` | `INT` | 适用年份 | ddl |
| `res_applicable_month` | `INT` | 适用月份 | ddl |
| `res_price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `res_type` | `String` | 资料类型 | alter |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_pub_io_log_zxxk_list_soft_view`, `dwd.dwd_pub_io_log_xyiolog_di`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `t1`, `t2`, `dim.dim_cmp_rbm_resource`, `dws.dws_zxxk_zxxk_log_res_stats_td`, `dim.dim_zxxk_zxxk_document_pv`, `dim.dim_zxxk_zxxk_document_download`, `dim.dim_pub_pub_course`, `t3`, `t4`, `t5`, `dim.dim_cmp_rbm_tag`
- 关联条件：t1.user_id=t2.user_id
    AND t1.url=t2.request_url
    AND t1.soft_id = t2.soft_id；b.dt = '${dt}' and a.res_id=b.res_id
         left；a.res_id=c.document_id
         left；a.res_id=d.document_id
         left；a.course_id=e.course_id
         left；t3.resource_id = a.res_id
         left；t4.soft_id = a.res_id
         left；t5.soft_id = a.res_id
         left
- 过滤条件：dt >= date_add('${dt}',-29) and dt <= '${dt}' and user_id is not null and user_id != 0 and softnum_id is not null and softnum_id != '' ) tmp LATERAL VIEW explode(split(softnum_id, ',')) lv AS idx_soft ), t2 as ( SELECT user_id, request_url, xyio_client_time, regexp_extract(html_element_target_url,'www\.zxxk\.com/soft/([0-9]+)\.html',1) AS soft_id FROM ${dwd}.dwd_pub_io_log_xyiolog_di WHERE dt >= date_add('${dt}',-29) AND dt <= '${dt}' AND log_event_type='click' AND product_id='xuekewang' ), t3 as ( select resource_id, count(if(down_interface_istob = 1, resource_id, null)) as b_dlcnt, count(if(down_interface_istob = 0, resource_id, null)) as c_dlcnt from ${dwd}.dwd_zxxk_zxxk_log_consume_log_di where dt >= date_add('${dt}', -29) and dt <= '${dt}' and product = 1 and resource_type not in (3,5)；t2.xyio_client_time>=t1.client_time AND t2.xyio_client_time<=t1.etime
- 聚合函数：COUNT(if(down_interface_istob = 1, resource_id, null), COUNT(if(down_interface_istob = 0, resource_id, null), COUNT(*)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 res_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
