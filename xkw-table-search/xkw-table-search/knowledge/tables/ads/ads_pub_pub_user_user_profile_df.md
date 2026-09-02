# `ads_pub_pub_user_user_profile_df`

- 层级：`ads`
- 本地表描述：用户ID
- 主题标签：user
- 数据粒度：按 consumer_id,resource_id ) a inner join ( select a.res_id,catalog_id from ${dim}.dim_cmp_rbm_resource a LATERAL VIEW explode(split(catalog_ids, ',')) mytable AS catalog_id where coalesce(catalog_ids,'')<>'' ) b on a.resource_id=b.res_id group by a.user_id,b.catalog_id ) w ) w where rn<=3 group by user_id ), user_login_times_90d as ( select user_id, count(1) as login_times_90d ----用户近90天登录次数 from ${dwd}.dwd_ump_uc_log_t_userlogin_di where dt > substring(cast(date_sub('${dt}', 90) as string), 1, 10) and dt <= '${dt}' group by user_id ) ,user_res_dl_30d as ( select user_id ,concat('[',concat_ws(',',collect_set(concat('{"id":',cast(subject_id as string),',"name":"',subject_name,'","cnt":',cast(cnt_by_subject as string),'}'))),']') zxxk_30d_res_dl_subject_detail ,concat('[',concat_ws(',',collect_set(concat('{"id":',cast(stage_id as string),',"name":"',stage_name,'","cnt":',cast(cnt_by_stage as string),'}'))),']') zxxk_30d_res_dl_stage_detail ,concat('[',concat_ws(',',collect_set(concat('{"id":',cast(course_id as string),',"name":"',course_name,'","cnt":',cast(cnt_by_course as string),'}'))),']') zxxk_30d_res_dl_course_detail ,concat('[',concat_ws(',',collect_set(concat('{"id":',cast(commercial_level_id as string),',"name":"',commercial_level_name,'","cnt":',cast(cnt_by_commercial as string),'}'))),']') zxxk_30d_res_dl_commercial_detail ,concat('[',concat_ws(',',collect_set(concat('{"id":',cast(type_id as string),',"name":"',type_name,'","cnt":',cast(cnt_by_typeid as string),'}'))),']') zxxk_30d_res_dl_type_detail ,concat('[',concat_ws(',',collect_set(concat('{"id":',cast(textbook_version_id as string),',"name":"',textbook_version_name,'","cnt":',cast(cnt_by_textbookversion as string),'}'))),']') zxxk_30d_res_dl_textbookversion_detail from ( select a.user_id ,c.subject_id,d5.subject_name,count(1) over (partition by a.user_id,c.subject_id) cnt_by_subject ,c.stage_id,d4.stage_name,count(1) over (partition by a.user_id,c.stage_id) cnt_by_stage ,a.course_id,c.course_name,count(1) over (partition by a.user_id,a.course_id) cnt_by_course ,a.commercial_level_id,d2.name commercial_level_name,count(1) over (partition by a.user_id,a.commercial_level_id) cnt_by_commercial ,a.type_id,d3.name type_name,count(1) over (partition by a.user_id,a.type_id) cnt_by_typeid ,a.textbook_version_id,d1.textbook_version_name,count(1) over (partition by a.user_id,a.textbook_version_id) cnt_by_textbookversion from ${dws}.dws_zxxk_zxxk_user_dl_stats_1d_di a left join ${dim}.dim_pub_pub_course c on a.course_id=c.course_id left join ${dim}.dim_cmp_mdm_textbook_version d1 on a.textbook_version_id=d1.textbook_version_id left join ${dim}.dim_cmp_rbm_tag d2 on a.commercial_level_id=d2.id left join ${dim}.dim_cmp_rbm_tag d3 on a.type_id=d3.id left join ${dim}.dim_pub_pub_stage d4 on c.stage_id=d4.stage_id left join ${dim}.dim_pub_pub_subject d5 on c.subject_id=d5.subject_id where a.dt>date_sub('${dt}',30) and a.dt<='${dt}' and coalesce(a.resource_type,0)<>3 and zxxk_product=1 and application_id='pczhan' ) w group by user_id ) ,user_consume_behavior_30d as ( select consumer_id as user_id ,sum( case when consume_type in (1,2,5,6) then consume_price when consume_type = 3 then consume_price * 0.4 when consume_type = 541 then 1.5 when consume_type = 520 then 1 when consume_type = 521 and consumer_identity = 50 then resource_price when consume_type = 521 and coalesce(consumer_identity, 0) <> 50 and resource_price > 0.5 then resource_price * 2 when consume_type = 521 and coalesce(consumer_identity, 0) <> 50 and resource_price <= 0.5 then 1.5 else 0 end ) as consume_price_sum from ${dwd}.dwd_zxxk_zxxk_log_consume_log_di a where coalesce(a.resource_type, 0) <> 3 and coalesce(a.product, 0) <> 9 and a.dt > date_sub('${dt}', 30) and a.dt <= '${dt}' group by consumer_id ) 聚合
- 分区字段：compute_date
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`user_id`、`user_school_id`、`ssm_school_id`、`ssm_user_type`、`course_ids`、`course_id`、`grade_id`、`profession_id`、`user_login_name`、`user_group_id`、`last_login_time`、`user_reg_time`、`activated_time`、`reg_product`、`product_id`、`application_id`、`zj_create_paper_num`、`zj_first_login_time`、`zj_last_login_time`、`zxxk_was_b_user`、`zxxk_90d_most_ip_city_id`、`zxxk_90d_most_stage_id`、`zxxk_90d_most_subject_id`、`zxxk_90d_most_version_id`、`zxxk_90d_most_textbook_id`、`zxxk_90d_most_grade_id`、`zxxk_90d_most_textbook_version_id_course`、`zxxk_90d_most_textbook_id_course`、`zxxk_90d_most_course_id`、`zxxk_14d_latest_catalog_ids`、`login_times_90d`、`zxxk_res_dl_type_detail_30d`、`zxxk_consume_behavior_price_30d`、`compute_date`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `user_id` | `INT` | 用户ID | ddl |
| `user_school_id` | `INT` | 学校ID。用户自编辑 | ddl |
| `ssm_school_id` | `INT` | ssm学校ID | ddl |
| `ssm_user_type` | `INT` | 用户类型。0-普通教师，1-30天单账号，2-回收的单账号，3-学校高级管理员，4-学校超级管理员，5-单账号学校账号，6-单账号试用账号 | ddl |
| `course_ids` | `STRING` | 课程IDs。逗号分隔的课程id组成的字符串。用户自编辑 | ddl |
| `course_id` | `INT` | 课程IDs的第一个id | ddl |
| `grade_id` | `INT` | 年级ID。用户自编辑 | ddl |
| `profession_id` | `INT` | 身份ID | ddl |
| `user_login_name` | `STRING` | 登录名 | ddl |
| `real_name` | `STRING` | 真实姓名 | ddl |
| `user_group_id` | `INT` | c端用户等级，学科网在用 | ddl |
| `logins` | `INT` | 登录次数 | ddl |
| `last_login_time` | `STRING` | 用户最后登录时间 | ddl |
| `last_login_ip` | `STRING` | 最后登录IP | ddl |
| `user_reg_time` | `STRING` | 用户注册时间 | ddl |
| `app_key` | `STRING` | 注册来源 | ddl |
| `activated_time` | `STRING` | 激活时间 | ddl |
| `reg_ip` | `STRING` | 注册IP | ddl |
| `reg_product` | `STRING` | 注册产品 | ddl |
| `reg_terminal` | `STRING` | 注册终端 | ddl |
| `product_id` | `STRING` | 产品id。根据reg_product转换得到 | ddl |
| `application_id` | `STRING` | 应用id。根据reg_terminal转换得到 | ddl |
| `zj_create_paper_num` | `INT` | 组卷网组卷次数 | ddl |
| `zj_logins` | `INT` | 组卷网登录次数 | ddl |
| `zj_first_login_time` | `STRING` | 组卷网首次登录时间 | ddl |
| `zj_last_login_time` | `STRING` | 组卷网最后一次登录时间 | ddl |
| `zj_last_login_ip` | `STRING` | 组卷网最后一次登录IP | ddl |
| `zj_is_lock` | `INT` | 组卷网是否锁定用户 | ddl |
| `zxxk_was_b_user` | `BOOLEAN` | 是否曾为学科网B端用户ads表+ods2.ods_uc_ssm_tbl_bi_user_role表新有效记录 | ddl |
| `zxxk_90d_most_ip_city_id` | `INT` | 最近90天全部行为最多IP所在城市ID | ddl |
| `zxxk_90d_most_stage_id` | `INT` | 最近90天全部行为最多的学段ID | ddl |
| `zxxk_90d_most_subject_id` | `INT` | 最近90天全部行为最多的学科ID | ddl |
| `zxxk_90d_most_version_id` | `INT` | 最近90天全部行为最多的版本ID | ddl |
| `zxxk_90d_most_textbook_id` | `INT` | 最近90天全部行为最多的教材ID | ddl |
| `zxxk_90d_most_grade_id` | `INT` | 最近90天全部行为最多的年级ID | ddl |
| `zxxk_730d_download_days` | `INT` | 用户最近730天（两年）下载天数计算所有用户最近两年内的下载天数,最后应用输出注册时间在两年内的该值 | ddl |
| `zxxk_90d_most_textbook_version_id_course` | `INT` | 最近90天全部行为最多的版本ID-常用课程 | ddl |
| `zxxk_90d_most_textbook_id_course` | `INT` | 最近90天全部行为最多的教材ID-常用课程 | ddl |
| `zxxk_90d_most_course_id` | `INT` | 最近90天全部行为最多的课程 | ddl |
| `zxxk_14d_latest_catalog_ids` | `STRING` | 最近14天最近下载的三个章节 | ddl |
| `nick` | `STRING` | 昵称 | ddl |
| `login_times_90d` | `INT` | 最近90天登录次数 | ddl |
| `zxxk_res_dl_subject_detail_30d` | `STRING` | 最近30天非专辑下载学科分布 | ddl |
| `zxxk_res_dl_stage_detail_30d` | `STRING` | 最近30天非专辑下载学段分布 | ddl |
| `zxxk_res_dl_course_detail_30d` | `STRING` | 最近30天非专辑下载课程分布 | ddl |
| `zxxk_res_dl_commercial_detail_30d` | `STRING` | 最近30天非专辑下载商业等级分布 | ddl |
| `zxxk_res_dl_type_detail_30d` | `STRING` | 最近30天非专辑下载资料类型分布 | ddl |
| `zxxk_res_dl_textbookversion_detail_30d` | `STRING` | 最近30天非专辑下载教材版本分布 | ddl |
| `zxxk_consume_behavior_price_30d` | `decimal(18,2` | 未提供字段注释 | alter |
| `compute_date` | `STRING` | 计算日期分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dws.dws_zxxk_zxxk_user_dl_stats_1d_di`, `dws.dws_zxxk_zxxk_user_res_pv_1d_di`, `t1`, `t2`, `t3`, `max_rlt`, `t2_1`, `t3_1`, `ads.ads_pub_pub_user_user_profile_df`, `dwd.dwd_ump_uc_user_user_role_df`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `dim.dim_cmp_rbm_resource`, `dwd.dwd_ump_uc_log_t_userlogin_di`, `dim.dim_pub_pub_course`, `dim.dim_cmp_mdm_textbook_version`, `dim.dim_cmp_rbm_tag`, `dim.dim_pub_pub_stage`, `dim.dim_pub_pub_subject`, `dim.dim_pub_pub_user`, `max_rlt_1`, `user_befor`, `user_catalogids`, `user_login_times_90d`, `user_res_dl_30d`, `user_consume_behavior_30d`
- 关联条件：a.user_id = b.user_id  and a.course_id = b.zxxk_90d_most_course_id；a.course_id=c.course_id
                      left；a.textbook_version_id=d1.textbook_version_id
                      left；a.commercial_level_id=d2.id
                      left；a.type_id=d3.id
                      left；c.stage_id=d4.stage_id
                      left；c.subject_id=d5.subject_id；a.user_id=b.user_id
         left
- 过滤条件：a.dt>=date_sub('${dt}',90) and a.dt<='${dt}'；coalesce(a.course_id,0)>0 and coalesce(b.zxxk_90d_most_course_id,0)>0 ) ,t3_1 as (select a.user_id ,first_value(textbook_version_id) over (partition by user_id；a.compute_date=date_sub('${dt}',1)；a.dt='${dt}'；a.dt=date_sub('${dt}',730)；a.start_date >='${dt}'；a.dt>=date_sub('${dt}',14) and a.dt<='${dt}'；coalesce(catalog_ids,'')<>'' ) b on a.resource_id=b.res_id
- 聚合函数：SUM(download_cnt), SUM(res_view_cnt), SUM(total_cnt), SUM(a.total_cnt), SUM(zxxk_730d_download_days), MAX(zxxk_was_b_user), MAX(a.last_time), MAX(consume_time), COUNT(1), SUM(case    when consume_type in (1,2,5,6)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 zxxk_consume_behavior_price_30d 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
