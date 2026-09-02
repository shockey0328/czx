# `dwd_zj_zj_trd_c_userupgraderecord_df`

- 层级：`dwd`
- 本地表描述：ID
- 主题标签：user, transaction_payment, exam_question
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`user_id`、`bank_id`、`user_current_group_id`、`user_upgrade_group_id`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | ID | ddl |
| `user_id` | `INT` | 用户ID | ddl |
| `bank_id` | `INT` | 学科ID | ddl |
| `user_current_group_id` | `INT` | 用户当前级别ID | ddl |
| `user_upgrade_group_id` | `INT` | 用户升级后的级别ID | ddl |
| `pay_mode` | `INT` | 0:扫码支付 1：储值支付 2：激活码；3-会费支付（高级转尊享转换方式）4-充值储值赠送的puls;5-wps特权包；6：组卷APP-学贝；7:APP引流活动；8:后台升级；9：后台降级； | ddl |
| `pay_code` | `STRING` | PayMode 0“OrderNo”,1:"",2:"使用激活码"；3：会费余额（无新数据）“zujuan666”：后台操作 | ddl |
| `original_price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zj_zj_zujuanwebsitedata_tbl_001_c_userupgraderecord`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 original_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
