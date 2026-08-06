/**
 * 用户增长周度一键入口：
 * 1) 周度用户核心
 * 2) 日度活跃/新老用户
 * 3) 周度渠道（活跃 + 新用户）
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BOARD_SCRIPTS = path.join(ROOT, '用户增长数据看板（周度）', 'scripts');

const STEPS = [
  {
    label: '[1/3] 周度用户核心',
    script: path.join(BOARD_SCRIPTS, 'update_weekly_user_core_from_odps.mjs'),
    extraArgs: ['--skip-embed']
  },
  {
    label: '[2/3] 日度活跃/新老用户',
    script: path.join(BOARD_SCRIPTS, 'update_daily_active_new_old_from_odps.mjs'),
    extraArgs: ['--skip-embed']
  },
  {
    label: '[3/3] 周度渠道 + embedded',
    script: path.join(BOARD_SCRIPTS, 'update_weekly_channels_from_odps.mjs'),
    extraArgs: []
  }
];

function run(label, script, args) {
  console.log('');
  console.log('----------------------------------------');
  console.log(label);
  console.log('----------------------------------------');
  const r = spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    env: process.env,
    stdio: 'inherit'
  });
  if (r.error) {
    console.error(`[失败] ${r.error.message}`);
    process.exit(1);
  }
  const code = r.status == null ? 1 : r.status;
  if (code !== 0) {
    console.error(`[失败] ${label} 退出码 ${code}`);
    process.exit(code);
  }
}

const args = process.argv.slice(2);
console.log('');
console.log('========================================');
console.log('  用户增长看板 · 一键更新');
console.log(`  参数: ${args.length ? args.join(' ') : '(默认上一完整周)'}`);
console.log('========================================');

for (const step of STEPS) {
  run(step.label, step.script, [...args, ...step.extraArgs]);
}

console.log('');
console.log('[完成] 周度核心 + 日度 + 渠道已更新。');
console.log('');
