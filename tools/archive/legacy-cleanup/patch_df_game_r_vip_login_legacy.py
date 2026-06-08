#!/usr/bin/env python3
"""Remove the legacy VIP login implementation from df_game_r.js.

The module script/js/vip_login.js already provides:
- startVipLogin()
- vip_Login() compatibility alias
- duplicate hook protection through g_vip_login_started
- compatibility for api_gameWorld_SendNotiPacketMessage naming

Usage:
    python3 tools/patch_df_game_r_vip_login_legacy.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "df_game_r.js"

OLD_BLOCK = """// ===== Feature: VIP Login (VIP 登录公告) =====\n\n// VIP 等级对应任务 ID（来源：dp2/df_game_r.js）\nfunction getQuestIds1() { return [8892]; }\nfunction getQuestIds2() { return [8893]; }\nfunction getQuestIds3() { return [8894]; }\nfunction getQuestIds4() { return [8895]; }\nfunction getQuestIds5() { return [8896]; }\n\n// 检查任务完成状态（来源：dp2/df_game_r.js）\nfunction Inspection_tasks(user, quest_ids) {\n\tconst WongWork_CQuestClear = CUser_getCurCharacQuestW(user).add(4);\n\tconst completedQuests = [];\n\tfor (var i = 0; i < quest_ids.length; i++) {\n\t\tif (WongWork_CQuestClear_isClearedQuest(WongWork_CQuestClear, quest_ids[i])) {\n\t\t\tcompletedQuests.push(quest_ids[i]);\n\t\t}\n\t}\n\treturn completedQuests;\n}\n\n// VIP 登录公告（来源：dp2/df_game_r.js）\nfunction vip_Login() {\n\tInterceptor.attach(ptr(0x86C4E50), {\n\t\tonEnter: function (args) { this.user = args[1]; },\n\t\tonLeave: function (retval) {\n\t\t\tconst user = this.user;\n\t\t\tconst c1 = Inspection_tasks(user, getQuestIds1()).length;\n\t\t\tconst c2 = Inspection_tasks(user, getQuestIds2()).length;\n\t\t\tconst c3 = Inspection_tasks(user, getQuestIds3()).length;\n\t\t\tconst c4 = Inspection_tasks(user, getQuestIds4()).length;\n\t\t\tconst c5 = Inspection_tasks(user, getQuestIds5()).length;\n\t\t\tif (c5 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip5玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }\n\t\t\telse if (c4 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip4玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }\n\t\t\telse if (c3 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip3玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }\n\t\t\telse if (c2 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip2玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }\n\t\t\telse if (c1 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip1玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }\n\t\t}\n\t});\n}\n\n"""

NEW_BLOCK = """// ===== Feature: VIP Login (VIP 登录公告) =====\n//\n// 旧内联实现已迁移到 script/js/vip_login.js。\n// 兼容入口 vip_Login() 由模块提供，避免主入口继续保留重复 hook 实现。\n\n"""


def main() -> int:
    content = TARGET.read_text(encoding="utf-8")

    if OLD_BLOCK not in content:
        raise SystemExit(
            "target block not found; df_game_r.js may have changed or the cleanup was already applied"
        )

    updated = content.replace(OLD_BLOCK, NEW_BLOCK, 1)

    remaining = [
        "function getQuestIds1()",
        "function Inspection_tasks(",
        "function vip_Login()",
    ]
    for marker in remaining:
        if marker in updated:
            raise SystemExit(f"legacy VIP login marker still exists after replacement: {marker}")

    TARGET.write_text(updated, encoding="utf-8")
    print("Removed legacy VIP login implementation from df_game_r.js")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
