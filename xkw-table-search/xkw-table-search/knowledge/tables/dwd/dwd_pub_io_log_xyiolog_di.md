# `dwd_pub_io_log_xyiolog_di`

- 层级：`dwd`
- 本地表描述：xyio唯一ID
- 主题标签：log_behavior
- 数据粒度：按 xyio_id,title,xyio_client_time,xyio_backend_time,user_id,device_id,is_tob,tob_rights, toc_rights,request_url,referrer,log_event_type,latest_inside_search_keyword,html_element_class_name, html_element_content,html_element_id,html_element_target_url,html_element_selector, dt,product,application,is_first_time,`source`,b_ip,user_ip,os, os_version,manufacturer,model,browser,browser_version,screen_width,screen_height,latest_referrer, latest_traffic_source_type,school_id,stage,subject,book_version,platform,element_name,element_type, viewport_width,viewport_height,offsetx,offsety,single_page_app,ut1,env_improper,env_open_devtool, env_moved,env_scrolly,env_trust_click,is_spider,fp_id,extension,element_extension,lib_version ) ,searchenginepre1 as ( select a.user_id,a.tracked_search_engine,a.xyio_backend_time ,xyio_id,a.dt ,row_number() over (partition by a.user_id 聚合
- 分区字段：dt, product_id, application_id
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`xyio_id`、`xyio_client_time`、`xyio_backend_time`、`user_id`、`device_id`、`log_event_type`、`latest_inside_search_keyword`、`html_element_id`、`product_source_id`、`screen_width`、`latest_traffic_source_type`、`user_school_id`、`stage_id`、`subject_id`、`textbook_version_id`、`html_element_type`、`viewport_width`、`dt`、`product_id`、`application_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `xyio_id` | `STRING` | xyio唯一ID | ddl |
| `title` | `STRING` | 标题 | ddl |
| `xyio_client_time` | `STRING` | 客户端时间，格式yyyy-MM-dd HH:mm:ss | ddl |
| `xyio_backend_time` | `STRING` | 后端时间,格式yyyy-MM-dd HH:mm:ss | ddl |
| `user_id` | `INT` | 用户ID，登录后的帐号ID | ddl |
| `device_id` | `STRING` | 设备id | ddl |
| `is_tob` | `INT` | 是否B端用户,1是0否.是否为该产品下的B端用户，如某用户在组卷为B端用户，但不是学科网的B端用户，在组卷触发该事件时该信息为是，在学科网为否 | ddl |
| `tob_rights` | `STRING` | B端产品权限.该产品下的B端权限，如学科网产品B端权限为：初中高端网校通、初中普通网校通等 | ddl |
| `toc_rights` | `STRING` | C端产品权限.该产品下的C端权限，如学科网产品C端权限为：高级会员、包月会员等 | ddl |
| `request_url` | `STRING` | 请求地址 | ddl |
| `referrer` | `STRING` | 前向地址 | ddl |
| `log_event_type` | `STRING` | 日志事件（浏览/点击两种类型） | ddl |
| `latest_inside_search_keyword` | `STRING` | 最近一次站内搜索关键词 | ddl |
| `html_element_class_name` | `STRING` | 页面元素样式名 | ddl |
| `html_element_content` | `STRING` | 页面元素内容 | ddl |
| `html_element_id` | `STRING` | 页面元素ID | ddl |
| `html_element_target_url` | `STRING` | 页面元素链接地址 | ddl |
| `html_element_selector` | `STRING` | 页面元素选择器 | ddl |
| `is_new_device` | `BOOLEAN` | 是否新设备，如果device_id首次出现 TRUE 是 FALSE 否 | ddl |
| `product_source_id` | `STRING` | 来源 | ddl |
| `req_header_x_real_ip` | `STRING` | 请求头X-Real-IP | ddl |
| `req_header_x_forwarded_for` | `STRING` | 请求头X-Forwarded-For | ddl |
| `os` | `STRING` | 操作系统 | ddl |
| `os_version` | `STRING` | 操作系统版本 | ddl |
| `device_manufacturer` | `STRING` | 设备制造商，Apple，Huawei，Xiaomi等 | ddl |
| `device_model` | `STRING` | 设备型号 | ddl |
| `browser` | `STRING` | 浏览器 | ddl |
| `browser_version` | `STRING` | 浏览器版本 | ddl |
| `screen_width` | `INT` | 屏幕宽度 | ddl |
| `screen_height` | `INT` | 屏幕高度 | ddl |
| `latest_referrer` | `STRING` | 最近一次站外前向地址 | ddl |
| `latest_traffic_source_type` | `STRING` | 本次流量来源类型。direct（直接访问，当$latest_referrer_host=“”时）；search_engine（搜索引擎，$latest_referrer_host包括以下搜索引擎域名时此项为search_engine；百度：baidu.com；360：so.com；搜狗：sogou.com；神马：sm.cn；谷歌：google.com；必应：bing.com）；other（外部链接，除以上两种情况都是other） | ddl |
| `user_school_id` | `INT` | 用户学校id | ddl |
| `stage_id` | `INT` | 学段id | ddl |
| `subject_id` | `INT` | 学科id | ddl |
| `textbook_version_id` | `INT` | 教材版本id | ddl |
| `platform` | `STRING` | 平台，pc_web/weixin_web/wap_web/weixin/PC | ddl |
| `html_element_name` | `STRING` | 元素名称 | ddl |
| `html_element_type` | `STRING` | 元素类型 | ddl |
| `viewport_width` | `INT` | 视区宽度 | ddl |
| `viewport_height` | `INT` | 视区高度 | ddl |
| `offsetx` | `DECIMAL(20,10` | 未提供字段注释 | ddl |
| `dt` | `STRING` | xyio_client_time日期 | ddl / 分区 |
| `product_id` | `STRING` | 产品id | ddl / 分区 |
| `application_id` | `STRING` | 应用id | ddl / 分区 |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_pub_pub_mq_tbl_xyio_track_log`, `track_log`, `dwd.dwd_pub_io_log_xyiolog_di`, `track_log_distinct`, `searchenginepre1`, `searchengine0`, `searchengine1`, `searchengine2`, `searchengine3`, `searchengine4`, `searchengine00`, `searchenginerlt`, `dim.dim_pub_pub_product_xyio`, `dim.dim_pub_pub_application_xyio`, `dim.dim_pub_pub_source_xyio`, `dim.dim_pub_pub_course`, `dim.dim_pub_pub_user`
- 关联条件：track_log.product = dim_product.product
         left；track_log.application = dim_application.application
         left；track_log.source = dim_source.source
         left；cast(track_log.subject as int) = dim_course.zj_course_id
         left；cast(track_log.user_id as int) = du.user_id
- 过滤条件：dt = '${dt}' -- AND NOT b_ua rlike '.*bot|Bot|spider|Spider|AhrefsBot|java|python|reques|urllib|crawl.*' -- 排除爬虫 ), track_log_distinct as ( SELECT xyio_id,title,xyio_client_time,xyio_backend_time,user_id,device_id,is_tob,tob_rights, toc_rights,request_url,referrer,log_event_type,latest_inside_search_keyword,html_element_class_name, html_element_content,html_element_id,html_element_target_url,html_element_selector, dt,product,application,is_first_time,`source`,b_ip,user_ip,os, os_version,manufacturer,model,browser,browser_version,screen_width,screen_height,latest_referrer, latest_traffic_source_type,school_id,stage,subject,book_version,platform,element_name,element_type, viewport_width,viewport_height,offsetx,offsety,single_page_app,ut1,env_improper,env_open_devtool, env_moved,env_scrolly,env_trust_click,is_spider,fp_id,extension,element_extension,lib_version FROM track_log；a.dt=DATE_SUB('${dt}',1) and coalesce(a.tracked_search_engine,'other')<>'other' ) ,searchengine00 as ( SELECT xyio_id,title,xyio_client_time,xyio_backend_time,user_id,device_id,is_tob,tob_rights, toc_rights,request_url,referrer,log_event_type,latest_inside_search_keyword,html_element_class_name, html_element_content,html_element_id,html_element_target_url,html_element_selector, dt,product,application,is_first_time,`source`,b_ip,user_ip,os, os_version,manufacturer,model,browser,browser_version,screen_width,screen_height,latest_referrer, latest_traffic_source_type,school_id,stage,subject,book_version,platform,element_name,element_type, viewport_width,viewport_height,offsetx,offsety,single_page_app,ut1,env_improper,env_open_devtool, env_moved,env_scrolly,env_trust_click,is_spider,fp_id,extension,element_extension,lib_version ,'other' tracked_search_engine_new FROM track_log_distinct where coalesce(cast(user_id as int),0)=0 ) ,searchengine0 as ( SELECT xyio_id,title,xyio_client_time,xyio_backend_time,user_id,device_id,is_tob,tob_rights, toc_rights,request_url,referrer,log_event_type,latest_inside_search_keyword,html_element_class_name, html_element_content,html_element_id,html_element_target_url,html_element_selector, dt,product,application,is_first_time,`source`,b_ip,user_ip,os, os_version,manufacturer,model,browser,browser_version,screen_width,screen_height,latest_referrer, latest_traffic_source_type,school_id,stage,subject,book_version,platform,element_name,element_type, viewport_width,viewport_height,offsetx,offsety,single_page_app,ut1,env_improper,env_open_devtool, env_moved,env_scrolly,env_trust_click,is_spider,fp_id,extension,element_extension,lib_version ,case when parse_url(latest_referrer,'HOST') like '%baidu.com' then 'baidu' when parse_url(latest_referrer,'HOST') in ('www.so.com','m.so.com','image.so.com','so.com') then '360' when parse_url(latest_referrer,'HOST') in ('www.sogou.com','m.sogou.com','wap.sogou.com','sogou.com') then 'sogou' when parse_url(latest_referrer,'HOST') in ('www.bing.com','global.bing.com','cn.bing.com') then 'bing' when parse_url(latest_referrer,'HOST') in ('www.google.com','www.google.com.hk') then 'google' when parse_url(latest_referrer,'HOST') in ('www.toutiao.com','nativeapp.toutiao.com','so.toutiao.com') then 'toutiao' else 'other' end tracked_search_engine FROM track_log_distinct where coalesce(cast(user_id as int),0)>0；rn=1 ) ,searchengine1 as ( SELECT xyio_id,title,xyio_client_time,xyio_backend_time,user_id,device_id,is_tob,tob_rights, toc_rights,request_url,referrer,log_event_type,latest_inside_search_keyword,html_element_class_name, html_element_content,html_element_id,html_element_target_url,html_element_selector, dt,product,application,is_first_time,`source`,b_ip,user_ip,os, os_version,manufacturer,model,browser,browser_version,screen_width,screen_height,latest_referrer, latest_traffic_source_type,school_id,stage,subject,book_version,platform,element_name,element_type, viewport_width,viewport_height,offsetx,offsety,single_page_app,ut1,env_improper,env_open_devtool, env_moved,env_scrolly,env_trust_click,is_spider,fp_id,extension,element_extension,lib_version,tracked_search_engine ,lag(xyio_backend_time) over (partition by user_id；a.dt='${dt}'
- 聚合函数：SUM(is_new_session)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 offsetx 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
