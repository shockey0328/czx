/**
 * 一键更新周度数据：核心指标（含去年同期）+ 日度趋势 + data.js
 * 由「更新周度数据.bat」调用；bat 仅含 ASCII 路径，避免 CMD 中文乱码导致找不到脚本。
 *
 * 用法：
 *   node scripts/update_weekly_all.mjs
 *   node scripts/update_weekly_all.mjs 2026-31
 *   node scripts/update_weekly_all.mjs --dry-run
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BOARD = path.join(ROOT, '核心数据看板（周度）');
const CORE = path.join(BOARD, 'scripts', 'update_weekly_core_from_odps.mjs');
const TRENDS = path.join(BOARD, 'scripts', 'update_weekly_trends_from_odps.mjs');

function run(label, script, args) {
  console.log('');
  console.log('----------------------------------------');
  console.log(label);
  console.log('----------------------------------------');
  console.log('');
  const r = spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    env: process.env,
    stdio: 'inherit'
  });
  if (r.error) {
    console.error(`[失败] 无法启动: ${r.error.message}`);
    process.exit(1);
  }
  const code = r.status == null ? 1 : r.status;
  if (code !== 0) {
    console.error(`[失败] ${label} 退出码 ${code}`);
    process.exit(code);
  }
}

const args = process.argv.slice(2);
const dry = args.includes('--dry-run');

console.log('');
console.log('========================================');
console.log('  橙子学数据看板 - 一键更新周度数据');
console.log('  1) 周度核心（本周 + 去年同期）');
console.log('  2) 日度趋势（活跃 / 付费营收 / 使用率）');
console.log(`  参数: ${args.length ? args.join(' ') : '(默认上一完整周)'}`);
if (dry) console.log('  模式: dry-run');
console.log('========================================');

run('[1/2] 拉取周度核心指标', CORE, [...args, '--skip-convert']);
run('[2/2] 拉取日度趋势并生成 data.js', TRENDS, args);

console.log('');
console.log('[完成] 周度核心 + 日度趋势 + data.js 已同步更新。');
console.log('');
