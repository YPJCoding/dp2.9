#!/usr/bin/env python3
"""Remove the legacy return_user implementation from df_game_r.js.

This patch intentionally targets only the small legacy block that is already covered by
script/js/return_user.js, which provides both setReturnUser(day) and the compatibility
alias set_return_user(day).

Usage:
    python3 tools/patch_df_game_r_return_user_legacy.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "df_game_r.js"

OLD_BLOCK = """// ===== Feature: Return User (回归勇士) =====\n\n// 回归勇士时间设置（来源：dp2/frida.js）\nfunction set_return_user(day) {\n\tconst time = day * 86400;\n\tMemory.protect(ptr(0x84C753D), 32, 'rwx');\n\tptr(0x84C753D).writeU32(time);\n}\n\n"""

NEW_BLOCK = """// ===== Feature: Return User (回归勇士) =====\n//\n// 旧内联实现已迁移到 script/js/return_user.js。\n// 兼容入口 set_return_user(day) 由模块提供，避免主入口继续保留重复实现。\n\n"""


def main() -> int:
    content = TARGET.read_text(encoding="utf-8")

    if OLD_BLOCK not in content:
        raise SystemExit(
            "target block not found; df_game_r.js may have changed or the cleanup was already applied"
        )

    updated = content.replace(OLD_BLOCK, NEW_BLOCK, 1)

    if "function set_return_user(day)" in updated:
        raise SystemExit("legacy set_return_user(day) still exists after replacement")

    TARGET.write_text(updated, encoding="utf-8")
    print("Removed legacy return_user implementation from df_game_r.js")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
