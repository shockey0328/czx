# `dim_pub_pub_user`

- 层级：`dim`
- 本地表描述：用户ID
- 主题标签：user
- 数据粒度：按 userid) useraccount on u.userid=useraccount.userid ; 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`user_id`、`user_school_id`、`ssm_school_id`、`ssm_user_type`、`course_ids`、`course_id`、`grade_id`、`profession_id`、`user_login_name`、`user_group_id`、`last_login_time`、`user_reg_time`、`activated_time`、`update_time`、`reg_product`、`product_id`、`application_id`、`zj_create_paper_num`、`zj_first_login_time`、`zj_last_login_time`、`link_province`、`stage_id`、`textbook_version_id`、`zj_first_dl_time`、`user_account_balance`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `user_id` | `INT` | 用户ID | ddl |
| `user_school_id` | `INT` | 学校ID。用户自编辑 | ddl |
| `ssm_school_id` | `INT` | ssm学校ID | ddl |
| `ssm_user_type` | `INT` | 用户类型。0-普通教师，1-30天单账号，2-回收的单账号，3-学校高级管理员，4-学校超级管理员，5-单账号学校账号，6-单账号试用账号 | ddl |
| `course_ids` | `STRING` | 课程IDs。逗号分隔的课程id组成的字符串。用户自编辑 | ddl |
| `course_id` | `INT` | 课程IDs的第一个id。 | ddl |
| `grade_id` | `INT` | 年级ID。用户自编辑 | ddl |
| `profession_id` | `INT` | 身份ID | ddl |
| `user_login_name` | `STRING` | 登录名 | ddl |
| `real_name` | `STRING` | 真实姓名 | ddl |
| `password_grade` | `INT` | 密码强度等级 | ddl |
| `mask` | `INT` | 用户标记 | ddl |
| `mail` | `STRING` | 用户邮箱 | ddl |
| `phone` | `STRING` | 用户手机 | ddl |
| `user_group_id` | `INT` | c端用户等级，学科网在用 | ddl |
| `logins` | `INT` | 登录次数 | ddl |
| `last_login_time` | `STRING` | 用户最后登录时间 | ddl |
| `last_login_ip` | `STRING` | 最后登录IP | ddl |
| `user_reg_time` | `STRING` | 用户注册时间 | ddl |
| `app_key` | `STRING` | 注册来源 | ddl |
| `activated_time` | `STRING` | 激活时间 | ddl |
| `update_time` | `STRING` | 数据的更新时间 | ddl |
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
| `link_province` | `STRING` | 所在省份 | ddl |
| `link_city` | `STRING` | 所在城市 | ddl |
| `link_county` | `STRING` | 所在区县 | ddl |
| `stage_id` | `INT` | 学段id | ddl |
| `textbook_version_id` | `INT` | 版本id | ddl |
| `qq` | `STRING` | qq | ddl |
| `link_micro` | `STRING` | 微信 | ddl |
| `nick` | `STRING` | 昵称 | ddl |
| `zj_reg_is_tob` | `INT` | 组卷注册是否为B端 | ddl |
| `zj_first_login_is_tob` | `INT` | 组卷首次登录是否为B端 | ddl |
| `zj_first_dl_time` | `STRING` | 组卷首次下载时间 | ddl |
| `user_account_balance` | `DECIMAL(20,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_ump_uc_log_tbl_t_userregister`, `tmp`, `dim.dim_pub_pub_product_uc`, `dim.dim_pub_pub_application_uc`, `dwd.dwd_zj_zj_log_usercreatedpaper_di`, `ods.ods_zj_zj_zujuanwebsitedata_tbl_001_zujuanuserroles`, `ods.ods_ump_uc_uc_tbl_t_user`, `ods.ods_ump_uc_ssm_tbl_school_users`, `ods.ods_ump_uc_uc_tbl_t_userprofile`, `u_reg`, `zj_dl`, `zj_user_role`, `ods.ods_zj_zj_zujuanwebsitedata_tbl_001_zujuanuser`, `ods.ods_ump_uc_uc_tbl_t_useraccount`
- 关联条件：a.product_union_key=b.union_key
                  left；a.application_union_key =c.union_key
     ),
     zj_dl as (
         select user_id,min(download_time) as download_time
         from ${dwd}.dwd_zj_zj_log_usercreatedpaper_di；u.userid=u_pro.userid
         left；u.userid=u_reg.user_id
         left；u.userid=zj_dl.user_id
         left；u.userid=zj_user_role.user_id
         left
- 过滤条件：a.dt>='2000-01-01' ), u_reg as ( select a.userid user_id ,a.userip reg_ip ,a.regtime reg_time ,a.product uc_product ,a.terminal uc_terminal ,a.reg_service ,coalesce(b.product_id,'other') product_id ,coalesce(c.application_id,'other') application_id ,a.phone as phone ,a.dt from tmp a left join ${dim}.dim_pub_pub_product_uc b on a.product_union_key=b.union_key left join ${dim}.dim_pub_pub_application_uc c on a.application_union_key =c.union_key ), zj_dl as ( select user_id,min(download_time) as download_time from ${dwd}.dwd_zj_zj_log_usercreatedpaper_di where dt>='2000-01-01'；group_id in (3,4,5)
- 聚合函数：MIN(download_time), MAX(userrmb)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 user_account_balance 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
