/**
 * 统一数仓查询客户端 — 自动适配 Hologres / MaxCompute
 *
 * 根据 WAREHOUSE_ENGINE 环境变量选择引擎：
 *   - hologres:   同步调用 execute_hg_select_sql（走 HOLOGRES_MCP_URL）
 *   - maxcompute: 异步调用 execute_sql → 轮询 → get_instance（走 MAXCOMPUTE_MCP_URL）
 *
 * SQL 语法差异自动转换（Hologres 模式下）：
 *   CAST(x AS STRING)      → CAST(x AS TEXT)
 *   TO_DATE(x)             → CAST(x AS DATE)
 *   DATE_ADD(date, N)      → (date + INTERVAL 'N days')
 *   DATE_ADD(date, expr)   → (date + (expr) * INTERVAL '1 day')
 *   REGEXP_EXTRACT(s,p,n)  → (regexp_match(s, p))[n]
 *   DATEDIFF(d1, d2)       → ((d1)::DATE - (d2)::DATE)  (PostgreSQL date-date=integer)
 *
 * 用法：
 *   import { createWarehouseClient } from '../../lib/warehouseClient.js';
 *   const client = await createWarehouseClient();
 *   const rows = await client.runSql(sql, { label: '活跃用户' });
 *   await client.close();
 */
import { McpHttpClient, sleep } from './mcpHttpClient.js';

/**
 * MaxCompute SQL → Hologres SQL 语法转换
 *
 * 转换规则：
 *   CAST(x AS STRING)      → CAST(x AS TEXT)
 *   TO_DATE(x)             → CAST(x AS DATE)
 *   DATE_ADD(date, N)      → (date + INTERVAL 'N days')::DATE
 *   DATE_ADD(date, -N)     → (date - INTERVAL 'N days')::DATE
 *   DATE_ADD(date, expr)   → (date + (expr) * INTERVAL '1 day')::DATE
 *   REGEXP_EXTRACT(s,p,n)  → (regexp_match(s, p))[n]
 *   DATEDIFF(d1, d2)       → EXTRACT(DAY FROM (d1 - d2))
 */

/**
 * 在 SQL 中查找指定函数名，用平衡括号匹配提取参数，交由 converter 转换。
 */
function replaceFunction(sql, funcName, converter) {
  const pattern = new RegExp(`\\b${funcName}\\s*\\(`, 'gi');
  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(sql)) !== null) {
    const openIdx = match.index + match[0].length - 1; // '(' 的位置
    let depth = 1;
    let i = openIdx + 1;
    let inStr = false;
    let strCh = '';

    while (i < sql.length && depth > 0) {
      const ch = sql[i];
      if (inStr) {
        if (ch === strCh && sql[i - 1] !== '\\') inStr = false;
      } else if (ch === "'" || ch === '"') {
        inStr = true;
        strCh = ch;
      } else if (ch === '(') {
        depth++;
      } else if (ch === ')') {
        depth--;
      }
      i++;
    }

    if (depth !== 0) {
      // 括号不匹配，原样保留
      result += sql.slice(lastIndex, match.index + match[0].length);
      lastIndex = match.index + match[0].length;
      continue;
    }

    const argsStr = sql.slice(openIdx + 1, i - 1);
    const args = splitArgs(argsStr);
    const replacement = converter(args);

    result += sql.slice(lastIndex, match.index) + replacement;
    lastIndex = i;
    pattern.lastIndex = lastIndex;
  }

  result += sql.slice(lastIndex);
  return result;
}

/**
 * 按顶层逗号拆分函数参数（忽略括号内和字符串内的逗号）。
 */
function splitArgs(str) {
  const args = [];
  let depth = 0;
  let start = 0;
  let inStr = false;
  let strCh = '';

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (inStr) {
      if (ch === strCh && str[i - 1] !== '\\') inStr = false;
    } else if (ch === "'" || ch === '"') {
      inStr = true;
      strCh = ch;
    } else if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
    } else if (ch === ',' && depth === 0) {
      args.push(str.slice(start, i).trim());
      start = i + 1;
    }
  }
  const last = str.slice(start).trim();
  if (last) args.push(last);
  return args;
}

function convertSqlForHologres(sql) {
  let result = sql;

  // CAST(... AS STRING) → CAST(... AS TEXT) — 用 [\s\S] 匹配跨行内容，\s* 允许 ) 前有换行
  result = result.replace(/CAST\(([\s\S]+?)\s+AS\s+STRING\s*\)/gi, 'CAST($1 AS TEXT)');

  // TO_DATE(x) → CAST(x AS DATE)
  result = replaceFunction(result, 'TO_DATE', (args) => `CAST(${args[0]} AS DATE)`);

  // DATE_ADD(date, expr) → 日期加减 INTERVAL，结果 ::DATE 保持 DATE 类型（与 MaxCompute 一致）
  result = replaceFunction(result, 'DATE_ADD', (args) => {
    const dateExpr = args[0];
    const numStr = args[1].trim();
    const n = Number(numStr);
    if (!Number.isNaN(n)) {
      return n >= 0
        ? `(${dateExpr} + INTERVAL '${n} days')::DATE`
        : `(${dateExpr} - INTERVAL '${-n} days')::DATE`;
    }
    // 复杂表达式：乘以 INTERVAL
    return `(${dateExpr} + (${numStr}) * INTERVAL '1 day')::DATE`;
  });

  // REGEXP_EXTRACT(str, pattern, N) → (regexp_match(str, pattern))[N]
  result = replaceFunction(result, 'REGEXP_EXTRACT', (args) => {
    return `(regexp_match(${args[0]}, ${args[1]}))[${args[2]}]`;
  });

  // DATEDIFF(d1, d2) → ((d1)::DATE - (d2)::DATE)  (PostgreSQL date-date=integer days)
  result = replaceFunction(result, 'DATEDIFF', (args) => {
    return `((${args[0]})::DATE - (${args[1]})::DATE)`;
  });

  return result;
}

export { convertSqlForHologres };

/**
 * CSV 文本 → 对象数组（与脚本内现有 parseCsvText 一致）
 */
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
  const headers = rows[0].map((h) => String(h).trim());
  return rows.slice(1).map((cols) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? '';
    });
    return obj;
  });
}

/**
 * 解析 MCP 返回的 JSON payload
 */
function parsePayload(text) {
  const raw = (text || '').trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const a = raw.indexOf('{');
    const b = raw.lastIndexOf('}');
    if (a >= 0 && b > a) return JSON.parse(raw.slice(a, b + 1));
    throw new Error(`无法解析返回: ${raw.slice(0, 200)}`);
  }
}

/**
 * 从 MaxCompute 结果体中提取行数据
 */
function extractRows(body) {
  if (!body) return [];
  if (Array.isArray(body.data)) return body.data;
  const csv = body.results?.AnonymousSQLTask;
  if (typeof csv === 'string') return parseCsvText(csv);
  return [];
}

/**
 * 创建统一数仓查询客户端
 *
 * @param {object} [env] - 环境变量（默认 process.env）
 * @returns {Promise<object>} 包含 runSql / close 方法的客户端
 */
export async function createWarehouseClient(env = process.env) {
  const engine = (env.WAREHOUSE_ENGINE || 'maxcompute').toLowerCase();
  const apiKey = env.MCP_KEY || env.X_MCP_KEY;

  if (!apiKey) {
    throw new Error('未配置 MCP_KEY（X-MCP-Key），请在 .env 中设置');
  }

  const isHologres = engine === 'hologres';
  const url = isHologres
    ? (env.HOLOGRES_MCP_URL || 'https://test-dmp-mcp.xkw.com/hologres-mcp')
    : (env.MAXCOMPUTE_MCP_URL || 'https://test-dmp-mcp.xkw.com/maxcompute-mcp');

  const mcp = new McpHttpClient({ url, apiKey });
  await mcp.initialize();

  console.log(`  [数仓引擎] ${isHologres ? 'Hologres' : 'MaxCompute'} (${url})`);

  if (isHologres) {
    // ── Hologres: 同步查询 ──
    return {
      engine: 'hologres',

      async runSql(sql, { label } = {}) {
        const hgSql = convertSqlForHologres(sql);
        const tag = label ? `[${label}]` : '';
        process.stdout.write(`  ${tag} 查询中 ... `);
        const r = await mcp.callTool('execute_hg_select_sql', { query: hgSql });
        const rows = parseCsvText(r.text);
        console.log(`完成 (${rows.length} 行)`);
        return rows;
      },

      async close() {
        await mcp.close();
      }
    };
  }

  // ── MaxCompute: 异步查询（原有逻辑） ──
  return {
    engine: 'maxcompute',

    async runSql(sql, { label, maxCU, waitMs } = {}) {
      const cu = maxCU || Number(env.ODPS_MAX_CU || 200);
      const maxWait = waitMs || Number(env.ODPS_WAIT_MS || 600000);
      const tag = label ? `[${label}]` : '';
      process.stdout.write(`  ${tag} 提交 (maxCU=${cu}) ... `);

      const submit = await mcp.callTool('execute_sql', {
        project: 'dmp_analyst',
        sql,
        async: true,
        maxCU: cu
      });
      const submitBody = parsePayload(submit.text);

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
        throw new Error(`未返回 instanceId: ${submit.text.slice(0, 240)}`);
      }

      const t0 = Date.now();
      while (Date.now() - t0 < maxWait) {
        const st = parsePayload(
          (await mcp.callTool('get_instance_status', {
            project: 'dmp_analyst',
            instanceId
          })).text
        );
        if (!st?.isTerminated) {
          await sleep(3000);
          continue;
        }
        if (st.isSuccessful === false) {
          throw new Error(`ODPS 失败: ${JSON.stringify(st).slice(0, 300)}`);
        }
        const dataBody = parsePayload(
          (await mcp.callTool('get_instance', {
            project: 'dmp_analyst',
            instanceId
          })).text
        );
        const rows = extractRows(dataBody);
        console.log(`完成 (${Math.round((Date.now() - t0) / 1000)}s, ${rows.length} 行)`);
        return rows;
      }
      throw new Error(`[${label}] 超时 instanceId=${instanceId}`);
    },

    async close() {
      await mcp.close();
    }
  };
}
