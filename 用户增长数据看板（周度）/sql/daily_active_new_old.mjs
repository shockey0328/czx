/**
 * 用户增长看板 · 每天的活跃用户及新老用户 SQL（按日，可圈定一周）
 *
 * 占位符：
 *   ${begin} ${end}  统计日起止 YYYY-MM-DD
 *
 * 写入：每天的活跃用户及新老用户.normalized.csv
 * 字段：dt, active_uv, new_uv, old_uv, new_user_rate（占比由脚本用 new/active 计算）
 *
 * 口径：
 * - 活跃：czx + xueban，去爬虫，按日去重
 * - 新用户：首次出现日 = 当天
 * - 老用户：首次出现日 < 当天
 * - 无 application_id=mzhan 限制（与周度用户核心首次日一致方向，但周度首次日有 2023-08-01 下界；本 SQL 按你提供的全量 MIN(dt)）
 */

/** @typedef {{ label: string, maxCU?: number, waitMs?: number, sql: string }} MetricSql */

/** @type {MetricSql} */
export const DAILY_ACTIVE_NEW_OLD_SQL = {
  label: '日活新老用户',
  maxCU: 200,
  waitMs: 600000,
  sql: `
WITH user_first_date AS (
    SELECT
        user_id,
        MIN(dt) AS first_date
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban')
      AND is_spider = false
    GROUP BY user_id
),
daily_active AS (
    SELECT
        dt,
        user_id
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban')
      AND is_spider = false
      AND dt >= '\${begin}'
      AND dt <= '\${end}'
    GROUP BY dt, user_id
)
SELECT
    a.dt,
    COUNT(DISTINCT a.user_id) AS active_uv,
    COUNT(DISTINCT CASE WHEN f.first_date = a.dt THEN a.user_id END) AS new_uv,
    COUNT(DISTINCT CASE WHEN f.first_date < a.dt THEN a.user_id END) AS old_uv
FROM daily_active a
LEFT JOIN user_first_date f
    ON a.user_id = f.user_id
GROUP BY a.dt
ORDER BY a.dt ASC
`.trim()
};
