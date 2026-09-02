-- ============================================================
-- 分省数据看板 · 补历史「新用户」分省数据（首访口径）
-- 目标月份: 2025-01 ~ 2026-02（覆盖历史 Excel 缺「新用户」列的所有月份）
-- 数据源: dmp_cdm（MaxCompute），依赖 UDF dmp_cdm.ip_parse(ip,'province')
-- 用法: 在 MaxCompute 客户端一次性执行本文件，返回 dt_month / province / new_user_uv
-- 说明: 与现有各月口径完全一致 —— 取用户首次访问记录，按首访所在月归属，
--       省份用首访时的访问 IP 解析。返回月份可直接回填 趋势分析/YY年M月.xlsx。
-- ============================================================

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
SELECT  substr(uf.first_date, 1, 7)                     AS dt_month,
        dmp_cdm.ip_parse(uf.ip, 'province')             AS province,
        COUNT(DISTINCT uf.user_id)                      AS new_user_uv
FROM    user_first uf
WHERE   uf.first_date >= '2025-01-01'
  AND   uf.first_date <= '2026-02-28'
GROUP BY substr(uf.first_date, 1, 7), dmp_cdm.ip_parse(uf.ip, 'province')
ORDER BY dt_month ASC, new_user_uv DESC;
