#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether hook_history_log was removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")
OLD_MARKER = "function hook_history_log("
REPLACEMENT_MARKER = "历史日志追踪函数已迁移到 script/js/history_log.js"


def main() -> int:
    if not TARGET.exists():
        print(f"[history_log_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")

    if OLD_MARKER not in text and REPLACEMENT_MARKER in text:
        print("[history_log_check] patched: helper removed from df_game_r.js")
        return 0

    if OLD_MARKER in text:
        print("[history_log_check] pending: helper remains")
        print("  - " + OLD_MARKER)
        return 1

    print("[history_log_check] broken: helper missing but replacement marker not found")
    return 2


if __name__ == "__main__":
    sys.exit(main())
