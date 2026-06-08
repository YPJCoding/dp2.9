#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Remove migrated low-risk village-attack state functions from df_game_r.js.

This removes only the pure state/helper functions now provided by
script/js/village_attack_state.js:

- reset_villageattack_info
- set_villageattack_dungeon_difficult
- event_villageattack_broadcast_difficulty
- event_villageattack_get_remain_time

It intentionally does not remove timers, startup flow, packets, hooks, PT logic,
DB save/load, rewards, or any function with packet/native side effects beyond the
same memory write / broadcast helper now covered by village_attack_state.js.

Usage from repo root:
    python3 tools/patch_df_game_r_village_attack_state_funcs.py
    python3 tools/check_df_game_r_village_attack_state_funcs.py
"""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")

FUNCTION_NAMES = (
    "reset_villageattack_info",
    "set_villageattack_dungeon_difficult",
    "event_villageattack_broadcast_difficulty",
    "event_villageattack_get_remain_time",
)

REPLACEMENT_HEADER = """// 怪物攻城纯状态函数已迁移到 script/js/village_attack_state.js。
// 保留旧函数名兼容：reset_villageattack_info / set_villageattack_dungeon_difficult /
// event_villageattack_broadcast_difficulty / event_villageattack_get_remain_time。

"""


def find_function_block(text: str, name: str) -> tuple[int, int] | None:
    marker = f"function {name}("
    start = text.find(marker)
    if start < 0:
        return None

    # Include immediately preceding line comment when present.
    block_start = start
    prev_line_start = text.rfind("\n", 0, start - 1)
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
        print(f"[village_attack_state_funcs_patch] missing {TARGET}", file=sys.stderr)
        return 2

    text = TARGET.read_text(encoding="utf-8")
    original = text

    if REPLACEMENT_HEADER in text:
        print("[village_attack_state_funcs_patch] replacement marker already exists")
    else:
        first = find_function_block(text, FUNCTION_NAMES[0])
        if first is None:
            print("[village_attack_state_funcs_patch] first migrated function not found", file=sys.stderr)
            return 2
        text = text[:first[0]] + REPLACEMENT_HEADER + text[first[0]:]

    for name in FUNCTION_NAMES:
        found = find_function_block(text, name)
        if found is None:
            continue
        start, end = found
        text = text[:start] + text[end:]

    if text == original:
        print("[village_attack_state_funcs_patch] no changes")
        return 0

    TARGET.write_text(text, encoding="utf-8")
    print("[village_attack_state_funcs_patch] patched df_game_r.js")
    return 0


if __name__ == "__main__":
    sys.exit(main())
