/**
 * 拉取上一完整自然周的活跃/新用户渠道，写入两张渠道 normalized CSV。
 * SQL：../sql/weekly_channels.mjs
 * device_first 回溯固定自 2026-03-01；自第31周（2026-07-30）起可写。
 *
 * 用法：
 *   node .../update_weekly_channels_from_odps.mjs
 *   node .../update_weekly_channels_from_odps.mjs 2026-31
 *   node .../update_weekly_channels_from_odps.mjs --dry-run
 *   node .../update_weekly_channels_from_odps.mjs --only=active
 *   node .../update_weekly_channels_from_odps.mjs --only=newUsers
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { spawnSync } from 'child_process';
import { loadEnv } from '../../lib/loadEnv.js';
import { McpHttpClient, sleep } from '../../lib/mcpHttpClient.js';
import { WEEKLY_CHANNEL_SQL, CHANNEL_SQL_META } from '../sql/weekly_channels.mjs';

const require = createRequire(import.meta.url);
const iconv = require('iconv-lite');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARD_DIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(BOARD_DIR, '..');
const SQL_CUTOFF_DATE = '2026-07-30';

const FILES = {
  active: {
    path: path.join(BOARD_DIR, '每周活跃用户的渠道来源.normalized.csv'),
    raw: path.join(BOARD_DIR, '每周活跃用户的渠道来源.csv'),
    header: 'week_start,week_end,channel_name,uv',
    uvKey: 'uv'
  },
  newUsers: {
    path: path.join(BOARD_DIR, '每周新用户的渠道来源.normalized.csv'),
    raw: path.join(BOARD_DIR, '每周新用户的渠道来源.csv'),
    header: 'week_start,week_end,channel_name,new_user_uv',
    uvKey: 'new_user_uv'
  }
};

loadEnv();
{
  const localEnv = path.join(BOARD_DIR, '.env');
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

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const skipEmbed = argv.includes('--skip-embed');
  const yw = argv.find((a) => /^\d{4}-W?\d{1,2}$/i.test(a));
  const onlyArg = argv.find((a) => a.startsWith('--only='));
  const only = onlyArg
    ? onlyArg
        .slice('--only='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : ['active', 'newUsers'];
  return { dryRun, skipEmbed, yw, only };
}

function parseYearWeek(yw) {
  const m = String(yw).match(/^(\d{4})-W?(\d{1,2})$/i);
  if (!m) throw new Error(`无法解析周次: ${yw}`);
  return { year: Number(m[1]), week: Number(m[2]) };
}

function weekOfYear(date) {
  const y = date.getFullYear();
  const jan1 = new Date(y, 0, 1);
  const today = new Date(y, date.getMonth(), date.getDate());
  const dayIndex = Math.floor((today - jan1) / 86400000);
  return { year: y, week: Math.floor(dayIndex / 7) + 1 };
}

function prevCompleteWeek(now = new Date()) {
  const { year, week } = weekOfYear(now);
  if (week <= 1) {
    const prevYear = year - 1;
    const leap =
      (prevYear % 4 === 0 && prevYear % 100 !== 0) || prevYear % 400 === 0;
    const days = leap ? 366 : 365;
    return { year: prevYear, week: Math.floor((days - 1) / 7) + 1 };
  }
  return { year, week: week - 1 };
}

function weekRange(year, week) {
  const beginDate = new Date(year, 0, 1 + (week - 1) * 7);
  const endDate = new Date(year, 0, 1 + (week - 1) * 7 + 6);
  const iso = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };
  const slash = (d) => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  return {
    begin: iso(beginDate),
    end: iso(endDate),
    beginSlash: slash(beginDate),
    endSlash: slash(endDate)
  };
}

function fillSql(template, vars) {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => {
    if (vars[key] == null) throw new Error(`缺少 \${${key}}`);
    return String(vars[key]);
  });
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

async function runOdpsSql(client, sql, { maxCU, label, waitMs } = {}) {
  const cu = maxCU || Number(process.env.ODPS_MAX_CU || 200);
  const maxWait = waitMs || Number(process.env.ODPS_WAIT_MS || 600000);
  process.stdout.write(`  [${label}] 提交 (maxCU=${cu}) ... `);
  const submit = await client.callTool('execute_sql', {
    project: 'dmp_analyst',
    sql,
    async: true,
    maxCU: cu
  });
  const submitBody = parseOdpsPayload(submit.text);
  if (submitBody?.overLimit) {
    throw new Error(`CU 超限 estimated=${submitBody.estimatedCU}`);
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
    const st = parseOdpsPayload(
      (
        await client.callTool('get_instance_status', {
          project: 'dmp_analyst',
          instanceId
        })
      ).text
    );
    if (!st?.isTerminated) {
      await sleep(3000);
      continue;
    }
    if (st.isSuccessful === false) {
      throw new Error(`ODPS 失败: ${JSON.stringify(st).slice(0, 300)}`);
    }
    const dataBody = parseOdpsPayload(
      (
        await client.callTool('get_instance', {
          project: 'dmp_analyst',
          instanceId
        })
      ).text
    );
    const rows = extractRows(dataBody);
    console.log(`完成 (${Math.round((Date.now() - t0) / 1000)}s, ${rows.length} 行)`);
    return rows;
  }
  throw new Error(`[${label}] 超时 instanceId=${instanceId}`);
}

function csvEscape(cell) {
  const s = String(cell ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** 与 build-embedded-b64 一致：渠道 CSV 可能是 GB18030，不可直接按 UTF-8 读写。 */
function containsMojibake(s) {
  return /�|锟斤拷|Ã|Ð|Ñ|瀛︿即|缁勫嵎|鍏朵粬娓犻亾|灏忓嵎/.test(String(s || ''));
}

function readChannelCsvText(filePath) {
  const buf = fs.readFileSync(filePath);
  const utf8 = buf.toString('utf8').replace(/^\uFEFF/, '');
  const gbk = iconv.decode(buf, 'gb18030').replace(/^\uFEFF/, '');
  const utf8Bad = containsMojibake(utf8);
  const gbkBad = containsMojibake(gbk);
  if (!gbkBad && utf8Bad) return gbk;
  if (!utf8Bad) return utf8;
  if (!gbkBad) return gbk;
  throw new Error(
    `无法可靠解码渠道 CSV（UTF-8/GB18030 均疑似乱码）：${path.basename(filePath)}`
  );
}

function replaceWeekRows(fileKey, beginSlash, endSlash, channelRows) {
  const meta = FILES[fileKey];
  let lines = [meta.header];
  if (fs.existsSync(meta.path)) {
    const text = readChannelCsvText(meta.path);
    lines = text.split(/\r?\n/).filter((l, i) => (i === 0 ? true : l.trim() !== ''));
    if (!lines[0] || !lines[0].includes('week_start')) lines.unshift(meta.header);
  }

  const kept = [lines[0]];
  let removed = 0;
  for (let i = 1; i < lines.length; i++) {
    const firstTwo = lines[i].split(',').slice(0, 2).join(',');
    if (firstTwo === `${beginSlash},${endSlash}`) {
      removed++;
      continue;
    }
    kept.push(lines[i]);
  }

  const uvField = meta.uvKey;
  for (const r of channelRows) {
    const name = String(r.channel_name ?? '').trim();
    const uv = Number(r[uvField] ?? r.uv ?? r.new_user_uv);
    if (!name || !Number.isFinite(uv)) continue;
    kept.push([beginSlash, endSlash, csvEscape(name), uv].join(','));
  }

  return {
    content: `${kept.join('\n')}\n`,
    removed,
    added: channelRows.length,
    path: meta.path,
    raw: meta.raw
  };
}

function rebuildEmbedded() {
  const script = path.join(BOARD_DIR, 'build-embedded-b64.js');
  if (!fs.existsSync(script)) {
    console.warn('未找到 build-embedded-b64.js，跳过');
    return;
  }
  console.log('\n>> 重建 embedded-csv-b64.js');
  const r = spawnSync(process.execPath, [script], { cwd: BOARD_DIR, encoding: 'utf8' });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) throw new Error(`build-embedded-b64 失败 exit=${r.status}`);
}

async function main() {
  const { dryRun, skipEmbed, yw, only } = parseArgs(process.argv.slice(2));
  for (const key of only) {
    if (!WEEKLY_CHANNEL_SQL[key]) {
      console.error(`未知 --only=${key}，可选 active,newUsers`);
      process.exit(1);
    }
  }

  const target = yw ? parseYearWeek(yw) : prevCompleteWeek();
  const range = weekRange(target.year, target.week);
  if (range.begin < SQL_CUTOFF_DATE) {
    console.error(`目标周 ${range.begin}~${range.end} 早于 ${SQL_CUTOFF_DATE}，渠道历史已冻结。`);
    process.exit(1);
  }

  console.log('========================================');
  console.log('  用户增长 · 周度渠道 MaxCompute 更新');
  console.log(
    `  目标: ${target.year}年第${target.week}周（${range.begin} ~ ${range.end}）`
  );
  console.log(
    `  device_first 回溯: ${CHANNEL_SQL_META.deviceLookbackBegin} ~ ${range.end}`
  );
  console.log(`  指标: ${only.join(', ')}`);
  if (dryRun) console.log('  模式: dry-run');
  console.log('========================================');

  if (!process.env.MCP_KEY && !process.env.X_MCP_KEY) {
    console.error('请配置 MCP_KEY');
    process.exit(1);
  }

  const vars = { begin: range.begin, end: range.end };
  const client = new McpHttpClient({
    url: process.env.MAXCOMPUTE_MCP_URL || 'https://test-dmp-mcp.xkw.com/maxcompute-mcp',
    apiKey: process.env.MCP_KEY || process.env.X_MCP_KEY
  });

  await client.initialize();
  try {
    for (const key of only) {
      const meta = WEEKLY_CHANNEL_SQL[key];
      const rows = await runOdpsSql(client, fillSql(meta.sql, vars), meta);
      console.log(`    [${key}] 预览 top:`);
      rows.slice(0, 8).forEach((r) => {
        const uv = r.uv ?? r.new_user_uv;
        console.log(`      ${r.channel_name}\t${uv}`);
      });
      if (rows.length > 8) console.log(`      ... 共 ${rows.length} 个渠道`);

      if (dryRun) continue;

      const out = replaceWeekRows(key, range.beginSlash, range.endSlash, rows);
      fs.writeFileSync(out.path, out.content, 'utf8');
      console.log(
        `    写入 ${path.basename(out.path)}（删旧 ${out.removed} / 新写 ${out.added}）`
      );
      try {
        fs.writeFileSync(out.raw, out.content, 'utf8');
      } catch {
        /* ignore */
      }
    }

    if (dryRun) {
      console.log('\n[dry-run] 未写入 CSV');
      return;
    }
    if (!skipEmbed) rebuildEmbedded();
    console.log('\n完成。');
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('\n[失败]', err.message || err);
  process.exit(1);
});
