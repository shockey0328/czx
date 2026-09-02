# `ads_zxxk_zxxk_user_creator_profile_df`

- 层级：`ads`
- 本地表描述：用户ID
- 主题标签：user
- 数据粒度：按 user_id ), rbm_resource as ( SELECT provider_id,source_application_id,commercial_level_id,create_time,publish_time,status,exam_scope,biz_brand_series_id,res_id FROM ${dim}.dim_cmp_rbm_resource WHERE (substring(create_time,1,10) < '${dt}' AND substring(create_time,1,10) >= date_add('${dt}', -29)) or (substring(publish_time,1,10) < '${dt}' AND substring(publish_time,1,10) >= date_add('${dt}', -29)) ), user_upload_all_cnt as( select provider_id as user_id,count(*) as upload_all_cnt from ${dim}.dim_cmp_rbm_resource where status not in ('P0_1', 'P0_2', 'P4_0') and substring(publish_time,1,10) >=date_add('${dt}',-29) and provider_id in (select user_id from all_user_id) group by provider_id ), brand_series as ( select id,name from ${dim}.dim_cmp_mdm_brand_series ), audit_res_stats as ( SELECT r.provider_id, count(DISTINCT if(r.status IN ('P0_1','P0_2','P4_2','P4_1_0','P4_0'),r.res_id,NULL)) AS res_audit_completed_cnt_30d, count(DISTINCT if(r.status IN ('P4_2','P4_1_0'),r.res_id,NULL)) res_audit_published_cnt_30d, count(DISTINCT if(r.status IN ('P4_2','P4_1_0'),r.res_id,NULL)) / count(DISTINCT if(r.status IN ('P0_1','P0_2','P4_2','P4_1_0','P4_0'),r.res_id,NULL)) AS res_audit_pass_rate_30d FROM rbm_resource AS r LEFT JOIN brand_series AS s ON s.id=r.biz_brand_series_id WHERE r.source_application_id IN ('ewt.pro', 'ewt.speed', 'qbm', 'rbm', 'xiaoxue.zxxk', 'zxxk', 'ewangtong', 'jx.ekt', 'zy.usercenter', 'zxxk.paper', 'zy.yfyb', 'oms', 'zy.ccw', 'zy.shop') AND (biz_brand_series_id IS NULL OR biz_brand_series_id = 0 OR s.name='其它') AND r.commercial_level_id <> '1205' AND coalesce(r.exam_scope,'') NOT IN ('3302', '3301', '3303') AND substring(r.create_time,1,10) < '${dt}' AND substring(r.create_time,1,10) >= date_sub('${dt}',29) GROUP BY r.provider_id ), user_subject_cnt_detail as( SELECT user_id, concat('{', concat_ws(',', collect_set(concat_ws(':', concat('"',cast(subject_id as string),'"'), cast(cnt AS string)))) ,'}') AS subject_cnt_detail FROM (select d1.provider_id as user_id,d2.subject_id,count(*) as cnt from ${dim}.dim_cmp_rbm_resource d1 join ${dim}.dim_pub_pub_course d2 on d1.course_id = d2.course_id where d1.provider_id in (select user_id from all_user_id) and substring(d1.publish_time,1,10) >=add_months('${dt}',-3) group by d1.provider_id,d2.subject_id) t group by user_id ), user_source_type_one_cnt_detail as ( SELECT user_id, concat('{' ,concat_ws(',', collect_set(concat_ws(':',concat('"',source_type_one_level_id,'"'), cast(cnt AS string)))) ,'}') AS source_type_one_cnt_detail FROM (select d1.provider_id as user_id,nvl(substring(d1.res_type_id,1,4),'') as source_type_one_level_id ,count(*) as cnt from ${dim}.dim_cmp_rbm_resource d1 where d1.provider_id in (select user_id from all_user_id) and substring(d1.publish_time,1,10) >=add_months('${dt}',-3) group by d1.provider_id,nvl(substring(d1.res_type_id,1,4),'')) t group by user_id ), user_scene_one_cnt_detail as ( SELECT user_id, concat('{', concat_ws(',', collect_set(concat_ws(':',concat('"',scenes_one,'"'), cast(cnt AS string)))) ,'}') AS scene_one_cnt_detail FROM (select d1.provider_id as user_id,d2.id as scenes_one,count(*) as cnt from ${dim}.dim_cmp_rbm_resource d1 join ${dim}.dim_cmp_rbm_tag d2 on substring(d1.scenario_id, 1, 4) = d2.id where d1.provider_id in (select user_id from all_user_id) and substring(d1.publish_time,1,10) >=add_months('${dt}',-3) group by d1.provider_id,d2.id) t group by user_id ), user_sign_up_data as( SELECT user_id, concat('[',concat_ws(',',collect_set(user_contract)),']') AS sign_up_data FROM (SELECT contract_product_id as user_id, concat('{', concat_ws(',', concat_ws(':', concat('"','number','"'),concat('"',number,'"')), concat_ws(':', concat('"','effective_begin','"'),concat('"',effective_begin,'"')), concat_ws(':', concat('"','effective_end','"'),concat('"',effective_end,'"')), concat_ws(':', concat('"','customer_type','"'),concat('"',customer_type,'"')), concat_ws(':', concat('"','grant_term','"'),concat('"',grant_term,'"')) ), '}') AS user_contract FROM (select contract_product_id,number,effective_begin,effective_end,customer_type,grant_term from dwd_doc_user_contract_list_df )t1 ) t group by user_id ), user_income as( SELECT user_id, sum(income) as income FROM ${dwd}.dwd_ump_uc_trd_incomerecord_di WHERE mth >= substring(date_add('${dt}',-29),1,7) and substring(add_time,1,10) >= date_add('${dt}',-29) and type_id = 7 and user_id in (select user_id from all_user_id) GROUP BY user_id ), user_first_upload_time as ( select provider_id as user_id, min(provider_first_upload_time) as provider_first_upload_time from ${dim}.dim_cmp_rbm_resource where provider_id in (select user_id from all_user_id) group by provider_id ), all_subject_ids as( SELECT user_id,concat_ws(',',collect_list(cast(t3.subject_id as STRING))) AS subject_ids from ( SELECT t1.user_id as user_id,t2.subject_id as subject_id from ${dim}.dim_pub_pub_course t2 join (select user_id,course_id_one as course_id FROM (select * from ${dim}.dim_pub_pub_user where user_id in (select user_id from all_user_id)) t LATERAL VIEW explode(split(course_ids, ',')) mytable AS course_id_one ) t1 ON t1.course_id = cast(t2.course_id as STRING) group by t1.user_id,t2.subject_id ) t3 group by user_id ) ,qualified_resources as ( select provider_id,res_id from ${dim}.dim_cmp_rbm_resource where publish_time<>'' and substring(publish_time,1,10) >= date_sub('${dt}',60) and substring(publish_time,1,10) <= date_sub('${dt}',30) and (exam_scope_name not in ('校考','校联考','统考') or exam_scope_name is null) and commercial_level_name !='第三方' and biz_brand_series_id is null and stage_name!='中职' and ( (stage_name='小学' and subject_id in (1,2,3,7,10)) or (stage_name in ('初中','高中') and subject_id in (1,2,3,4,5,6,7,8,9)) ) and source_application_id in ('ewt.pro','ewt.speed','qbm','rbm','xiaoxue.zxxk','zxxk','ewangtong','jx.ekt','zy.usercenter','zxxk.paper','zy.yfyb','oms','zy.ccw','zy.shop') ), user_rewards as ( select t1.provider_id,t1.res_id resource_id,sum(c.amount) as reward_amount from qualified_resources t1 left join ${dwd}.dwd_cmp_rbm_cont_provider_reward_record_df c on t1.res_id=c.resource_id group by t1.provider_id,t1.res_id ), resource_consumption as ( select resource_id, sum(case when consume_type in (1,2,5,6) then consume_price when consume_type=3 then consume_price*0.5 when consume_type=541 then 1.5 else 0 end) as consume_amount from ${dwd}.dwd_zxxk_zxxk_log_consume_log_di where dt >= date_sub('${dt}',60) and dt <= '${dt}' and resource_type!=3 and resource_type!=5 and product!=9 group by resource_id ), low_consume_rlt as ( select t3.provider_id, sum(case when coalesce(consume_amount,0)*0.5-coalesce(reward_amount,0)<0 then 1 else 0 end) as res_low_consume_cnt, round(sum(case when coalesce(consume_amount,0)*0.5-coalesce(reward_amount,0)<0 then 1 else 0 end)/count(t3.resource_id),4) as res_low_consume_rate from user_rewards t3 left join resource_consumption t4 on t3.resource_id=t4.resource_id group by t3.provider_id ) 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`user_id`、`user_name`、`province_id`、`city_id`、`county_id`、`org_id`、`org_type_id`、`stage_id`、`subject_ids`、`textbook_version_id`、`group_ids`、`upload_all_cnt`、`first_upload_time`、`subject_cnt_detail`、`source_type_one_cnt_detail`、`scene_one_cnt_detail`、`res_audit_completed_cnt_30d`、`res_audit_published_cnt_30d`、`res_low_consume_cnt`、`res_low_consume_rate`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `user_id` | `INT` | 用户ID | ddl |
| `user_name` | `STRING` | 用户名 | ddl |
| `province_id` | `STRING` | 省份ID | ddl |
| `city_id` | `STRING` | 市ID | ddl |
| `county_id` | `STRING` | 区县ID | ddl |
| `org_id` | `INT` | 组织ID | ddl |
| `org_name` | `STRING` | 组织名称 | ddl |
| `org_type_id` | `INT` | 组织类型ID | ddl |
| `stage_id` | `INT` | 学段ID | ddl |
| `subject_ids` | `STRING` | 学科ID集合 | ddl |
| `textbook_version_id` | `STRING` | 版本ID | ddl |
| `phone` | `STRING` | 手机号 | ddl |
| `qq` | `STRING` | qq | ddl |
| `link_micro` | `STRING` | 微信 | ddl |
| `mail` | `STRING` | 邮箱 | ddl |
| `group_ids` | `STRING` | 所属群组类型ID集合 | ddl |
| `upload_all_cnt` | `INT` | 近30天上传资料份数 | ddl |
| `first_upload_time` | `STRING` | 首次上传时间 | ddl |
| `subject_cnt_detail` | `STRING` | （json结构的字符串）学科偏好 | ddl |
| `source_type_one_cnt_detail` | `STRING` | (json结构的字符串）类型偏好 | ddl |
| `scene_one_cnt_detail` | `STRING` | （json结构的字符串）场景偏好 | ddl |
| `sign_up_data` | `STRING` | （json结构的字符串）个人签约合同数据 合同ID,合同有效期,合同类型,授权期限 | ddl |
| `income` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `res_audit_completed_cnt_30d` | `int` | 最近30天上传的监管资料审核完成的数量 | alter |
| `res_audit_published_cnt_30d` | `int` | 最近30天上传的监管资料发布的数量 | alter |
| `res_audit_pass_rate_30d` | `decimal(10,4` | 未提供字段注释 | alter |
| `res_low_consume_cnt` | `int` | 发布时间在30-60天低消费的资料数量 | alter |
| `res_low_consume_rate` | `decimal(10,4` | 未提供字段注释 | alter |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_doc_sms_crm_contract_list_df`, `dim.dim_pub_pub_user`, `dim.dim_cmp_rbm_resource`, `dim.dim_zxxk_zxxk_user_group`, `dwd_doc_user_contract_list_df`, `all_user_id`, `all_province_name`, `dim.dim_pub_pub_area`, `all_city_name`, `user_city_id`, `dim.dim_cmp_mdm_brand_series`, `rbm_resource`, `brand_series`, `dim.dim_pub_pub_course`, `dim.dim_cmp_rbm_tag`, `dwd.dwd_ump_uc_trd_incomerecord_di`, `qualified_resources`, `dwd.dwd_cmp_rbm_cont_provider_reward_record_df`, `dwd.dwd_zxxk_zxxk_log_consume_log_di`, `user_rewards`, `resource_consumption`, `dim.dim_pub_pub_organization`, `user_groups`, `user_upload_all_cnt`, `user_first_upload_time`, `user_subject_cnt_detail`, `user_source_type_one_cnt_detail`, `user_scene_one_cnt_detail`, `user_sign_up_data`, `user_income`, `user_province_id`, `user_county_id`, `all_subject_ids`, `audit_res_stats`, `low_consume_rlt`
- 关联条件：t3.contract_product_name = d2.user_login_name
    ),
all_user_id as(
        select user_id
        from
        (select provider_id as user_id
         from ${dim}.dim_cmp_rbm_resource；s.id=r.biz_brand_series_id；d1.course_id = d2.course_id；substring(d1.scenario_id, 1, 4) = d2.id；t1.res_id=c.resource_id；t3.resource_id=t4.resource_id；d2.user_school_id = d3.id
               left；d1.user_id = d4.user_id
               left
- 过滤条件：mold = 2 and state = 1 and customer_type !='劳务合同' and contract_product_id is not null ) t1 lateral view explode ( split(contract_product_id,',' ) ) addr_tmp as contract_product_id；mold = 2 and state = 1 and customer_type !='劳务合同' and contract_product_id is null and coalesce(contract_product_name,'')<>'' ) t1 lateral view explode ( split(contract_product_name, ',' ) ) addr_tmp as contract_product_name ) t3 join ${dim}.dim_pub_pub_user d2 on t3.contract_product_name = d2.user_login_name ), all_user_id as( select user_id from (select provider_id as user_id from ${dim}.dim_cmp_rbm_resource；group_id in (14,53,56)；user_id is not null and user_id != 0；user_id in (select user_id from all_user_id) ), user_province_id as ( select d1.user_id as user_id,d2.area_id as province_id from all_province_name d1 join (select area_id,short_name as area_name from ${dim}.dim_pub_pub_area where level ='PROVINCE'；level ='PROVINCE' ) d2 on d1.province_name = d2.area_name where d1.province_name is not null and d1.province_name != '' and d1.province_name != '1'；nvl(link_province + 0, null) is not null and link_province != '0' and (d1.province_name is null or d1.province_name = '' or d1.province_name = '1')；level ='PROVINCE'
- 聚合函数：COUNT(*), COUNT(DISTINCT if(r.status IN ('P0_1','P0_2','P4_2','P4_1_0','P4_0'), COUNT(DISTINCT if(r.status IN ('P4_2','P4_1_0'), SUM(income), MIN(provider_first_upload_time), SUM(c.amount), SUM(case when consume_type in (1,2,5,6), SUM(case when coalesce(consume_amount,0), COUNT(t3.resource_id)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 income 缺少注释
- 字段 res_audit_pass_rate_30d 缺少注释
- 字段 res_low_consume_rate 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
