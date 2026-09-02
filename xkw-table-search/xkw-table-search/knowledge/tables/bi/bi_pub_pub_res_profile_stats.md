# `bi_pub_pub_res_profile_stats`

- 层级：`bi`
- 本地表描述：计算日期
- 主题标签：content_resource, log_behavior
- 数据粒度：按 dt,time_grain,stage_name,subject_name,course_name,commercial_level_extend_name 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`dt`、`time_grain`、`res_audit_cnt`、`res_audit_cnt_last_year`、`res_audit_cnt_2_years_ago`、`res_audit_cnt_last_period`、`res_second_audit_cnt`、`res_second_audit_cnt_last_year`、`res_second_audit_cnt_2_years_ago`、`res_second_audit_cnt_last_period`、`exam_res_upload_new_cnt`、`exam_res_upload_new_cnt_last_year`、`exam_res_upload_new_cnt_2_years_ago`、`exam_res_upload_new_cnt_last_period`、`exam_res_supervision_cnt`、`exam_res_supervision_cnt_last_year`、`exam_res_supervision_cnt_2_years_ago`、`exam_res_supervision_cnt_last_period`、`exam_res_supervision_pass_cnt`、`exam_res_supervision_pass_cnt_last_year`、`exam_res_supervision_pass_cnt_2_years_ago`、`practice_res_upload_new_cnt`、`practice_res_upload_new_cnt_last_year`、`practice_res_upload_new_cnt_2_years_ago`、`practice_res_upload_new_cnt_last_period`、`practice_res_supervision_cnt`、`practice_res_supervision_cnt_last_year`、`practice_res_supervision_cnt_2_years_ago`、`practice_res_supervision_cnt_last_period`、`practice_res_supervision_pass_cnt`、`practice_res_supervision_pass_cnt_last_year`、`practice_res_supervision_pass_cnt_2_years_ago`、`res_supervision_cnt`、`res_supervision_cnt_last_year`、`res_supervision_cnt_2_years_ago`、`res_supervision_out24h_cnt`、`res_supervision_out24h_cnt_last_year`、`res_supervision_out24h_cnt_2_years_ago`、`res_supervision_in24h_cnt`、`res_supervision_in24h_cnt_last_year`、`res_supervision_in24h_cnt_2_years_ago`、`res_upload_cnt`、`res_upload_cnt_last_year`、`res_upload_cnt_2_years_ago`、`res_refund_cnt`、`res_refund_cnt_last_year`、`res_refund_cnt_2_years_ago`、`res_publish_cnt`、`res_publish_cnt_last_year`、`res_publish_cnt_2_years_ago`、`res_upload_new_cnt`、`res_upload_new_cnt_last_year`、`res_upload_new_cnt_2_years_ago`、`res_free_cnt`、`res_free_cnt_last_year`、`res_free_cnt_2_years_ago`、`res_free_cnt_last_period`、`res_initial_free_cnt`、`res_initial_free_cnt_last_year`、`res_initial_free_cnt_2_years_ago`、`res_initial_free_cnt_last_period`、`res_increase_cnt`、`res_increase_cnt_last_year`、`res_increase_cnt_2_years_ago`、`res_increase_cnt_last_period`、`res_cnt`、`res_cnt_last_year`、`res_cnt_2_years_ago`、`res_cnt_last_period`、`res_cnt_dl_publish30d`、`res_cnt_dl_publish30d_last_year`、`res_cnt_dl_publish30d_2_years_ago`、`res_cnt_dl_publish30d_last_period`、`paid_sum_publish30d`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `dt` | `STRING` | 计算日期 | ddl |
| `time_grain` | `STRING` | 统计粒度 | ddl |
| `stage_name` | `STRING` | 学段 | ddl |
| `subject_name` | `STRING` | 学科 | ddl |
| `course_name` | `STRING` | 课程名称 | ddl |
| `commercial_level_extend_name` | `STRING` | 商业等级 | ddl |
| `res_audit_cnt` | `INT` | 资料审核数量 | ddl |
| `res_audit_cnt_last_year` | `INT` | 去年同期资料审核数量 | ddl |
| `res_audit_cnt_2_years_ago` | `INT` | 2年前同期资料审核数量 | ddl |
| `res_audit_cnt_last_period` | `INT` | 上个月资料审核数量 | ddl |
| `res_second_audit_cnt` | `INT` | 秒审资料数量 | ddl |
| `res_second_audit_cnt_last_year` | `INT` | 去年同期秒审资料数量 | ddl |
| `res_second_audit_cnt_2_years_ago` | `INT` | 2年前同期秒审资料数量 | ddl |
| `res_second_audit_cnt_last_period` | `INT` | 上个月秒审资料数量 | ddl |
| `exam_res_upload_new_cnt` | `INT` | 正式考卷上新量 | ddl |
| `exam_res_upload_new_cnt_last_year` | `INT` | 去年同期正式考卷上新量 | ddl |
| `exam_res_upload_new_cnt_2_years_ago` | `INT` | 2年前同期正式考卷上新量 | ddl |
| `exam_res_upload_new_cnt_last_period` | `INT` | 上个月正式考卷上新量 | ddl |
| `exam_res_supervision_cnt` | `INT` | 正式考卷督查量 | ddl |
| `exam_res_supervision_cnt_last_year` | `INT` | 去年同期正式考卷督查量 | ddl |
| `exam_res_supervision_cnt_2_years_ago` | `INT` | 2年前同期正式考卷督查量 | ddl |
| `exam_res_supervision_cnt_last_period` | `INT` | 上个月正式考卷督查量 | ddl |
| `exam_res_supervision_pass_cnt` | `INT` | 正式考卷督查通过量 | ddl |
| `exam_res_supervision_pass_cnt_last_year` | `INT` | 去年同期正式考卷督查通过量 | ddl |
| `exam_res_supervision_pass_cnt_2_years_ago` | `INT` | 2年前同期正式考卷督查通过量 | ddl |
| `practice_res_upload_new_cnt` | `INT` | 非正式考卷上新量 | ddl |
| `practice_res_upload_new_cnt_last_year` | `INT` | 去年同期非正式考卷上新量 | ddl |
| `practice_res_upload_new_cnt_2_years_ago` | `INT` | 2年前同期非正式考卷上新量 | ddl |
| `practice_res_upload_new_cnt_last_period` | `INT` | 上个月非正式考卷上新量 | ddl |
| `practice_res_supervision_cnt` | `INT` | 非正式考卷督查量 | ddl |
| `practice_res_supervision_cnt_last_year` | `INT` | 去年同期非正式考卷督查量 | ddl |
| `practice_res_supervision_cnt_2_years_ago` | `INT` | 2年前同期非正式考卷督查量 | ddl |
| `practice_res_supervision_cnt_last_period` | `INT` | 上个月非正式考卷督查量 | ddl |
| `practice_res_supervision_pass_cnt` | `INT` | 非正式考卷督查通过量 | ddl |
| `practice_res_supervision_pass_cnt_last_year` | `INT` | 去年同期非正式考卷督查通过量 | ddl |
| `practice_res_supervision_pass_cnt_2_years_ago` | `INT` | 2年前同期非正式考卷督查通过量 | ddl |
| `res_supervision_cnt` | `INT` | 督查量 | ddl |
| `res_supervision_cnt_last_year` | `INT` | 去年同期督查量 | ddl |
| `res_supervision_cnt_2_years_ago` | `INT` | 2年前同期督查量 | ddl |
| `res_supervision_out24h_cnt` | `INT` | 督查时效大于24h量 | ddl |
| `res_supervision_out24h_cnt_last_year` | `INT` | 去年同期督查时效大于24h量 | ddl |
| `res_supervision_out24h_cnt_2_years_ago` | `INT` | 2年前同期督查时效大于24h量 | ddl |
| `res_supervision_in24h_cnt` | `INT` | 督查时效小于24h量 | ddl |
| `res_supervision_in24h_cnt_last_year` | `INT` | 去年同期督查时效小于24h量 | ddl |
| `res_supervision_in24h_cnt_2_years_ago` | `INT` | 2年前同期督查时效小于24h量 | ddl |
| `res_upload_cnt` | `INT` | 上传量 | ddl |
| `res_upload_cnt_last_year` | `INT` | 去年同期上传量 | ddl |
| `res_upload_cnt_2_years_ago` | `INT` | 2年前同期上传量 | ddl |
| `res_refund_cnt` | `INT` | 退稿量 | ddl |
| `res_refund_cnt_last_year` | `INT` | 去年同期退稿量 | ddl |
| `res_refund_cnt_2_years_ago` | `INT` | 2年前同期退稿量 | ddl |
| `res_publish_cnt` | `INT` | 发布资料量 | ddl |
| `res_publish_cnt_last_year` | `INT` | 去年同期发布资料量 | ddl |
| `res_publish_cnt_2_years_ago` | `INT` | 2年前同期发布资料量 | ddl |
| `res_upload_new_cnt` | `INT` | 资料上新量 | ddl |
| `res_upload_new_cnt_last_year` | `INT` | 去年同期资料上新量 | ddl |
| `res_upload_new_cnt_2_years_ago` | `INT` | 2年前同期资料上新量 | ddl |
| `res_free_cnt` | `INT` | 免费资料量 | ddl |
| `res_free_cnt_last_year` | `INT` | 去年同期免费资料量 | ddl |
| `res_free_cnt_2_years_ago` | `INT` | 2年前同期免费资料量 | ddl |
| `res_free_cnt_last_period` | `INT` | 上个月免费资料量 | ddl |
| `res_initial_free_cnt` | `INT` | 初始资料免费量 | ddl |
| `res_initial_free_cnt_last_year` | `INT` | 去年同期初始资料免费量 | ddl |
| `res_initial_free_cnt_2_years_ago` | `INT` | 2年前同期初始资料免费量 | ddl |
| `res_initial_free_cnt_last_period` | `INT` | 上个月初始资料免费量 | ddl |
| `res_increase_cnt` | `INT` | 升点资料量 | ddl |
| `res_increase_cnt_last_year` | `INT` | 去年同期升点资料量 | ddl |
| `res_increase_cnt_2_years_ago` | `INT` | 2年前同期升点资料量 | ddl |
| `res_increase_cnt_last_period` | `INT` | 上个月升点资料量 | ddl |
| `res_cnt` | `INT` | 发布资料量 | ddl |
| `res_cnt_last_year` | `INT` | 去年同期发布资料量 | ddl |
| `res_cnt_2_years_ago` | `INT` | 2年前同期发布资料量 | ddl |
| `res_cnt_last_period` | `INT` | 上个周期发布资料量 | ddl |
| `res_cnt_dl_publish30d` | `INT` | 发布30天有下载资料量 | ddl |
| `res_cnt_dl_publish30d_last_year` | `INT` | 去年同期发布30天有下载资料量 | ddl |
| `res_cnt_dl_publish30d_2_years_ago` | `INT` | 2年前同期发布30天有下载资料量 | ddl |
| `res_cnt_dl_publish30d_last_period` | `INT` | 上个月同期发布30天有下载资料量 | ddl |
| `paid_sum_publish30d` | `decimal(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`bi.bi_pub_pub_res_profile_create_stats`, `bi.bi_pub_pub_res_profile_publish_stats`, `bi.bi_pub_pub_res_profile_download_stats`, `t1`, `t2`, `t3`, `t4`, `bi.bi_pub_pub_res_profile_stats`
- 过滤条件：dt is not NULL and time_grain is not null and dt >= concat(substring(add_months('${dt}',-2),1,7),'-01') ), t2 as ( select dt, time_grain, coalesce(stage_name,'') as stage_name, coalesce(subject_name,'') as subject_name, coalesce(course_name,'') as course_name, coalesce(commercial_level_extend_name,'') as commercial_level_extend_name, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0, coalesce(res_cnt,0) as res_cnt, coalesce(res_cnt_last_year,0) as res_cnt_last_year, coalesce(res_cnt_2_years_ago,0) as res_cnt_2_years_ago, coalesce(res_cnt_last_period,0) as res_cnt_last_period, coalesce(res_cnt_dl_publish30d,0) as res_cnt_dl_publish30d, coalesce(res_cnt_dl_publish30d_last_year,0) as res_cnt_dl_publish30d_last_year, coalesce(res_cnt_dl_publish30d_2_years_ago,0) as res_cnt_dl_publish30d_2_years_ago, coalesce(res_cnt_dl_publish30d_last_period,0) as res_cnt_dl_publish30d_last_period, coalesce(paid_sum_publish30d,0) as paid_sum_publish30d, coalesce(paid_sum_publish30d_last_year,0) as paid_sum_publish30d_last_year, coalesce(paid_sum_publish30d_2_years_ago,0) as paid_sum_publish30d_2_years_ago, coalesce(paid_sum_publish30d_last_period,0) as paid_sum_publish30d_last_period, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0 from ${bi}.bi_pub_pub_res_profile_publish_stats where dt is not NULL and time_grain is not null and length(dt) = 10 and dt >= concat(substring(add_months('${dt}',-2),1,7),'-01') ), t3 as ( select dt, time_grain, coalesce(stage_name,'') as stage_name, coalesce(subject_name,'') as subject_name, coalesce(course_name,'') as course_name, coalesce(commercial_level_extend_name,'') as commercial_level_extend_name, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0, coalesce(dl_cnt_b_right,0) as dl_cnt_b_right, coalesce(dl_cnt_b_right_last_year,0) as dl_cnt_b_right_last_year, coalesce(dl_cnt_b_right_2_years_ago,0) as dl_cnt_b_right_2_years_ago, coalesce(dl_cnt_b_right_last_period,0) as dl_cnt_b_right_last_period, coalesce(dl_cnt_c_right,0) as dl_cnt_c_right, coalesce(dl_cnt_c_right_last_year,0) as dl_cnt_c_right_last_year, coalesce(dl_cnt_c_right_2_years_ago,0) as dl_cnt_c_right_2_years_ago, coalesce(dl_cnt_c_right_last_period,0) as dl_cnt_c_right_last_period, coalesce(dl_cnt_c_fee,0) as dl_cnt_c_fee, coalesce(dl_cnt_c_fee_last_year,0) as dl_cnt_c_fee_last_year, coalesce(dl_cnt_c_fee_2_years_ago,0) as dl_cnt_c_fee_2_years_ago, coalesce(dl_cnt_c_fee_last_period,0) as dl_cnt_c_fee_last_period, coalesce(dl_cnt_resprice_free_c,0) as dl_cnt_resprice_free_c, coalesce(dl_cnt_resprice_free_c_last_year,0) as dl_cnt_resprice_free_c_last_year, coalesce(dl_cnt_resprice_free_c_2_years_ago,0) as dl_cnt_resprice_free_c_2_years_ago, coalesce(dl_cnt_resprice_free_c_last_period,0) as dl_cnt_resprice_free_c_last_period, coalesce(dl_cnt_c_kaquan,0) as dl_cnt_c_kaquan, coalesce(dl_cnt_c_kaquan_last_year,0) as dl_cnt_c_kaquan_last_year, coalesce(dl_cnt_c_kaquan_2_years_ago,0) as dl_cnt_c_kaquan_2_years_ago, coalesce(dl_cnt_c_kaquan_last_period,0) as dl_cnt_c_kaquan_last_period, coalesce(paid_sum_b_right,0) as paid_sum_b_right, coalesce(paid_sum_b_right_last_year,0) as paid_sum_b_right_last_year, coalesce(paid_sum_b_right_2_years_ago,0) as paid_sum_b_right_2_years_ago, coalesce(paid_sum_b_right_last_period,0) as paid_sum_b_right_last_period, coalesce(paid_sum_c_right,0) as paid_sum_c_right, coalesce(paid_sum_c_right_last_year,0) as paid_sum_c_right_last_year, coalesce(paid_sum_c_right_2_years_ago,0) as paid_sum_c_right_2_years_ago, coalesce(paid_sum_c_right_last_period,0) as paid_sum_c_right_last_period, coalesce(paid_sum_c_fee,0) as paid_sum_c_fee, coalesce(paid_sum_c_fee_last_year,0) as paid_sum_c_fee_last_year, coalesce(paid_sum_c_fee_2_years_ago,0) as paid_sum_c_fee_2_years_ago, coalesce(paid_sum_c_fee_last_period,0) as paid_sum_c_fee_last_period, coalesce(paid_sum_resprice_free_c,0) as paid_sum_resprice_free_c, coalesce(paid_sum_resprice_free_c_last_year,0) as paid_sum_resprice_free_c_last_year, coalesce(paid_sum_resprice_free_c_2_years_ago,0) as paid_sum_resprice_free_c_2_years_ago, coalesce(paid_sum_resprice_free_c_last_period,0) as paid_sum_resprice_free_c_last_period, coalesce(paid_sum_c_kaquan,0) as paid_sum_c_kaquan, coalesce(paid_sum_c_kaquan_last_year,0) as paid_sum_c_kaquan_last_year, coalesce(paid_sum_c_kaquan_2_years_ago,0) as paid_sum_c_kaquan_2_years_ago, coalesce(paid_sum_c_kaquan_last_period,0) as paid_sum_c_kaquan_last_period from ${bi}.bi_pub_pub_res_profile_download_stats where dt is not NULL and time_grain is not null and dt >= concat(substring(add_months('${dt}',-2),1,7),'-01') ), t4 as ( select * from t1；dt < concat(substring(add_months('${dt}',-2),1,7),'-01')
- 聚合函数：SUM(res_audit_cnt), SUM(res_audit_cnt_last_year), SUM(res_audit_cnt_2_years_ago), SUM(res_audit_cnt_last_period), SUM(res_second_audit_cnt), SUM(res_second_audit_cnt_last_year), SUM(res_second_audit_cnt_2_years_ago), SUM(res_second_audit_cnt_last_period), SUM(exam_res_upload_new_cnt), SUM(exam_res_upload_new_cnt_last_year), SUM(exam_res_upload_new_cnt_2_years_ago), SUM(exam_res_upload_new_cnt_last_period)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 paid_sum_publish30d 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
