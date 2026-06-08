#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check whether village-attack startup flow functions were removed from df_game_r.js."""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")

OLD_MARKERS = (
    "function event_villageattack_timer(",
    "function start_villageattack(",
    "function on_start_event_villageattack(",
    "function start_event_villageattack_timer(",
    "function start_event_villageattack(",
)

REPLACEMENT_MARKER = "怪物攻城启动流程和活动计时器已迁移到 script/js/village_attack_flow.js"


def main() -> int:
    if not TARGET.exists():
        print(f"[village_attack_flow_check] broken: missing {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8")
    remaining = [marker for marker in OLD_MARKERS if marker in text]

    if not remaining and REPLACEMENT_MARKER in text:
        print("[village_attack_flow_check] patched: migrated flow functions removed from df_game_r.js")
        return 0

    if remaining:
        print("[village_attack_flow_check] pending: migrated flow functions remain")
        for marker in remaining:
            print("  - " + marker)
        return 1

    print("[village_attack_flow_check] broken: old functions missing but replacement marker not found")
    return 2


if __name__ == "__main__":
    sys.exit(main())
