/**
 * 用户增长看板 · 周度用户核心数据 SQL（单周可跑）
 *
 * 改口径只改本文件。占位符：
 *   ${begin} ${end}           目标周起止 YYYY-MM-DD
 *   ${prevBegin} ${prevEnd}   上一周起止（新用户次周留存：上期新增 ∩ 本期活跃）
 *
 * 写入 CSV：周度用户核心数据.normalized.csv
 * 累计用户 = 脚本读取「上一周累计」+ 本周新增（不在本文件内算全历史）
 */

/** @typedef {{ label: string, maxCU?: number, waitMs?: number, sql: string }} MetricSql */

/** @type {Record<string, MetricSql>} */
export const WEEKLY_USER_CORE_SQL = {
  /** 当周活跃 / 新增（首次出现日落在当周；无 mzhan） */
  activeNew: {
    label: '周活跃与新增',
    maxCU: 120,
    waitMs: 600000,
    sql: `
WITH user_first_date AS (
    SELECT
        user_id,
        MIN(dt) AS first_date
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban')
      AND is_spider = false
      AND dt >= '2023-08-01'
    GROUP BY user_id
),
week_active AS (
    SELECT DISTINCT user_id
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban')
      AND is_spider = false
      AND dt >= '\${begin}'
      AND dt <= '\${end}'
)
SELECT
    COUNT(DISTINCT a.user_id) AS active_uv,
    COUNT(DISTINCT CASE
        WHEN f.first_date >= '\${begin}' AND f.first_date <= '\${end}'
        THEN a.user_id
    END) AS new_uv
FROM week_active a
LEFT JOIN user_first_date f
    ON a.user_id = f.user_id
`.trim()
  },

  /**
   * 新用户次周留存（写在目标周行）：
   * 上一周新增用户中，本周仍活跃的比例
   */
  newUserRetention: {
    label: '新用户次周留存',
    maxCU: 120,
    waitMs: 600000,
    sql: `
WITH user_first_date AS (
    SELECT
        user_id,
        MIN(dt) AS first_date
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban')
      AND is_spider = false
      AND dt >= '2023-08-01'
    GROUP BY user_id
),
prev_new AS (
    SELECT DISTINCT user_id
    FROM user_first_date
    WHERE first_date >= '\${prevBegin}'
      AND first_date <= '\${prevEnd}'
),
curr_active AS (
    SELECT DISTINCT user_id
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban')
      AND is_spider = false
      AND dt >= '\${begin}'
      AND dt <= '\${end}'
)
SELECT
    COUNT(DISTINCT p.user_id) AS prev_week_new_uv,
    COUNT(DISTINCT c.user_id) AS retained_uv
FROM prev_new p
LEFT JOIN curr_active c
    ON p.user_id = c.user_id
`.trim()
  }
};
