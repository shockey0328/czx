# `ads_zxxk_zxxk_res_train_data_collection_df`

- 层级：`ads`
- 本地表描述：设备id
- 主题标签：content_resource
- 数据粒度：按 t1.soft_id,t1.client_time ), t4 as ( SELECT user_id, zxxk_res_dl_subject_detail_30d, zxxk_res_dl_stage_detail_30d, zxxk_res_dl_course_detail_30d, zxxk_res_dl_commercial_detail_30d, zxxk_res_dl_type_detail_30d, zxxk_res_dl_textbookversion_detail_30d FROM ${ads}.ads_pub_pub_user_user_profile WHERE compute_date = '${dt}' ), t5 as ( SELECT res_id, course_id, stage_id, subject_id, res_type_id, textbook_version_id, commercial_level_id, publish_time, school_level_id, res_price_initial, zxxk_ctr_exposure_cnt_30day, zxxk_ctr_exposure_click_cnt_30day, zxxk_ctr_b_identify_down_cnt_30day, zxxk_ctr_c_identify_down_cnt_30day FROM ${ads}.ads_pub_pub_cont_rbm_res_profile ) 聚合
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`deviceid`、`userid`、`zxxk_res_dl_type_detail_30d`、`res_id`、`res_course_id`、`res_stage_id`、`res_subject_id`、`res_res_type_id`、`res_textbook_version_id`、`res_commercial_level_id`、`res_publish_time`、`res_school_level_id`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `deviceid` | `STRING` | 设备id | ddl |
| `userid` | `INT` | 用户id | ddl |
| `zxxk_res_dl_subject_detail_30d` | `STRING` | 近30天非专辑下载学科分布 | ddl |
| `zxxk_res_dl_stage_detail_30d` | `STRING` | 近30天非专辑下载学段分布 | ddl |
| `zxxk_res_dl_course_detail_30d` | `STRING` | 近30天非专辑下载课程分布 | ddl |
| `zxxk_res_dl_commercial_detail_30d` | `STRING` | 近30天非专辑下载商业等级分布 | ddl |
| `zxxk_res_dl_type_detail_30d` | `STRING` | 近30天非专辑下载资料类型分布 | ddl |
| `zxxk_res_dl_textbookversion_detail_30d` | `STRING` | 近30天非专辑下载教材版本分布 | ddl |
| `res_id` | `INT` | 曝光资料id | ddl |
| `res_course_id` | `INT` | 课程id | ddl |
| `res_stage_id` | `INT` | 学段ID | ddl |
| `res_subject_id` | `INT` | 学科ID | ddl |
| `res_res_type_id` | `STRING` | 资料类型ID。关联dim_rbm_tag表 | ddl |
| `res_textbook_version_id` | `INT` | 教材版本ID | ddl |
| `res_commercial_level_id` | `STRING` | 商业等级ID，关联dim_rbm_tag表 | ddl |
| `res_publish_time` | `STRING` | 发布时间 | ddl |
| `res_school_level_id` | `STRING` | 学校等级ID。关联dim_pub_tag | ddl |
| `res_res_price_initial` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 日期分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_pub_io_log_zxxk_list_soft_view`, `dwd.dwd_pub_io_log_xyiolog_di`, `t1`, `t2`, `ads.ads_pub_pub_user_user_profile`, `ads.ads_pub_pub_cont_rbm_res_profile`, `t3`, `t4`, `t5`, `dim.dim_pub_pub_area`
- 关联条件：t1.user_id=t2.user_id
    AND t1.url=t2.request_url
    AND t1.soft_id = t2.soft_id；t1.soft_id = t3.soft_id and t1.client_time = t3.client_time
         left；t1.user_id = t4.user_id
         left；t1.soft_id = t5.res_id
         left
- 过滤条件：dt = '${dt}' and ( (client_time >= concat('${dt}',' 09:30:000') and client_time < concat('${dt}',' 11:31:000')) or (client_time >= concat('${dt}',' 14:30:000') and client_time < concat('${dt}',' 16:31:000')) ) and user_id is not null and user_id != 0 and softnum_id is not null and softnum_id != '' and url_host in ('yw.zxxk.com','sx.zxxk.com','yy.zxxk.com','zz.zxxk.com','kx.zxxk.com','xx.zxxk.com','yinyue.zxxk.com','ms.zxxk.com', 'tx.zxxk.com','tz.zxxk.com','zhsj.zxxk.com','xljk.zxxk.com','sf.zxxk.com','lj.zxxk.com','wl.zxxk.com','hx.zxxk.com','sw.zxxk.com', 'ls.zxxk.com','dl.zxxk.com','ry.zxxk.com','search.zxxk.com') ) tmp LATERAL VIEW explode(split(softnum_id, ',')) lv AS idx_soft ), t2 AS ( SELECT user_id, request_url, xyio_client_time, regexp_extract(html_element_target_url,'www\.zxxk\.com/soft/([0-9]+)\.html',1) AS soft_id FROM ${dwd}.dwd_pub_io_log_xyiolog_di WHERE dt = '${dt}' AND user_id is not null AND user_id != 0 AND log_event_type='click' AND product_id='xuekewang' ), t3 AS ( SELECT cast(t1.soft_id as INT) as soft_id,t1.client_time,if(max(t2.user_id) is not null,1,0) as is_click FROM t1 LEFT JOIN t2 ON t1.user_id=t2.user_id AND t1.url=t2.request_url AND t1.soft_id = t2.soft_id WHERE t2.xyio_client_time>=t1.client_time AND t2.xyio_client_time<=t1.etime；compute_date = '${dt}' ), t5 as ( SELECT res_id, course_id, stage_id, subject_id, res_type_id, textbook_version_id, commercial_level_id, publish_time, school_level_id, res_price_initial, zxxk_ctr_exposure_cnt_30day, zxxk_ctr_exposure_click_cnt_30day, zxxk_ctr_b_identify_down_cnt_30day, zxxk_ctr_c_identify_down_cnt_30day FROM ${ads}.ads_pub_pub_cont_rbm_res_profile )；level = 'PROVINCE') t6 on t1.province_name = t6.area_name left join (select * from ${dim}.dim_pub_pub_area where level = 'PROVINCE') t7 on t1.province_name = t7.short_name ;
- 聚合函数：MAX(t2.user_id)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 res_res_price_initial 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
