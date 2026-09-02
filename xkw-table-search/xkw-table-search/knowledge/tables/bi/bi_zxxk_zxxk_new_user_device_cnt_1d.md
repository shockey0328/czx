# `bi_zxxk_zxxk_new_user_device_cnt_1d`

- 层级：`bi`
- 本地表描述：日期
- 主题标签：user, device_school
- 数据粒度：按 dt, application_name, time_grain ) 聚合
- 分区字段：无
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`dt`、`time_grain`、`new_reg_user_cnt`、`new_reg_user_cnt_last_1year`、`new_reg_user_cnt_last_2year`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `dt` | `STRING` | 日期 | ddl |
| `application_name` | `STRING` | 终端：PC站,M站,全部 | ddl |
| `time_grain` | `STRING` | 统计粒度: 日/周/月 | ddl |
| `new_reg_user_cnt` | `int` | 新注册用户数 | ddl |
| `new_reg_user_cnt_last_1year` | `int` | 去年同期：新注册用户数 | ddl |
| `new_reg_user_cnt_last_2year` | `int` | 前年同期：新注册用户数 | ddl |
| `reg_percent` | `decimal(20,4` | 未提供字段注释 | ddl |

## ETL 与查询提示

- 写入方式：overwrite
- 上游表：`dim.dim_pub_pub_user`, `bi.bi_pub_pub_flr_xyiolog_newdevice_stas_di`, `dwd.dwd_pub_io_log_xyiolog_di`, `dwd.dwd_pub_io_log_xyiolog_app_di`, `dwd.dwd_pub_io_log_xyiolog_miniprogram_di`, `dt_user_reg`, `dt_new_device`, `dt_device_uv`, `bi.bi_zxxk_zxxk_new_user_device_cnt_1d`, `t1_final_result`, `pre1_day_result`, `pre2_day_result`, `dtmth_user_reg`, `dtmth_new_device`, `dtmth_device_uv`, `t3_final_result`, `pre1_mth_result`, `pre2_mth_result`, `dtthisweek_user_reg`, `dtthisweek_new_device`, `dtthisweek_device_uv`, `last_t1_final_result`, `last_t3_final_result`, `t2_1week_ago_final_result`, `t2_thisweek_final_result`
- 关联条件：dt_user_reg.dt = dt_new_device.dt and
                                                  dt_user_reg.time_grain = dt_new_device.time_grain and
                                                  dt_user_reg.application_id = dt_new_device.application_id
                       full；dt_user_reg.dt = dt_device_uv.dt and
                                                 dt_user_reg.time_grain = dt_device_uv.time_grain and
                                                 dt_user_reg.application_id = dt_device_uv.application_id
          ) A；a.dt = b.dt and a.time_grain = b.time_grain and a.application_name = b.application_name
                              left；a.dt = c.dt and a.time_grain = c.time_grain and a.application_name = c.application_name；dtmth_user_reg.dt = dtmth_new_device.dt and
                                                         dtmth_user_reg.time_grain = dtmth_new_device.time_grain and
                                                         dtmth_user_reg.application_id = dtmth_new_device.application_id
                           full；dtmth_user_reg.dt = dtmth_device_uv.dt and
                                                        dtmth_user_reg.time_grain = dtmth_device_uv.time_grain and
                                                        dtmth_user_reg.application_id = dtmth_device_uv.application_id
              ) A；a.dt = b.dt and a.time_grain = b.time_grain and a.application_name = b.application_name
                  left；dtthisweek_user_reg.dt = dtthisweek_new_device.dt and
                                                              dtthisweek_user_reg.time_grain = dtthisweek_new_device.time_grain and
                                                              dtthisweek_user_reg.application_id =
                                                              dtthisweek_new_device.application_id
                           full
- 过滤条件：product_id = 'xuekewang' and to_date(user_reg_time) = '${dt}'；product_id = 'xuekewang' and to_date(user_reg_time) = '${dt}' ), dt_new_device as ( ----dt新设备(今年，去年，前年) select max('${dt}') as dt, application_id, max('天') as time_grain, sum(if(dt = '${dt}', new_device_cnt ,0)) as new_device_cnt, 0 as new_device_cnt_last_1year, 0 as new_device_cnt_last_2year from ${bi}.bi_pub_pub_flr_xyiolog_newdevice_stas_di where dt = '${dt}'；dt = '${dt}' ), dt_device_uv as ( ----dt设备去重数（今年，去年，前年） select max('${dt}') as dt, application_id, max('天') as time_grain, count(distinct if(dt = '${dt}', ut1, null)) as device_uv, 0 as device_uv_last_1year, 0 as device_uv_last_2year from ${dwd}.dwd_pub_io_log_xyiolog_di where dt = '${dt}' and product_id in ('xuekewang','voc','wangxiaotong') and application_id = 'pczhan' and is_spider= false and env_improper= false and env_open_devtool = false and log_event_type = 'view'；dt = '${dt}' and product_id = 'xuekewang' and application_id = 'mzhan' and is_spider = false and env_improper = false and env_open_devtool = false and log_event_type = 'view'；dt = '${dt}' and to_date(xyio_client_time) = '${dt}' and product_id = 'xuekewang' and application_id = 'androidapp' and log_event_type = 'appear'；dt = '${dt}' and to_date(xyio_client_time) = '${dt}' and product_id = 'xuekewang' and application_id = 'iosapp' and log_event_type='appear'；dt = '${dt}' and product_id = 'xuekewang' and application_id = 'weixinxiaochengxu' and log_event_type = 'view'；dt = '${dt}' and product_id in ('xuekewang', 'voc', 'wangxiaotong') and application_id = 'pczhan' and is_spider = false and env_improper = false and env_open_devtool = false and log_event_type = 'view'
- 聚合函数：MAX('${dt}'), MAX('天'), COUNT(distinct if(to_date(user_reg_time), SUM(if(dt = '${dt}', new_device_cnt ,0), COUNT(distinct if(dt = '${dt}', ut1, null), COUNT(distinct if(dt = '${dt}', device_id, null), MAX(new_reg_user_cnt), MAX(reg_percent), MAX(new_device_cnt), MAX(device_uv), MAX(concat(substring('${dt}', 1, 7), MAX('月')

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 reg_percent 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
