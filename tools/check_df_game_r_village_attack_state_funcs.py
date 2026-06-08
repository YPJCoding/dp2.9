#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether low-risk village-attack state functions were removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")

OLD_MARKERS = (
    "function reset_villageattack_info(",
    "function set_villageattack_dungeon_difficult(",
    "function event_villageattack_broadcast_difficulty(",
    "function event_villageattack_get_remain_time(",
)

REPLACEMENT_MARKER = "怪物攻城纯状态函数已迁移到 script/js/village_attack_state.js"


def main() -> int:
    if not TARGET.exists():
        print(f"[village_attack_state_funcs_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")
    remaining = [marker for marker in OLD_MARKERS if marker in text]

    if not remaining and REPLACEMENT_MARKER in text:
        print("[village_attack_state_funcs_check] patched: migrated state functions removed from df_game_r.js")
        return 0

    if remaining:
        print("[village_attack_state_funcs_check] pending: migrated state functions remain")
        for marker in remaining:
            print("  - " + marker)
        return 1

    print("[village_attack_state_funcs_check] broken: old functions missing but replacement marker not found")
    return 2


if __name__ == "__main__":
    sys.exit(main())
