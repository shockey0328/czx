# `dwd_doc_sms_crm_contract_list_df`

- 层级：`dwd`
- 本地表描述：主键id，自增主键
- 主题标签：content_resource, device_school
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`key_id`、`number`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 主键id，自增主键 | ddl |
| `mold` | `INT` | 合同类型（1：客户 2：教师 3：部门 4：代理商） | ddl |
| `state` | `INT` | 合同状态.1有效,2借阅,3作废。默认1 | ddl |
| `key_id` | `STRING` | 关联id。销售系统协议记录id，默认0 | ddl |
| `number` | `STRING` | 合同编号 | ddl |
| `contract_price` | `DECIMAL(12,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_pub_oa_sales_tbl_contract_list`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 contract_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
