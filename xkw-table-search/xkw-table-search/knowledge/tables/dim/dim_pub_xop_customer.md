# `dim_pub_xop_customer`

- 层级：`dim`
- 本地表描述：主键id
- 主题标签：other
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`type_id`、`pay_status`、`school_id`、`start_date`、`end_date`、`create_time`、`update_time`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `BIGINT` | 主键id | ddl |
| `name` | `STRING` | 名称 | ddl |
| `type_id` | `INT` | 类型：0：B端 ，1：C端 | ddl |
| `pay_status` | `INT` | 付费状态：0未付费, 1已付费；枚举使用：CustomerPayStatus | ddl |
| `pay_mode` | `INT` | 付费方式：0预付费，1后付费，2无计费 | ddl |
| `school_id` | `INT` | 对应机构id | ddl |
| `start_date` | `STRING` | 服务有效期：开始时间 | ddl |
| `end_date` | `STRING` | 服务有效期：结束时间 | ddl |
| `total_qty` | `INT` | 总调用量：-1不限 | ddl |
| `used_qty` | `INT` | 已调用量 | ddl |
| `seller_code` | `STRING` | 业务员xy编号 | ddl |
| `source` | `STRING` | 来源：console 客户上传，sellsys 销售系统同步  admin 后台新增 | ddl |
| `remark` | `STRING` | 备注信息 | ddl |
| `create_time` | `STRING` | 添加时间 | ddl |
| `update_time` | `STRING` | 修改时间 | ddl |
| `balance` | `DECIMAL(14,4` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_pub_xop_xop2_tbl_customer`, `ods.ods_pub_xop_xop2_tbl_customer_api`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 balance 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
