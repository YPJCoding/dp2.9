#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Patch df_game_r.js start() with the minimal safe structure fix and migrated-module coordinator hookup.

What this script does:
1. Replaces the old per-feature split-module startup calls inside start() with:
   dp_load('startup_helpers');
   dp_load('startup_modules');
   startMigratedModules(cfg);
2. Keeps TOD, DB init, timer dispatcher, and village_attack startup in df_game_r.js.
3. Adds the missing closing brace right after the start() success log.
4. Removes the old stray brace immediately before the Bridge section.
5. Does not delete any legacy feature function definitions.

Usage from repo root:
    python3 tools/patch_df_game_r_start.py --check
    python3 tools/patch_df_game_r_start.py

The default mode writes df_game_r.js and also creates df_game_r.js.bak before writing.
"""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path

TARGET = Path("df_game_r.js")
BACKUP = Path("df_game_r.js.bak")

OLD_START_BLOCK = """//加载主功能
function start() {
\tconsole.log('[' + get_timestamp() + '] [frida] [info] --------------------------- set function ----------------------------');

\t// 加载配置文件（由 Lua bootstrap 自动生成，包含 features 开关）
\tload_config('/dp2/frida/frida_config.json');
\tconst cfg = (global_config && global_config.features) ? global_config.features : {};

\t// 绝望之塔金币修复
\tif (cfg.enable_tod_fix !== false) { fix_TOD(true); }

\t// 时装镶嵌修复
\tif (cfg.enable_emblem_fix !== false) { fix_use_emblem(); }

\t// 历史日志追踪
\tif (cfg.enable_history_log !== false) { hook_history_log(); }

\t// 上下线处理（幸运点 + 怪物攻城 UI）
\tif (cfg.enable_user_inout_hook === true) { hook_user_inout_game_world(); }

\t// 在线奖励（发点券）
\tif (cfg.enable_online_reward === true) { enable_online_reward(); }

\t// 魔法封印属性转换时继承
\tif (cfg.enable_random_option_inherit === true) { change_random_option_inherit(); }

\t// 魔法封印自动解封
\tif (cfg.enable_auto_unseal === true) { auto_unseal_random_option_equipment(); }

\t// 角色幸运值加成装备爆率
\tif (cfg.enable_luck_point_drop === true) { enable_drop_use_luck_point(); }

\t// 账号金库扩展至 128 格
\tif (cfg.enable_account_cargo === true) { dp_load('account_cargo'); setMaxCAccountCargoSolt(128); }

\t// 加载独立修补程序模块（始终加载，各功能按开关启用）
\tdp_load('patches');

\t// 解除每日创建角色数量限制
\tif (cfg.enable_create_character_unlimit !== false) { disableCreateCharLimit(); }

\t// +13 以上强化券自动刷新物品栏
\tif (cfg.enable_strengthen_refresh !== false) { enableStrengthenRefresh(); }

\t// 黑暗武士技能栏修复
\tif (cfg.enable_dark_knight_skill_fix !== false) { enableComboSkillFix(); }

\t// 取消新账号送成长契约
\tif (cfg.enable_mobile_auth === true) { disableMobileAuth(); }

\t// 抽取幸运在线玩家活动
\tif (cfg.enable_lucky_online === true) { start_event_lucky_online_user(); }

\t// 战力排行榜
\tif (cfg.enable_ranking === true) { dp_load('ranking'); startRanking(); }

\t// 时装潜能
\tif (cfg.enable_hidden_option === true) { dp_load('hidden_option'); startHiddenOption(); }

\t// 回归勇士
\tif (cfg.enable_return_user === true) { dp_load('return_user'); setReturnUser(15); }

\t// VIP 登录公告
\tif (cfg.enable_vip_login === true) { dp_load('vip_login'); startVipLogin(); }

\t// 初始化数据库
\tapi_scheduleOnMainThread(init_db, null);

\t// 挂接消息分发线程
\thook_TimerDispatcher_dispatch();

\t// 怪物攻城活动
\tif (cfg.enable_village_attack === true) { api_scheduleOnMainThread(start_event_villageattack, null); }

\t// VIP 登录公告（依赖 enable_user_inout_hook）
\tif (cfg.enable_vip_login === true) { vip_Login(); }

\tconsole.log('[' + get_timestamp() + '] [frida] [info] ----------------------- set function success ------------------------');
"""

NEW_START_BLOCK = """//加载主功能
function start() {
\tconsole.log('[' + get_timestamp() + '] [frida] [info] --------------------------- set function ----------------------------');

\t// 加载配置文件（由 Lua bootstrap 自动生成，包含 features 开关）
\tload_config('/dp2/frida/frida_config.json');
\tconst cfg = (global_config && global_config.features) ? global_config.features : {};

\t// 绝望之塔金币修复：仍保留在入口内，后续再专项拆分。
\tif (cfg.enable_tod_fix !== false) { fix_TOD(true); }

\t// 已拆分模块集中启动：统一处理模块加载、函数缺失、重复加载和单功能异常。
\tdp_load('startup_helpers');
\tdp_load('startup_modules');
\tstartMigratedModules(cfg);

\t// 初始化数据库
\tapi_scheduleOnMainThread(init_db, null);

\t// 挂接消息分发线程
\thook_TimerDispatcher_dispatch();

\t// 怪物攻城活动：大型旧逻辑仍保留在入口内，后续再专项拆分。
\tif (cfg.enable_village_attack === true) { api_scheduleOnMainThread(start_event_villageattack, null); }

\tconsole.log('[' + get_timestamp() + '] [frida] [info] ----------------------- set function success ------------------------');
}
"""

OLD_BRIDGE_PREFIX = """// Bridge: Frida Integration
// dp2_resolver, frida_main, frida_handler, rpc.exports
}


//============================================= dp集成frida =============================================
"""

NEW_BRIDGE_PREFIX = """// Bridge: Frida Integration
// dp2_resolver, frida_main, frida_handler, rpc.exports


//============================================= dp集成frida =============================================
"""


def build_patched_text(text: str) -> str:
    if OLD_START_BLOCK not in text:
        raise SystemExit("old start() block not found; abort to avoid unsafe patch")
    if OLD_BRIDGE_PREFIX not in text:
        raise SystemExit("old bridge prefix with stray brace not found; abort to avoid unsafe patch")

    text = text.replace(OLD_START_BLOCK, NEW_START_BLOCK, 1)
    text = text.replace(OLD_BRIDGE_PREFIX, NEW_BRIDGE_PREFIX, 1)
    return text


def main() -> None:
    parser = argparse.ArgumentParser(description="Patch df_game_r.js start() safely.")
    parser.add_argument("--check", action="store_true", help="Only verify that the patch can be applied; do not write files.")
    parser.add_argument("--no-backup", action="store_true", help="Do not create df_game_r.js.bak before writing.")
    args = parser.parse_args()

    path = TARGET
    if not path.exists():
        raise SystemExit(f"missing target file: {path}")

    text = path.read_text(encoding="utf-8")
    patched = build_patched_text(text)

    if patched == text:
        raise SystemExit("patch produced no changes; abort")

    if args.check:
        print("check passed: df_game_r.js start() patch can be applied")
        return

    if not args.no_backup:
        shutil.copyfile(path, BACKUP)
        print(f"backup written: {BACKUP}")

    path.write_text(patched, encoding="utf-8")
    print("patched df_game_r.js start() successfully")
    print("next: inspect git diff, then restart/test Frida startup")


if __name__ == "__main__":
    main()
