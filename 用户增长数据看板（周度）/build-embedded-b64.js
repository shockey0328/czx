/**
 * 将同目录下 4 个 CSV 读入并生成 embedded-csv-b64.js。
 * Windows 下 Excel 导出的 CSV 常为 GBK/GB18030，若按 UTF-8 解析会导致表头匹配失败（看板显示无数据）。
 * 本脚本会识别编码：已是 UTF-8 且含正确表头则直接用；否则按 GB18030 解码后再输出 UTF-8 的 Base64。
 * 同时把 CSV 文件重写为 UTF-8（无 BOM），便于本地 http 服务 fetch。
 */
const fs = require("fs");
const path = require("path");

let iconv;
try {
  iconv = require("iconv-lite");
} catch (e) {
  console.error(
    "需要 iconv-lite：请在「橙子学数据看板」目录执行 npm install iconv-lite，或在本目录安装后再运行。"
  );
  process.exit(1);
}

const dir = __dirname;
const files = {
  core: "周度用户核心数据.csv",
  daily: "每天的活跃用户及新老用户.csv",
  activeCh: "每周活跃用户的渠道来源.csv",
  newCh: "每周新用户的渠道来源.csv",
};

/** 用「表头必须含的关键字」判断解码是否正确（避免 GBK 文件被误当成 UTF-8） */
function decodedTextLooksValid(fileName, text) {
  const line0 = (String(text).split(/\r?\n/)[0] || "").trim();
  if (fileName === "周度用户核心数据.csv") {
    return line0.includes("第n周") && line0.includes("周开始日期") && line0.includes("累计用户");
  }
  if (fileName === "每天的活跃用户及新老用户.csv") {
    return (
      line0.includes("dt") &&
      line0.includes("active_uv") &&
      line0.includes("新用户占比")
    );
  }
  if (fileName === "每周活跃用户的渠道来源.csv") {
    return line0.includes("week_start") && line0.includes("channel_name") && line0.includes("uv");
  }
  if (fileName === "每周新用户的渠道来源.csv") {
    return (
      line0.includes("week_start") &&
      line0.includes("channel_name") &&
      (line0.includes("new_user_uv") || /\buv\b/i.test(line0))
    );
  }
  return true;
}

function readCsvFileAsUtf8String(filePath) {
  const buf = fs.readFileSync(filePath);
  const base = path.basename(filePath);
  // UTF-8 BOM
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.slice(3).toString("utf8");
  }
  const asUtf8 = buf.toString("utf8");
  const asGbk = iconv.decode(buf, "gb18030");
  if (decodedTextLooksValid(base, asUtf8)) return asUtf8;
  if (decodedTextLooksValid(base, asGbk)) return asGbk;
  return asGbk;
}

let out = "var EMBEDDED_CSV_B64 = {\n";
for (const [k, f] of Object.entries(files)) {
  const full = path.join(dir, f);
  const utf8Text = readCsvFileAsUtf8String(full);
  // 统一落盘为 UTF-8，避免下次双击打开仍按 GBK 误判
  fs.writeFileSync(full, utf8Text, { encoding: "utf8" });
  const b64 = Buffer.from(utf8Text, "utf8").toString("base64");
  out += `  ${k}: "${b64}",\n`;
}
out += "};\n";

fs.writeFileSync(path.join(dir, "embedded-csv-b64.js"), out, "utf8");
console.log("written embedded-csv-b64.js（CSV 已规范为 UTF-8）");
