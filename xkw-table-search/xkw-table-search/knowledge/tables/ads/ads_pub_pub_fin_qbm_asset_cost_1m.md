# `ads_pub_pub_fin_qbm_asset_cost_1m`

- 层级：`ads`
- 本地表描述：rbm的资料id
- 主题标签：finance
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：mth
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`res_id`、`paper_id`、`question_id`、`cost_type`、`cost_amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `res_id` | `BIGINT` | rbm的资料id | ddl |
| `paper_id` | `BIGINT` | qbm的试卷id | ddl |
| `question_id` | `BIGINT` | qbm的试题id | ddl |
| `res_title` | `STRING` | rbm的资料标题 | ddl |
| `cost_type` | `INT` | 成本类型  关联dim2.dim_fin_asset_dimesion | ddl |
| `cost_amount` | `DECIMAL(20,2` | 未提供字段注释 | ddl |
| `mth` | `STRING` | 月分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dim.dim_cmp_rbm_resource`, `dim.dim_cmp_qbm_paper`, `dwd.dwd_cmp_qbm_trd_res_sal_di`, `dim.dim_pub_pub_course`, `dim.dim_cmp_qbm_question`
- 关联条件：a.res_id=b.paper_source_id and b.source_application_id='zxxk'
         inner；b.paper_id=c.paper_id and c.dt>='${mth}-01' and substring(c.dt,1,7)='${mth}'
         left；a.course_id=d.course_id
         left；c.question_id=e.question_id
- 过滤条件：a.origin_uploader<>'学科网试题平台' and a.exam_scope in ('3301','3302','3303') and a.status = 'P4_2' and b.paper_status='P4_2' and coalesce(e.ques_status,'') in ('','P4') and a.source_application_id in ('ewt.pro','ewt.speed','qbm','rbm','xiaoxue.zxxk','zxxk','zy.ccw' ,'ewangtong','jx.ekt','zy.usercenter','zxxk.paper','zy.yfyb','oms','zy.shop') and a.commercial_level_id in ('1202','1204')

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 cost_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
