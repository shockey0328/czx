# `dim_zj_zj_special_parent`

- 层级：`dim`
- 本地表描述：ID
- 主题标签：other
- 数据粒度：需结合实时 schema 与业务口径确认
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`id`、`add_time`、`update_time`、`visits_num`、`paper_num`、`grade_ids`、`bank_id`、`type_id`、`type_names`、`types`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `id` | `INT` | ID | ddl |
| `name` | `STRING` | 父专题名称 | ddl |
| `add_time` | `STRING` | 添加时间 | ddl |
| `update_time` | `STRING` | 更新时间 | ddl |
| `visits_num` | `INT` | 浏览次数 | ddl |
| `paper_num` | `INT` | 试卷套数 | ddl |
| `grade_ids` | `STRING` | 子专题年级集合 | ddl |
| `bank_id` | `INT` | 学科ID | ddl |
| `type_id` | `INT` | 子专题类型id | ddl |
| `introduction` | `STRING` | 介绍 | ddl |
| `auths` | `STRING` | 权限IDS | ddl |
| `is_show` | `INT` | 是否显式 1显式 0不显示 | ddl |
| `grade_names` | `STRING` | 年级名称聚合 | ddl |
| `type_names` | `STRING` | 类型名称聚合 | ddl |
| `abbreviate_name` | `STRING` | 简称 | ddl |
| `is_open` | `INT` | 是否开放给第三方 1开放 0不开放 | ddl |
| `types` | `string` | 二级类型 | ddl |
| `versions` | `string` | 版本ids | ddl |
| `semesters` | `string` | 学期ids | ddl |
| `price` | `decimal(10,2` | 未提供字段注释 | ddl |
| `labels` | `string` | 标签ids | alter |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`ods.ods_zj_zj_zujuanspecial_tbl_special_parent`

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
