/**
 * 周度搜索看板一键更新：搜索词 + 行为漏斗
 *
 * 用法：
 *   node scripts/update_search_weekly.mjs
 *   node scripts/update_search_weekly.mjs 2026-31
 *   node scripts/update_search_weekly.mjs 2026-31 --dry-run
 *   node scripts/update_search_weekly.mjs --only=keywords
 *   node scripts/update_search_weekly.mjs --only=retention
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARD_DIR = path.resolve(__dirname, '..');

const STEPS = {
  keywords: 'update_weekly_keywords_from_odps.mjs',
  funnel: 'update_weekly_funnel_from_odps.mjs',
  conversion: 'update_daily_conversion_from_odps.mjs',
  retention: 'update_weekly_retention_from_odps.mjs'
};

function parseOnly(argv) {
  const arg = argv.find((a) => a.startsWith('--only='));
  if (!arg) return ['keywords', 'funnel', 'conversion', 'retention'];
  return arg
    .slice('--only='.length)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function main() {
  const argv = process.argv.slice(2);
  const only = parseOnly(argv);
  const passthrough = argv.filter((a) => !a.startsWith('--only='));

  for (const key of only) {
    const script = STEPS[key];
    if (!script) {
      console.error(`未知 --only=${key}，可选: ${Object.keys(STEPS).join(',')}`);
      process.exit(1);
    }
    console.log(`\n======== [搜索看板] ${key} ========`);
    const r = spawnSync(process.execPath, [path.join(__dirname, script), ...passthrough], {
      cwd: BOARD_DIR,
      stdio: 'inherit'
    });
    if (r.status !== 0) {
      console.error(`\n[失败] ${key} 退出码 ${r.status}`);
      process.exit(r.status || 1);
    }
  }
  console.log('\n[全部完成] 搜索看板周度更新');
}

main();
