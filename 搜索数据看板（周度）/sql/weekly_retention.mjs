/**
 * 周度搜索看板 · 搜索成功用户周留存 SQL
 *
 * 改口径只改本文件。由 buildRetentionSql() 按目标周生成完整 SQL。
 *
 * 约定：
 * - 锚定日起：2026-01-01（与看板自然周一致）
 * - 2026-07-16 前：search_result_click_1
 * - 2026-07-16 起：search_result_click_2 + paperlist_click_3（搜索结果列表）
 * - 未完整结束的留存周输出 NULL（CSV 写 null）
 * - 每次按 endExclusive 全量重算整张留存矩阵后覆写 CSV
 */
export const RETENTION_META = {
  label: '搜索功能留存',
  maxCU: 250,
  waitMs: 1800000,
  startDate: '2026-01-01',
  clickSwitchDate: '2026-07-16'
};

/**
 * @param {{ endExclusive: string, maxLag?: number }} opts
 *   endExclusive: 右开截止日期 YYYY-MM-DD（= 目标周结束日次日）
 *   maxLag: 最多输出 week_0..week_maxLag（默认按完整周数推算）
 */
export function buildRetentionSql({ endExclusive, maxLag } = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(endExclusive || ''))) {
    throw new Error(`endExclusive 非法: ${endExclusive}`);
  }
  const start = RETENTION_META.startDate;
  const switchDt = RETENTION_META.clickSwitchDate;

  const startMs = Date.parse(`${start}T00:00:00`);
  const endExMs = Date.parse(`${endExclusive}T00:00:00`);
  const lastCompleteMs = endExMs - 86400000;
  const completeWeeks = Math.floor((lastCompleteMs - startMs) / (7 * 86400000)) + 1;
  const lag = Number.isFinite(maxLag) ? maxLag : Math.max(0, completeWeeks - 1);

  const wCountCols = [];
  for (let i = 0; i <= lag; i++) {
    wCountCols.push(
      `COUNT(DISTINCT CASE WHEN weeks_since_first = ${i} THEN user_id END) AS w${i}`
    );
  }

  const weekSelectCols = [];
  for (let i = 0; i <= lag; i++) {
    if (i === 0) {
      weekSelectCols.push(
        `ROUND(w0 * 100.0 / NULLIF(cohort_size, 0), 2) AS week_0`
      );
      continue;
    }
    weekSelectCols.push(`
    CASE WHEN DATE_ADD((SELECT start_date FROM params), (first_week_num + ${i}) * 7 + 6) <= (SELECT last_complete_date FROM params)
         THEN ROUND(w${i} * 100.0 / NULLIF(cohort_size, 0), 2) END AS week_${i}`.trim());
  }

  return `
WITH params AS (
    SELECT
        TO_DATE('${start}') AS start_date,
        TO_DATE('${endExclusive}') AS end_date_exclusive,
        DATE_ADD(TO_DATE('${endExclusive}'), -1) AS last_complete_date
),
click_base AS (
    SELECT
        CAST(user_id AS STRING) AS user_id,
        dt
    FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_search_result_click_1
    WHERE dt >= '${start}'
      AND dt <  '${switchDt}'
      AND dt <  '${endExclusive}'
      AND user_id IS NOT NULL
      AND CAST(user_id AS STRING) <> ''

    UNION ALL

    SELECT
        CAST(user_id AS STRING) AS user_id,
        dt
    FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_search_result_click_2
    WHERE dt >= '${switchDt}'
      AND dt <  '${endExclusive}'
      AND user_id IS NOT NULL
      AND CAST(user_id AS STRING) <> ''

    UNION ALL

    SELECT
        CAST(user_id AS STRING) AS user_id,
        dt
    FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_paperlist_click_3
    WHERE dt >= '${switchDt}'
      AND dt <  '${endExclusive}'
      AND user_id IS NOT NULL
      AND CAST(user_id AS STRING) <> ''
      AND (
            url LIKE 'https://c.zxxk.com/search-result?kw=%'
         OR url LIKE 'https://c.xkw.com/search-result?kw=%'
      )
      AND click_paper_id IS NOT NULL
),
user_first_click AS (
    SELECT
        user_id,
        FLOOR(
            DATEDIFF(
                TO_DATE(MIN(dt)),
                (SELECT start_date FROM params)
            ) / 7
        ) AS first_week_num
    FROM click_base
    GROUP BY user_id
),
user_weekly_click AS (
    SELECT
        user_id,
        FLOOR(
            DATEDIFF(
                TO_DATE(dt),
                (SELECT start_date FROM params)
            ) / 7
        ) AS week_num
    FROM click_base
    GROUP BY
        user_id,
        FLOOR(
            DATEDIFF(
                TO_DATE(dt),
                (SELECT start_date FROM params)
            ) / 7
        )
),
cohort_data AS (
    SELECT
        f.user_id,
        f.first_week_num,
        w.week_num,
        w.week_num - f.first_week_num AS weeks_since_first
    FROM user_first_click f
    LEFT JOIN user_weekly_click w
        ON f.user_id = w.user_id
       AND w.week_num >= f.first_week_num
),
cohort_summary AS (
    SELECT
        first_week_num,
        COUNT(DISTINCT user_id) AS cohort_size,
        ${wCountCols.join(',\n        ')}
    FROM cohort_data
    GROUP BY first_week_num
)
SELECT
    CONCAT(
        DATE_ADD((SELECT start_date FROM params), first_week_num * 7),
        ' ~ ',
        CASE
            WHEN DATE_ADD((SELECT start_date FROM params), first_week_num * 7 + 6) <= (SELECT last_complete_date FROM params)
                THEN DATE_ADD((SELECT start_date FROM params), first_week_num * 7 + 6)
            ELSE (SELECT last_complete_date FROM params)
        END
    ) AS cohort_week,
    CASE
        WHEN DATE_ADD((SELECT start_date FROM params), first_week_num * 7) < TO_DATE('${switchDt}')
            THEN 'old_metric_period'
        ELSE 'new_metric_period'
    END AS metric_period,
    cohort_size,
    ${weekSelectCols.join(',\n    ')}
FROM cohort_summary
WHERE first_week_num >= 0
ORDER BY first_week_num
`.trim();
}
