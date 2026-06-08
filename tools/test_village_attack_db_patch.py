#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regression tests for village-attack DB cleanup scripts."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import check_df_game_r_village_attack_db as check_script
import patch_df_game_r_village_attack_db as patch_script


SAMPLE_DF_GAME_R = """function uninit_db() {
	if (mysql_frida) {
		MySQL_close(mysql_frida);
		mysql_frida = null;
	}
}

//怪物攻城活动数据存档
function event_villageattack_save_to_db() {
	api_MySQL_exec(mysql_frida, "replace into game_event (event_id, event_info) values ('villageattack', '" + JSON.stringify(villageAttackEventInfo) + "');");
}

//从数据库载入怪物攻城活动数据
function event_villageattack_load_from_db() {
	if (api_MySQL_exec(mysql_frida, "select event_info from game_event where event_id = 'villageattack';")) {
		if (MySQL_get_n_rows(mysql_frida) == 1) {
			MySQL_fetch(mysql_frida);
			const info = api_MySQL_get_str(mysql_frida, 0);
			villageAttackEventInfo = JSON.parse(info);
		}
	}
}

//处理到期的自定义定时器
function do_timer_dispatch() {
}
"""


class VillageAttackDbPatchTest(unittest.TestCase):
    def test_patch_removes_db_helpers_and_check_accepts_result(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "df_game_r.js"
            target.write_text(SAMPLE_DF_GAME_R, encoding="utf-8")

            original_patch_target = patch_script.TARGET
            original_check_target = check_script.TARGET
            try:
                patch_script.TARGET = target
                check_script.TARGET = target

                self.assertEqual(patch_script.main(), 0)
                text = target.read_text(encoding="utf-8")

                self.assertNotIn("function event_villageattack_save_to_db(", text)
                self.assertNotIn("function event_villageattack_load_from_db(", text)
                self.assertIn(check_script.REPLACEMENT_MARKER, text)
                self.assertIn("function do_timer_dispatch()", text)
                self.assertEqual(check_script.main(), 0)
            finally:
                patch_script.TARGET = original_patch_target
                check_script.TARGET = original_check_target


if __name__ == "__main__":
    unittest.main()
