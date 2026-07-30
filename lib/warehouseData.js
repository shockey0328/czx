/**
 * 通过学科网数仓 MCP（优先 Hologres）拉取用户行为日志
 * 环境变量：
 *   DATA_SOURCE=warehouse
 *   MCP_KEY=...                 # 与 Cursor mcp.json 中 X-MCP-Key 一致
 *   HOLOGRES_MCP_URL=https://test-dmp-mcp.xkw.com/hologres-mcp
 *   MAXCOMPUTE_MCP_URL=https://test-dmp-mcp.xkw.com/maxcompute-mcp  # 可选回退
 */

import { McpHttpClient, sleep } from './mcpHttpClient.js';
import {
  buildXyioLogJsonSql,
  buildXyioLogOdpsSql,
  normalizeLogRow
} from './xyioLogSql.js';

function getMcpKey() {
  return process.env.MCP_KEY || process.env.X_MCP_KEY || '';
}

function getHologresUrl() {
  return (
    process.env.HOLOGRES_MCP_URL ||
    'https://test-dmp-mcp.xkw.com/hologres-mcp'
  );
}

function getMaxcomputeUrl() {
  return (
    process.env.MAXCOMPUTE_MCP_URL ||
    'https://test-dmp-mcp.xkw.com/maxcompute-mcp'
  );
}

function parseJsonAggPayload(text) {
  const raw = (text || '').trim();
  if (!raw) return [];

  // 常见：CSV 头 + 一行 JSON；或纯 JSON 数组
  if (raw.startsWith('[')) {
    return JSON.parse(raw);
  }

  // rows_json\n[{...}]
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length >= 2 && /rows_json/i.test(lines[0])) {
    const body = lines.slice(1).join('\n').trim();
    // CSV 可能把 JSON 包在引号里
    let jsonText = body;
    if (jsonText.startsWith('"') && jsonText.endsWith('"')) {
      jsonText = jsonText.slice(1, -1).replace(/""/g, '"');
    }
    if (jsonText === '' || jsonText === '[]') return [];
    return JSON.parse(jsonText);
  }

  // 整段就是 JSON 对象/数组
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.rows_json)) return parsed.rows_json;
    if (parsed && typeof parsed.rows_json === 'string') {
      return JSON.parse(parsed.rows_json || '[]');
    }
  } catch {
    // fallthrough
  }

  throw new Error(`无法解析 Hologres 返回: ${raw.slice(0, 200)}`);
}

function parseOdpsToolPayload(text) {
  const raw = (text || '').trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    // 工具可能返回带前后缀的文本
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error(`无法解析 MaxCompute MCP 返回: ${raw.slice(0, 200)}`);
  }
}

/** RFC4180 风格 CSV → 对象数组（支持引号内换行/逗号） */
function parseCsvToObjects(csvText) {
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
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
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
  const headers = rows[0].map((h) => String(h).replace(/^"|"$/g, '').trim());
  return rows.slice(1).map((cols) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? '';
    });
    return obj;
  });
}

function extractOdpsRows(dataBody) {
  if (!dataBody) return null;
  if (Array.isArray(dataBody.data)) return dataBody.data;
  if (Array.isArray(dataBody.results?.data)) return dataBody.results.data;
  if (Array.isArray(dataBody.result?.data)) return dataBody.result.data;

  const csv =
    dataBody.results?.AnonymousSQLTask ||
    dataBody.result?.results?.AnonymousSQLTask ||
    dataBody.AnonymousSQLTask;
  if (typeof csv === 'string' && csv.trim()) {
    return parseCsvToObjects(csv);
  }
  return null;
}

async function withRetries(fn, { retries = 3, label = 'request' } = {}) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = String(err.message || err);
      const retryable = /502|503|504|ECONNRESET|ETIMEDOUT|socket/i.test(msg);
      if (!retryable || i === retries - 1) throw err;
      const wait = 800 * (i + 1);
      console.warn(`[warehouse] ${label} 失败，${wait}ms 后重试 (${i + 1}/${retries}):`, msg.slice(0, 120));
      await sleep(wait);
    }
  }
  throw lastErr;
}

async function fetchViaHologres(userIds, startDate, endDate, options) {
  const sql = buildXyioLogJsonSql(userIds, startDate, endDate, options);
  return withRetries(async () => {
    const client = new McpHttpClient({
      url: getHologresUrl(),
      apiKey: getMcpKey()
    });
    try {
      await client.initialize();
      const { text } = await client.callTool('execute_hg_select_sql', { query: sql });
      const rows = parseJsonAggPayload(text);
      return rows.map(normalizeLogRow);
    } finally {
      await client.close();
    }
  }, { retries: 3, label: 'hologres' });
}

async function fetchViaMaxcompute(userIds, startDate, endDate, options) {
  const sql = buildXyioLogOdpsSql(userIds, startDate, endDate, options);
  const client = new McpHttpClient({
    url: getMaxcomputeUrl(),
    apiKey: getMcpKey()
  });
  try {
    await client.initialize();
    const submit = await client.callTool('execute_sql', {
      project: 'dmp_analyst',
      sql,
      async: true,
      maxCU: Number(process.env.ODPS_MAX_CU || 100)
    });
    const submitBody = parseOdpsToolPayload(submit.text);
    const instanceId =
      submitBody?.instanceId ||
      submitBody?.data?.instanceId ||
      submitBody?.result?.instanceId;

    const syncRows = extractOdpsRows(submitBody);
    if (!instanceId) {
      if (syncRows) return syncRows.map(normalizeLogRow);
      throw new Error(`MaxCompute 未返回 instanceId: ${submit.text.slice(0, 300)}`);
    }

    const maxWaitMs = Number(process.env.ODPS_WAIT_MS || 180000);
    const started = Date.now();
    while (Date.now() - started < maxWaitMs) {
      const statusRes = await client.callTool('get_instance_status', {
        project: 'dmp_analyst',
        instanceId
      });
      const statusBody = parseOdpsToolPayload(statusRes.text) || {};
      const status = String(statusBody.status || statusBody.data?.status || '').toUpperCase();
      const terminated =
        statusBody.isTerminated === true ||
        status === 'TERMINATED' ||
        status === 'SUCCESS' ||
        status === 'FAILED';
      if (!terminated) {
        await sleep(2000);
        continue;
      }
      if (status === 'FAILED' || statusBody.isSuccessful === false) {
        throw new Error(`MaxCompute 任务失败: ${statusRes.text.slice(0, 400)}`);
      }
      const dataRes = await client.callTool('get_instance', {
        project: 'dmp_analyst',
        instanceId
      });
      const dataBody = parseOdpsToolPayload(dataRes.text);
      const rows = extractOdpsRows(dataBody);
      if (!rows) {
        throw new Error(`MaxCompute 结果无法解析: ${dataRes.text.slice(0, 300)}`);
      }
      return rows.map(normalizeLogRow);
    }
    throw new Error(`MaxCompute 查询超时（>${maxWaitMs}ms），instanceId=${instanceId}`);
  } finally {
    await client.close();
  }
}

/**
 * 从数仓拉取用户行为日志（橙子学 czx + 学伴 xueban）
 */
export async function fetchUserBehaviorFromWarehouse(userIds, startDate, endDate, options = {}) {
  if (!getMcpKey()) {
    throw new Error('未配置 MCP_KEY，无法通过数仓 MCP 取数。请在 .env 中设置（与 Cursor mcp.json 的 X-MCP-Key 一致）');
  }

  const prefer = (
    process.env.WAREHOUSE_ENGINE ||
    (process.env.VERCEL ? 'maxcompute' : 'hologres')
  ).toLowerCase();
  const errors = [];

  const tryOrder =
    prefer === 'maxcompute' || prefer === 'odps'
      ? ['maxcompute', 'hologres']
      : ['hologres', 'maxcompute'];

  for (const engine of tryOrder) {
    try {
      if (engine === 'hologres') {
        console.log('[warehouse] 通过 Hologres MCP 查询行为日志…');
        return await fetchViaHologres(userIds, startDate, endDate, options);
      }
      console.log('[warehouse] 通过 MaxCompute MCP 查询行为日志…');
      return await fetchViaMaxcompute(userIds, startDate, endDate, options);
    } catch (err) {
      console.warn(`[warehouse] ${engine} 失败:`, err.message);
      errors.push(`${engine}: ${err.message}`);
    }
  }

  throw new Error(`数仓取数失败：${errors.join(' | ')}`);
}

export function isWarehouseDataSource() {
  const src = (process.env.DATA_SOURCE || '').toLowerCase();
  return src === 'warehouse' || src === 'mcp' || src === 'hologres' || src === 'odps';
}
