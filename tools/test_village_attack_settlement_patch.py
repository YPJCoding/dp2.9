#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regression tests for village-attack settlement cleanup scripts."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import check_df_game_r_village_attack_settlement as check_script
import patch_df_game_r_village_attack_settlement as patch_script


SAMPLE_DF_GAME_R = """//结束怪物攻城活动(立即销毁攻城怪物, 不开启逆袭之谷, 不发送活动奖励)
function end_villageattack() {
	village_attacked_CVillageMonsterMgr_OnDestroyVillageMonster(GlobalData_s_villageMonsterMgr.readPointer(), 2);
}

//结束怪物攻城活动
function on_end_event_villageattack() {
	end_villageattack();
	event_villageattack_save_to_db();
	start_event_villageattack_timer();
}

//无条件完成指定任务并领取奖励
function api_force_clear_quest(user, quest_id) {
	return true;
}
"""


class VillageAttackSettlementPatchTest(unittest.TestCase):
    def test_patch_removes_settlement_helpers_and_check_accepts_result(self) -> None:
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

                self.assertNotIn("function end_villageattack(", text)
                self.assertNotIn("function on_end_event_villageattack(", text)
                self.assertIn(check_script.REPLACEMENT_MARKER, text)
                self.assertIn("function api_force_clear_quest(", text)
                self.assertEqual(check_script.main(), 0)
            finally:
                patch_script.TARGET = original_patch_target
                check_script.TARGET = original_check_target


if __name__ == "__main__":
    unittest.main()
