#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check df_game_r.js start() migration status.

This checker is intentionally read-only. It distinguishes three states:

- pending: the old start() block is still present and the patch script should be run.
- patched: df_game_r.js already loads startup_helpers/startup_modules and calls startMigratedModules(cfg).
- broken: mixed or unsafe structure that needs manual review before patching.

Usage from repo root:
    python3 tools/check_df_game_r_start.py
"""

from __future__ import annotations

import sys
from pathlib import Path

TARGET = Path("df_game_r.js")

REQUIRED_STARTUP_LINES = (
    "dp_load('startup_helpers');",
    "dp_load('startup_modules');",
    "startMigratedModules(cfg);",
)

OLD_DIRECT_START_CALLS = (
    "fix_use_emblem();",
    "hook_history_log();",
    "hook_user_inout_game_world();",
    "enable_online_reward();",
    "change_random_option_inherit();",
    "auto_unseal_random_option_equipment();",
    "enable_drop_use_luck_point();",
    "dp_load('patches');",
    "start_event_lucky_online_user();",
    "startRanking();",
    "startHiddenOption();",
    "setReturnUser(15);",
    "startVipLogin();",
    "vip_Login();",
)

STRAY_BRIDGE_PREFIX = """// Bridge: Frida Integration
// dp2_resolver, frida_main, frida_handler, rpc.exports
}
"""


def fail(message: str) -> int:
    print(f"[df_game_r_start] broken: {message}")
    return 2


def find_start_body(text: str) -> tuple[str, str] | None:
    start_marker = "//加载主功能\nfunction start() {"
    success_marker = "console.log('[' + get_timestamp() + '] [frida] [info] ----------------------- set function success ------------------------');"
    start_pos = text.find(start_marker)
    if start_pos < 0:
        return None
    success_pos = text.find(success_marker, start_pos)
    if success_pos < 0:
        return None
    success_end = text.find("\n", success_pos)
    if success_end < 0:
        success_end = len(text)
    body = text[start_pos:success_end]
    after_success = text[success_end:success_end + 8]
    return body, after_success


def main() -> int:
    if not TARGET.exists():
        return fail(f"missing target file: {TARGET}")

    text = TARGET.read_text(encoding="utf-8")
    found = find_start_body(text)
    if found is None:
        return fail("cannot locate start() or set function success marker")

    start_body, after_success = found
    has_startup_lines = all(line in start_body for line in REQUIRED_STARTUP_LINES)
    has_old_direct_calls = any(call in start_body for call in OLD_DIRECT_START_CALLS)
    closes_after_success = after_success.startswith("\n}\n") or after_success.startswith("\n}\r\n")
    has_stray_bridge_brace = STRAY_BRIDGE_PREFIX in text

    if has_startup_lines and not has_old_direct_calls and closes_after_success and not has_stray_bridge_brace:
        print("[df_game_r_start] patched: start() is using startup_modules and has expected brace structure")
        return 0

    if (not has_startup_lines) and has_old_direct_calls and (not closes_after_success) and has_stray_bridge_brace:
        print("[df_game_r_start] pending: old start() is still present; run tools/patch_df_game_r_start.py")
        return 1

    details = []
    details.append(f"startup_lines={'yes' if has_startup_lines else 'no'}")
    details.append(f"old_direct_calls={'yes' if has_old_direct_calls else 'no'}")
    details.append(f"closes_after_success={'yes' if closes_after_success else 'no'}")
    details.append(f"stray_bridge_brace={'yes' if has_stray_bridge_brace else 'no'}")
    return fail("mixed start() state: " + ", ".join(details))


if __name__ == "__main__":
    sys.exit(main())
