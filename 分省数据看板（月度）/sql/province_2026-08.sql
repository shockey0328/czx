-- ============================================================
-- 分省数据看板 · MaxCompute 直查 SQL（口径=访问IP省份，与历史一致）
-- 目标月份: 2026-08-01 ~ 2026-08-31
-- 数据源: dmp_cdm（MaxCompute），依赖已安装 UDF dmp_cdm.ip_parse(ip,'province')
-- 用法: 在 MaxCompute 客户端逐段执行以下 4 条 SELECT，把结果贴回即可。
-- 返回口径: 每条给出 province / 对应指标；省份解析用 ip_parse 得到标准省名。
-- ============================================================

-- ① 活跃用户（按访问IP解析省份）
SELECT  dmp_cdm.ip_parse(l.req_header_x_forwarded_for, 'province') AS province,
        COUNT(1) AS pv,
        COUNT(DISTINCT l.user_id) AS uv
FROM    dmp_cdm.dwd_pub_io_log_xyiolog_di l
WHERE   l.product_id IN ('czx', 'xueban')
  AND   l.is_spider = false
  AND   l.dt >= '2026-08-01' AND l.dt <= '2026-08-31'
GROUP BY dmp_cdm.ip_parse(l.req_header_x_forwarded_for, 'province')
ORDER BY uv DESC;

-- ② 新用户（首访口径，按首访时访问IP解析省份）
WITH user_logs AS (
    SELECT  l.user_id, l.dt, l.req_header_x_forwarded_for AS ip
    FROM    dmp_cdm.dwd_pub_io_log_xyiolog_di l
    WHERE   (l.request_url LIKE 'https://c.xkw.com%'
             OR l.request_url LIKE 'https://c.zxxk.com%')
            AND l.application_id = 'mzhan'
            AND l.is_spider = false
),
user_first AS (
    SELECT  ul.user_id, ul.dt AS first_date, ul.ip
    FROM    (SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY dt ASC) AS rn FROM user_logs) ul
    WHERE   ul.rn = 1
)
SELECT  dmp_cdm.ip_parse(uf.ip, 'province') AS province,
        COUNT(DISTINCT uf.user_id) AS new_user_uv
FROM    user_first uf
WHERE   uf.first_date >= '2026-08-01' AND uf.first_date <= '2026-08-31'
GROUP BY dmp_cdm.ip_parse(uf.ip, 'province')
ORDER BY new_user_uv DESC;

-- ③ 营收（排除测试 payer_id，按付费IP解析省份）
SELECT  dmp_cdm.ip_parse(c.client_ip, 'province') AS province,
        COUNT(DISTINCT c.payer_id) AS paid_uv,
        SUM(c.paid_amount * 0.01) AS total_amount
FROM    dmp_cdm.dwd_ump_pay_trd_charges_di c
WHERE   c.dt >= '2026-08-01' AND c.dt <= '2026-08-31'
  AND   c.app_id = 'app_xkwczx'
  AND   c.paid_status = '1'
  AND   c.refunded = '0'
  AND   c.payer_id NOT IN (
        '64715131',
        '47456867',
        '26586707',
        '33119852',
        '26945698',
        '46139544',
        '28782753',
        '65228068',
        '62374507',
        '54589073',
        '54525570',
        '54525568',
        '54525569',
        '54589071',
        '54589072',
        '54589070',
        '54418117',
        '30396915',
        '45910665',
        '70182323',
        '26277102',
        '26272623',
        '70799773',
        '23516880',
        '10167816',
        '64025857',
        '57782781',
        '22664042',
        '61570251',
        '35833204',
        '29128900',
        '72997019',
        '22664198',
        '70751965',
        '47876582',
        '317406582',
        '317463456',
        '317411735',
        '317402344',
        '22664064',
        '34409192',
        '75858697',
        '37812082',
        '75734940',
        '4276996',
        '76116584',
        '28345186',
        '29081269',
        '53090059',
        '54068676',
        '54528073'
  )
GROUP BY dmp_cdm.ip_parse(c.client_ip, 'province')
ORDER BY paid_uv DESC;

-- ④ 使用用户（visited 用户按访问IP解析省份；action 为各类深度使用行为）
WITH visited_users AS (
    SELECT  DISTINCT CAST(l.user_id AS STRING) AS user_id,
            dmp_cdm.ip_parse(l.req_header_x_forwarded_for, 'province') AS province
    FROM    dmp_cdm.dwd_pub_io_log_xyiolog_di l
    WHERE   l.product_id IN ('czx', 'xueban')
      AND   l.is_spider = false
      AND   l.dt BETWEEN '2026-08-01' AND '2026-08-31'
),
action_users AS (
    SELECT  DISTINCT CAST(user_id AS STRING) AS user_id
    FROM (
        SELECT  DISTINCT CAST(user_id AS STRING) AS user_id
        FROM    dmp_cdm.dwd_zxxk_zxxk_log_student_download_df
        WHERE   substr(download_time, 1, 10) BETWEEN '2026-08-01' AND '2026-08-31'
        UNION
        SELECT  DISTINCT CAST(user_id AS STRING) AS user_id
        FROM    dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE   product_id = 'czx'
          AND   (referrer LIKE 'https://c.zxxk.com/doc-detail%' OR referrer LIKE 'https://c.xkw.com/doc-detail%')
          AND   dt BETWEEN '2026-08-01' AND '2026-08-31'
          AND   (request_url LIKE 'https://c.zxxk.com/correct?documentId%' OR request_url LIKE 'https://c.xkw.com/correct?documentId%')
          AND   log_event_type = 'view'
          AND   is_spider = false
        UNION
        SELECT  DISTINCT CAST(user_id AS STRING) AS user_id
        FROM    dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE   product_id = 'czx'
          AND   log_event_type = 'click'
          AND   html_element_name = 'full_preview'
          AND   dt BETWEEN '2026-08-01' AND '2026-08-31'
        UNION
        SELECT  DISTINCT CAST(user_id AS STRING) AS user_id
        FROM    dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE   product_id = 'czx'
          AND   log_event_type = 'click'
          AND   html_element_name = 'toast_favorite_success'
          AND   dt BETWEEN '2026-08-01' AND '2026-08-31'
        UNION
        SELECT  DISTINCT CAST(user_id AS STRING) AS user_id
        FROM    dmp_cdm.dwd_pub_io_log_zxxk_czx_video_play_1
        WHERE   dt BETWEEN '2026-08-01' AND '2026-08-31'
        UNION
        SELECT  DISTINCT CAST(user_id AS STRING) AS user_id
        FROM    dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE   product_id = 'czx'
          AND   (referrer LIKE 'https://c.zxxk.com/doc-detail%' OR referrer LIKE 'https://c.xkw.com/doc-detail%')
          AND   dt BETWEEN '2026-08-01' AND '2026-08-31'
          AND   (request_url LIKE 'https://c.zxxk.com/report%' OR request_url LIKE 'https://c.xkw.com/report%')
          AND   log_event_type = 'view'
          AND   is_spider = false
        UNION
        SELECT  DISTINCT CAST(user_id AS STRING) AS user_id
        FROM    dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE   product_id = 'czx'
          AND   dt BETWEEN '2026-08-01' AND '2026-08-31'
          AND   (request_url LIKE 'https://c.zxxk.com/practice%' OR request_url LIKE 'https://c.xkw.com/practice%')
          AND   log_event_type = 'view'
          AND   is_spider = false
        UNION
        SELECT  DISTINCT CAST(user_id AS STRING) AS user_id
        FROM    dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE   dt BETWEEN '2026-08-01' AND '2026-08-31'
          AND   (request_url LIKE 'https://xb.xkw.com/photo-search%' OR request_url = 'https://xb.xkw.com/')
          AND   log_event_type = 'view'
          AND   is_spider = false
    ) AS actions
)
SELECT  vu.province, COUNT(DISTINCT vu.user_id) AS user_count
FROM    visited_users vu
JOIN    action_users au ON vu.user_id = au.user_id
GROUP BY vu.province
ORDER BY user_count DESC;

