/**
 * 周度核心数据 · MaxCompute SQL 模板（口径与月度核心一致，时间窗改为自然周）
 *
 * 改口径时只改本文件，无需动 scripts/update_weekly_core_from_odps.mjs。
 *
 * 占位符（运行时由脚本替换）：
 *   ${begin} ${end}           目标周起止日期 YYYY-MM-DD
 *   ${prevBegin} ${prevEnd}   上一周起止（次周留存：上期活跃 ∩ 本期 / 上期活跃）
 *   ${payerInList}            排除的 payer_id，形如 '1','2','3'
 *
 * 指标写入 CSV 字段：
 *   activeUsers → 活跃用户
 *   newUsers    → 新用户
 *   retention   → 次周留存率
 *   revenue     → 营收（ARPU = 营收 / 活跃用户，脚本计算）
 *   depth       → 深度访问率（详情 UV / 活跃）
 *   usage       → 使用率（使用用户 / 活跃）
 *   vip         → 大会员活跃率
 */

/** @typedef {{ label: string, maxCU?: number, waitMs?: number, sql: string }} MetricSql */

/** @type {Record<string, MetricSql>} */
export const METRIC_SQL = {
  activeUsers: {
    label: '活跃用户',
    maxCU: 20,
    sql: `
SELECT count(1) AS pv, count(DISTINCT user_id) AS uv
FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
WHERE product_id IN ('czx', 'xueban')
  AND is_spider = false
  AND dt >= '\${begin}' AND dt <= '\${end}'
`.trim()
  },

  newUsers: {
    label: '新用户',
    maxCU: 30,
    sql: `
WITH temp1 AS (
    SELECT user_id, min(dt) AS first_date
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban')
      AND application_id = 'mzhan'
      AND is_spider = false
    GROUP BY user_id
)
SELECT count(user_id) AS new_user_cnt
FROM temp1
WHERE first_date BETWEEN '\${begin}' AND '\${end}'
`.trim()
  },

  retention: {
    label: '次周留存',
    maxCU: 30,
    sql: `
WITH temp1 AS (
    SELECT DISTINCT user_id
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban') AND application_id = 'mzhan'
      AND dt >= '\${prevBegin}' AND dt <= '\${prevEnd}'
),
temp2 AS (
    SELECT DISTINCT user_id
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban') AND application_id = 'mzhan'
      AND dt >= '\${begin}' AND dt <= '\${end}'
),
temp3 AS (
    SELECT 1 AS a, count(DISTINCT t1.user_id) AS retained_users
    FROM temp1 t1
    INNER JOIN temp2 t2 ON t1.user_id = t2.user_id
),
temp4 AS (
    SELECT 1 AS a, count(DISTINCT user_id) AS active_users
    FROM temp1
)
SELECT t4.active_users, t3.retained_users,
       t3.retained_users / t4.active_users AS retention_rate
FROM temp4 t4
LEFT JOIN temp3 t3 ON t4.a = t3.a
`.trim()
  },

  revenue: {
    label: '营收',
    maxCU: 20,
    sql: `
SELECT
    sum(paid_amount * 0.01) AS revenue,
    COUNT(*) AS order_cnt,
    COUNT(DISTINCT payer_id) AS paying_users
FROM dmp_cdm.dwd_ump_pay_trd_charges_di
WHERE dt >= '\${begin}' AND dt <= '\${end}'
  AND app_id = 'app_xkwczx'
  AND paid_status = '1'
  AND refunded = '0'
  AND payer_id NOT IN (\${payerInList})
`.trim()
  },

  depth: {
    label: '深度访问UV',
    maxCU: 80,
    waitMs: 300000,
    sql: `
SELECT count(1) AS pv, COUNT(DISTINCT user_id) AS uv
FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
WHERE (request_url LIKE 'https://c.zxxk.com/doc-detail%'
    OR request_url LIKE 'https://c.xkw.com/doc-detail%')
  AND log_event_type = 'view'
  AND is_spider = false
  AND dt >= '\${begin}' AND dt <= '\${end}'
`.trim()
  },

  usage: {
    label: '使用用户',
    maxCU: 200,
    waitMs: 600000,
    sql: `
WITH visited_users AS (
    SELECT DISTINCT CAST(user_id AS STRING) AS user_id
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx', 'xueban')
      AND is_spider = false
      AND dt >= '\${begin}' AND dt <= '\${end}'
),
action_users AS (
    SELECT DISTINCT CAST(user_id AS STRING) AS user_id
    FROM (
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_download_complete
        WHERE dt >= '\${begin}' AND dt <= '\${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE (referrer LIKE 'https://c.zxxk.com/doc-detail%' OR referrer LIKE 'https://c.xkw.com/doc-detail%')
          AND (request_url LIKE 'https://c.zxxk.com/correct?documentId%' OR request_url LIKE 'https://c.xkw.com/correct?documentId%')
          AND log_event_type = 'view'
          AND is_spider = false
          AND dt >= '\${begin}' AND dt <= '\${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id IN ('czx', 'xueban')
          AND log_event_type = 'click'
          AND html_element_name = 'full_preview'
          AND dt >= '\${begin}' AND dt <= '\${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id IN ('czx', 'xueban')
          AND log_event_type = 'click'
          AND html_element_name = 'toast_favorite_success'
          AND dt >= '\${begin}' AND dt <= '\${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_video_play_1
        WHERE dt >= '\${begin}' AND dt <= '\${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE (referrer LIKE 'https://c.zxxk.com/doc-detail%' OR referrer LIKE 'https://c.xkw.com/doc-detail%')
          AND (request_url LIKE 'https://c.zxxk.com/report%' OR request_url LIKE 'https://c.xkw.com/report%')
          AND log_event_type = 'view'
          AND is_spider = false
          AND dt >= '\${begin}' AND dt <= '\${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id = 'czx'
          AND (request_url LIKE 'https://c.zxxk.com/practice%' OR request_url LIKE 'https://c.xkw.com/practice%')
          AND log_event_type = 'view'
          AND is_spider = false
          AND dt >= '\${begin}' AND dt <= '\${end}'
        UNION
        SELECT CAST(user_id AS STRING) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE (request_url LIKE 'https://xb.xkw.com/photo-search%' OR request_url = 'https://xb.xkw.com/')
          AND log_event_type = 'view'
          AND is_spider = false
          AND dt >= '\${begin}' AND dt <= '\${end}'
    ) AS actions
)
SELECT COUNT(DISTINCT vu.user_id) AS user_count
FROM visited_users vu
JOIN action_users au ON vu.user_id = au.user_id
`.trim()
  },

  vip: {
    label: '大会员活跃率',
    maxCU: 40,
    waitMs: 300000,
    sql: `
WITH yearly_members AS (
    SELECT
        payer_id AS seller_id,
        dt AS purchase_date,
        CASE
            WHEN paid_amount IN (15800, 23800, 26800) THEN DATE_ADD(CAST(dt AS DATE), 365)
            WHEN paid_amount = 21900 THEN DATE_ADD(CAST(dt AS DATE), 335)
            WHEN paid_amount = 59800 THEN DATE_ADD(CAST(dt AS DATE), 1095)
        END AS expiry_date
    FROM dmp_cdm.dwd_ump_pay_trd_charges_di
    WHERE paid_status = '1'
      AND refunded = '0'
      AND app_id = 'app_xkwczx'
      AND paid_amount IN (15800, 23800, 26800, 21900, 59800)
      AND dt >= '2023-01-01'
      AND dt <= '\${end}'
),
valid_yearly_members AS (
    SELECT DISTINCT seller_id
    FROM yearly_members
    WHERE purchase_date <= '\${end}'
      AND expiry_date >= '\${begin}'
)
SELECT
    COUNT(DISTINCT vm.seller_id) AS member_cnt,
    COUNT(DISTINCT t.user_id) AS visit_cnt,
    ROUND(COUNT(DISTINCT t.user_id) * 100.0 / COUNT(DISTINCT vm.seller_id), 2) AS active_rate
FROM valid_yearly_members vm
LEFT JOIN dmp_cdm.dwd_pub_io_log_xyiolog_di t
    ON CAST(t.user_id AS STRING) = vm.seller_id
   AND t.product_id IN ('czx', 'xueban')
   AND t.is_spider = false
   AND t.dt >= '\${begin}'
   AND t.dt <= '\${end}'
`.trim()
  }
};
