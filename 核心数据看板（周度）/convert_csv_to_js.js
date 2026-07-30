/**
 * 兼容入口：仓库根 package.json 为 "type":"module" 后，
 * 请优先使用 convert_csv_to_js.cjs；本文件转发到 .cjs，避免周度更新.bat 失败。
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const cjs = path.join(dir, 'convert_csv_to_js.cjs');
const r = spawnSync(process.execPath, [cjs], { stdio: 'inherit', cwd: dir });
process.exit(r.status === null ? 1 : r.status);
