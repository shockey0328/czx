# `bi_zxxk_zxxk_uv_stats`

- 层级：`bi`
- 本地表描述：指标名称
- 主题标签：log_behavior
- 数据粒度：按 metric_name, time_grain ) 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`time_grain`、`stat_date`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `metric_name` | `STRING` | 指标名称 | ddl |
| `time_grain` | `STRING` | 统计粒度（周/月） | ddl |
| `stat_date` | `STRING` | 统计周期日期（周为周一日期，月为月初日期） | ddl |
| `display_order` | `INT` | 控制展示顺序 | ddl |
| `current_value` | `DECIMAL(20,4` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`params`, `time_calc`, `period_flat`, `period_config`, `dwd.dwd_pub_io_log_xyiolog_di`, `all_period_dts`, `all_pc_site_uv_base`, `all_pc_site_uv_filtered`, `all_m_site_uv_base`, `all_m_site_uv_filtered`, `dwd.dwd_pub_io_log_xyiolog_app_di`, `dwd.dwd_pub_io_log_xyiolog_miniprogram_di`, `all_pc_site_uv`, `all_m_site_uv`, `all_android_uv`, `all_ios_uv`, `all_miniprogram_uv`, `indicators_unpivoted`, `indicators_pivoted`, `bi.bi_zxxk_zxxk_uv_stats`, `current_month_stats`, `historical_stats`
- 关联条件：log.dt >= pc.start_dt AND log.dt <= pc.end_dt；log.dt >= pc.start_dt
    AND     log.dt <= pc.end_dt；log.dt >= pc.start_dt
                AND     log.dt <= pc.end_dt；c.metric_name = h.metric_name
    AND     c.time_grain = h.time_grain；hist.metric_name = curr.metric_name
AND     hist.time_grain = curr.time_grain
AND     hist.stat_date = curr.stat_date
- 过滤条件：log.dt IN (SELECT dt_str FROM all_period_dts) AND product_id IN ('xuekewang','voc','wangxiaotong') AND application_id = 'pczhan' AND is_spider = false AND log_event_type = 'view' ), all_pc_site_uv_filtered AS ( SELECT device_id, period_tag, time_grain, stat_date, latest_traffic_source_type, referrer FROM all_pc_site_uv_base WHERE rn = 1 AND (latest_traffic_source_type IN ('search_engine','direct') OR (latest_traffic_source_type = 'other' AND PARSE_URL(referrer,'HOST') NOT REGEXP 'zxxk\\.com|xkw\\.com')) ), all_pc_site_uv AS ( SELECT period_tag, time_grain, stat_date, COUNT(DISTINCT device_id) AS uv_cnt FROM all_pc_site_uv_filtered；log.dt IN (SELECT dt_str FROM all_period_dts) AND product_id IN ('xuekewang','czx') AND application_id = 'mzhan' AND is_spider = false AND log_event_type = 'view' AND (product_source_id<>'zxxk_app' or product_source_id is null) and parse_url(request_url,'HOST') in ('m.zxxk.com','c.xkw.com') ), all_m_site_uv_filtered AS ( SELECT device_id, period_tag, time_grain, stat_date, latest_traffic_source_type, referrer FROM all_m_site_uv_base WHERE rn = 1 AND (latest_traffic_source_type IN ('search_engine','direct') OR (latest_traffic_source_type = 'other' AND PARSE_URL(referrer,'HOST') NOT REGEXP 'zxxk\\.com|xkw\\.com')) ), all_m_site_uv AS ( SELECT period_tag, time_grain, stat_date, COUNT(DISTINCT device_id) AS uv_cnt FROM all_m_site_uv_filtered；log.dt IN (SELECT dt_str FROM all_period_dts) AND product_id = 'xuekewang' AND application_id = 'androidapp' AND TO_DATE(log.xyio_client_time) >= pc.start_dt AND TO_DATE(log.xyio_client_time) <= pc.end_dt；log.dt IN (SELECT dt_str FROM all_period_dts) AND log.product_id ='czx' AND log.application_id = 'mzhan' AND log.is_spider = false AND log.product_source_id = 'zxxk_app' AND log.os = 'Android' ) tmp；log.dt IN (SELECT dt_str FROM all_period_dts) AND product_id = 'xuekewang' AND application_id = 'iosapp' AND TO_DATE(log.xyio_client_time) >= pc.start_dt AND TO_DATE(log.xyio_client_time) <= pc.end_dt；log.dt IN (SELECT dt_str FROM all_period_dts) AND log.product_id ='czx' AND log.application_id = 'mzhan' AND log.is_spider = false AND log.product_source_id = 'zxxk_app' AND log.os = 'iOS' ) tmp；log.dt IN (SELECT dt_str FROM all_period_dts) AND product_id = 'xuekewang' AND application_id = 'weixinxiaochengxu' AND device_id IS NOT NULL；stat_date IS NOT NULL
- 聚合函数：COUNT(DISTINCT device_id), MAX(CASE WHEN period_tag IN ('week_current', 'month_current'), MAX(display_order), MAX(CASE WHEN period_tag IN ('week_last_year_same', 'month_last_year_same'), MAX(CASE WHEN period_tag IN ('week_last', 'month_last'), MAX(CASE WHEN period_tag IN ('week_last_year_last', 'month_last_year_last'), MAX(CASE WHEN period_tag IN ('week_last_last', 'month_last_last'), MAX(CASE WHEN period_tag IN ('week_last_year_last_last', 'month_last_year_last_last'), MAX(CASE WHEN period_tag IN ('week_last_last_last', 'month_last_last_last'), MAX(CASE WHEN period_tag IN ('week_last_year_last_last_last', 'month_last_year_last_last_last'), MAX(stat_date), MAX(uv_cnt)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 current_value 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
