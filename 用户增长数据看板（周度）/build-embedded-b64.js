/**
 * 生产端标准化（方案 A）：
 * 1) 读取原始 CSV（自动识别 UTF-8 / GB18030）
 * 2) 统一输出 *.normalized.csv（UTF-8）
 * 3) 对关键字段做结构与乱码校验（失败直接退出）
 * 4) 基于 normalized 文件生成 embedded-csv-b64.js
 */
const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

const dir = __dirname;
const files = {
  core: { raw: "周度用户核心数据.csv", normalized: "周度用户核心数据.normalized.csv" },
  daily: { raw: "每天的活跃用户及新老用户.csv", normalized: "每天的活跃用户及新老用户.normalized.csv" },
  activeCh: { raw: "每周活跃用户的渠道来源.csv", normalized: "每周活跃用户的渠道来源.normalized.csv" },
  newCh: { raw: "每周新用户的渠道来源.csv", normalized: "每周新用户的渠道来源.normalized.csv" },
};

function stripBom(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}

function parseCSVLine(line) {
  const out = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(field);
      field = "";
      continue;
    }
    field += ch;
  }
  out.push(field);
  return out;
}

function parseCSV(text) {
  const lines = stripBom(text).replace(/\r/g, "").split("\n").filter((x) => x.trim() !== "");
  return lines.map(parseCSVLine);
}

function toCSV(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "");
          if (s.includes(",") || s.includes('"') || s.includes("\n")) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(",")
    )
    .join("\n");
}

function looksValidHeader(fileName, header) {
  const h = header.join(",");
  if (fileName === "周度用户核心数据.csv") {
    return h.includes("第n周") && h.includes("周开始日期") && h.includes("累计用户");
  }
  if (fileName === "每天的活跃用户及新老用户.csv") {
    return h.includes("dt") && h.includes("active_uv") && h.includes("新用户占比");
  }
  if (fileName === "每周活跃用户的渠道来源.csv") {
    return h.includes("week_start") && h.includes("channel_name") && h.includes("uv");
  }
  if (fileName === "每周新用户的渠道来源.csv") {
    return h.includes("week_start") && h.includes("channel_name") && (h.includes("new_user_uv") || /\buv\b/i.test(h));
  }
  return false;
}

function readCsvAsUtf8(fileName) {
  const fullPath = path.join(dir, fileName);
  const buf = fs.readFileSync(fullPath);
  const utf8 = stripBom(buf.toString("utf8"));
  const gbk = stripBom(iconv.decode(buf, "gb18030"));
  const utf8Header = parseCSV(utf8)[0] || [];
  const gbkHeader = parseCSV(gbk)[0] || [];
  if (looksValidHeader(fileName, utf8Header)) return utf8;
  if (looksValidHeader(fileName, gbkHeader)) return gbk;
  throw new Error(`无法识别 CSV 表头结构：${fileName}`);
}

function containsMojibake(s) {
  const v = String(s || "");
  return /�|锟斤拷|Ã|Ð|Ñ|瀛︿即|缁勫嵎|鍏朵粬娓犻亾|灏忓嵎/.test(v);
}

const CHANNEL_NAME_ALIAS = new Map([
  ["学锟斤拷", "学伴"],
  ["锟斤拷锟斤拷锟斤拷锟斤拷锟脚底诧拷锟斤拷钮", "组卷网服务号底部按钮"],
  ["锟斤拷锟斤拷锟斤拷锟斤拷", "__AMB_OTHER_OR_MALAN__"],
  ["锟斤拷锟斤拷锟斤拷锟斤拷诤锟斤拷锟斤拷没锟斤拷锟斤拷锟�", "组卷网公众号新用户提醒"],
  ["锟斤拷锟斤拷锟斤拷锟斤拷诤诺撞锟斤拷锟脚�", "组卷网公众号底部按钮"],
  ["小锟斤拷锟斤拷页banner", "小卷首页banner"],
  ["锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟矫伙拷锟斤拷锟斤拷", "组卷网服务号新用户提醒"],
  ["锟斤拷平锟斤拷锟角达拷锟斤拷息锟狡硷拷锟斤拷锟睫癸拷司", "南平市智达信息科技有限公司"],
  ["小锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷", "小卷开屏弹窗"],
  ["锟斤拷锟斤拷锟斤拷锟斤拷诤锟斤拷锟斤拷锟�(i)", "组卷网公众号推文(i)"],
  ["ѧ��", "学伴"],
  ["���������ŵײ���ť", "组卷网服务号底部按钮"],
  ["��������", "__AMB_OTHER_OR_MALAN__"],
  ["��������ں����û�����", "组卷网公众号新用户提醒"],
  ["��������ںŵײ���ť", "组卷网公众号底部按钮"],
  ["С����ҳbanner", "小卷首页banner"],
  ["�������������û�����", "组卷网服务号新用户提醒"],
  ["��ƽ���Ǵ���Ϣ�Ƽ����޹�˾", "南平市智达信息科技有限公司"],
  ["С����������", "小卷开屏弹窗"],
  ["��������ں�����(i)", "组卷网公众号推文(i)"],
]);

const CHANNEL_NAME_ALLOWLIST = new Set([
  "APP",
  "学伴",
  "组卷网服务号底部按钮",
  "其他渠道",
  "组卷网公众号新用户提醒",
  "组卷网公众号底部按钮",
  "小卷首页banner",
  "组卷网服务号新用户提醒",
  "南平市智达信息科技有限公司",
  "小卷开屏弹窗",
  "马兰花开",
  "组卷网公众号推文(i)",
]);

function normalizeChannelName(name) {
  const raw = String(name || "").trim();
  if (!raw) return raw;
  if (CHANNEL_NAME_ALIAS.has(raw)) return CHANNEL_NAME_ALIAS.get(raw);
  return raw;
}

function normalizeRows(key, rows) {
  if (!rows || rows.length < 2) throw new Error(`${key} 数据为空`);
  const header = rows[0].map((x) => String(x).trim());
  const idx = Object.fromEntries(header.map((name, i) => [name, i]));

  if (key === "activeCh" || key === "newCh") {
    const uvKey = key === "newCh" && idx.new_user_uv == null ? "uv" : (key === "newCh" ? "new_user_uv" : "uv");
    const required = ["week_start", "week_end", "channel_name", uvKey];
    for (const col of required) {
      if (idx[col] == null) throw new Error(`${key} 缺少字段：${col}`);
    }
    const normalizedRows = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const name = normalizeChannelName(r[idx.channel_name]);
      if (!name) continue;
      if (containsMojibake(name)) {
        throw new Error(`${key} 检测到渠道名乱码，第 ${i + 1} 行：${name}`);
      }
      normalizedRows.push({
        line: i + 1,
        weekStart: String(r[idx.week_start] ?? "").trim(),
        weekEnd: String(r[idx.week_end] ?? "").trim(),
        channelName: name,
        uv: String(r[idx[uvKey]] ?? "").trim(),
      });
    }

    // 处理“其他渠道 / 马兰花开”不可逆合并：同周若出现两个歧义值，则大值归“其他渠道”，小值归“马兰花开”
    const byWeek = new Map();
    for (const row of normalizedRows) {
      const keyWeek = `${row.weekStart}|${row.weekEnd}`;
      if (!byWeek.has(keyWeek)) byWeek.set(keyWeek, []);
      byWeek.get(keyWeek).push(row);
    }
    for (const weekRows of byWeek.values()) {
      const amb = weekRows.filter((r) => r.channelName === "__AMB_OTHER_OR_MALAN__");
      if (amb.length === 1) {
        amb[0].channelName = "其他渠道";
      } else if (amb.length === 2) {
        amb.sort((a, b) => Number(b.uv || 0) - Number(a.uv || 0));
        amb[0].channelName = "其他渠道";
        amb[1].channelName = "马兰花开";
      } else if (amb.length === 3) {
        amb.sort((a, b) => Number(b.uv || 0) - Number(a.uv || 0));
        amb[0].channelName = "其他渠道";
        amb[1].channelName = "马兰花开";
        amb[2].channelName = "小卷开屏弹窗";
      } else if (amb.length > 3) {
        throw new Error(`${key} 在同一周检测到超过 3 条歧义渠道，无法自动判定，请修复源 CSV`);
      }
    }

    const out = [["week_start", "week_end", "channel_name", uvKey]];
    for (const row of normalizedRows) {
      if (!CHANNEL_NAME_ALLOWLIST.has(row.channelName)) {
        throw new Error(`${key} 检测到未登记渠道名，第 ${row.line} 行：${row.channelName}`);
      }
      out.push([row.weekStart, row.weekEnd, row.channelName, row.uv]);
    }
    return out;
  }

  // core / daily 仅做 UTF-8 标准化与结构校验
  if (key === "core") {
    for (const col of ["第n周", "周开始日期", "周结束日期", "活跃用户", "新增用户", "累计用户"]) {
      if (idx[col] == null) throw new Error(`core 缺少字段：${col}`);
    }
  }
  if (key === "daily") {
    for (const col of ["dt", "active_uv", "new_uv", "old_uv", "新用户占比"]) {
      if (idx[col] == null) throw new Error(`daily 缺少字段：${col}`);
    }
  }
  return rows;
}

const normalizedTextByKey = {};
for (const [key, def] of Object.entries(files)) {
  const rawText = readCsvAsUtf8(def.raw);
  const rows = parseCSV(rawText);
  const normalizedRows = normalizeRows(key, rows);
  const normalizedText = toCSV(normalizedRows);
  fs.writeFileSync(path.join(dir, def.normalized), normalizedText, "utf8");
  normalizedTextByKey[key] = normalizedText;
}

let out = "var EMBEDDED_CSV_B64 = {\n";
for (const [k, text] of Object.entries(normalizedTextByKey)) {
  const b64 = Buffer.from(text, "utf8").toString("base64");
  out += `  ${k}: "${b64}",\n`;
}
out += "};\n";
fs.writeFileSync(path.join(dir, "embedded-csv-b64.js"), out, "utf8");
console.log("written normalized CSV + embedded-csv-b64.js");
