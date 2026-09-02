# `dwd_zxxk_ebk_trd_biz_order_df`

- 层级：`dwd`
- 本地表描述：自增ID
- 主题标签：transaction_payment
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`user_id`、`lecture_id`、`lecture_ids`、`catalog_id`、`material_type`、`material_id`、`amount`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | 自增ID | ddl |
| `order_no` | `STRING` | 订单id | ddl |
| `user_id` | `INT` | 用户id | ddl |
| `lecture_id` | `INT` | 备课id | ddl |
| `lecture_ids` | `STRING` | 批量加备课时使用 | ddl |
| `title` | `STRING` | 标题 | ddl |
| `catalog_id` | `INT` | 章节id | ddl |
| `material_type` | `INT` | e备课资源类型。如果是"学科网资源 或 学科网专辑"则该字段表示"资源"；如果是"试题篮" 该字段表示 "试题试卷" | ddl |
| `material_id` | `INT` | e备课资源类型id。如果是学科网资源则该字段表示"资源Id"，如果是学科网专辑则该字段表示"专辑Id"；如果是"试题篮" 该字段表示 ”试题篮id“ | ddl |
| `material_level` | `INT` | 资源价格等级。1普通点2储值3现金 | ddl |
| `amount` | `DECIMAL(10,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_zxxk_ebk_teaching_lectures_tbl_biz_order`, `ods.ods_zxxk_ebk_teaching_lectures_tbl_member`
- 关联条件：t1.order_no = t0.order_no and t1.vip_begin <= t1.vip_end;

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 amount 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
