#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether hook_VillageAttack was removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")
OLD_MARKER = "function hook_VillageAttack("
REPLACEMENT_MARKER = "怪物攻城 hook 已迁移到 script/js/village_attack_hook.js"


def main() -> int:
    if not TARGET.exists():
        print(f"[village_attack_hook_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")

    if OLD_MARKER not in text and REPLACEMENT_MARKER in text:
        print("[village_attack_hook_check] patched: hook_VillageAttack removed from df_game_r.js")
        return 0

    if OLD_MARKER in text:
        print("[village_attack_hook_check] pending: hook_VillageAttack remains in df_game_r.js")
        return 1

    print("[village_attack_hook_check] broken: hook missing but replacement marker not found")
    return 2


if __name__ == "__main__":
    sys.exit(main())
