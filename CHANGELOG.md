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
- Added business-level success/failure logging to quest, job, misc, inherit, cleanup, and PVP handlers.
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
- `signin` is migrated and wired but default-disabled; it needs test-server verification before enabling for players.
- Remaining safety-blocking work is mainly PVF/real-item verification and signin verification.
- `frida.js` is not treated as part of the default DP loading chain; DP defaults to `df_game_r.lua` and `df_game_r.js`.
