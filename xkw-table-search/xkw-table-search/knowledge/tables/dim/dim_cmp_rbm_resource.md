# `dim_cmp_rbm_resource`

- 层级：`dim`
- 本地表描述：资料ID
- 主题标签：content_resource
- 数据粒度：按 resource_id ) ,rbm_res_catalogs AS ( SELECT resource_id ,CONCAT_WS('|',COLLECT_SET(m_catalogs.name)) AS catalog_names FROM ( SELECT catalog_id ,resource_id FROM ( SELECT resource_id ,catalog_ids FROM rb_1 ) tmp LATERAL VIEW EXPLODE(SPLIT(catalog_ids,',')) catalog_ids AS catalog_id ) resource_catalogs LEFT JOIN ${dim}.dim_cmp_mdm_textbook_catalog m_catalogs ON m_catalogs.id = resource_catalogs.catalog_id GROUP BY resource_id ) ,cmp_areas AS ( SELECT resource_biz5.resource_id ,CONCAT_WS('|',COLLECT_SET(area.area_name)) AS city_names FROM ( SELECT resource_id ,city_id FROM ( SELECT resource_id ,area_ids FROM rb_1 ) tmp LATERAL VIEW EXPLODE(SPLIT(area_ids,',')) mytable AS city_id WHERE city_id = 1 OR ( LENGTH(city_id) >= 4 AND SUBSTR(city_id,3,2) != '00' ) ) resource_biz5 LEFT JOIN ${dim}.dim_pub_pub_area area ON IF(resource_biz5.city_id = 1,resource_biz5.city_id,CONCAT(SUBSTR(resource_biz5.city_id,1,4),'00')) = area.code GROUP BY resource_biz5.resource_id ) 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`res_id`、`fin_res_contract_type`、`source_type_one_level_id`、`source_type_one_level_name`、`source_type_two_level_id`、`source_type_two_level_name`、`province_name`、`scenes_one_id`、`scenes_two_id`、`status_name`、`school_name`、`school_level_name`、`area_names`、`exam_area_name`、`shop_name`、`provider`、`album_ids`、`stage_id`、`subject_id`、`school_level_ids`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `res_id` | `INT` | 资料ID | ddl |
| `res_title` | `STRING` | 资料标题 | ddl |
| `res_applicable_year` | `INT` | 适用年份 | ddl |
| `res_applicable_month` | `INT` | 适用月份 | ddl |
| `res_price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `fin_res_contract_type` | `int` | 财务口径资料所属合同类型  关联维度表 dim2.dim_fin_asset_dimension | alter |
| `course_name` | `string` | 课程名称 | alter |
| `grade_name` | `string` | 年级名称 | alter |
| `commercial_level_name` | `string` | 商业等级名称 | alter |
| `source_type_one_level_id` | `int` | 资源类型1级id | alter |
| `source_type_one_level_name` | `string` | 资源类型1级名称 | alter |
| `source_type_two_level_id` | `int` | 资源类型2级id | alter |
| `source_type_two_level_name` | `string` | 资源类型2级名称 | alter |
| `province_name` | `string` | 省份名称 | alter |
| `scenes_one_id` | `int` | 应用场景1级id | alter |
| `scenes_one_name` | `string` | 应用场景1级名称 | alter |
| `scenes_two_id` | `int` | 应用场景2级id | alter |
| `scenes_two_name` | `string` | 应用场景2级名称 | alter |
| `status_name` | `string` | 状态名称 | alter |
| `source_application_channel_name` | `string` | 上传通道名称 | alter |
| `textbook_name` | `string` | 教材（课本）名称 | alter |
| `textbook_version_name` | `string` | 教材版本名称 | alter |
| `catalog_names` | `string` | 章节名称（多个用竖杠分隔） | alter |
| `kpoint_names` | `string` | 知识点名称（多个用竖杠分隔） | alter |
| `school_name` | `string` | 所属的学校名称 | alter |
| `school_level_name` | `string` | 学校等级名称 | alter |
| `area_names` | `string` | 城市或者区县名称 | alter |
| `exam_scope_name` | `string` | 考试范围名称 | alter |
| `exam_area_name` | `string` | 考区名称 | alter |
| `shop_name` | `string` | 店铺名称 | alter |
| `provider` | `string` | 提供者 | alter |
| `uploader` | `string` | 上传人 | alter |
| `last_auditor` | `string` | 审核人 | alter |
| `paper_media_name` | `string` | 试卷媒介：图片版、文字版、空 | alter |
| `out_file_name` | `string` | 扩展名 | alter |
| `album_ids` | `string` | 专辑IDS | alter |
| `stage_id` | `int` | 学段ID | alter |
| `stage_name` | `string` | 学段 | alter |
| `subject_id` | `int` | 学科ID | alter |
| `subject_name` | `string` | 学科 | alter |
| `hits` | `int` | 总点击量（前台浏览量） | alter |
| `down_hits` | `int` | 总下载点击量（前台下载量） | alter |
| `school_level_ids` | `string` | 学校等级 | alter |
| `storage_mode` | `STRING` | 资料结构模式。 | alter |
| `oss_folder` | `STRING` | 存储目录。SINGLE：单文件，MASTER_SLAVE：主副文件，ZIP_COMPATIBLE：压缩包 | alter |
| `out_file_version` | `STRING comment '输出文件(out_file_name` | 未提供字段注释 | alter |
| `cover_oss_path` | `STRING` | 封面图oss key。相对bucket：zxxk-images 的UpImages目录。域名img.zxxk.com也是映射到UpImages目录 | alter |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_cmp_rbm_rbm_tbl_resource`, `ods.ods_cmp_rbm_rbm_tbl_resource_biz`, `ods.ods_cmp_rbm_rbm_tbl_resource_timeline`, `ods.ods_cmp_rbm_rbm_tbl_bundle_node`, `ods.ods_cmp_mdm_mdm_tbl_courses`, `ods.ods_cmp_mdm_mdm_tbl_stages`, `ods.ods_cmp_mdm_mdm_tbl_subjects`, `ods.ods_zxxk_zxxk_hit_tbl_document_pv`, `ods.ods_zxxk_zxxk_hit_tbl_document_download`, `ods.ods_cmp_rbm_rbm_tbl_resource_quality`, `ods.ods_cmp_drm_drm_tbl_resource`, `ods.ods_cmp_rbm_rbm_tbl_resource_operator`, `ods.ods_zxxk_zxxk_xkw_resource_tbl_document`, `ods.ods_cmp_rbm_rbm_tbl_resource_audit`, `ods.ods_cmp_rbm_rbm_tbl_resource_supervision`, `ods.ods_zxxk_zxxk_log_tbl_cl_pointincreinfolog`, `ods.ods_zxxk_zxxk_settle_tbl_profit_incre_price_log`, `ods.ods_cmp_rbm_rbm_tbl_resource_ex_tag`, `ods.ods_cmp_rbm_rbm_tbl_resource_text`, `dim.dim_pub_pub_course`, `dim.dim_pub_pub_grade`, `dim.dim_cmp_rbm_tag`, `dim.dim_pub_pub_organization`, `dim.dim_pub_pub_area`, `dim.dim_zxxk_zxxk_shop`, `dim.dim_cmp_pub_textbooks`, `dim.dim_cmp_mdm_textbook_version`, `dim.dim_cmp_pub_exam_areas`, `r`, `rb`, `rb_1`, `dim.dim_cmp_pub_knowledge_points`, `dim.dim_cmp_mdm_textbook_catalog`, `tmp_rbm_bundle_node`, `rt`, `courses`, `stages`, `subjects`, `pv`, `download`, `ro`, `provider_first`, `rbm_tag`, `dr`, `xkw_resource`, `cl_pointincreinfolog`, `rbm_resource_audit`, `rbm_resource_auditpass`, `rbm_resource_supervision`, `rbm_reject_reason_tag`, `rbm_resource_ex_tag`, `rbm_resource_text`, `rquality`, `dwd.dwd_doc_sms_crm_contract_list_df`, `pub_course`, `pub_grade`, `pub_area`, `dim_status`, `cmp_textbook`, `cmp_textbook_version`, `pub_organization`, `exam_area`, `zxxk_shop`, `rbm_res_kpoints`, `rbm_res_catalogs`, `cmp_areas`, `ods.ods_cmp_rbm_rbm_tbl_resource_file`, `ods.ods_cmp_rbm_rbm_tbl_resource_group`, `ods.ods_cmp_rbm_rbm_tbl_resource_group_node`, `ods.ods_cmp_rbm_rbm_tbl_resource_quality_dimension_level`
- 关联条件：a.resource_id = b.id；r.id = rb.resource_id
)
,rbm_res_kpoints AS
(
    SELECT  resource_id
            ,CONCAT_WS('|',COLLECT_SET(m_kpoints.name)) AS kpoint_names
    FROM    (
                SELECT  kpoint_id
                        ,resource_id
                FROM    (
                            SELECT  resource_id
                                    ,kpoint_ids
                            FROM    rb_1
                        ) tmp
                LATERAL VIEW EXPLODE(SPLIT(kpoint_ids,',')) kpoint_ids AS kpoint_id
            ) resource_kpoints
    LEFT；m_kpoints.id = resource_kpoints.kpoint_id；m_catalogs.id = resource_catalogs.catalog_id；IF(resource_biz5.city_id = 1,resource_biz5.city_id,CONCAT(SUBSTR(resource_biz5.city_id,1,4),'00')) = area.code；tmp_rbm_bundle_node.target_id = r.id
LEFT；r.id = rb_1.resource_id
LEFT；r.id = rt.resource_id
LEFT
- 过滤条件：type = 'RESOURCE'；`type` = 'RESOURCE' ) ,provider_first AS ( SELECT a.provider_id ,MIN(b.create_time) provider_first_upload_time FROM ${ods}.ods_cmp_rbm_rbm_tbl_resource_operator a INNER JOIN ${ods}.ods_cmp_rbm_rbm_tbl_resource b ON a.resource_id = b.id WHERE `type` = 'RESOURCE'；rn = 1 ) ,rbm_resource_auditpass AS ( SELECT resource_id AS res_id ,start_time AS audit_last_starttime ,end_time AS audit_last_endtime ,result AS audit_last_result ,auditor AS audit_last_auditor FROM ( SELECT * ,ROW_NUMBER() OVER (PARTITION BY resource_id；result = 'PASS' AND latest = 1 AND end_time <> '' ) t1 WHERE rn = 1 ) ,rbm_reject_reason_tag AS ( SELECT resource_id AS res_id ,reject_reason_tag FROM ( SELECT * ,ROW_NUMBER() OVER (PARTITION BY resource_id；reject_reason_tag != '' AND reject_reason_tag IS NOT NULL AND end_time <> '' ) t1 WHERE rn = 1 ) ,rbm_resource_supervision AS ( SELECT resource_id AS res_id ,create_date AS supervision_last_time ,result AS supervision_last_result FROM ( SELECT * ,ROW_NUMBER() OVER (PARTITION BY resource_id；rn = 1 ) -- 升点表旧表和新表有冗余，已新表为准 ,cl_pointincreinfolog AS ( SELECT res_id ,SUM(inc_price) inc_price FROM ( SELECT infoid AS res_id ,COUNT(*) * 0.5 AS inc_price FROM ${ods}.ods_zxxk_zxxk_log_tbl_cl_pointincreinfolog WHERE softpoint IS NOT NULL AND infoid NOT IN ( SELECT resource_id FROM ${ods}.ods_zxxk_zxxk_settle_tbl_profit_incre_price_log；incre_price IS NOT NULL；city_id = 1 OR ( LENGTH(city_id) >= 4 AND SUBSTR(city_id,3,2) != '00' ) ) resource_biz5 LEFT JOIN ${dim}.dim_pub_pub_area area ON IF(resource_biz5.city_id = 1,resource_biz5.city_id,CONCAT(SUBSTR(resource_biz5.city_id,1,4),'00')) = area.code
- 聚合函数：MIN(b.create_time), MAX(operation_tags), SUM(inc_price), COUNT(*)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 out_file_version 缺少注释
- 字段 res_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
