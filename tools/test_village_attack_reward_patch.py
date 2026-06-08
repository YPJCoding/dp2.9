#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regression tests for village-attack reward callback cleanup scripts."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import check_df_game_r_village_attack_reward as check_script
import patch_df_game_r_village_attack_reward as patch_script


SAMPLE_DF_GAME_R = """//怪物攻城副本回调奖励处理函数
function VillageAttackedRewardSendReward(user) {
	const VAttackCount = GetCurVAttackCount(user);
	const mail_title = "GM"
	const mail_contact = "怪物攻城奖励："
	switch (VAttackCount) {
		case 1:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3037, 5, mail_title, mail_contact);
			break;
		default:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3037, 5, mail_title, mail_contact);
	}
}

//增加魔法封印装备的魔法封印等级
function _boost_random_option_equ(inven_item) {
	return false;
}
"""


class VillageAttackRewardPatchTest(unittest.TestCase):
    def test_patch_removes_reward_callback_and_check_accepts_result(self) -> None:
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

                self.assertNotIn("function VillageAttackedRewardSendReward(", text)
                self.assertIn(check_script.REPLACEMENT_MARKER, text)
                self.assertIn("function _boost_random_option_equ(", text)
                self.assertEqual(check_script.main(), 0)
            finally:
                patch_script.TARGET = original_patch_target
                check_script.TARGET = original_check_target


if __name__ == "__main__":
    unittest.main()
