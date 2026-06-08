#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether village-attack state has been removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")

OLD_MARKERS = (
    "const VILLAGEATTACK_STATE_P1 = 0;",
    "const VILLAGEATTACK_STATE_P2 = 1;",
    "const VILLAGEATTACK_STATE_P3 = 2;",
    "const VILLAGEATTACK_STATE_END = 3;",
    "const TAU_CAPTAIN_MONSTER_ID = 50071;",
    "const GBL_POPE_MONSTER_ID = 262;",
    "const TAU_META_COW_MONSTER_ID = 17;",
    "const EVENT_VILLAGEATTACK_START_HOUR = 12;",
    "const EVENT_VILLAGEATTACK_TARGET_SCORE = [100, 200, 300];",
    "const EVENT_VILLAGEATTACK_TOTAL_TIME = 3600;",
    "var villageAttackEventInfo = {",
)

REQUIRED_REPLACEMENTS = (
    "怪物攻城活动状态常量已迁移到 script/js/village_attack_state.js",
    "怪物攻城活动默认状态已迁移到 script/js/village_attack_state.js",
)


def main() -> int:
    if not TARGET.exists():
        print(f"[village_attack_state_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")
    remaining = [marker for marker in OLD_MARKERS if marker in text]
    replacements = [marker for marker in REQUIRED_REPLACEMENTS if marker in text]

    if not remaining and len(replacements) == len(REQUIRED_REPLACEMENTS):
        print("[village_attack_state_check] patched: df_game_r.js no longer defines village attack state")
        return 0

    if remaining:
        print("[village_attack_state_check] pending: old village attack state definitions remain")
        for marker in remaining:
            print("  - " + marker)
        return 1

    print("[village_attack_state_check] broken: old definitions missing but replacement markers incomplete")
    return 2


if __name__ == "__main__":
    sys.exit(main())
