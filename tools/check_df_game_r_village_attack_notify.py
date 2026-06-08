#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether village-attack notify helpers were removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")

OLD_MARKERS = (
    "function gameworld_update_villageattack_score(",
    "function notify_villageattack_score(",
)

REPLACEMENT_MARKER = "怪物攻城 UI/进度通知函数已迁移到 script/js/village_attack_notify.js"


def main() -> int:
    if not TARGET.exists():
        print(f"[village_attack_notify_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")
    remaining = [marker for marker in OLD_MARKERS if marker in text]

    if not remaining and REPLACEMENT_MARKER in text:
        print("[village_attack_notify_check] patched: migrated notify helpers removed from df_game_r.js")
        return 0

    if remaining:
        print("[village_attack_notify_check] pending: migrated notify helpers remain")
        for marker in remaining:
            print("  - " + marker)
        return 1

    print("[village_attack_notify_check] broken: old functions missing but replacement marker not found")
    return 2


if __name__ == "__main__":
    sys.exit(main())
