# `dwd_pub_pub_fin_union_mbr_ord_di`

- 层级：`dwd`
- 本地表描述：产品ID
- 主题标签：user, finance
- 数据粒度：按 dt) ) tmp ) w where w.rn=1; 聚合
- 分区字段：order_month, dt
- 推荐项目：`dmp_ads`（bi/ads）或 `dmp_cdm`（dwd/dim）

## 关键字段

`product_id`、`create_time`、`mbr_type`、`user_id`、`charge_id`、`dt`

## 字段

| 字段 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `product_id` | `STRING` | 产品ID | ddl |
| `create_time` | `STRING` | 创建时间 | ddl |
| `mbr_type` | `STRING` | 会员类型 | ddl |
| `user_id` | `INT` | 用户id | ddl |
| `order_no` | `STRING` | 订单号 | ddl |
| `charge_id` | `STRING` | 订单流水id | ddl |
| `orginal_price` | `DECIMAL(10,2` | 未提供字段注释 | ddl |
| `order_month` | `STRING` | 月分区 | ddl / 分区 |
| `dt` | `STRING` | 天分区 | ddl / 分区 |

## ETL 与查询提示

- 写入方式：OVERWRITE
- 上游表：`dwd.dwd_ump_pay_trd_trade_wide_di`, `dwd.dwd_pub_pub_fin_moneyrecord_di`, `dim.dim_pub_pub_pay_channel`, `dim.dim_pub_pub_fin_io_type`, `union_mbr`, `dwd.dwd_zxxk_zxxk_mbr_member_benefit_record_df`, `yanxiu_tbl`, `zujuan_tbl`, `qingxiang_tbl`, `zujuan_yanxiu_tbl`, `zujuan_yanxiu_ebk_tbl`, `dwd.dwd_ump_pay_trd_refund_wide_df`, `dwd.dwd_pub_pub_fin_union_mbr_ord_di`, `tmp_all_new_order`, `tmp_total_refund_all`, `new_data_results`
- 关联条件：m.dt>='2000-01-01' and p.app_sub_trade_no = m.order_no
                            left；p.channel_id = t1.channel_id
                            left；t1.order_no = t2.order_no
     ),
     zujuan_yanxiu_tbl as (
-- 题库plus会员2个月(价值9.9元)
-- ai研修会员季卡3个月（价值50元）
         select 'zujuanwang' as product_id,
                time_paid  as create_time,
                'PLUS会员' as mbr_type,
                user_id as user_id,
                order_no,
                charge_id,
                9.9 * pay_cnt as orginal_price,
                9.9 * pay_cnt as fin_io_actual,
                pay_cnt as fin_io_actual_cnt,
                pay_way,
                time_paid  as fin_io_time,
                time_paid  as begin_time,
                cast(add_months(time_paid,2) as string) as end_time,
                fin_io_direction,
                fin_io_type,
                1 as trade_type,
                '学科网高级会员,组卷网PLUS会员,ai研修会员季卡联合会员,业务线有记录会员权限,但关联不上订单,数仓补充' as remark
         from union_mbr
- 过滤条件：dt = '${dt}' and (channel_id like 'wx%' or channel_id like 'alipay%' or channel_id like 'apple_iap') and paid_status = 1 ) p join ${dwd}.dwd_pub_pub_fin_moneyrecord_di m on m.dt>='2000-01-01' and p.app_sub_trade_no = m.order_no left join ${dim}.dim_pub_pub_pay_channel t1 on p.channel_id = t1.channel_id left join (select * from ${dim}.dim_pub_pub_fin_io_type) t2 on coalesce(t1.fin_payment_source,p.channel_id) = t2.io_type_name and t2.is_income = 1 where p.amount * 0.01 > m.fin_io_actual and m.fin_io_type in (11, 13, 12)；subject in ('[510086]双11联合会员 资源库+研修','[510086]双11联合会员 资源库 研修','2022双11研修联合高级')；subject in ('[510086]中学扫码充值','[510086]充值高级会员') ), zujuan_tbl as ( -- 组卷 -- 2022年双十一 select 'zujuanwang' as product_id, time_paid as create_time, 'PLUS会员' as mbr_type, user_id as user_id, order_no, charge_id, union_mbr_price as orginal_price, union_mbr_price as fin_io_actual, pay_cnt as fin_io_actual_cnt, pay_way, time_paid as fin_io_time, time_paid as begin_time, cast(add_months(time_paid,12) as string) as end_time, fin_io_direction, fin_io_type, 1 as trade_type, '学科网高级,组卷网PLUS年卡联合会员,题库卡券形式发放，数仓补充' as remark from union_mbr where subject in ('[510085]双11联合会员 资源库+题库','[510085]双11联合会员 资源库 题库','2022双11组卷联合高级','[510085]充值高级会员') ), qingxiang_tbl as ( -- 轻享 -- 2023年双十一-双会员 -- 2023年9月20日 select 'xuekewang' as product_id, time_paid as create_time, '轻享会员' as mbr_type, coalesce(t2.user_id,t1.user_id) as user_id, t1.order_no as order_no, t1.charge_id, union_mbr_price as orginal_price, union_mbr_price as fin_io_actual, pay_cnt as fin_io_actual_cnt, pay_way, time_paid as fin_io_time, coalesce(t2.start_time,time_paid) as begin_time, cast(coalesce(t2.end_time,if(t1.subject in ('[510123]充值高级会员','[510123]中学扫码充值'),add_months(time_paid,3), add_months(time_paid,12))) as string) as end_time, fin_io_direction, fin_io_type, 1 as trade_type, concat('学科网高级会员,轻享会员联合会员,订单号:',t1.order_no) as remark from (select * from union_mbr where subject in ('[510139]双11-699双会员','[510140]双11-999双会员','双11大促 699高级+轻享双会员年卡礼包','双11大促 999高级+轻享双会员年卡礼包','[510123]充值高级会员','[510123]中学扫码充值') ) t1 left join ${dwd}.dwd_zxxk_zxxk_mbr_member_benefit_record_df t2 on t1.order_no = t2.order_no ), zujuan_yanxiu_tbl as ( -- 题库plus会员2个月(价值9.9元) -- ai研修会员季卡3个月（价值50元） select 'zujuanwang' as product_id, time_paid as create_time, 'PLUS会员' as mbr_type, user_id as user_id, order_no, charge_id, 9.9 * pay_cnt as orginal_price, 9.9 * pay_cnt as fin_io_actual, pay_cnt as fin_io_actual_cnt, pay_way, time_paid as fin_io_time, time_paid as begin_time, cast(add_months(time_paid,2) as string) as end_time, fin_io_direction, fin_io_type, 1 as trade_type, '学科网高级会员,组卷网PLUS会员,ai研修会员季卡联合会员,业务线有记录会员权限,但关联不上订单,数仓补充' as remark from union_mbr where subject in ('[510131]双11超级联合学科网×组卷网×AI研修','[510131]双11联合会员高级 研修 组卷','[510131]双11联合会员高级+研修+组卷','双11超级联合 学科网×组卷网×AI研修')；subject in ('[510131]双11超级联合学科网×组卷网×AI研修','[510131]双11联合会员高级 研修 组卷','[510131]双11联合会员高级+研修+组卷','双11超级联合 学科网×组卷网×AI研修') ), zujuan_yanxiu_ebk_tbl as ( -- 2024双11 -- e备课 半年卡 (价值31元) -- 组卷尊享会员3个月(价值139元) -- ai研修会员季卡3个月（价值50元） select 'zujuanwang' as product_id, time_paid as create_time, '尊享会员' as mbr_type, user_id as user_id, order_no, charge_id, 139 * pay_cnt as orginal_price, union_mbr_price as fin_io_actual, pay_cnt as fin_io_actual_cnt, pay_way, time_paid as fin_io_time, time_paid as begin_time, cast(add_months(time_paid,3) as string) as end_time, fin_io_direction, fin_io_type, 1 as trade_type, '[510203]双11学科网 组卷,组卷的记录,数仓补充' as remark from union_mbr where subject in ('[510203]双11学科网 组卷','[510203]双11学科网+组卷','双11联合学科网+组卷')；subject in ('[510197]双11学科网 研修','[510197]双11学科网+研修')；subject in ('[510196]双11学科网+备课','[510196]双11学科网 备课','双11联合学科网+e备课') ), tmp_all_new_order as ( select *,substr(fin_io_time,1,7) as mth,substr(fin_io_time,1,10) as dt from yanxiu_tbl；order_month <= substr('${dt}',1,7) and dt < '${dt}'；a.succeed = 1 and a.refund_amount > 0 and substr(a.create_time,1,10) = '${dt}' and b.begin_time is not null and b.begin_time != '' and b.end_time is not null and b.end_time != ''
- 聚合函数：SUM(p.amount * 0.01 - (m.fin_io_actual + m.fin_io_gift), COUNT(*), MAX(a.create_time), SUM(b.fin_io_actual), COUNT(a.refund_amount), MIN(a.time_succeed)

## 使用边界

- 本文件是基于本地 DDL/DML 的辅助元数据，不替代 MaxCompute 实时 schema。
- 执行 SQL 前使用 `mcp__maxcompute__get_table_schema` 核对字段、类型和分区。
- 查询分区表必须在 WHERE 中添加分区过滤，避免全表扫描。

## 数据质量提示

- 字段 orginal_price 缺少注释
- 未匹配到 INSERT SQL，来源与指标逻辑待补充
