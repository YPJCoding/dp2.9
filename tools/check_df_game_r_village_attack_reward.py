#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether village-attack reward callback was removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")
OLD_MARKERS = (
    "function VillageAttackedRewardSendReward(",
)
REPLACEMENT_MARKER = "怪物攻城副本回调奖励函数已迁移到 script/js/village_attack_hook.js"


def main() -> int:
    if not TARGET.exists():
        print(f"[village_attack_reward_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")
    remaining = [marker for marker in OLD_MARKERS if marker in text]

    if not remaining and REPLACEMENT_MARKER in text:
        print("[village_attack_reward_check] patched: reward callback removed from df_game_r.js")
        return 0

    if remaining:
        print("[village_attack_reward_check] pending: reward callback remains")
        for marker in remaining:
            print("  - " + marker)
        return 1

    print("[village_attack_reward_check] broken: reward callback missing but replacement marker not found")
    return 2


if __name__ == "__main__":
    sys.exit(main())
