#!/usr/bin/env python3
"""Remove the legacy hidden_option implementation from df_game_r.js.

The module script/js/hidden_option.js already provides:
- startHiddenOption()
- start_hidden_option() compatibility alias
- duplicate hook protection through g_hidden_option_started

Usage:
    python3 tools/patch_df_game_r_hidden_option_legacy.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "df_game_r.js"

OLD_BLOCK = """// ===== Feature: Hidden Option (时装潜能) =====\n\n// 随机数辅助函数（来源：dp2/frida.js）\nfunction get_random_int(min, max) {\n\treturn Math.floor(Math.random() * (max - min)) + min;\n}\n\n// 覆盖系统分配属性并下发随机时装潜能（来源：dp2/frida.js）\nfunction hidden_option() {\n\tMemory.protect(ptr(0x08509D49), 3, 'rwx');\n\tptr(0x08509D49).writeByteArray([0xEB]);\n\n\tMemory.protect(ptr(0x08509D34), 3, 'rwx');\n\tptr(0x08509D34).writeUShort(get_random_int(1, 64));\n}\n\n// 挂接时装潜能激活钩子（来源：dp2/frida.js）\nfunction start_hidden_option() {\n\tInterceptor.attach(ptr(0x08509B9E), {\n\t\tonEnter: function (args) { hidden_option(); },\n\t\tonLeave: function (retval) {}\n\t});\n\tInterceptor.attach(ptr(0x0817EDEC), {\n\t\tonEnter: function (args) {},\n\t\tonLeave: function (retval) { retval.replace(1); }\n\t});\n}\n\n"""

NEW_BLOCK = """// ===== Feature: Hidden Option (时装潜能) =====\n//\n// 旧内联实现已迁移到 script/js/hidden_option.js。\n// 兼容入口 start_hidden_option() 由模块提供，避免主入口继续保留重复 hook 实现。\n\n"""


def main() -> int:
    content = TARGET.read_text(encoding="utf-8")

    if OLD_BLOCK not in content:
        raise SystemExit(
            "target block not found; df_game_r.js may have changed or the cleanup was already applied"
        )

    updated = content.replace(OLD_BLOCK, NEW_BLOCK, 1)

    remaining = [
        "function hidden_option()",
        "function start_hidden_option()",
    ]
    for marker in remaining:
        if marker in updated:
            raise SystemExit(f"legacy hidden option marker still exists after replacement: {marker}")

    TARGET.write_text(updated, encoding="utf-8")
    print("Removed legacy hidden_option implementation from df_game_r.js")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
