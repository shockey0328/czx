/**
 * 周度搜索行为漏斗 · MaxCompute SQL 模板
 *
 * 改口径只改本文件。占位符：
 *   ${begin} ${end}   目标周起止 YYYY-MM-DD（含当日）
 *   ${endNext}        end 次日 YYYY-MM-DD（下载表 download_time 右开区间）
 *
 * 输出三行 stage：搜索结果 / 搜索点击 / 点击后使用（pv、uv）
 * 写入 CSV：week_key,date_range,search_pv,click_pv,click_rate_pv_pct,any_usage_pv,usage_rate_vs_click_pv_pct
 *   click_rate_pv_pct = click_pv / search_pv * 100
 *   usage_rate_vs_click_pv_pct = any_usage_pv / search_pv * 100（列名历史如此，实际相对搜索）
 */
export const FUNNEL_SQL = {
  label: '搜索行为漏斗',
  maxCU: 250,
  waitMs: 1800000,
  sql: `
WITH
search_data AS (
    SELECT
        CAST(user_id AS STRING) AS user_id,
        dt
    FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_search_result_3
    WHERE dt >= '\${begin}'
      AND dt <= '\${end}'
),
search_user_day AS (
    SELECT DISTINCT
        user_id,
        dt
    FROM search_data
),
search_click_data AS (
    SELECT
        CAST(c.user_id AS STRING) AS user_id,
        c.dt
    FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_search_result_click_2 c
    INNER JOIN search_user_day s
        ON CAST(c.user_id AS STRING) = s.user_id
       AND c.dt = s.dt
    WHERE c.dt >= '\${begin}'
      AND c.dt <= '\${end}'
),
direct_doc_entry_raw AS (
    SELECT DISTINCT
        CAST(user_id AS STRING) AS user_id,
        CAST(REGEXP_EXTRACT(request_url, '.*/doc-detail/([0-9]+)', 1) AS BIGINT) AS res_id,
        dt
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE (
            referrer LIKE 'https://c.zxxk.com/search-result?kw=%'
         OR referrer LIKE 'https://c.xkw.com/search-result?kw=%'
    )
      AND (
            request_url LIKE 'https://c.zxxk.com/doc-detail/%'
         OR request_url LIKE 'https://c.xkw.com/doc-detail/%'
    )
      AND REGEXP_EXTRACT(request_url, '.*/doc-detail/([0-9]+)', 1) IS NOT NULL
      AND REGEXP_EXTRACT(request_url, '.*/doc-detail/([0-9]+)', 1) != ''
      AND dt >= '\${begin}'
      AND dt <= '\${end}'
),
direct_doc_entry AS (
    SELECT DISTINCT
        d.user_id,
        d.res_id,
        d.dt,
        'direct' AS scene_type
    FROM direct_doc_entry_raw d
    INNER JOIN search_user_day s
        ON d.user_id = s.user_id
       AND d.dt = s.dt
),
search_to_scene_raw AS (
    SELECT DISTINCT
        CAST(user_id AS STRING) AS user_id,
        dt,
        request_url AS scene_url,
        CASE
            WHEN request_url LIKE 'https://c.xkw.com/doc-list-module%'
              OR request_url LIKE 'https://c.zxxk.com/doc-list-module%' THEN 'doc_list_module'
            WHEN request_url LIKE 'https://c.xkw.com/phreview%'
              OR request_url LIKE 'https://c.zxxk.com/phreview%' THEN 'phreview'
            WHEN request_url LIKE 'https://c.xkw.com/template/tbx%'
              OR request_url LIKE 'https://c.zxxk.com/template/tbx%' THEN 'template_tbx'
            WHEN request_url LIKE 'https://c.xkw.com/upstage%'
              OR request_url LIKE 'https://c.zxxk.com/upstage%' THEN 'upstage'
            ELSE 'other_scene'
        END AS scene_type
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE (
            referrer LIKE 'https://c.zxxk.com/search-result?kw=%'
         OR referrer LIKE 'https://c.xkw.com/search-result?kw=%'
    )
      AND (
            request_url LIKE 'https://c.xkw.com/doc-list-module%'
         OR request_url LIKE 'https://c.zxxk.com/doc-list-module%'
         OR request_url LIKE 'https://c.xkw.com/phreview%'
         OR request_url LIKE 'https://c.zxxk.com/phreview%'
         OR request_url LIKE 'https://c.xkw.com/template/tbx%'
         OR request_url LIKE 'https://c.zxxk.com/template/tbx%'
         OR request_url LIKE 'https://c.xkw.com/upstage%'
         OR request_url LIKE 'https://c.zxxk.com/upstage%'
    )
      AND dt >= '\${begin}'
      AND dt <= '\${end}'
),
search_to_scene AS (
    SELECT DISTINCT
        r.user_id,
        r.dt,
        r.scene_url,
        r.scene_type
    FROM search_to_scene_raw r
    INNER JOIN search_user_day s
        ON r.user_id = s.user_id
       AND r.dt = s.dt
),
scene_to_doc_raw AS (
    SELECT DISTINCT
        CAST(user_id AS STRING) AS user_id,
        CAST(REGEXP_EXTRACT(request_url, '.*/doc-detail/([0-9]+)', 1) AS BIGINT) AS res_id,
        dt,
        referrer AS scene_url,
        CASE
            WHEN referrer LIKE 'https://c.xkw.com/doc-list-module%'
              OR referrer LIKE 'https://c.zxxk.com/doc-list-module%' THEN 'doc_list_module'
            WHEN referrer LIKE 'https://c.xkw.com/phreview%'
              OR referrer LIKE 'https://c.zxxk.com/phreview%' THEN 'phreview'
            WHEN referrer LIKE 'https://c.xkw.com/template/tbx%'
              OR referrer LIKE 'https://c.zxxk.com/template/tbx%' THEN 'template_tbx'
            WHEN referrer LIKE 'https://c.xkw.com/upstage%'
              OR referrer LIKE 'https://c.zxxk.com/upstage%' THEN 'upstage'
            ELSE 'other_scene'
        END AS scene_type
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE (
            referrer LIKE 'https://c.xkw.com/doc-list-module%'
         OR referrer LIKE 'https://c.zxxk.com/doc-list-module%'
         OR referrer LIKE 'https://c.xkw.com/phreview%'
         OR referrer LIKE 'https://c.zxxk.com/phreview%'
         OR referrer LIKE 'https://c.xkw.com/template/tbx%'
         OR referrer LIKE 'https://c.zxxk.com/template/tbx%'
         OR referrer LIKE 'https://c.xkw.com/upstage%'
         OR referrer LIKE 'https://c.zxxk.com/upstage%'
    )
      AND (
            request_url LIKE 'https://c.zxxk.com/doc-detail/%'
         OR request_url LIKE 'https://c.xkw.com/doc-detail/%'
    )
      AND REGEXP_EXTRACT(request_url, '.*/doc-detail/([0-9]+)', 1) IS NOT NULL
      AND REGEXP_EXTRACT(request_url, '.*/doc-detail/([0-9]+)', 1) != ''
      AND dt >= '\${begin}'
      AND dt <= '\${end}'
),
scene_doc_entry AS (
    SELECT DISTINCT
        d.user_id,
        d.res_id,
        d.dt,
        d.scene_type
    FROM scene_to_doc_raw d
    INNER JOIN search_to_scene s
        ON d.user_id = s.user_id
       AND d.dt = s.dt
       AND d.scene_type = s.scene_type
),
scene_to_practice_raw AS (
    SELECT DISTINCT
        CAST(user_id AS STRING) AS user_id,
        dt,
        referrer AS scene_url,
        request_url AS practice_url,
        CASE
            WHEN referrer LIKE 'https://c.xkw.com/phreview%'
              OR referrer LIKE 'https://c.zxxk.com/phreview%' THEN 'phreview'
            WHEN referrer LIKE 'https://c.xkw.com/template/tbx%'
              OR referrer LIKE 'https://c.zxxk.com/template/tbx%' THEN 'template_tbx'
            WHEN referrer LIKE 'https://c.xkw.com/upstage%'
              OR referrer LIKE 'https://c.zxxk.com/upstage%' THEN 'upstage'
            ELSE 'other_scene'
        END AS scene_type
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE (
            referrer LIKE 'https://c.xkw.com/phreview%'
         OR referrer LIKE 'https://c.zxxk.com/phreview%'
         OR referrer LIKE 'https://c.xkw.com/template/tbx%'
         OR referrer LIKE 'https://c.zxxk.com/template/tbx%'
         OR referrer LIKE 'https://c.xkw.com/upstage%'
         OR referrer LIKE 'https://c.zxxk.com/upstage%'
    )
      AND (
            request_url LIKE 'https://c.zxxk.com/practice%'
         OR request_url LIKE 'https://c.xkw.com/practice%'
    )
      AND dt >= '\${begin}'
      AND dt <= '\${end}'
),
scene_practice_entry AS (
    SELECT DISTINCT
        p.user_id,
        p.dt,
        p.practice_url,
        p.scene_type
    FROM scene_to_practice_raw p
    INNER JOIN search_to_scene s
        ON p.user_id = s.user_id
       AND p.dt = s.dt
       AND p.scene_type = s.scene_type
    WHERE p.scene_type IN ('phreview', 'template_tbx', 'upstage')
),
doc_entry AS (
    SELECT user_id, res_id, dt, scene_type
    FROM direct_doc_entry
    UNION
    SELECT user_id, res_id, dt, scene_type
    FROM scene_doc_entry
),
download_data AS (
    SELECT DISTINCT
        CAST(user_id AS STRING) AS user_id,
        CAST(document_id AS BIGINT) AS res_id,
        SUBSTR(download_time, 1, 10) AS dt
    FROM dmp_cdm.dwd_zxxk_zxxk_log_student_download_df
    WHERE download_time >= '\${begin}'
      AND download_time <  '\${endNext}'
      AND document_id IS NOT NULL
),
preview_data AS (
    SELECT DISTINCT
        CAST(user_id AS STRING) AS user_id,
        CAST(REGEXP_EXTRACT(request_url, '.*/doc-detail/([0-9]+)', 1) AS BIGINT) AS res_id,
        dt
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE dt >= '\${begin}'
      AND dt <= '\${end}'
      AND log_event_type = 'click'
      AND html_element_name = 'full_preview'
      AND REGEXP_EXTRACT(request_url, '.*/doc-detail/([0-9]+)', 1) IS NOT NULL
      AND REGEXP_EXTRACT(request_url, '.*/doc-detail/([0-9]+)', 1) != ''
),
video_data AS (
    SELECT DISTINCT
        CAST(user_id AS STRING) AS user_id,
        CAST(content_id AS BIGINT) AS res_id,
        dt
    FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_video_play_1
    WHERE dt >= '\${begin}'
      AND dt <= '\${end}'
      AND content_id IS NOT NULL
),
doc_to_practice_entry AS (
    SELECT DISTINCT
        CAST(user_id AS STRING) AS user_id,
        CAST(REGEXP_EXTRACT(referrer, '.*/doc-detail/([0-9]+)', 1) AS BIGINT) AS res_id,
        dt,
        request_url AS practice_url
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE (
            referrer LIKE 'https://c.zxxk.com/doc-detail/%'
         OR referrer LIKE 'https://c.xkw.com/doc-detail/%'
    )
      AND (
            request_url LIKE 'https://c.zxxk.com/practice%'
         OR request_url LIKE 'https://c.xkw.com/practice%'
    )
      AND REGEXP_EXTRACT(referrer, '.*/doc-detail/([0-9]+)', 1) IS NOT NULL
      AND REGEXP_EXTRACT(referrer, '.*/doc-detail/([0-9]+)', 1) != ''
      AND dt >= '\${begin}'
      AND dt <= '\${end}'
),
click_then_download AS (
    SELECT DISTINCT
        c.user_id,
        c.res_id,
        c.dt
    FROM doc_entry c
    INNER JOIN download_data d
        ON c.user_id = d.user_id
       AND c.res_id = d.res_id
       AND c.dt = d.dt
),
click_then_preview AS (
    SELECT DISTINCT
        c.user_id,
        c.res_id,
        c.dt
    FROM doc_entry c
    INNER JOIN preview_data p
        ON c.user_id = p.user_id
       AND c.res_id = p.res_id
       AND c.dt = p.dt
),
click_then_video AS (
    SELECT DISTINCT
        c.user_id,
        c.res_id,
        c.dt
    FROM doc_entry c
    INNER JOIN video_data v
        ON c.user_id = v.user_id
       AND c.res_id = v.res_id
       AND c.dt = v.dt
),
click_then_practice_res AS (
    SELECT DISTINCT
        c.user_id,
        c.res_id,
        c.dt,
        e.practice_url
    FROM doc_entry c
    INNER JOIN doc_to_practice_entry e
        ON c.user_id = e.user_id
       AND c.res_id = e.res_id
       AND c.dt = e.dt
    WHERE c.scene_type IN ('direct', 'doc_list_module')
),
click_then_practice_no_res AS (
    SELECT DISTINCT
        user_id,
        dt,
        practice_url
    FROM scene_practice_entry
),
usage_detail AS (
    SELECT
        user_id,
        dt,
        'download' AS src,
        CONCAT(user_id, '|doc|', CAST(res_id AS STRING), '|', dt) AS usage_key
    FROM click_then_download
    UNION ALL
    SELECT
        user_id,
        dt,
        'preview' AS src,
        CONCAT(user_id, '|doc|', CAST(res_id AS STRING), '|', dt) AS usage_key
    FROM click_then_preview
    UNION ALL
    SELECT
        user_id,
        dt,
        'video' AS src,
        CONCAT(user_id, '|doc|', CAST(res_id AS STRING), '|', dt) AS usage_key
    FROM click_then_video
    UNION ALL
    SELECT
        user_id,
        dt,
        'practice_res' AS src,
        CONCAT(user_id, '|practice_res|', CAST(res_id AS STRING), '|', dt, '|', practice_url) AS usage_key
    FROM click_then_practice_res
    UNION ALL
    SELECT
        user_id,
        dt,
        'practice_no_res' AS src,
        CONCAT(user_id, '|practice_no_res|', dt, '|', practice_url) AS usage_key
    FROM click_then_practice_no_res
),
funnel_stages AS (
    SELECT
        '1_search_result' AS stage_code,
        '搜索结果' AS stage_name,
        COUNT(1) AS pv,
        COUNT(DISTINCT user_id) AS uv
    FROM search_data
    UNION ALL
    SELECT
        '2_search_click' AS stage_code,
        '搜索点击' AS stage_name,
        COUNT(1) AS pv,
        COUNT(DISTINCT user_id) AS uv
    FROM search_click_data
    UNION ALL
    SELECT
        '3_click_usage' AS stage_code,
        '点击后使用' AS stage_name,
        COUNT(DISTINCT usage_key) AS pv,
        COUNT(DISTINCT user_id) AS uv
    FROM usage_detail
)
SELECT
    stage_code,
    stage_name,
    pv,
    uv
FROM funnel_stages
ORDER BY stage_code
`.trim()
};
