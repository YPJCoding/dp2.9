#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether random-option helpers were removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")
OLD_MARKERS = (
    "function _boost_random_option_equ(",
    "function boost_random_option_equ(",
    "function change_random_option_inherit(",
    "function auto_unseal_random_option_equipment(",
)
REPLACEMENT_MARKER = "随机属性相关函数已迁移到 script/js/random_option.js"


def main() -> int:
    if not TARGET.exists():
        print(f"[random_option_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")
    remaining = [marker for marker in OLD_MARKERS if marker in text]

    if not remaining and REPLACEMENT_MARKER in text:
        print("[random_option_check] patched: helpers removed from df_game_r.js")
        return 0

    if remaining:
        print("[random_option_check] pending: helpers remain")
        for marker in remaining:
            print("  - " + marker)
        return 1

    print("[random_option_check] broken: helpers missing but replacement marker not found")
    return 2


if __name__ == "__main__":
    sys.exit(main())
