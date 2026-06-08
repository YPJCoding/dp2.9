#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether village-attack DB helpers were removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")
OLD_MARKERS = (
    "function event_villageattack_save_to_db(",
    "function event_villageattack_load_from_db(",
)
REPLACEMENT_MARKER = "怪物攻城 DB 存档函数已迁移到 script/js/village_attack_db.js"


def main() -> int:
    if not TARGET.exists():
        print(f"[village_attack_db_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")
    remaining = [marker for marker in OLD_MARKERS if marker in text]

    if not remaining and REPLACEMENT_MARKER in text:
        print("[village_attack_db_check] patched: db helpers removed from df_game_r.js")
        return 0

    if remaining:
        print("[village_attack_db_check] pending: db helpers remain")
        for marker in remaining:
            print("  - " + marker)
        return 1

    print("[village_attack_db_check] broken: db helpers missing but replacement marker not found")
    return 2


if __name__ == "__main__":
    sys.exit(main())
