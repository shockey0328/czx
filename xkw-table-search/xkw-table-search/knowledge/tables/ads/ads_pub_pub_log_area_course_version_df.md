# `ads_pub_pub_log_area_course_version_df`

- 层级：`ads`
- 本地表描述：省份或者城市ID
- 主题标签：log_behavior, device_school
- 数据粒度：按 res_id,course_id,textbook_version_id,city_id ) b on a.resource_id=b.res_id inner join ${dim}.dim_pub_pub_area c on c.level='COUNTY' and b.city_id=c.area_id where a.dt >= date_sub('${dt}',180) and a.dt <= '${dt}' group by b.city_id,b.course_id,b.textbook_version_id ) ,t_version_top_n_county as( select city_id,course_id,version_id,version_count ,row_number() over(partition by city_id, course_id 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`area_id`、`course_id`、`version_id`、`course_sum`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `area_id` | `STRING` | 省份或者城市ID | ddl |
| `course_id` | `INT` | 课程ID | ddl |
| `version_id` | `INT` | 教材版本ID | ddl |
| `version_count` | `INT` | 该版本对应资源在统计时间段内行为（被下载）发生的次数 | ddl |
| `course_sum` | `INT` | 该课程所有教材版本对应资源在统计时间段内行为（被下载）发生的次数 | ddl |
| `version_ratio` | `DECIMAL(10,4` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dwd.dwd_zxxk_zxxk_log_consume_log_di`, `dim.dim_cmp_rbm_resource`, `dim.dim_pub_pub_area`, `t_version_city`, `t_version_province`, `t_version_county`, `t_version_top_n_province`, `t_version_top_n_city`, `t_version_top_n_county`
- 关联条件：c.level='CITY' and b.city_id=c.area_id；c.level='PROVINCE' and b.province_id=c.area_id；c.level='COUNTY' and b.city_id=c.area_id
- 过滤条件：course_id>0 and textbook_version_id>0 and coalesce(area_ids,'')<>''；a.dt >=date_sub('${dt}',180) and a.dt <='${dt}'；course_id>0 and textbook_version_id>0 and coalesce(province_id,'')<>'' ) b on a.resource_id=b.res_id inner join ${dim}.dim_pub_pub_area c on c.level='PROVINCE' and b.province_id=c.area_id where a.dt >=date_sub('${dt}',180) and a.dt <='${dt}'；a.dt >= date_sub('${dt}',180) and a.dt <= '${dt}'；city_id is not null；a.version_rn < 3；a.version_rn < 3 ) w
- 聚合函数：COUNT(a.id), SUM(version_count)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 version_ratio 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
