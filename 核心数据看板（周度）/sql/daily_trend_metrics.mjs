/**
 * 周度看板 · 日度趋势 SQL 模板（活跃 / 付费营收 / 使用率）
 *
 * 改口径只改本文件。占位符：
 *   ${begin} ${end}     目标日起止 YYYY-MM-DD（通常为一整周）
 *   ${payerInList}      排除的 payer_id，形如 '1','2','3'
 *
 * 写入 CSV：
 *   active  → 活跃用户趋势_utf8.csv      字段 dt,pv,uv
 *   paid    → 付费用户及营收趋势_utf8.csv  字段 dt,付费用户,营收
 *   usage   → 使用率趋势_utf8.csv        字段 date,活跃用户数,使用用户数,使用率百分比
 *
 * 说明：
 * - 付费原 SQL 为区间汇总；日趋势需按日序列，已补 dt + GROUP BY dt。
 * - 使用率 SQL 去掉了 MCP 不支持的 SET 语句；视频新旧表切换日仍为 2026-05-25。
 */

/** @typedef {{ label: string, maxCU?: number, waitMs?: number, sql: string }} MetricSql */

/** @type {Record<string, MetricSql>} */
export const DAILY_TREND_SQL = {
  active: {
    label: '活跃用户趋势',
    maxCU: 30,
    sql: `
SELECT dt, count(1) AS pv, count(DISTINCT user_id) AS uv
FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
WHERE product_id IN ('czx', 'xueban')
  AND is_spider = false
  AND dt >= '\${begin}' AND dt <= '\${end}'
GROUP BY dt
ORDER BY dt
`.trim()
  },

  paid: {
    label: '付费用户及营收趋势',
    maxCU: 20,
    sql: `
SELECT
    dt,
    COUNT(DISTINCT payer_id) AS paid_users,
    SUM(paid_amount) * 0.01 AS revenue
FROM dmp_cdm.dwd_ump_pay_trd_charges_di
WHERE dt >= '\${begin}' AND dt <= '\${end}'
  AND app_id = 'app_xkwczx'
  AND paid_status = '1'
  AND refunded = '0'
  AND payer_id NOT IN (\${payerInList})
GROUP BY dt
ORDER BY dt
`.trim()
  },

  usage: {
    label: '使用率趋势',
    maxCU: 200,
    waitMs: 600000,
    sql: `
WITH visited_users AS (
    SELECT DISTINCT
        CAST(user_id AS STRING) AS user_id,
        dt AS date
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban')
      AND is_spider = false
      AND dt >= '\${begin}'
      AND dt <= '\${end}'
),
action_users AS (
    SELECT DISTINCT
        CAST(user_id AS STRING) AS user_id,
        date
    FROM (
        -- 行为 1: 下载
        SELECT CAST(user_id AS STRING) AS user_id, dt AS date
        FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_download_complete
        WHERE dt >= '\${begin}' AND dt <= '\${end}'

        UNION

        -- 行为 2: 文档详情批改
        SELECT CAST(user_id AS STRING) AS user_id, dt AS date
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id = 'czx'
          AND (referrer LIKE 'https://c.zxxk.com/doc-detail%' OR referrer LIKE 'https://c.xkw.com/doc-detail%')
          AND (request_url LIKE 'https://c.zxxk.com/correct?documentId%' OR request_url LIKE 'https://c.xkw.com/correct?documentId%')
          AND log_event_type = 'view'
          AND is_spider = false
          AND dt >= '\${begin}' AND dt <= '\${end}'

        UNION

        -- 行为 3: 全屏预览
        SELECT CAST(user_id AS STRING) AS user_id, dt AS date
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id = 'czx'
          AND log_event_type = 'click'
          AND html_element_name = 'full_preview'
          AND dt >= '\${begin}' AND dt <= '\${end}'

        UNION

        -- 行为 4: 收藏成功
        SELECT CAST(user_id AS STRING) AS user_id, dt AS date
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id = 'czx'
          AND log_event_type = 'click'
          AND html_element_name = 'toast_favorite_success'
          AND dt >= '\${begin}' AND dt <= '\${end}'

        UNION

        -- 行为 5: 播放视频（旧表）
        SELECT CAST(user_id AS STRING) AS user_id, dt AS date
        FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_video_play
        WHERE dt >= '\${begin}' AND dt <= '\${end}'

        UNION

        -- 行为 5: 播放视频（新表，自 2026-05-25 起）
        SELECT CAST(user_id AS STRING) AS user_id, dt AS date
        FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_video_play_1
        WHERE dt >= '2026-05-25'
          AND dt >= '\${begin}' AND dt <= '\${end}'

        UNION

        -- 行为 6: 试卷报告
        SELECT CAST(user_id AS STRING) AS user_id, dt AS date
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id = 'czx'
          AND (referrer LIKE 'https://c.zxxk.com/doc-detail%' OR referrer LIKE 'https://c.xkw.com/doc-detail%')
          AND (request_url LIKE 'https://c.zxxk.com/report%' OR request_url LIKE 'https://c.xkw.com/report%')
          AND log_event_type = 'view'
          AND is_spider = false
          AND dt >= '\${begin}' AND dt <= '\${end}'

        UNION

        -- 行为 7: 在线练
        SELECT CAST(user_id AS STRING) AS user_id, dt AS date
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id = 'czx'
          AND (request_url LIKE 'https://c.zxxk.com/practice%' OR request_url LIKE 'https://c.xkw.com/practice%')
          AND log_event_type = 'view'
          AND is_spider = false
          AND dt >= '\${begin}' AND dt <= '\${end}'

        UNION

        -- 行为 8: 伴学
        SELECT CAST(user_id AS STRING) AS user_id, dt AS date
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE request_url IN ('https://xb.xkw.com/photo-search', 'https://xb.xkw.com')
          AND log_event_type = 'view'
          AND is_spider = false
          AND dt >= '\${begin}' AND dt <= '\${end}'
    ) AS actions
),
daily_usage_users AS (
    SELECT
        vu.date,
        COUNT(DISTINCT vu.user_id) AS usage_user_count
    FROM visited_users vu
    JOIN action_users au
        ON vu.user_id = au.user_id
        AND vu.date = au.date
    GROUP BY vu.date
),
daily_active_users AS (
    SELECT
        dt AS date,
        COUNT(DISTINCT user_id) AS active_user_count
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban')
      AND is_spider = false
      AND dt >= '\${begin}'
      AND dt <= '\${end}'
    GROUP BY dt
)
SELECT
    dau.date,
    dau.active_user_count AS active_users,
    COALESCE(duu.usage_user_count, 0) AS usage_users,
    ROUND(COALESCE(duu.usage_user_count, 0) * 100.0 / dau.active_user_count, 2) AS usage_rate
FROM daily_active_users dau
LEFT JOIN daily_usage_users duu
    ON dau.date = duu.date
ORDER BY dau.date
`.trim()
  }
};
