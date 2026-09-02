/**
 * 从数仓拉取「上一自然月」分省核心指标，写入 趋势分析/YY年M月.xlsx
 *
 * 省份解析策略（依据 Hologres / MaxCompute 能力对照）：
 *  - 默认 hybrid（口径=访问IP省份，与历史一致）：
 *      MaxCompute 用已安装的 ip_parse UDF 建中间表 dmp_cdm.dws_zxxk_log_ip_province_di，
 *      再由 Hologres 关联该表出数。对应能力表「自定义函数暂不支持，需在 MaxCompute 先建中间表，再使用 Hologres」。
 *  - --via-user-attr（纯 Hologres，口径=用户归属省份，与历史月份不完全可比）：
 *      改用 dmp_cdm.dim_ump_uc_user_ips 按 user_id→province 归属省份，并对省份全称做归一化以对齐 34 省清单。
 *      该路径不依赖 MaxCompute，MaxCompute MCP 挂掉时可用。
 *
 * 用法（在「分省数据看板（月度）」目录）：
 *   node scripts/update_province_metrics_from_odps.mjs
 *   node scripts/update_province_metrics_from_odps.mjs 2026-07
 *   node scripts/update_province_metrics_from_odps.mjs --dry-run
 *   node scripts/update_province_metrics_from_odps.mjs --via-user-attr
 *
 * 依赖：MCP_KEY；本地 xlsx（本看板 npm install）
 * 26年7月起走 SQL；历史 xlsx 不改。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { loadEnv } from '../../lib/loadEnv.js';
import { createWarehouseClient } from '../../lib/warehouseClient.js';
import { McpHttpClient, sleep } from '../../lib/mcpHttpClient.js';

loadEnv();
{
  const localEnv = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
  if (fs.existsSync(localEnv)) {
    for (const rawLine of fs.readFileSync(localEnv, 'utf8').split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARD_DIR = path.resolve(__dirname, '..');
const TREND_DIR = path.join(BOARD_DIR, '趋势分析');
const CACHE_DIR = path.join(BOARD_DIR, 'config', '.odps-cache');
const PAYER_CFG = path.join(BOARD_DIR, 'config', 'excluded_payer_ids.txt');
const SQL_CUTOFF = { year: 2026, month: 7 };
const IP_DIM_TABLE = 'dmp_cdm.dws_zxxk_log_ip_province_di';
const USER_DIM_TABLE = 'dmp_cdm.dim_ump_uc_user_ips';

const require = createRequire(import.meta.url);
const XLSX = require(path.join(BOARD_DIR, 'node_modules', 'xlsx'));

/** 与 26年6月.xlsx 一致的 34 省名称与顺序 */
const PROVINCES_34 = [
  '北京', '天津', '河北省', '山西省', '内蒙古', '辽宁省', '吉林省', '黑龙江省',
  '上海', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省',
  '湖北省', '湖南省', '广东省', '广西', '海南省', '重庆', '四川省', '贵州省',
  '云南省', '西藏', '陕西省', '甘肃省', '青海省', '宁夏', '新疆', '香港', '澳门', '台湾省'
];
const PROVINCE_SET = new Set(PROVINCES_34);

/**
 * 把 dim_ump_uc_user_ips 的省份全称归一化到 34 省清单的简称，
 * 过滤内网/未知等脏值。仅 --via-user-attr 路径使用。
 */
function normalizeProvinceName(raw) {
  const p = String(raw || '').trim();
  if (!p) return null;
  if (PROVINCE_SET.has(p)) return p;
  const alias = {
    '宁夏回族自治区': '宁夏',
    '广西壮族自治区': '广西',
    '新疆维吾尔自治区': '新疆',
    '内蒙古自治区': '内蒙古',
    '西藏自治区': '西藏',
    '北京市': '北京',
    '天津市': '天津',
    '上海市': '上海',
    '重庆市': '重庆',
    '香港特别行政区': '香港',
    '澳门特别行政区': '澳门'
  };
  if (alias[p]) return alias[p];
  // 兜底：去掉常见后缀再试（如「黑龙江省」已在集合中，不会被走到这里）
  const stripped = p
    .replace(/回族自治区$/, '')
    .replace(/维吾尔自治区$/, '')
    .replace(/自治区$/, '')
    .replace(/特别行政区$/, '')
    .replace(/省$/, '')
    .replace(/市$/, '');
  if (PROVINCE_SET.has(stripped)) return stripped;
  return null;
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    refresh: argv.includes('--refresh'),
    viaUserAttr: argv.includes('--via-user-attr'),
    ym: argv.find((a) => /^\d{4}-\d{1,2}$/.test(a))
  };
}

function cachePath(label, metric) {
  return path.join(CACHE_DIR, `${label}-${metric}.json`);
}

function readCache(label, metric) {
  const p = cachePath(label, metric);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function writeCache(label, metric, rows) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cachePath(label, metric), JSON.stringify(rows), 'utf8');
}

function prevCalendarMonth(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  if (m === 1) return { year: y - 1, month: 12 };
  return { year: y, month: m - 1 };
}

function parseYearMonth(ym) {
  const [ys, ms] = ym.split('-');
  return { year: Number(ys), month: Number(ms) };
}

function monthRange(year, month) {
  const begin = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { begin, end };
}

function fileMonthLabel(year, month) {
  return `${year % 100}年${month}月`;
}

function loadExcludedPayers() {
  if (!fs.existsSync(PAYER_CFG)) throw new Error(`未找到排除名单: ${PAYER_CFG}`);
  const ids = fs
    .readFileSync(PAYER_CFG, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  const uniq = [...new Set(ids)];
  if (!uniq.length) throw new Error('排除名单为空');
  return uniq.map((id) => `'${id.replace(/'/g, "''")}'`).join(',');
}

function parseOdpsPayload(text) {
  const raw = (text || '').trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const a = raw.indexOf('{');
    const b = raw.lastIndexOf('}');
    if (a >= 0 && b > a) return JSON.parse(raw.slice(a, b + 1));
    throw new Error(`无法解析 ODPS 返回: ${raw.slice(0, 200)}`);
  }
}

function parseCsvText(csvText) {
  const text = String(csvText || '').replace(/^\uFEFF/, '');
  if (!text.trim()) return [];
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else field += ch;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (ch === '\n' || (ch === '\r' && next === '\n')) {
      if (ch === '\r') i++;
      row.push(field);
      field = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
      continue;
    }
    if (ch === '\r') {
      row.push(field);
      field = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
      continue;
    }
    field += ch;
  }
  row.push(field);
  if (row.some((c) => c !== '')) rows.push(row);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => String(h).trim());
  return rows.slice(1).map((cols) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? '';
    });
    return obj;
  });
}

function extractRows(body) {
  if (!body) return [];
  if (Array.isArray(body.data)) return body.data;
  const csv = body.results?.AnonymousSQLTask;
  if (typeof csv === 'string') return parseCsvText(csv);
  return [];
}

async function callToolWithRetry(client, name, args, retries = 4) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await client.callTool(name, args);
    } catch (err) {
      lastErr = err;
      const msg = String(err.message || err);
      if (!/HTTP 502|HTTP 503|HTTP 504|ECONNRESET|ETIMEDOUT|fetch failed/i.test(msg)) {
        throw err;
      }
      const wait = 5000 * (i + 1);
      console.log(`\n    [重试 ${i + 1}/${retries}] ${msg.slice(0, 80)}，${wait / 1000}s 后重试...`);
      await sleep(wait);
      try {
        await client.close();
      } catch {
        /* ignore */
      }
      client.sessionId = null;
      await client.initialize();
    }
  }
  throw lastErr;
}

async function runMaxComputeSql(client, sql, { maxCU, label, waitMs } = {}) {
  const cu = maxCU || Number(process.env.ODPS_MAX_CU || 250);
  const maxWait = waitMs || Number(process.env.ODPS_WAIT_MS || 1200000);
  process.stdout.write(`  [MaxCompute][${label}] 提交 (maxCU=${cu}) ... `);
  const submit = await callToolWithRetry(client, 'execute_sql', {
    project: 'dmp_analyst',
    sql,
    async: true,
    maxCU: cu
  });
  const submitBody = parseOdpsPayload(submit.text);
  if (submitBody?.overLimit) {
    throw new Error(
      `CU 超限 estimated=${submitBody.estimatedCU}，请提高 ODPS_MAX_CU（建议 ${submitBody.suggestedMaxCU || cu * 2}）`
    );
  }
  const instanceId = submitBody?.instanceId;
  if (!instanceId) {
    const sync = extractRows(submitBody);
    if (sync.length) {
      console.log('同步完成');
      return sync;
    }
    console.log('无结果（建表类语句正常）');
    return [];
  }

  const t0 = Date.now();
  while (Date.now() - t0 < maxWait) {
    let st;
    try {
      st = parseOdpsPayload(
        (await callToolWithRetry(client, 'get_instance_status', {
          project: 'dmp_analyst',
          instanceId
        })).text
      );
    } catch (err) {
      console.log(`\n    [状态查询失败] ${String(err.message || err).slice(0, 80)}，继续等待...`);
      await sleep(8000);
      continue;
    }
    if (!st?.isTerminated) {
      await sleep(8000);
      continue;
    }
    if (st.isSuccessful === false) {
      throw new Error(`ODPS 失败: ${JSON.stringify(st).slice(0, 300)}`);
    }
    const dataBody = parseOdpsPayload(
      (await callToolWithRetry(client, 'get_instance', {
        project: 'dmp_analyst',
        instanceId
      })).text
    );
    const rows = extractRows(dataBody);
    console.log(`完成 (${Math.round((Date.now() - t0) / 1000)}s, ${rows.length} 行)`);
    return rows;
  }
  throw new Error(`[${label}] 超时 instanceId=${instanceId}`);
}

async function fetchMetric(client, monthLabel, metricKey, cfg, { refresh }) {
  if (!refresh) {
    const cached = readCache(monthLabel, metricKey);
    if (cached?.length) {
      console.log(`  [${cfg.label}] 使用缓存 ${cached.length} 行`);
      return cached;
    }
  }
  const rows = await client.runSql(cfg.sql, cfg);
  writeCache(monthLabel, metricKey, rows);
  return rows;
}

function toProvinceMap(rows, valueKeys, { normalize } = {}) {
  const map = new Map();
  for (const r of rows) {
    let prov = String(r.province ?? '').trim();
    if (normalize) {
      prov = normalizeProvinceName(prov);
      if (!prov) continue;
    } else if (!PROVINCE_SET.has(prov)) {
      continue;
    }
    if (map.has(prov)) {
      const existing = map.get(prov);
      for (const outKey of Object.keys(valueKeys)) existing[outKey] += Number(r[valueKeys[outKey]] ?? 0) || 0;
    } else {
      const values = {};
      for (const [outKey, srcKey] of Object.entries(valueKeys)) {
        values[outKey] = Number(r[srcKey] ?? 0) || 0;
      }
      map.set(prov, values);
    }
  }
  return map;
}

/**
 * 生成省份关联子句。
 * - strategy='user'：按 user_id 关联归属省份维表
 * - strategy='ip'：按 IP 关联 MaxCompute 预建的 IP→省份中间表（需先 buildIpProvinceDim）
 * @param {'user'|'ip'} strategy
 * @param {string} alias 主表别名
 * @param {string} ipCol IP 列名（strategy='ip' 时用于关联）
 * @param {string} userCol 用户列名（strategy='user' 时用于关联）
 * @param {string} ym 月份分区 YYYY-MM（strategy='ip' 用）
 */
function provinceJoin(strategy, alias, { ipCol, userCol, ym }) {
  if (strategy === 'user') {
    return {
      expr: 'p.province',
      join: `JOIN (SELECT user_id, MAX(province) AS province FROM ${USER_DIM_TABLE} GROUP BY user_id) p ` +
        `ON CAST(${alias}.${userCol} AS TEXT) = CAST(p.user_id AS TEXT)`
    };
  }
  return {
    expr: 'ipd.province',
    join: `JOIN ${IP_DIM_TABLE} ipd ON ${alias}.${ipCol} = ipd.ip AND ipd.dt = '${ym}-01'`
  };
}

function buildSqls({ begin, end, payerInList, ym, strategy }) {
  // ── 活跃用户 ──
  const a = provinceJoin(strategy, 'l', { ipCol: 'req_header_x_forwarded_for', userCol: 'user_id', ym });
  const active = `
SELECT ${a.expr} AS province,
       COUNT(1) AS pv,
       COUNT(DISTINCT l.user_id) AS uv
FROM dmp_cdm.dwd_pub_io_log_xyiolog_di l
${a.join}
WHERE l.product_id IN ('czx', 'xueban')
  AND l.is_spider = false
  AND l.dt >= '${begin}' AND l.dt <= '${end}'
GROUP BY ${a.expr}
ORDER BY uv DESC`.trim();

  // ── 新用户（首访口径）──
  const nIp = strategy === 'ip' ? ', l.req_header_x_forwarded_for AS ip' : '';
  const nIpSel = strategy === 'ip' ? ', ul.ip' : '';
  const nf = provinceJoin(strategy, 'uf', { ipCol: 'ip', userCol: 'user_id', ym });
  const newUsers = `
WITH user_logs AS (
    SELECT  l.user_id, l.dt${nIp}
    FROM    dmp_cdm.dwd_pub_io_log_xyiolog_di l
    WHERE   (l.request_url LIKE 'https://c.xkw.com%'
             OR l.request_url LIKE 'https://c.zxxk.com%')
            AND l.application_id = 'mzhan'
            AND l.is_spider = false
),
user_first AS (
    SELECT  ul.user_id, ul.dt AS first_date${nIpSel}
    FROM    (SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY dt ASC) AS rn FROM user_logs) ul
    WHERE   ul.rn = 1
)
SELECT  ${nf.expr} AS province, COUNT(DISTINCT uf.user_id) AS new_user_uv
FROM    user_first uf
${nf.join}
WHERE   uf.first_date >= '${begin}' AND uf.first_date <= '${end}'
GROUP BY ${nf.expr}
ORDER BY new_user_uv DESC`.trim();

  // ── 营收 ──
  const r = provinceJoin(strategy, 'c', { ipCol: 'client_ip', userCol: 'payer_id', ym });
  const revenue = `
SELECT  ${r.expr} AS province,
        COUNT(DISTINCT c.payer_id) AS paid_uv,
        SUM(c.paid_amount * 0.01) AS total_amount
FROM    dmp_cdm.dwd_ump_pay_trd_charges_di c
${r.join}
WHERE   c.dt >= '${begin}' AND c.dt <= '${end}'
        AND c.app_id = 'app_xkwczx'
        AND c.paid_status = '1'
        AND c.refunded = '0'
        AND c.payer_id NOT IN (${payerInList})
GROUP BY ${r.expr}
ORDER BY paid_uv DESC`.trim();

  // ── 使用用户（visited JOIN action）──
  const v = provinceJoin(strategy, 'l', { ipCol: 'req_header_x_forwarded_for', userCol: 'user_id', ym });
  const usage = `
WITH visited_users AS (
    SELECT DISTINCT CAST(l.user_id AS TEXT) AS user_id, ${v.expr} AS province
    FROM dmp_cdm.dwd_pub_io_log_xyiolog_di l
    ${v.join}
    WHERE l.product_id IN ('czx', 'xueban')
      AND l.is_spider = false
      AND l.dt BETWEEN '${begin}' AND '${end}'
),
action_users AS (
    SELECT DISTINCT CAST(user_id AS TEXT) AS user_id
    FROM (
        SELECT DISTINCT CAST(user_id AS TEXT) AS user_id
        FROM dmp_cdm.dwd_zxxk_zxxk_log_student_download_df
        WHERE substr(download_time, 1, 10) BETWEEN '${begin}' AND '${end}'
        UNION
        SELECT DISTINCT CAST(user_id AS TEXT) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id = 'czx'
          AND (referrer LIKE 'https://c.zxxk.com/doc-detail%' OR referrer LIKE 'https://c.xkw.com/doc-detail%')
          AND dt BETWEEN '${begin}' AND '${end}'
          AND (request_url LIKE 'https://c.zxxk.com/correct?documentId%' OR request_url LIKE 'https://c.xkw.com/correct?documentId%')
          AND log_event_type = 'view'
          AND is_spider = false
        UNION
        SELECT DISTINCT CAST(user_id AS TEXT) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id = 'czx'
          AND log_event_type = 'click'
          AND html_element_name = 'full_preview'
          AND dt BETWEEN '${begin}' AND '${end}'
        UNION
        SELECT DISTINCT CAST(user_id AS TEXT) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id = 'czx'
          AND log_event_type = 'click'
          AND html_element_name = 'toast_favorite_success'
          AND dt BETWEEN '${begin}' AND '${end}'
        UNION
        SELECT DISTINCT CAST(user_id AS TEXT) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_video_play_1
        WHERE dt BETWEEN '${begin}' AND '${end}'
        UNION
        SELECT DISTINCT CAST(user_id AS TEXT) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id = 'czx'
          AND (referrer LIKE 'https://c.zxxk.com/doc-detail%' OR referrer LIKE 'https://c.xkw.com/doc-detail%')
          AND dt BETWEEN '${begin}' AND '${end}'
          AND (request_url LIKE 'https://c.zxxk.com/report%' OR request_url LIKE 'https://c.xkw.com/report%')
          AND log_event_type = 'view'
          AND is_spider = false
        UNION
        SELECT DISTINCT CAST(user_id AS TEXT) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE product_id = 'czx'
          AND dt BETWEEN '${begin}' AND '${end}'
          AND (request_url LIKE 'https://c.zxxk.com/practice%' OR request_url LIKE 'https://c.xkw.com/practice%')
          AND log_event_type = 'view'
          AND is_spider = false
        UNION
        SELECT DISTINCT CAST(user_id AS TEXT) AS user_id
        FROM dmp_cdm.dwd_pub_io_log_xyiolog_di
        WHERE dt BETWEEN '${begin}' AND '${end}'
          AND (request_url LIKE 'https://xb.xkw.com/photo-search%' OR request_url = 'https://xb.xkw.com/')
          AND log_event_type = 'view'
          AND is_spider = false
    ) AS actions
)
SELECT vu.province, COUNT(DISTINCT vu.user_id) AS user_count
FROM visited_users vu
JOIN action_users au ON vu.user_id = au.user_id
GROUP BY vu.province
ORDER BY user_count DESC`.trim();

  return {
    active: { label: '活跃用户', sql: active },
    newUsers: { label: '新用户', sql: newUsers },
    revenue: { label: '营收', sql: revenue },
    usage: { label: '使用用户', sql: usage }
  };
}

/**
 * 在 MaxCompute 建 IP→省份中间表（依赖已安装的 ip_parse UDF）。
 * 仅 strategy='ip'（默认 hybrid）路径需要。
 */
async function buildIpProvinceDim(maxClient, { begin, end, ym }) {
  const ddl = `
CREATE TABLE IF NOT EXISTS ${IP_DIM_TABLE} (
  ip STRING COMMENT '客户端IP',
  province STRING COMMENT '省份（ip_parse 解析）'
) PARTITIONED BY (dt STRING COMMENT '月份分区 YYYY-MM')
LIFECYCLE 540;
`.trim();
  await runMaxComputeSql(maxClient, ddl, { label: '建IP省份中间表(DDL)', maxCU: 50, waitMs: 300000 });

  const insert = `
INSERT OVERWRITE TABLE ${IP_DIM_TABLE} PARTITION (dt='${ym}')
SELECT  ip, dmp_cdm.ip_parse(ip, 'province') AS province
FROM (
    SELECT  req_header_x_forwarded_for AS ip
    FROM    dmp_cdm.dwd_pub_io_log_xyiolog_di
    WHERE   dt BETWEEN '${begin}' AND '${end}'
            AND req_header_x_forwarded_for IS NOT NULL AND req_header_x_forwarded_for <> ''
    UNION ALL
    SELECT  client_ip AS ip
    FROM    dmp_cdm.dwd_ump_pay_trd_charges_di
    WHERE   dt BETWEEN '${begin}' AND '${end}'
            AND client_ip IS NOT NULL AND client_ip <> ''
) t
WHERE ip IS NOT NULL AND ip <> ''
GROUP BY ip;
`.trim();
  await runMaxComputeSql(maxClient, insert, { label: '建IP省份中间表(数据)', maxCU: 250, waitMs: 1200000 });
}

function assembleRows(activeMap, newMap, revMap, usageMap) {
  return PROVINCES_34.map((name) => {
    const active = Math.round(activeMap.get(name)?.uv || 0);
    const newUsers = Math.round(newMap.get(name)?.new_user_uv || 0);
    const revenue = Math.round(revMap.get(name)?.total_amount || 0);
    const usage = Math.round(usageMap.get(name)?.user_count || 0);
    const arpu = active > 0 ? revenue / active : 0;
    const rate = active > 0 ? usage / active : 0;
    return {
      名称: name,
      活跃用户: active,
      新用户: newUsers,
      营收: revenue,
      使用用户: usage,
      ARPU: arpu,
      使用率: rate
    };
  });
}

function writeMonthXlsx(outPath, rows) {
  const aoa = [
    ['名称', '活跃用户', '新用户', '营收', '使用用户', 'ARPU', '使用率'],
    ...rows.map((r) => [
      r.名称,
      r.活跃用户,
      r.新用户,
      r.营收,
      r.使用用户,
      r.ARPU,
      r.使用率
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, outPath);
}

async function main() {
  const { dryRun, refresh, viaUserAttr, ym } = parseArgs(process.argv.slice(2));
  const strategy = viaUserAttr ? 'user' : 'ip';
  const target = ym ? parseYearMonth(ym) : prevCalendarMonth();
  const { year, month } = target;

  if (year < SQL_CUTOFF.year || (year === SQL_CUTOFF.year && month < SQL_CUTOFF.month)) {
    console.error(
      `目标 ${year}-${month} 早于 SQL 起点 ${SQL_CUTOFF.year}-${SQL_CUTOFF.month}，历史请勿用本脚本覆盖。`
    );
    process.exit(1);
  }

  const { begin, end } = monthRange(year, month);
  const ymKey = `${year}-${String(month).padStart(2, '0')}`;
  const label = fileMonthLabel(year, month);
  const outPath = path.join(TREND_DIR, `${label}.xlsx`);

  console.log('========================================');
  console.log(`  分省数据 · 省份解析策略=${strategy === 'ip' ? 'hybrid(MaxCompute建表+Hologres出数)' : 'user-attr(纯Hologres)'}`);
  console.log(`  目标月份: ${label}（${begin} ~ ${end}）`);
  console.log(`  输出: ${outPath}`);
  if (dryRun) console.log('  模式: dry-run（不写文件）');
  if (refresh) console.log('  模式: --refresh（忽略缓存）');
  console.log('========================================\n');

  if (!process.env.MCP_KEY && !process.env.X_MCP_KEY) {
    console.error('请先配置 MCP_KEY（与 Cursor mcp.json 的 X-MCP-Key 一致）');
    process.exit(1);
  }
  if (!fs.existsSync(path.join(BOARD_DIR, 'node_modules', 'xlsx'))) {
    console.error('未找到 xlsx，请在「分省数据看板（月度）」目录执行: npm install');
    process.exit(1);
  }

  const payerInList = loadExcludedPayers();
  const sqls = buildSqls({ begin, end, payerInList, ym: ymKey, strategy });

  // Hologres 客户端（指标出数统一走 Hologres）
  const hgClient = await createWarehouseClient();
  let maxClient = null;
  try {
    if (strategy === 'ip') {
      // 建 IP→省份中间表需要 MaxCompute（ip_parse 自定义函数仅 MaxCompute 有）
      maxClient = new McpHttpClient({
        url: process.env.MAXCOMPUTE_MCP_URL || 'https://test-dmp-mcp.xkw.com/maxcompute-mcp',
        apiKey: process.env.MCP_KEY || process.env.X_MCP_KEY
      });
      await maxClient.initialize();
      console.log('  >> 构建 IP→省份中间表（MaxCompute）...');
      await buildIpProvinceDim(maxClient, { begin, end, ym: ymKey });
    }

    const activeRows = await fetchMetric(hgClient, label, 'active', sqls.active, { refresh });
    const activeMap = toProvinceMap(activeRows, { uv: 'uv' }, { normalize: strategy === 'user' });

    const newRows = await fetchMetric(hgClient, label, 'newUsers', sqls.newUsers, { refresh });
    const newMap = toProvinceMap(newRows, { new_user_uv: 'new_user_uv' }, { normalize: strategy === 'user' });

    const revRows = await fetchMetric(hgClient, label, 'revenue', sqls.revenue, { refresh });
    const revMap = toProvinceMap(revRows, { total_amount: 'total_amount' }, { normalize: strategy === 'user' });

    const usageRows = await fetchMetric(hgClient, label, 'usage', sqls.usage, { refresh });
    const usageMap = toProvinceMap(usageRows, { user_count: 'user_count' }, { normalize: strategy === 'user' });

    const rows = assembleRows(activeMap, newMap, revMap, usageMap);
    const matched = {
      active: activeMap.size,
      newUsers: newMap.size,
      revenue: revMap.size,
      usage: usageMap.size
    };
    console.log('\n>> 命中 34 省数量:', matched);
    console.log('>> 样例前 3 行:');
    rows.slice(0, 3).forEach((r) => {
      console.log(
        `   ${r.名称}: 活跃=${r.活跃用户} 新用户=${r.新用户} 营收=${r.营收} 使用=${r.使用用户} ARPU=${r.ARPU.toFixed(2)} 使用率=${r.使用率.toFixed(4)}`
      );
    });

    if (dryRun) {
      console.log('\n[dry-run] 未写入 xlsx');
      return;
    }

    fs.mkdirSync(TREND_DIR, { recursive: true });
    writeMonthXlsx(outPath, rows);
    console.log(`\n>> 已写入: ${outPath}`);
    console.log('完成。请继续运行 build_trend_data.js 生成 trend-data.js。');
  } finally {
    await hgClient.close();
    if (maxClient) await maxClient.close();
  }
}

main().catch((err) => {
  console.error('\n[失败]', err.message || err);
  process.exit(1);
});
