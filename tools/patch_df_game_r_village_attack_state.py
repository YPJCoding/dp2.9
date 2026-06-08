#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Remove village-attack state definitions from df_game_r.js.

This script is intentionally narrow and idempotent. It only removes definitions
that are now provided by script/js/village_attack_state.js:

- VILLAGEATTACK_STATE_* constants
- TAU_CAPTAIN_MONSTER_ID / GBL_POPE_MONSTER_ID / TAU_META_COW_MONSTER_ID
- EVENT_VILLAGEATTACK_* constants
- default villageAttackEventInfo object literal

It does not move timers, hooks, packets, rewards, DB save/load, or core activity
logic. Those remain in df_game_r.js for later small-step migration.

Usage from repo root:
    python3 tools/patch_df_game_r_village_attack_state.py
    python3 tools/check_df_game_r_village_attack_state.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

TARGET = Path("df_game_r.js")

STATE_CONSTANT_BLOCK = """//怪物攻城活动当前状态
const VILLAGEATTACK_STATE_P1 = 0; //一阶段
const VILLAGEATTACK_STATE_P2 = 1; //二阶段
const VILLAGEATTACK_STATE_P3 = 2; //三阶段
const VILLAGEATTACK_STATE_END = 3; //活动已结束

const TAU_CAPTAIN_MONSTER_ID = 50071; //牛头统帅id(P1阶段击杀该怪物可提升活动难度等级)
const GBL_POPE_MONSTER_ID = 262; //GBL教主教(P2/P3阶段城镇存在该怪物 持续减少PT点数)
const TAU_META_COW_MONSTER_ID = 17; //机械牛(P3阶段世界BOSS)

const EVENT_VILLAGEATTACK_START_HOUR = 12; //每日北京时间20点开启活动
const EVENT_VILLAGEATTACK_TARGET_SCORE = [100, 200, 300]; //各阶段目标PT
const EVENT_VILLAGEATTACK_TOTAL_TIME = 3600; //活动总时长(秒)

"""

STATE_CONSTANT_REPLACEMENT = """// 怪物攻城活动状态常量已迁移到 script/js/village_attack_state.js。
// startup_modules.js 会无条件加载该状态模块，供 DB 存档和活动启动逻辑使用。

"""

EVENT_INFO_PATTERN = re.compile(
    r"//怪物攻城活动数据\n"
    r"var villageAttackEventInfo = \{\n"
    r"(?:.*?\n)"
    r"\}\n",
    re.DOTALL,
)

EVENT_INFO_REPLACEMENT = """// 怪物攻城活动默认状态已迁移到 script/js/village_attack_state.js。
// 该模块会在缺失时创建 villageAttackEventInfo，避免热加载时重置活动数据。
"""


def main() -> int:
    if not TARGET.exists():
        print(f"[village_attack_state_patch] missing {TARGET}", file=sys.stderr)
        return 2

    text = TARGET.read_text(encoding="utf-8")
    original = text

    if STATE_CONSTANT_BLOCK in text:
        text = text.replace(STATE_CONSTANT_BLOCK, STATE_CONSTANT_REPLACEMENT, 1)
    elif STATE_CONSTANT_REPLACEMENT in text:
        print("[village_attack_state_patch] state constants already removed")
    else:
        print("[village_attack_state_patch] state constant block not found", file=sys.stderr)
        return 2

    text, event_info_count = EVENT_INFO_PATTERN.subn(EVENT_INFO_REPLACEMENT, text, count=1)
    if event_info_count == 0:
        if EVENT_INFO_REPLACEMENT in text:
            print("[village_attack_state_patch] default event info already removed")
        else:
            print("[village_attack_state_patch] default event info block not found", file=sys.stderr)
            return 2

    if text == original:
        print("[village_attack_state_patch] no changes")
        return 0

    TARGET.write_text(text, encoding="utf-8")
    print("[village_attack_state_patch] patched df_game_r.js")
    return 0


if __name__ == "__main__":
    sys.exit(main())
