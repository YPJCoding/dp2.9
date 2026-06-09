#!/usr/bin/env node
// Frida bundle 构建脚本 (Node.js 版本)
// 按固定顺序将 JS 模块拼接成单个可加载文件
//
// 用法：node tools/build_frida_bundle.js
// 输出：dist/df_game_r.bundle.js

const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');
const outputDir = path.join(projectDir, 'dist');
const output = path.join(outputDir, 'df_game_r.bundle.js');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 拼接顺序（必须按此顺序，不可随意调整）
// 顺序原因：模块依赖的拓扑排序
const files = [
  'script/js/runtime_addresses.js',
  'script/js/runtime_config.js',

  'script/js/core/runtime_utils.js',
  'script/js/bindings/native_functions.js',

  'script/js/core/logger.js',
  'script/js/core/time.js',
  'script/js/core/random.js',
  'script/js/core/memory.js',
  'script/js/core/file.js',
  'script/js/core/hook_guard.js',

  'script/js/bindings/packet.js',
  'script/js/bindings/mysql.js',
  'script/js/bindings/user.js',
  'script/js/bindings/inventory.js',
  'script/js/bindings/item.js',
  'script/js/bindings/mail.js',
  'script/js/bindings/game_world.js',
  'script/js/bindings/timer_dispatcher.js',
  'script/js/bindings/quest.js',

  'script/js/features/tod_fix.js',
  'script/js/features/emblem_fix.js',
  'script/js/features/hidden_option.js',
  'script/js/features/return_user.js',
  'script/js/features/online_reward.js',
  'script/js/features/ranking.js',
  'script/js/features/user_inout.js',

  'script/js/features/village_attack/constants.js',
  'script/js/features/village_attack/state.js',
  'script/js/features/village_attack/db.js',
  'script/js/features/village_attack/notify.js',
  'script/js/features/village_attack/reward.js',
  'script/js/features/village_attack/settlement.js',
  'script/js/features/village_attack/flow.js',
  'script/js/features/village_attack/hooks.js',
  'script/js/features/village_attack/index.js',

  'script/js/startup_helpers.js',
  'script/js/startup_modules.js',

  'df_game_r.js',
];

var bundleContent = '';

files.forEach(function (file) {
  const filePath = path.join(projectDir, file);
  if (!fs.existsSync(filePath)) {
    console.error('file not found: ' + filePath);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  bundleContent += content + '\n';
});

fs.writeFileSync(output, bundleContent, 'utf-8');
console.log('build complete: ' + output);
