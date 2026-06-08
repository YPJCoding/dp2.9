#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether enable_drop_use_luck_point was removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")
OLD_MARKER = "function enable_drop_use_luck_point("
REPLACEMENT_MARKER = "幸运点影响掉落品质函数已迁移到 script/js/luck_point_drop.js"
REQUIRED_HELPERS = (
    "function api_CUserCharacInfo_SetCurCharacLuckPoint(",
    "function use_ftcoin_change_luck_point(",
)


def main() -> int:
    if not TARGET.exists():
        print(f"[luck_point_drop_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")
    missing_helpers = [marker for marker in REQUIRED_HELPERS if marker not in text]

    if missing_helpers:
        print("[luck_point_drop_check] broken: required shared helpers missing")
        for marker in missing_helpers:
            print("  - " + marker)
        return 2

    if OLD_MARKER not in text and REPLACEMENT_MARKER in text:
        print("[luck_point_drop_check] patched: helper removed from df_game_r.js")
        return 0

    if OLD_MARKER in text:
        print("[luck_point_drop_check] pending: helper remains")
        print("  - " + OLD_MARKER)
        return 1

    print("[luck_point_drop_check] broken: helper missing but replacement marker not found")
    return 2


if __name__ == "__main__":
    sys.exit(main())
