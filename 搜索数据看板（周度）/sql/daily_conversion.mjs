/**
 * 周度搜索看板 · 每日搜索转化率 SQL 模板
 *
 * 改口径只改本文件。占位符：
 *   ${begin} ${end}  目标日起止 YYYY-MM-DD（含当日；通常为一整周）
 *
 * 一次查出次数口径 + 用户口径，脚本拆成两张 CSV：
 *   搜索次数转化率.csv  ← total_searches / success_searches / success_rate_by_search
 *   搜索用户转化率.csv  ← total_users / success_users / success_rate_by_user
 *   （用户表列名沿用历史：日期,搜索次数,搜索点击次数,搜索点击转化率）
 */
export const DAILY_CONVERSION_SQL = {
  label: '每日搜索转化率',
  maxCU: 80,
  waitMs: 600000,
  sql: `
WITH search_data AS (
    SELECT
        user_id,
        dt
    FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_search_result_3
    WHERE dt >= '\${begin}'
      AND dt <= '\${end}'
),
click_data AS (
    SELECT
        user_id,
        dt
    FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_search_result_click_2
    WHERE dt >= '\${begin}'
      AND dt <= '\${end}'
),
daily_search AS (
    SELECT
        dt,
        COUNT(*) AS total_searches,
        COUNT(DISTINCT user_id) AS total_users
    FROM search_data
    GROUP BY dt
),
daily_click AS (
    SELECT
        dt,
        COUNT(*) AS success_searches,
        COUNT(DISTINCT user_id) AS success_users
    FROM click_data
    GROUP BY dt
)
SELECT
    s.dt,
    s.total_searches,
    COALESCE(c.success_searches, 0) AS success_searches,
    ROUND(COALESCE(c.success_searches, 0) * 100.0 / s.total_searches, 2) AS success_rate_by_search,
    s.total_users,
    COALESCE(c.success_users, 0) AS success_users,
    ROUND(COALESCE(c.success_users, 0) * 100.0 / s.total_users, 2) AS success_rate_by_user
FROM daily_search s
LEFT JOIN daily_click c
    ON s.dt = c.dt
ORDER BY s.dt
`.trim()
};
