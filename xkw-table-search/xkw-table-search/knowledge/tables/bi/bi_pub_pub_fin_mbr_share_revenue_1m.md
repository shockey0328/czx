# `bi_pub_pub_fin_mbr_share_revenue_1m`

- 层级：`bi`
- 本地表描述：产品事业部
- 主题标签：user, transaction_payment, finance
- 数据粒度：按 case when product_id in ('xuekewang','ebeike') then '资源库' when product_id = 'zujuanwang' then '题库' when product_id = 'aiyanxiu' then 'AI研修' else '其他' end, case when product_id in ('xuekewang','ebeike') and mbr_type='轻享会员' then '轻享会员' WHEN product_id IN ('xuekewang','ebeike') AND mbr_type = '橙子学会员' THEN '橙子学会员' when product_id in ('xuekewang','ebeike') then '其他' when product_id in ('zujuanwang') and mbr_type='尊享会员' then '尊享会员' when product_id in ('zujuanwang') and mbr_type='PLUS会员' then 'plus会员' when product_id in ('zujuanwang') and mbr_type='优享会员' then '优享会员' when product_id in ('zujuanwang') then '其他' else '会员' end, user_id, mth 聚合
- 分区字段：mth
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`product_dept_name`、`mbr_type`、`user_id`、`share_amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `product_dept_name` | `STRING` | 产品事业部 | ddl |
| `mbr_type` | `STRING` | 会员类型 | ddl |
| `user_id` | `INT` | 用户id | ddl |
| `share_amount` | `DECIMAL(20,2` | 未提供字段注释 | ddl |
| `mth` | `STRING` | 月分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dws.dws_pub_pub_fin_mbr_share_1m_mi`
- 过滤条件：compute_month in (select max(compute_month) from ${dws}.dws_pub_pub_fin_mbr_share_1m_mi) AND mth = '${mth}'
- 聚合函数：SUM(share_amount), MAX(compute_month)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 share_amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
