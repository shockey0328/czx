# `bi_zxxk_zxxk_user_action_1m_stats_di`

- 层级：`bi`
- 本地表描述：月份
- 主题标签：user, log_behavior
- 数据粒度：按 mth_dt ) 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`mth_dt`、`c_active_user_cnt`、`c_active_user_cnt_last_mth`、`c_active_user_cnt_last_year`、`new_reg_user_cnt`、`new_reg_user_cnt_last_mth`、`new_reg_user_cnt_last_year`、`new_device_cnt`、`new_device_cnt_last_mth`、`new_device_cnt_last_year`、`pay_user_cnt`、`pay_user_cnt_last_mth`、`pay_user_cnt_last_year`、`active_mbr_cnt`、`active_mbr_cnt_last_mth`、`active_mbr_cnt_last_year`、`buy_mbr_cnt`、`buy_mbr_cnt_last_mth`、`buy_mbr_cnt_last_year`、`c_user_cnt`、`c_user_cnt_last_mth`、`c_user_cnt_last_year`、`total_user_cnt`、`total_user_cnt_last_mth`、`total_user_cnt_last_year`、`dl_consume_amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `mth_dt` | `STRING` | 月份 | ddl |
| `application_name` | `STRING` | 终端名称 | ddl |
| `c_active_user_cnt` | `INT` | c端活跃用户数 | ddl |
| `c_active_user_cnt_last_mth` | `INT` | c端活跃用户数上月 | ddl |
| `c_active_user_cnt_last_year` | `INT` | c端活跃用户数去年 | ddl |
| `new_reg_user_cnt` | `INT` | 新注册用户数 | ddl |
| `new_reg_user_cnt_last_mth` | `INT` | 新注册用户数上月 | ddl |
| `new_reg_user_cnt_last_year` | `INT` | 新注册用户数去年 | ddl |
| `new_device_cnt` | `INT` | 新设备数 | ddl |
| `new_device_cnt_last_mth` | `INT` | 新设备数上月 | ddl |
| `new_device_cnt_last_year` | `INT` | 新设备数去年 | ddl |
| `pay_user_cnt` | `INT` | 付费用户数 | ddl |
| `pay_user_cnt_last_mth` | `INT` | 付费用户数上月 | ddl |
| `pay_user_cnt_last_year` | `INT` | 付费用户数去年 | ddl |
| `active_mbr_cnt` | `INT` | 活跃会员数 | ddl |
| `active_mbr_cnt_last_mth` | `INT` | 活跃会员数上月 | ddl |
| `active_mbr_cnt_last_year` | `INT` | 活跃会员数去年 | ddl |
| `buy_mbr_cnt` | `INT` | 购买会员数 | ddl |
| `buy_mbr_cnt_last_mth` | `INT` | 购买会员数上月 | ddl |
| `buy_mbr_cnt_last_year` | `INT` | 购买会员数去年 | ddl |
| `c_user_cnt` | `INT` | c端用户数 | ddl |
| `c_user_cnt_last_mth` | `INT` | c端用户数上月 | ddl |
| `c_user_cnt_last_year` | `INT` | c端用户数去年 | ddl |
| `total_user_cnt` | `INT` | 总用户数 | ddl |
| `total_user_cnt_last_mth` | `INT` | 总用户数上月 | ddl |
| `total_user_cnt_last_year` | `INT` | 总用户数去年 | ddl |
| `dl_consume_amount` | `DECIMAL(20,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`bi.bi_zxxk_zxxk_user_action_1d`, `bi.bi_pub_pub_flr_xyiolog_newdevice_stas_di`, `t1`, `t3`, `dmp_cdm.dim_pub_pub_application`, `bi.bi_zxxk_zxxk_user_action_1m_stats_di`, `t2`
- 关联条件：a.application_id=e.application_id
         left；b.mth_dt=add_months('${mth}-01',-1) and coalesce(e.application_name,a.application_id)=b.application_name
         left；c.mth_dt=add_months('${mth}-01',-12) and coalesce(e.application_name,a.application_id)=c.application_name
         left；a.mth_dt=d.mth_dt and a.application_id=d.application_id
- 过滤条件：substring(a.dt,1,7)='${mth}'；mth_dt<'${mth}-01'
- 聚合函数：MAX(if(from_tbl>=100  and user_id>0 and is_tob = 0, 1,0), MAX(if(user_reg_date<>'' and dt=substring(user_reg_date,1,10), MAX(if(from_tbl>=100  and is_tob = 1, 1,0), MAX(if(from_tbl>=100  and is_tob <> 1, 1,0), MAX(if(paid_cnt >0, 1, 0), MAX(case when is_mbr = true then 1 else 0 end), MAX(case when buy_mbr = true then 1 else 0 end), SUM(dl_consume_amount), SUM(paid_amount), SUM(new_device_cnt), COUNT(DISTINCT case  when is_c_active=1 then user_id end), COUNT(DISTINCT case  when is_new_reg=1 then user_id  end)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 dl_consume_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
