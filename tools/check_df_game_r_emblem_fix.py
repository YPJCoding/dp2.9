#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether fix_use_emblem was removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")
OLD_MARKER = "function fix_use_emblem("
REPLACEMENT_MARKER = "时装镶嵌修复函数已迁移到 script/js/emblem_fix.js"
REQUIRED_HELPERS = (
    "function api_get_avatar_ui_id(",
    "function api_set_JewelSocketData(",
)


def main() -> int:
    if not TARGET.exists():
        print(f"[emblem_fix_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")
    missing_helpers = [marker for marker in REQUIRED_HELPERS if marker not in text]

    if missing_helpers:
        print("[emblem_fix_check] broken: required shared helpers missing")
        for marker in missing_helpers:
            print("  - " + marker)
        return 2

    if OLD_MARKER not in text and REPLACEMENT_MARKER in text:
        print("[emblem_fix_check] patched: helper removed from df_game_r.js")
        return 0

    if OLD_MARKER in text:
        print("[emblem_fix_check] pending: helper remains")
        print("  - " + OLD_MARKER)
        return 1

    print("[emblem_fix_check] broken: helper missing but replacement marker not found")
    return 2


if __name__ == "__main__":
    sys.exit(main())
