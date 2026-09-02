# `dwd_zxxk_zxxk_fin_flow_xkw_asset_list`

- 层级：`dwd`
- 本地表描述：主键ID
- 主题标签：finance
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`product_id`、`product_code`、`product_name`、`user_id`、`user_name`、`user_login_name`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 主键ID | ddl |
| `mold` | `INT` | 分类(1会员 2店铺) | ddl |
| `state` | `INT` | 奖惩状态(1成功 0待处理 -1失败 -2作废) | ddl |
| `server_code` | `STRING` | 流程单号 | ddl |
| `category` | `STRING` | 账户类别 | ddl |
| `product_id` | `INT` | 产品ID | ddl |
| `product_code` | `STRING` | 产品编号 | ddl |
| `product_name` | `STRING` | 产品名称 | ddl |
| `big_class_code` | `STRING` | 大类编号 | ddl |
| `big_class_name` | `STRING` | 大类名称 | ddl |
| `small_class_code` | `STRING` | 小类编号 | ddl |
| `small_class_name` | `STRING` | 小类名称 | ddl |
| `last_class_code` | `STRING` | 末类编号 | ddl |
| `last_class_name` | `STRING` | 末类名称 | ddl |
| `user_id` | `INT` | 用户ID/店铺ID | ddl |
| `user_name` | `STRING` | 用户姓名/店铺名称 | ddl |
| `user_login_name` | `STRING` | 用户名/商户ID | ddl |
| `account` | `DECIMAL(18,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_pub_zxxk_oa_tbl_flow_xkw_asset_list`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 account 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
