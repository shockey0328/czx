# `ads_zxxk_zxxk_shop_res_1d`

- 层级：`ads`
- 本地表描述：主键
- 主题标签：content_resource
- 数据粒度：按 A.resource_id,A.shop_id,A.res_type_id,A.dt ; 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`resource_id`、`shop_id`、`hit_num`、`download_num`、`b_download_num`、`c_download_num`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `resource_id` | `INT` | 主键 | ddl |
| `shop_id` | `BIGINT` | 店铺ID | ddl |
| `hit_num` | `INT` | 日点击次数 | ddl |
| `download_num` | `BIGINT` | 日下载次数 | ddl |
| `b_download_num` | `BIGINT` | B端日下载次数 | ddl |
| `c_download_num` | `BIGINT` | C端日下载次数 | ddl |
| `c_income` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 日分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_zxxk_zxxk_log_consume_log_di`, `dim.dim_cmp_rbm_resource`, `dwd.dwd_zxxk_zxxk_log_document_day_hit_di`, `dwd.dwd_zxxk_zxxk_trd_feeback_1d_di`, `t1_res`, `t3_hit`, `t4_feeback`
- 关联条件：A.resource_id = B.res_id
),

     t3_hit as(
         select A.dt as dt,
                A.document_id as document_id,
                B.shop_id,
                B.res_type_id as res_type_id,   -----资源类型id
                sum(pv) as view_hits,
                sum(downloads)  as download_hits    -----学科网前台下载量
         from (
                  SELECT dt,
                         document_id,
                         pv,
                         downloads
                  FROM ${dwd}.dwd_zxxk_zxxk_log_document_day_hit_di；A.document_id = B.res_id and B.shop_id>0
- 过滤条件：dt = '${dt}' and case when a.author_type = 2 then a.author_id else 0 end > 0 and coalesce(resource_type,0) not in (3,5)；dt = '${dt}' ) A join ${dim}.dim_cmp_rbm_resource B on A.document_id = B.res_id and B.shop_id>0；fee_back_business_type in (0,3) and a.mth>=substring('${dt}',1,7) and substring(a.add_time,1,10) = '${dt}' and status = 0
- 聚合函数：COUNT(a.id), COUNT(case when down_interface_istob = 1 then a.id end), COUNT(case when down_interface_istob = 0 then a.id end), SUM(case
                            when consume_type in (1, 2, 5, 8), COUNT(DISTINCT if(down_interface_istob = 0, consumer_id, null), COUNT(DISTINCT if(down_interface_istob = 1, consumer_id, null), COUNT(DISTINCT consumer_id), SUM(pv), SUM(downloads), SUM(fee_back_money), SUM(case when auther_type =2 then fee_back_money else 0 end), MAX(A.download_num)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 c_income 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
