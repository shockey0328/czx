/**
 * 用户增长看板 · 周度渠道 SQL（新用户渠道 / 活跃用户渠道）
 *
 * 占位符：
 *   ${begin} ${end}  目标周起止 YYYY-MM-DD
 *
 * device_first 回溯下界固定 2026-03-01；上界为 ${end}
 *
 * 写入：
 *   newUsers → 每周新用户的渠道来源.normalized.csv（new_user_uv）
 *   active   → 每周活跃用户的渠道来源.normalized.csv（uv）
 */

const DEVICE_LOOKBACK_BEGIN = '2026-03-01';

const KNOWN_PARTNER_IDS = `'1','2','3','101','103','105','zxxk_app',
'partnerId11','partnerId12','partnerId14','partnerId15','partnerId16','partnerId17',
'partnerId18','partnerId19','partnerId23','partnerId3001','partnerId7',
'partnerId25','partnerId26','partnerId27','partnerId28','partnerId29',
'partnerId30','partnerId3719','partnerId8','partnerId10001','partnerId32',
'partnerId22','partnerId31','partnerId20','partnerId21','partnerId34','partnerId35','partnerId36','partnerId37','partnerId40','partnerId41','partnerId42','partnerId43'`;

/** 渠道名 CASE（active: request_url/referrer/pid/psid；new: 同逻辑字段名） */
function channelCaseExpr({ url, ref, pid, psid, dUrl, dRef }) {
  return `
CASE
    WHEN ${url} LIKE '%qrFrom=teacher%' OR ${ref} LIKE '%qrFrom=teacher%' THEN '学伴'
    WHEN ${dUrl} LIKE '%qrFrom=teacher%' OR ${dRef} LIKE '%qrFrom=teacher%' THEN '学伴'
    WHEN ${pid} = 'xueban' THEN '学伴'
    WHEN ${psid} IS NULL OR ${psid} IN ('','\\N') THEN '其他渠道'
    WHEN ${psid} IN ('1','2','3','101','103','105','zxxk_app') THEN 'APP'
    WHEN ${psid} = 'partnerId11'   THEN '组卷公众号新用户关注回复'
    WHEN ${psid} = 'partnerId12'   THEN '学科网【旗下产品】'
    WHEN ${psid} = 'partnerId14'   THEN '学科网公众号底部按钮'
    WHEN ${psid} = 'partnerId15'   THEN '组卷网公众号底部按钮'
    WHEN ${psid} = 'partnerId16'   THEN '大联考服务号底部按钮'
    WHEN ${psid} = 'partnerId17'   THEN '组卷网服务号底部按钮'
    WHEN ${psid} = 'partnerId18'   THEN '组卷网服务号新用户提醒'
    WHEN ${psid} = 'partnerId19'   THEN '组卷网公众号推文(i)'
    WHEN ${psid} = 'partnerId23'   THEN '马兰花开'
    WHEN ${psid} = 'partnerId3001' THEN '电信翼智'
    WHEN ${psid} = 'partnerId7'    THEN '南平市智达信息科技有限公司'
    WHEN ${psid} = 'partnerId25'   THEN '山西和教育'
    WHEN ${psid} = 'partnerId26'   THEN '广州大学附属教育集团'
    WHEN ${psid} = 'partnerId27'   THEN '北京市教委-京小学'
    WHEN ${psid} = 'partnerId28'   THEN '岳阳楼区博雅文化用品经营部'
    WHEN ${psid} = 'partnerId29'   THEN '自媒体引流'
    WHEN ${psid} = 'partnerId30'   THEN '广东和教育'
    WHEN ${psid} = 'partnerId3719' THEN '江苏凤凰报刊出版传媒有限公司'
    WHEN ${psid} = 'partnerId8'    THEN '龙江教研在线'
    WHEN ${psid} = 'partnerId10001' THEN '通用'
    WHEN ${psid} = 'partnerId32'   THEN '芯星'
    WHEN ${psid} = 'partnerId34'   THEN '自媒体发文'
    WHEN ${psid} = 'partnerId35'   THEN '湖南书丁网络科技有限公司'
    WHEN ${psid} = 'partnerId36'   THEN '云南泽慧科技有限公司'
    WHEN ${psid} = 'partnerId37'   THEN '贵州黔程智教科技有限公司'
    WHEN ${psid} = 'partnerId40'   THEN '无忧伴学教育信息有限公司'
    WHEN ${psid} = 'partnerId41'   THEN '内蒙古智学汇森科技发展有限公司'
    WHEN ${psid} = 'partnerId42'   THEN '南京启源星河科技有限公司'
    WHEN ${psid} = 'partnerId43'   THEN '学科网服务号'
    WHEN ${psid} IN ('partnerId22','partnerId31','partnerId20','partnerId21') THEN '学科网首页'
    ELSE '其他渠道'
END`.trim();
}

const activeChannelCase = channelCaseExpr({
  url: 'request_url',
  ref: 'referrer',
  pid: 'pid',
  psid: 'psid',
  dUrl: 'd_url',
  dRef: 'd_ref'
});

const newChannelCase = channelCaseExpr({
  url: 'f.request_url',
  ref: 'f.referrer',
  pid: "COALESCE(d.d_pid, f.product_id)",
  psid: 'COALESCE(d.d_psid, f.product_source_id)',
  dUrl: 'd.d_url',
  dRef: 'd.d_ref'
});

/** @typedef {{ label: string, maxCU?: number, waitMs?: number, sql: string }} MetricSql */

/** @type {Record<string, MetricSql>} */
export const WEEKLY_CHANNEL_SQL = {
  active: {
    label: '活跃用户渠道',
    maxCU: 120,
    waitMs: 600000,
    sql: `
WITH weekly_first AS (
    SELECT * FROM (
        SELECT user_id, product_id, product_source_id, device_id,
               request_url, referrer,
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY dt, xyio_backend_time) AS rn
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id IN ('czx','xueban')
          AND application_id = 'mzhan'
          AND is_spider = false
          AND dt >= '\${begin}' AND dt <= '\${end}'
    ) t
    WHERE rn = 1
),
device_first AS (
    SELECT * FROM (
        SELECT f.user_id,
               log.product_id AS d_pid, log.product_source_id AS d_psid,
               log.request_url AS d_url, log.referrer AS d_ref,
               ROW_NUMBER() OVER (PARTITION BY f.user_id ORDER BY log.xyio_backend_time) AS drn
        FROM weekly_first f
        JOIN dmp_cdm.dwd_pub_io_log_xyiolog_di log
          ON f.device_id = log.device_id
        WHERE f.product_id != 'xueban'
          AND NOT (f.request_url LIKE '%qrFrom=teacher%' OR f.referrer LIKE '%qrFrom=teacher%')
          AND (f.product_source_id IS NULL OR f.product_source_id IN ('','\\N')
               OR f.product_source_id NOT IN (${KNOWN_PARTNER_IDS}))
          AND f.device_id IS NOT NULL AND f.device_id != '' AND f.device_id != '\\N'
          AND log.product_id IN ('czx','xueban')
          AND log.application_id = 'mzhan'
          AND log.is_spider = false
          AND log.dt >= '${DEVICE_LOOKBACK_BEGIN}' AND log.dt <= '\${end}'
          AND log.product_source_id IS NOT NULL
          AND log.product_source_id NOT IN ('','\\N')
    ) t
    WHERE drn = 1
),
merged AS (
    SELECT f.user_id,
           f.request_url, f.referrer,
           COALESCE(d.d_pid, f.product_id) AS pid,
           COALESCE(d.d_psid, f.product_source_id) AS psid,
           d.d_url, d.d_ref
    FROM weekly_first f
    LEFT JOIN device_first d ON f.user_id = d.user_id
)
SELECT
    ${activeChannelCase} AS channel_name,
    COUNT(DISTINCT user_id) AS uv
FROM merged
GROUP BY ${activeChannelCase}
ORDER BY uv DESC
`.trim()
  },

  newUsers: {
    label: '新用户渠道',
    maxCU: 150,
    waitMs: 600000,
    sql: `
WITH new_users AS (
    SELECT user_id, MIN(dt) AS first_date
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE product_id IN ('czx','xueban')
      AND application_id = 'mzhan'
      AND is_spider = false
      AND dt >= '2023-01-01' AND dt <= '\${end}'
    GROUP BY user_id
    HAVING MIN(dt) >= '\${begin}' AND MIN(dt) <= '\${end}'
),
first_rec AS (
    SELECT * FROM (
        SELECT u.user_id, log.product_id, log.product_source_id, log.device_id,
               log.request_url, log.referrer,
               ROW_NUMBER() OVER (PARTITION BY u.user_id ORDER BY log.xyio_backend_time) AS rn
        FROM new_users u
        JOIN dmp_cdm.dwd_pub_io_log_xyiolog_di log
          ON u.user_id = log.user_id AND u.first_date = log.dt
        WHERE log.product_id IN ('czx','xueban')
          AND log.application_id = 'mzhan'
          AND log.is_spider = false
          AND log.dt >= '\${begin}' AND log.dt <= '\${end}'
    ) t
    WHERE rn = 1
),
device_first AS (
    SELECT * FROM (
        SELECT f.user_id, log.product_id AS d_pid, log.product_source_id AS d_psid,
               log.request_url AS d_url, log.referrer AS d_ref,
               ROW_NUMBER() OVER (PARTITION BY f.user_id ORDER BY log.xyio_backend_time) AS drn
        FROM first_rec f
        JOIN dmp_cdm.dwd_pub_io_log_xyiolog_di log
          ON f.device_id = log.device_id
        WHERE f.product_id != 'xueban'
          AND NOT (f.request_url LIKE '%qrFrom=teacher%' OR f.referrer LIKE '%qrFrom=teacher%')
          AND (f.product_source_id IS NULL OR f.product_source_id IN ('','\\N')
               OR f.product_source_id NOT IN (${KNOWN_PARTNER_IDS}))
          AND f.device_id IS NOT NULL AND f.device_id != '' AND f.device_id != '\\N'
          AND log.product_id IN ('czx','xueban')
          AND log.application_id = 'mzhan'
          AND log.is_spider = false
          AND log.dt >= '${DEVICE_LOOKBACK_BEGIN}' AND log.dt <= '\${end}'
          AND log.product_source_id IS NOT NULL
          AND log.product_source_id NOT IN ('','\\N')
    ) t
    WHERE drn = 1
),
user_channel AS (
    SELECT f.user_id,
           ${newChannelCase} AS channel_name
    FROM first_rec f
    LEFT JOIN device_first d ON f.user_id = d.user_id
)
SELECT
    channel_name,
    COUNT(DISTINCT user_id) AS new_user_uv
FROM user_channel
GROUP BY channel_name
ORDER BY new_user_uv DESC
`.trim()
  }
};

export const CHANNEL_SQL_META = {
  deviceLookbackBegin: DEVICE_LOOKBACK_BEGIN
};
