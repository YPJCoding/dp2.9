#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Remove migrated luck-point helper from df_game_r.js.

The active implementation is now provided by script/js/luck_point_drop.js.

This removes only:

- enable_drop_use_luck_point

It intentionally keeps shared helpers used by the still-present hook_user_inout_game_world:

- MAX_LUCK_POINT / MIN_LUCK_POINT constants
- api_CUserCharacInfo_SetCurCharacLuckPoint
- use_ftcoin_change_luck_point

Usage from repo root:
    python3 tools/patch_df_game_r_luck_point_drop.py
    python3 tools/check_df_game_r_luck_point_drop.py
"""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")
FUNCTION_NAME = "enable_drop_use_luck_point"
REPLACEMENT_HEADER = """// 幸运点影响掉落品质函数已迁移到 script/js/luck_point_drop.js。
// 迁移模块提供 startLuckPointDrop() 替代旧 enable_drop_use_luck_point() 入口。
// df_game_r.js 保留使用中的幸运点辅助函数（use_ftcoin_change_luck_point、API 等）供 hook_user_inout_game_world 复用。

"""


def find_function_block(text: str, name: str) -> tuple[int, int] | None:
    marker = f"function {name}("
    start = text.find(marker)
    if start < 0:
        return None

    block_start = start
    prev_line_start = text.rfind("\n", 0, start)
    if prev_line_start >= 0:
        prev_prev_line_start = text.rfind("\n", 0, prev_line_start - 1)
        candidate_start = prev_prev_line_start + 1 if prev_prev_line_start >= 0 else 0
        candidate = text[candidate_start:prev_line_start].strip()
        if candidate.startswith("//"):
            block_start = candidate_start

    open_brace = text.find("{", start)
    if open_brace < 0:
        raise ValueError(f"function {name}: missing opening brace")

    depth = 0
    in_string: str | None = None
    escape = False
    i = open_brace
    while i < len(text):
        ch = text[i]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_string:
                in_string = None
        else:
            if ch in ("'", '"', "`"):
                in_string = ch
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    if end < len(text) and text[end] == "\r":
                        end += 1
                    if end < len(text) and text[end] == "\n":
                        end += 1
                    return block_start, end
        i += 1

    raise ValueError(f"function {name}: missing closing brace")


def main() -> int:
    if not TARGET.exists():
        print(f"[luck_point_drop_patch] missing {TARGET}", file=sys.stderr)
        return 2

    text = TARGET.read_text(encoding="utf-8")
    original = text

    if REPLACEMENT_HEADER not in text:
        found = find_function_block(text, FUNCTION_NAME)
        if found is None:
            print("[luck_point_drop_patch] function not found", file=sys.stderr)
            return 2
        text = text[:found[0]] + REPLACEMENT_HEADER + text[found[0]:]

    found = find_function_block(text, FUNCTION_NAME)
    if found is not None:
        start, end = found
        text = text[:start] + text[end:]

    if text == original:
        print("[luck_point_drop_patch] no changes")
        return 0

    TARGET.write_text(text, encoding="utf-8")
    print("[luck_point_drop_patch] patched df_game_r.js")
    return 0


if __name__ == "__main__":
    sys.exit(main())
