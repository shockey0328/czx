const fs = require("fs");
const path = require("path");
eval(fs.readFileSync(path.join(__dirname, "embedded-csv-b64.js"), "utf8"));
function d(b64) {
  return Buffer.from(b64, "base64").toString("utf8");
}
console.log("core line0:", d(EMBEDDED_CSV_B64.core).split(/\r?\n/)[0]);
console.log("daily line0:", d(EMBEDDED_CSV_B64.daily).split(/\r?\n/)[0]);
