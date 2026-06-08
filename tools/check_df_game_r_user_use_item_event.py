#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether UserUseItemEvent was removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")
OLD_MARKER = "function UserUseItemEvent("
REPLACEMENT_MARKER = "角色使用道具事件函数已迁移到 script/js/user_use_item_event.js"


def main() -> int:
    if not TARGET.exists():
        print(f"[user_use_item_event_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")

    if OLD_MARKER not in text and REPLACEMENT_MARKER in text:
        print("[user_use_item_event_check] patched: helper removed from df_game_r.js")
        return 0

    if OLD_MARKER in text:
        print("[user_use_item_event_check] pending: helper remains")
        print("  - " + OLD_MARKER)
        return 1

    print("[user_use_item_event_check] broken: helper missing but replacement marker not found")
    return 2


if __name__ == "__main__":
    sys.exit(main())
