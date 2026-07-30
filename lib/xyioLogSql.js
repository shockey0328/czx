/**
 * 橙子学 / 学伴 xyio 全埋点查询 SQL（对齐看板字段）
 * 表：dmp_cdm.dwd_pub_io_log_xyiolog_di
 * 分区：dt / product_id / application_id
 */

export const XYIO_PRODUCT_IDS = ['czx', 'xueban'];
export const XYIO_APPLICATION_ID = 'mzhan';

const FIELD_SELECT = `
    xyio_client_time,
    user_id::text AS user_id,
    device_id,
    request_url AS url,
    product_id,
    referrer,
    product_source_id AS source,
    os,
    device_manufacturer,
    device_model,
    platform,
    html_element_class_name AS element_class_name,
    html_element_content AS element_content,
    html_element_id AS element_id,
    html_element_name AS element_name,
    log_event_type,
    xyio_backend_time,
    lib_version,
    dt
`.trim();

/** 仅允许数字型用户 ID，防止 SQL 注入 */
export function sanitizeUserIds(userIds) {
  const list = (Array.isArray(userIds) ? userIds : [userIds])
    .map((id) => String(id).trim())
    .filter((id) => /^\d+$/.test(id));
  if (list.length === 0) {
    throw new Error('用户ID无效：仅支持数字 ID');
  }
  return list;
}

function assertDate(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    throw new Error(`日期格式无效: ${d}，期望 YYYY-MM-DD`);
  }
  return d;
}

/**
 * Hologres：一次返回 JSON 数组，避免 CSV 多行字段解析问题
 */
export function buildXyioLogJsonSql(userIds, startDate, endDate, options = {}) {
  const ids = sanitizeUserIds(userIds);
  const start = assertDate(startDate);
  const end = assertDate(endDate);
  const productIds = options.productIds || XYIO_PRODUCT_IDS;
  const applicationId = options.applicationId || XYIO_APPLICATION_ID;
  const limit = Math.min(Math.max(Number(options.limit) || 20000, 1), 50000);
  const productList = productIds.map((p) => `'${String(p).replace(/'/g, "''")}'`).join(', ');
  const userList = ids.join(', ');

  return `
SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)::text AS rows_json
FROM (
  SELECT
    ${FIELD_SELECT}
  FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
  WHERE dt >= '${start}'
    AND dt <= '${end}'
    AND product_id IN (${productList})
    AND application_id = '${String(applicationId).replace(/'/g, "''")}'
    AND user_id IN (${userList})
  ORDER BY xyio_client_time
  LIMIT ${limit}
) t
`.trim();
}

/**
 * MaxCompute：扁平 SELECT（字段类型用 CAST）
 */
export function buildXyioLogOdpsSql(userIds, startDate, endDate, options = {}) {
  const ids = sanitizeUserIds(userIds);
  const start = assertDate(startDate);
  const end = assertDate(endDate);
  const productIds = options.productIds || XYIO_PRODUCT_IDS;
  const applicationId = options.applicationId || XYIO_APPLICATION_ID;
  const limit = Math.min(Math.max(Number(options.limit) || 20000, 1), 50000);
  const productList = productIds.map((p) => `'${String(p).replace(/'/g, "''")}'`).join(', ');
  const userList = ids.join(', ');

  return `
SELECT
    xyio_client_time,
    CAST(user_id AS STRING) AS user_id,
    device_id,
    request_url AS url,
    product_id,
    referrer,
    product_source_id AS source,
    os,
    device_manufacturer,
    device_model,
    platform,
    html_element_class_name AS element_class_name,
    html_element_content AS element_content,
    html_element_id AS element_id,
    html_element_name AS element_name,
    log_event_type,
    xyio_backend_time,
    lib_version,
    dt
FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
WHERE dt >= '${start}'
  AND dt <= '${end}'
  AND product_id IN (${productList})
  AND application_id = '${String(applicationId).replace(/'/g, "''")}'
  AND user_id IN (${userList})
ORDER BY xyio_client_time
LIMIT ${limit}
`.trim();
}

export function normalizeLogRow(row) {
  const nullish = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (s === 'None' || s === 'null' || s === 'undefined') return '';
    return s;
  };
  return {
    xyio_client_time: nullish(row.xyio_client_time),
    user_id: nullish(row.user_id),
    device_id: nullish(row.device_id),
    url: nullish(row.url ?? row.request_url),
    product_id: nullish(row.product_id),
    referrer: nullish(row.referrer),
    source: nullish(row.source ?? row.product_source_id),
    os: nullish(row.os),
    device_manufacturer: nullish(row.device_manufacturer),
    device_model: nullish(row.device_model),
    platform: nullish(row.platform),
    element_class_name: nullish(row.element_class_name ?? row.html_element_class_name),
    element_content: nullish(row.element_content ?? row.html_element_content),
    element_id: nullish(row.element_id ?? row.html_element_id),
    element_name: nullish(row.element_name ?? row.html_element_name),
    log_event_type: nullish(row.log_event_type),
    xyio_backend_time: nullish(row.xyio_backend_time),
    lib_version: nullish(row.lib_version),
    dt: nullish(row.dt)
  };
}
