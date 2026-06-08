#!/usr/bin/env bash
set -euo pipefail
# Frida bundle 构建脚本
# 按固定顺序将 JS 模块拼接成单个可加载文件
#
# 为什么必须按顺序拼接：
# Frida 环境下 JS 文件是逐个加载的，如果某个模块依赖的函数/变量
# 还未定义，运行时会报错。拼接顺序就是模块依赖的拓扑排序。
#
# 输出：dist/df_game_r.bundle.js
# 用法：bash tools/build_frida_bundle.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

OUTPUT_DIR="$PROJECT_DIR/dist"
mkdir -p "$OUTPUT_DIR"

OUTPUT="$OUTPUT_DIR/df_game_r.bundle.js"

rm -f "$OUTPUT"

echo "building $OUTPUT ..."

# 拼接顺序（必须按此顺序，不可随意调整）
cat "$PROJECT_DIR/script/js/runtime_addresses.js"     >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/runtime_config.js"        >> "$OUTPUT"

cat "$PROJECT_DIR/script/js/bindings/native_functions.js" >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/core/logger.js"           >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/core/time.js"             >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/core/random.js"           >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/core/memory.js"           >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/core/file.js"             >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/core/hook_guard.js"       >> "$OUTPUT"

cat "$PROJECT_DIR/script/js/bindings/packet.js"       >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/bindings/mysql.js"        >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/bindings/user.js"         >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/bindings/inventory.js"    >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/bindings/item.js"         >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/bindings/mail.js"         >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/bindings/game_world.js"   >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/bindings/timer_dispatcher.js" >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/bindings/quest.js"        >> "$OUTPUT"

cat "$PROJECT_DIR/script/js/features/tod_fix.js"      >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/emblem_fix.js"   >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/hidden_option.js" >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/return_user.js"  >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/online_reward.js" >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/ranking.js"      >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/user_inout.js"   >> "$OUTPUT"

cat "$PROJECT_DIR/script/js/features/village_attack/constants.js"  >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/village_attack/state.js"      >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/village_attack/db.js"         >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/village_attack/notify.js"     >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/village_attack/reward.js"     >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/village_attack/settlement.js" >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/village_attack/flow.js"       >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/village_attack/hooks.js"      >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/features/village_attack/index.js"      >> "$OUTPUT"

cat "$PROJECT_DIR/script/js/startup_helpers.js"        >> "$OUTPUT"
cat "$PROJECT_DIR/script/js/startup_modules.js"        >> "$OUTPUT"

cat "$PROJECT_DIR/df_game_r.js"                        >> "$OUTPUT"

echo "build complete: $OUTPUT"
