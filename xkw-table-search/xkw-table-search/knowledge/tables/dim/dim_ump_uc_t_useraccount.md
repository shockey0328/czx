# `dim_ump_uc_t_useraccount`

- 层级：`dim`
- 本地表描述：用户ID
- 主题标签：user
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`user_id`、`userpoint`、`useradvpoint`、`userrmbincome`、`userrmb`、`userelitepoint`、`userdownpoint`、`chargetime`、`paidrmb`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `user_id` | `INT` | 用户ID | ddl |
| `userpoint` | `DOUBLE` | 未提供字段注释 | ddl |
| `useradvpoint` | `INT` | 未提供字段注释 | ddl |
| `userrmbincome` | `DOUBLE` | 未提供字段注释 | ddl |
| `userrmb` | `DOUBLE` | 未提供字段注释 | ddl |
| `userelitepoint` | `INT` | 未提供字段注释 | ddl |
| `userdownpoint` | `INT` | 未提供字段注释 | ddl |
| `chargemode` | `INT` | 扣费模式 | ddl |
| `chargetime` | `STRING` | 会员开始时间 | ddl |
| `chargedays` | `INT` | 会员天数 | ddl |
| `check` | `INT` | 未提供字段注释 | ddl |
| `cashin` | `DOUBLE` | 未提供字段注释 | ddl |
| `lastmodify` | `STRING` | 上次更新时间 | ddl |
| `signature` | `STRING` | 安全签名 | ddl |
| `paidrmb` | `DECIMAL(12,2` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`ods.ods_ump_uc_uc_tbl_t_useraccount`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 cashin 缺少注释
- 字段 check 缺少注释
- 字段 paidrmb 缺少注释
- 字段 useradvpoint 缺少注释
- 字段 userdownpoint 缺少注释
- 字段 userelitepoint 缺少注释
- 字段 userpoint 缺少注释
- 字段 userrmb 缺少注释
- 字段 userrmbincome 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
