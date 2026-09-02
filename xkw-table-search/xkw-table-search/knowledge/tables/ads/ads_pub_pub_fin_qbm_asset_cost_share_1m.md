# `ads_pub_pub_fin_qbm_asset_cost_share_1m`

- 层级：`ads`
- 本地表描述：rbm的资料id
- 主题标签：finance
- 数据粒度：按 mth ) ,t2 as (select substring(a.dt,1,7) mth ,sum(case when a.sal_type in ('QUES_AUDIT_INCOME' ,'REWARD_MONTH_QUALITY' ,'SCHEDULER_MANAGEMENT' ,'SUBSIDY') then a.sal_amount end) cost_qbm_incentive from ${dwd}.dwd_cmp_qbm_trd_res_sal_di a where a.dt>='${mth}-01' and substring(a.dt,1,7)='${mth}' group by substring(a.dt,1,7) ) ,t3 as (select mth ,sum(case when type_id=15 and source='zxxk.qbm' then income-outlay end) total_cost ,sum(case when type_id=34 and source='zxxk.oa' and remark like '%$$$2' then income-outlay end) cost_oa_incentive from ${dwd}.dwd_ump_uc_trd_incomerecord_di a where a.mth='${mth}' group by mth ) ,t4 as (select a.mth ,a.cost_qbm_no_incentive ,c.total_cost ,b.cost_qbm_incentive ,a.cost_qbm_no_incentive/(c.total_cost-b.cost_qbm_incentive) cost_rate_incentive ,c.cost_oa_incentive ,c.cost_oa_incentive*(a.cost_qbm_no_incentive/(c.total_cost-b.cost_qbm_incentive)) cost_oa_incentive_paper ,b.cost_qbm_incentive*(a.cost_qbm_no_incentive/(c.total_cost-b.cost_qbm_incentive)) cost_qbm_incentive_paper from t1 a left join t2 b on a.mth=b.mth left join t3 c on a.mth=c.mth ) ,t5 as (select mth,paper_id,sum(cost_amount) paper_cost_amount from ${ads}.ads_pub_pub_fin_qbm_asset_cost_1m where mth='${mth}' group by mth,paper_id ) ,t6 as (select c.mth ,c.paper_id ,3 cost_type ,c.paper_cost_amount/e.cost_qbm_no_incentive*e.cost_qbm_incentive_paper cost_amount_share ,1 res_type ,2 res_cost_source ,'摊销数' cost_mark from t5 c join t4 e on c.mth=e.mth where e.cost_qbm_incentive>0 聚合
- 分区字段：mth
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`res_id`、`paper_id`、`cost_type`、`cost_amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `res_id` | `BIGINT` | rbm的资料id | ddl |
| `paper_id` | `BIGINT` | qbm的试卷id | ddl |
| `res_title` | `STRING` | rbm的资料标题 | ddl |
| `cost_type` | `INT` | 成本类型  关联dim2.dim_fin_asset_dimesion | ddl |
| `cost_amount` | `DECIMAL(20,2` | 未提供字段注释 | ddl |
| `mth` | `STRING` | 月分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ads.ads_pub_pub_fin_qbm_asset_cost_1m`, `dwd.dwd_cmp_qbm_trd_res_sal_di`, `dwd.dwd_ump_uc_trd_incomerecord_di`, `t1`, `t2`, `t3`, `t5`, `t4`, `dim.dim_cmp_rbm_resource`, `dim.dim_cmp_qbm_paper`, `t6`, `dim.dim_pub_pub_course`
- 关联条件：a.mth=b.mth
              left；a.mth=c.mth
    )
   ,t5 as
    (select mth,paper_id,sum(cost_amount) paper_cost_amount
     from ${ads}.ads_pub_pub_fin_qbm_asset_cost_1m；c.mth=e.mth；a.res_id=b.paper_source_id and b.source_application_id='zxxk'
         inner；b.paper_id=c.paper_id
         left；a.course_id=d.course_id
- 过滤条件：mth='${mth}'；a.dt>='${mth}-01' and substring(a.dt,1,7)='${mth}'；a.mth='${mth}'；e.cost_qbm_incentive>0；e.cost_oa_incentive>0 )；a.origin_uploader<>'学科网试题平台' and a.exam_scope in ('3301','3302','3303') and a.status = 'P4_2' and b.paper_status='P4_2' and a.source_application_id in ('ewt.pro','ewt.speed','qbm','rbm','xiaoxue.zxxk','zxxk','zy.ccw' ,'ewangtong','jx.ekt','zy.usercenter','zxxk.paper','zy.yfyb','oms','zy.shop') and a.commercial_level_id in ('1202','1204')
- 聚合函数：SUM(cost_amount), SUM(case when a.sal_type in ('QUES_AUDIT_INCOME'
        ,'REWARD_MONTH_QUALITY'
        ,'SCHEDULER_MANAGEMENT'
        ,'SUBSIDY'), SUM(case when type_id=15 and source='zxxk.qbm'
                        then income-outlay end), SUM(case when type_id=34 and source='zxxk.oa' and remark like '%$$$2'
                        then income-outlay end)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 cost_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
