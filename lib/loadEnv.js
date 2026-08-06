import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function applyEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return false;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
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
  return true;
}

/** 可选加载 .env（不覆盖已有 process.env）；依次尝试仓库根与相关子目录 */
export function loadEnv(fileName = '.env') {
  const candidates = [
    path.resolve(__dirname, '..', fileName),
    path.resolve(__dirname, '..', '用户行为看板（周度）', fileName),
    path.resolve(__dirname, '..', '核心数据看板（月度）', fileName),
    path.resolve(__dirname, '..', '核心数据看板（周度）', fileName),
    path.resolve(__dirname, '..', '用户增长数据看板（周度）', fileName),
    path.resolve(__dirname, '..', '分省数据看板（月度）', fileName),
    path.resolve(__dirname, '..', '各模块渗透率看板（月度）', fileName)
  ];
  for (const p of candidates) applyEnvFile(p);
}
