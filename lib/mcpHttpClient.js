/**
 * 轻量 Streamable HTTP MCP 客户端（对接学科网 Hologres / MaxCompute MCP）
 * 鉴权：请求头 X-MCP-Key（来自环境变量，勿写入代码库）
 */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseSseOrJson(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }
  // SSE: data: {...}
  const dataLines = [];
  for (const line of trimmed.split(/\r?\n/)) {
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }
  if (dataLines.length === 0) {
    throw new Error(`无法解析 MCP 响应: ${trimmed.slice(0, 200)}`);
  }
  // 取最后一条完整 JSON-RPC 消息
  let last = null;
  for (const chunk of dataLines) {
    if (!chunk || chunk === '[DONE]') continue;
    try {
      last = JSON.parse(chunk);
    } catch {
      // 多行 data 拼接场景较少，忽略碎片
    }
  }
  if (!last) throw new Error('MCP SSE 响应中未找到 JSON-RPC 消息');
  return last;
}

function extractToolText(result) {
  if (result == null) return '';
  if (typeof result === 'string') return result;
  if (Array.isArray(result.content)) {
    return result.content
      .map((c) => (c && typeof c.text === 'string' ? c.text : ''))
      .filter(Boolean)
      .join('\n');
  }
  if (typeof result.content === 'string') return result.content;
  return JSON.stringify(result);
}

export class McpHttpClient {
  constructor({ url, apiKey, protocolVersion = '2025-03-26' }) {
    if (!url) throw new Error('未配置 MCP URL');
    if (!apiKey) throw new Error('未配置 MCP_KEY（X-MCP-Key）');
    this.url = url.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.protocolVersion = protocolVersion;
    this.sessionId = null;
    this._reqId = 0;
  }

  async _post(body, { notification = false } = {}) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'X-MCP-Key': this.apiKey,
      'MCP-Protocol-Version': this.protocolVersion
    };
    if (this.sessionId) headers['Mcp-Session-Id'] = this.sessionId;

    const res = await fetch(this.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const sid = res.headers.get('mcp-session-id') || res.headers.get('Mcp-Session-Id');
    if (sid) this.sessionId = sid;

    if (notification) {
      if (!res.ok && res.status !== 202) {
        const t = await res.text();
        throw new Error(`MCP notification 失败 HTTP ${res.status}: ${t.slice(0, 300)}`);
      }
      return null;
    }

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`MCP 请求失败 HTTP ${res.status}: ${text.slice(0, 500)}`);
    }

    const msg = parseSseOrJson(text);
    if (msg?.error) {
      throw new Error(`MCP JSON-RPC 错误: ${JSON.stringify(msg.error)}`);
    }
    return msg;
  }

  async initialize() {
    const id = ++this._reqId;
    await this._post({
      jsonrpc: '2.0',
      id,
      method: 'initialize',
      params: {
        protocolVersion: this.protocolVersion,
        capabilities: {},
        clientInfo: { name: 'czx-user-behavior-dashboard', version: '1.0.0' }
      }
    });
    await this._post(
      { jsonrpc: '2.0', method: 'notifications/initialized', params: {} },
      { notification: true }
    );
    return this;
  }

  async callTool(name, args = {}) {
    if (!this.sessionId) await this.initialize();
    const id = ++this._reqId;
    const msg = await this._post({
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: { name, arguments: args }
    });
    const result = msg?.result;
    if (result?.isError) {
      throw new Error(`MCP 工具错误: ${extractToolText(result)}`);
    }
    return {
      result,
      text: extractToolText(result)
    };
  }

  async close() {
    if (!this.sessionId) return;
    try {
      await fetch(this.url, {
        method: 'DELETE',
        headers: {
          'X-MCP-Key': this.apiKey,
          'Mcp-Session-Id': this.sessionId,
          'MCP-Protocol-Version': this.protocolVersion
        }
      });
    } catch {
      // ignore
    }
    this.sessionId = null;
  }
}

export { sleep, extractToolText };
