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
const ALLOW_OVERWRITE_NORMALIZED = process.env.ALLOW_OVERWRITE_NORMALIZED === "1";
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
  const name = String(fileName || "");
  const base = name.replace(/\.normalized(?=\.csv$)/i, "");

  if (base === "周度用户核心数据.csv") {
    return h.includes("第n周") && h.includes("周开始日期") && h.includes("累计用户");
  }
  if (base === "每天的活跃用户及新老用户.csv") {
    return h.includes("dt") && h.includes("active_uv") && (h.includes("新用户占比") || h.includes("new_user_rate"));
  }
  if (base === "每周活跃用户的渠道来源.csv") {
    return h.includes("week_start") && h.includes("channel_name") && h.includes("uv");
  }
  if (base === "每周新用户的渠道来源.csv") {
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

  const name = String(fileName || "");
  const base = name.replace(/\.normalized(?=\.csv$)/i, "");

  // 渠道文件可能是 GB/UTF-8 任一编码：表头是 ASCII，容易“误判为 UTF-8 正常”，但正文会出现锟斤拷
  // 这里用“正文乱码特征”做解码选择（不是渠道名映射/猜测）
  const isChannel = (base === "每周活跃用户的渠道来源.csv" || base === "每周新用户的渠道来源.csv");
  if (isChannel) {
    const utf8Bad = containsMojibake(utf8);
    const gbkBad = containsMojibake(gbk);
    if (!gbkBad && utf8Bad && looksValidHeader(fileName, gbkHeader)) return gbk;
    if (!utf8Bad && looksValidHeader(fileName, utf8Header)) return utf8;
    if (looksValidHeader(fileName, gbkHeader)) return gbk;
  }

  if (looksValidHeader(fileName, utf8Header)) return utf8;
  if (looksValidHeader(fileName, gbkHeader)) return gbk;
  throw new Error(`无法识别 CSV 表头结构：${fileName}`);
}

function readPreferredCsvText(def) {
  // 仓库里常见只提交 *.normalized.csv（UTF-8），原始 *.csv 可能不存在
  const tryFiles = [def.raw, def.normalized].filter(Boolean);
  let lastErr = null;
  for (const f of tryFiles) {
    try {
      if (!fs.existsSync(path.join(dir, f))) continue;
      return readCsvAsUtf8(f);
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  throw new Error(`找不到 CSV 文件：${tryFiles.join(" / ")}`);
}

function containsMojibake(s) {
  const v = String(s || "");
  return /�|锟斤拷|Ã|Ð|Ñ|瀛︿即|缁勫嵎|鍏朵粬娓犻亾|灏忓嵎/.test(v);
}

const CHANNEL_NAME_ALIAS = new Map([
  ["学锟斤拷", "学伴"],
  ["锟斤拷锟斤拷锟斤拷锟斤拷锟脚底诧拷锟斤拷钮", "组卷网服务号底部按钮"],
  // 该乱码串在当前看板口径中对应「其他渠道」
  ["锟斤拷锟斤拷锟斤拷锟斤拷", "其他渠道"],
  ["锟斤拷锟斤拷锟斤拷锟斤拷诤锟斤拷锟斤拷没锟斤拷锟斤拷锟�", "组卷网公众号新用户提醒"],
  ["锟斤拷锟斤拷锟斤拷锟斤拷诤诺撞锟斤拷锟脚�", "组卷网公众号底部按钮"],
  ["小锟斤拷锟斤拷页banner", "小卷首页banner"],
  ["锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟矫伙拷锟斤拷锟斤拷", "组卷网服务号新用户提醒"],
  ["锟斤拷平锟斤拷锟角达拷锟斤拷息锟狡硷拷锟斤拷锟睫癸拷司", "南平市智达信息科技有限公司"],
  ["小锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷", "小卷开屏弹窗"],
  ["锟斤拷锟斤拷锟斤拷锟斤拷诤锟斤拷锟斤拷锟�(i)", "组卷网公众号推文(i)"],
  ["ѧ��", "学伴"],
  ["���������ŵײ���ť", "组卷网服务号底部按钮"],
  // 该乱码串在当前看板口径中对应「其他渠道」
  ["��������", "其他渠道"],
  ["��������ں����û�����", "组卷网公众号新用户提醒"],
  ["��������ںŵײ���ť", "组卷网公众号底部按钮"],
  ["С����ҳbanner", "小卷首页banner"],
  ["�������������û�����", "组卷网服务号新用户提醒"],
  ["��ƽ���Ǵ���Ϣ�Ƽ����޹�˾", "南平市智达信息科技有限公司"],
  ["С����������", "小卷开屏弹窗"],
  ["��������ں�����(i)", "组卷网公众号推文(i)"],
  ["ɽ���ͽ���", "马兰花开"],
  ["���շ�˱������洫ý���޹�˾", "江苏凤凰报刊出版传媒有限公司"],
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
  "山西和教育",
  "江苏凤凰报刊出版传媒有限公司",
  "龙江教研在线",
  "通用",
  "北京市教委-京小学",
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

  // 渠道表：做“精确别名替换”（不是猜测式纠错），并在仍存在乱码时直接失败，避免静默误报
  if (key === "activeCh" || key === "newCh") {
    const uvKey = key === "newCh" && idx.new_user_uv == null ? "uv" : (key === "newCh" ? "new_user_uv" : "uv");
    const required = ["week_start", "week_end", "channel_name", uvKey];
    for (const col of required) {
      if (idx[col] == null) throw new Error(`${key} 缺少字段：${col}`);
    }
    const out = [["week_start", "week_end", "channel_name", uvKey]];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const rawName = String(r[idx.channel_name] ?? "").trim();
      const fixedName = normalizeChannelName(rawName);
      if (containsMojibake(fixedName)) {
        throw new Error(
          `${key} 渠道名仍存在乱码（请补充精确映射或修订源数据）：` +
          `raw="${rawName}" fixed="${fixedName}"`
        );
      }
      if (CHANNEL_NAME_ALLOWLIST.size && fixedName && !CHANNEL_NAME_ALLOWLIST.has(fixedName)) {
        throw new Error(`${key} 渠道名不在白名单（请确认是否新增渠道需纳入）：${fixedName}`);
      }
      out.push([
        String(r[idx.week_start] ?? "").trim(),
        String(r[idx.week_end] ?? "").trim(),
        fixedName,
        String(r[idx[uvKey]] ?? "").trim(),
      ]);
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
    for (const col of ["dt", "active_uv", "new_uv", "old_uv"]) {
      if (idx[col] == null) throw new Error(`daily 缺少字段：${col}`);
    }
    const shareKey = idx["新用户占比"] != null ? "新用户占比" : (idx["new_user_rate"] != null ? "new_user_rate" : null);
    if (!shareKey) throw new Error("daily 缺少字段：新用户占比 / new_user_rate");

    // 统一输出表头为「新用户占比」，与页面解析逻辑保持一致
    const out = [["dt", "active_uv", "new_uv", "old_uv", "新用户占比"]];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      out.push([
        String(r[idx.dt] ?? "").trim(),
        String(r[idx.active_uv] ?? "").trim(),
        String(r[idx.new_uv] ?? "").trim(),
        String(r[idx.old_uv] ?? "").trim(),
        String(r[idx[shareKey]] ?? "").trim(),
      ]);
    }
    return out;
  }
  return rows;
}

function headerLine(text) {
  return String(text || "").split(/\r?\n/, 1)[0] || "";
}

function buildEmbeddedTextByKey() {
  const out = {};

  for (const [key, def] of Object.entries(files)) {
    const normalizedPath = def.normalized ? path.join(dir, def.normalized) : null;
    const rawPath = def.raw ? path.join(dir, def.raw) : null;

    let text = "";
    let source = "";

    if (normalizedPath && fs.existsSync(normalizedPath)) {
      // 默认只读 normalized，避免任何“读错编码后写回”导致的数据污染
      source = def.normalized;
      // 注意：normalized 文件名不代表一定是 UTF-8，这里仍按字节做 UTF-8/GB18030 自适应解码
      text = readCsvAsUtf8(def.normalized);
    } else if (rawPath && fs.existsSync(rawPath)) {
      source = def.raw;
      text = readCsvAsUtf8(def.raw);
    } else {
      throw new Error(`找不到 CSV 文件：${def.normalized || ""}${def.raw ? " / " + def.raw : ""}`);
    }

    // 基本结构校验（只用于防呆，不做任何内容“纠错/猜测”）
    const h = headerLine(text);
    if (!looksValidHeader(source, parseCSV(h)[0] || [])) {
      throw new Error(`${key} 表头结构不符合预期：${source} header="${h}"`);
    }

    // 渠道文件：严格禁止出现明显乱码（避免输出“看起来像正常 UTF-8、但内容已坏”的文件）
    if ((key === "activeCh" || key === "newCh") && containsMojibake(text)) {
      throw new Error(`${key} 检测到疑似乱码（请检查源文件编码/生成过程）：${source}`);
    }

    // 只有在显式允许时，才会把 raw 规范化写回 normalized（默认不写，保护数据）
    if (ALLOW_OVERWRITE_NORMALIZED && source === def.raw && def.normalized) {
      fs.writeFileSync(path.join(dir, def.normalized), text, "utf8");
    }

    out[key] = text;
  }

  return out;
}

let out = "var EMBEDDED_CSV_B64 = {\n";
const embeddedTextByKey = buildEmbeddedTextByKey();
for (const [k, text] of Object.entries(embeddedTextByKey)) {
  const b64 = Buffer.from(text, "utf8").toString("base64");
  out += `  ${k}: "${b64}",\n`;
}
out += "};\n";
fs.writeFileSync(path.join(dir, "embedded-csv-b64.js"), out, "utf8");
console.log(
  `written embedded-csv-b64.js (overwrite normalized: ${ALLOW_OVERWRITE_NORMALIZED ? "ON" : "OFF"})`
);
