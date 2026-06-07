# Changelog

## Unreleased

### Added

- Added README for the `dp2.9` base branch.
- Added architecture documentation.
- Added coding standards.
- Added initial code review notes for `df_game_r.lua` and `df_game_r.js`.
- Added Lua config module: `script/config.lua`.
- Added Lua utils module: `script/utils.lua`.
- Added Lua bootstrap module: `script/bootstrap.lua`.
- Added handler module directory and module implementations for:
  - quest
  - job
  - item cleanup
  - inherit
  - pvp
  - misc
- Added infrastructure and gameplay modules for:
  - online tracking
  - broadcast
  - GM permission checks
  - item query
  - player info
  - command menu
  - command help
  - signin
  - experience dungeon
  - dungeon gate
  - drop rules
  - finish back home
- Added legacy patch module `script/modules/legacy_patches.lua` for migrated dp2 entry hooks:
  - tower gold notice fix
  - save-town fix
  - open extra dungeons
- Added hot reload module `script/modules/hot_reload.lua` for config-driven runtime tuning.
- Added runtime smoke test checklist: `docs/RUNTIME_SMOKE_TEST_CHECKLIST.md`.
- Added signin test checklist: `docs/SIGNIN_TEST_CHECKLIST.md`.
- Added player info test checklist: `docs/PLAYER_INFO_TEST_CHECKLIST.md`.
- Added next migration TODO list: `docs/NEXT_MIGRATION_TODO.md`.
- Added Frida migration status document: `docs/FRIDA_MIGRATION_STATUS.md`.
- Added Frida startup audit document: `docs/FRIDA_STARTUP_AUDIT.md`.
- Added Frida high-risk TODO document: `docs/FRIDA_HIGH_RISK_TODO.md`.
- Added drop announce JS module: `script/js/drop_announce.js`.
- Added emblem fix JS module: `script/js/emblem_fix.js`.
- Added luck point drop JS module: `script/js/luck_point_drop.js`.
- Added random option JS module: `script/js/random_option.js`.
- Added online reward JS module: `script/js/online_reward.js`.
- Added lucky online compatibility JS module: `script/js/lucky_online.js`.
- Added history log JS module: `script/js/history_log.js`.
- Added batch item notify JS module: `script/js/batch_item_notify.js`.
- Added user use item event JS module: `script/js/user_use_item_event.js`.
- Added user inout compatibility JS module: `script/js/user_inout.js`.
- Added migrated JS startup module: `script/js/startup_modules.js`.
- Added P3 refactor plan.
- Added `df_game_r.js` audit notes.
- Added `df_game_r.js` index draft.
- Added `dp2` reference evaluation notes.
- Added risk guide.

### Changed

- Updated README TODO list with completed documentation, template, audit, runtime wiring, and server smoke-test steps.
- Updated architecture document with current module migration status.
- Changed `df_game_r.lua` into a lightweight runtime entry that loads `script/bootstrap.lua`.
- Wired modular handlers through `bootstrap.setup(...)`.
- Registered `UseItem1` as the normal right-click consumable dispatch entry.
- Kept `UseItem2` as a compatibility dispatch entry.
- Centralized DPX startup behavior in `script/config.lua` and `bootstrap.apply_dpx_startup(...)`.
- Aligned high-risk handler defaults: SQL, delete, and shell handlers are disabled by default.
- Tightened handler risk gates for combined-risk features:
  - pet/avatar cleanup requires both delete and SQL risk switches.
  - PVP experience book requires both shell and SQL risk switches.
- Added business-level success/failure logging to quest, job, misc, inherit, and PVP handlers.
- Wired `legacy_patches` through bootstrap and config; the module and all sub-features are disabled by default.
- Reworked `hot_reload` to watch only `script/config.lua`; `Work_Reload.lua` script execution was removed.
- Reorganized `script/config.lua` by reload scope:
  - `hot` for supported runtime hot-config values.
  - `[BOOT]` sections for restart-required registration, startup, risk, and JS/Frida settings.
- Updated `finish_back_home` defaults:
  - `default_mode = "5"`, only random point reward by default.
  - `equipment_rarities = {0, 1}`, only normal and advanced equipment are processed by disjoint/sell modes.
- Added `signin` config and bootstrap wiring:
  - `features.enable_signin = false` by default.
  - `signin.command = "//qd"`.
  - default reward remains `3340 x1` by mail.
  - reset hour remains 6.
  - sign-in state remains in memory to match old script behavior.
- Added `player_info` config and bootstrap wiring:
  - `features.enable_player_info = true` by default.
  - `player_info.command = "//myinfo"`.
  - command only reads the current character's basic info.
- Added `command_menu` config and bootstrap wiring:
  - `features.enable_command_menu = true` by default.
  - `command_menu.command = "//指令"`.
  - menu only shows migrated safe commands and hides high-risk unavailable GM commands.
- Added `command_help` config and bootstrap wiring:
  - `features.enable_command_help = true` by default.
  - `//getq`, `//clearq`, `//zhiye`, and `//pvp` only show safe help text.
  - legacy high-risk subcommands such as forced quest accept, job/grow/wake changes, and PVP SQL updates remain unavailable.
- Added `//view` item query help and legacy no-space query compatibility:
  - `//view` shows query usage.
  - `//viewid <name>` and `//viewid<name>` both query item IDs.
  - `//viewname <id>` and `//viewname<id>` both query item names.
- Hardened Frida `additem` callback to check `js_features.enable_batch_item_add`, validate account and item IDs, and require the target user to be online before adding items.
- Continued Frida migration hardening:
  - `script/js/startup_helpers.js` now resolves startup functions through `globalThis`, current context, and `eval(functionName)` fallback before reporting a missing function.
  - `script/js/startup_modules.js` now provides `startMigratedModules(cfg)` to centralize startup for already split JS modules, including `patches` and default-disabled `account_cargo`.
  - `script/js/ranking.js` now waits/retries when DB handles are not ready and falls back when guild-name helpers are unavailable.
  - `script/js/vip_login.js` now uses the correct broadcast helper name, adds duplicate hook protection, keeps the old `vip_Login()` alias, and adds compatibility for the old lowercase broadcast helper name.
  - `script/js/patches.js` now guards duplicate patch startup and restores the old strengthen-refresh user/slot argument behavior.
  - `script/js/hidden_option.js` now guards duplicate hook startup and keeps the old `start_hidden_option()` alias.
  - `script/js/return_user.js` now validates day values, avoids duplicate patch writes, and keeps the old `set_return_user()` alias.
  - `script/js/drop_announce.js` was extracted from the residual `processing_data(...)` logic in `df_game_r.js`; it remains default-disabled because it broadcasts drops and grants cera.
  - `script/js/emblem_fix.js` was extracted from the old `fix_use_emblem()` implementation and adds duplicate hook protection while preserving the old `fix_use_emblem()` alias.
  - `script/js/luck_point_drop.js` was extracted from the old `enable_drop_use_luck_point()` implementation and adds duplicate attach/replace protection while preserving old compatibility aliases.
  - `script/js/random_option.js` was extracted from the old random-option inherit and auto-unseal implementations and adds duplicate hook protection while preserving old compatibility aliases.
  - `script/js/online_reward.js` was extracted from the old `enable_online_reward()` implementation and adds duplicate hook protection while preserving the old alias.
  - `script/js/lucky_online.js` was added as a compatibility stub for the missing `start_event_lucky_online_user()` implementation; it does not implement random-online-player draw, cera, item, or mail rewards.
  - `script/js/history_log.js` was extracted from the old `hook_history_log()` implementation and adds duplicate hook protection while preserving the old alias.
  - `script/js/batch_item_notify.js` was extracted from the old batch item add UI notification helpers while preserving old compatibility aliases.
  - `script/js/user_use_item_event.js` was extracted from the old `UserUseItemEvent()` implementation and keeps only the previously active mount-transformer return-mail branch.
  - `script/js/user_inout.js` was added as a compatibility stub for the missing `hook_user_inout_game_world()` implementation; it does not implement ranking, village-attack UI, or luck-point business logic.
  - `js_features.enable_drop_announce` is now default-disabled.
- Synced Frida high-risk tracking:
  - `docs/FRIDA_HIGH_RISK_TODO.md` now tracks account cargo, village attack, luck-point drop, online rewards, lucky online users, and drop announce separately.
  - `docs/FRIDA_MIGRATION_STATUS.md` links high-risk features to the dedicated TODO document.
- Synced `DP2_UNMIGRATED_FEATURES.md`, `HANDLER_MIGRATION_MAP.md`, and `ROADMAP.md` after implementation audits.
- Synced `ROADMAP.md` and `DP2_UNMIGRATED_FEATURES.md` with current config-only hot reload and finish_back_home testing status.
- Marked `hot.finish_back_home.default_mode` hot reload verification as passed for modes `0`, `5`, and `1`.
- Marked `finish_back_home` mode `5` random-point-only behavior as verified.
- Marked `finish_back_home` equipment rarity filtering as verified for modes `2`, `3`, and `4`.
- Marked runtime smoke tests as verified:
  - handler total switch disables handler registration.
  - level cap remains 85 and auction minimum level remains 10.
  - hot_reload timer starts and watches `script/config.lua`.
  - legacy_patches default-disabled and per-feature enable paths work.
  - SQL/delete/shell high-risk handlers reject and return items by default.
- Updated safety progress estimates to approximately 96% for the safe deployable base and 70% for complete feature recovery.

### Fixed

- Fixed level cap startup wiring to call `dpx.set_max_level(...)` instead of `dpx.set_auction_min_level(...)`.
- Fixed the fallback startup path in `df_game_r.lua` to use `dpx.set_max_level(85)`.
- Fixed `features.enable_item_handlers` so it now actually disables handler registration.
- Fixed `item_query` GmInput passthrough calls to use `fnext()` consistently.
- Fixed `finish_back_home` so `mode=0` is fully inert and does not grant points or trigger return/disjoint/sell behavior.
- Fixed `finish_back_home` GameEvent handling to avoid calling `fnext()` twice for dungeon-finish events.
- Fixed `dungeon_gate` hook registration so configured rules register a valid `on_game_event` function and avoid duplicate hook registration.
- Fixed `inherit` amplify checks to tolerate missing `amplify` fields and avoid nil-index crashes.
- Hardened config hot reload so syntax errors, invalid config return types, or module configure failures keep the previous config active and log `keep previous config`.

### Removed

- Removed `script/Work_Reload.lua`; config hot reload is now handled directly through `script/config.lua`.

### Notes

- The migration branch now contains runtime entry wiring and modular handler loading.
- Runtime smoke tests for the safe deployable base have passed.
- High-risk handlers are present but gated by config switches; default rejection/return behavior is verified.
- Legacy entry patches are present, default-disabled, and their enable paths are verified.
- Hot reload is enabled by default and currently applies only explicitly supported runtime config, starting with `hot.finish_back_home`.
- `finish_back_home` main modes and equipment rarity filtering are verified.
- `signin`, `player_info`, `command_menu`, `command_help`, and `item_query` help are migrated and wired; they are listed in `docs/NEXT_MIGRATION_TODO.md` for later test-server verification.
- Frida/JS migration status is tracked in `docs/FRIDA_MIGRATION_STATUS.md`; `drop_announce` has been extracted to `script/js/drop_announce.js` but remains default-disabled and not yet wired into startup.
- Frida startup risks and the `df_game_r.js` entrypoint cleanup plan are tracked in `docs/FRIDA_STARTUP_AUDIT.md`.
- Frida high-risk feature拆分与专项验证项 are tracked in `docs/FRIDA_HIGH_RISK_TODO.md`.
- `pvp` shell/SQL restoration remains high risk because it trusts SQL generated by `/dp2/script/pvp_exp_inc.sh`; do not enable both risk switches before dedicated script review.
- Remaining safety-blocking work is mainly PVF/real-item verification and pending verification of newly migrated low-risk command modules.
- `frida.js` is not treated as part of the default DP loading chain; DP defaults to `df_game_r.lua` and `df_game_r.js`.
