#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether batch item notification helpers were removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")
OLD_MARKERS = (
    "function api_CUser_Add_Item_list(",
    "function SendItemWindowNotification(",
)
REPLACEMENT_MARKER = "批量物品 UI 通知函数已迁移到 script/js/batch_item_notify.js"


def main() -> int:
    if not TARGET.exists():
        print(f"[batch_item_notify_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")
    remaining = [marker for marker in OLD_MARKERS if marker in text]

    if not remaining and REPLACEMENT_MARKER in text:
        print("[batch_item_notify_check] patched: helpers removed from df_game_r.js")
        return 0

    if remaining:
        print("[batch_item_notify_check] pending: helpers remain")
        for marker in remaining:
            print("  - " + marker)
        return 1

    print("[batch_item_notify_check] broken: helpers missing but replacement marker not found")
    return 2


if __name__ == "__main__":
    sys.exit(main())
