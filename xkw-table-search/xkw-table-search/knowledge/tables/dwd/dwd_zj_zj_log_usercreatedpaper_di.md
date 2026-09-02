# `dwd_zj_zj_log_usercreatedpaper_di`

- 层级：`dwd`
- 本地表描述：主键id
- 主题标签：user, content_resource, log_behavior, exam_question
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`user_id`、`product_id`、`application_id`、`download_time`、`course_id`、`org_id`、`zj_user_type_id`、`zj_res_id`、`qbm_paper_id`、`zj_course_id`、`user_pay_point`、`user_pay_money`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 主键id | ddl |
| `user_id` | `INT` | 用户id | ddl |
| `product_id` | `STRING` | 产品id | ddl |
| `application_id` | `STRING` | 应用id | ddl |
| `zj_client_devices` | `INT` | 组卷客户端设备 | ddl |
| `download_time` | `STRING` | 下载时间 | ddl |
| `course_id` | `INT` | 课程id | ddl |
| `org_id` | `INT` | 学校id | ddl |
| `zj_down_mode` | `INT` | 组卷下载方式：1组卷，2试卷，3专题，4单题 | ddl |
| `is_tob` | `INT` | 是否b端用户 | ddl |
| `zj_user_type_id` | `INT` | 组卷用户类型id | ddl |
| `zj_res_id` | `INT` | 组卷的资源id | ddl |
| `qbm_paper_id` | `STRING` | qbm的试卷id | ddl |
| `ques_count` | `INT` | 下载题数 | ddl |
| `zj_course_id` | `INT` | 组卷课程id | ddl |
| `paper_name` | `STRING` | 试卷名称 | ddl |
| `user_pay_point` | `INT` | 下载试卷所花点数 | ddl |
| `user_pay_money` | `DECIMAL(20,2` | 未提供字段注释 | ddl |
| `dt` | `STRING` | 天分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zj_zj_zujuanwebsitedata_tbl_003_usercreatedpaper`, `zj_usercreatedpaper`, `ods.ods_zj_zj_zujuancorequesdata_tbl_004_paperlist`, `ods.ods_zj_zj_quesplatform_tbl_bankidtocourseid`, `ods.ods_zj_zj_zujuanwebsitedata_tbl_003_userdownloadinfo`
- 关联条件：zj_paperlist.id = zj_usercreatedpaper.sourceid
LEFT；zj_usercreatedpaper.quesbankid = e.bankid
LEFT；f.paperid = zj_usercreatedpaper.id
- 过滤条件：dt = '${dt}' )

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 user_pay_money 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
