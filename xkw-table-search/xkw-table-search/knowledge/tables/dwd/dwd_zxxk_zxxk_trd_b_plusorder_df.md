# `dwd_zxxk_zxxk_trd_b_plusorder_df`

- 层级：`dwd`
- 本地表描述：未提供
- 主题标签：transaction_payment
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`order_num`、`user_id`、`username`、`product_id`、`product_type`、`product`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT             COMMENT'主键ID'` | 未提供字段注释 | ddl |
| `order_num` | `STRING          COMMENT'订单编号'` | 未提供字段注释 | ddl |
| `user_id` | `INT             COMMENT'用户ID'` | 未提供字段注释 | ddl |
| `username` | `STRING          COMMENT'用户名'` | 未提供字段注释 | ddl |
| `product_id` | `STRING          COMMENT'会员产品id'` | 未提供字段注释 | ddl |
| `product_type` | `INT             COMMENT'会员产品类型:1高级会员 2包月会员 3plus会员 4轻享会员5学生产品'` | 未提供字段注释 | ddl |
| `product` | `INT             COMMENT'产品类型:0未定义 1中学 2组卷 3书城 4作业通 5M站 6小学 8微信小程序 9安卓 10ISOAPP'` | 未提供字段注释 | ddl |
| `price` | `DECIMAL(10, 2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zxxk_zxxk_zxxkpay_tbl_b_order`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- DDL 未提供表注释
- 字段 id 缺少注释
- 字段 order_num 缺少注释
- 字段 price 缺少注释
- 字段 product 缺少注释
- 字段 product_id 缺少注释
- 字段 product_type 缺少注释
- 字段 user_id 缺少注释
- 字段 username 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
