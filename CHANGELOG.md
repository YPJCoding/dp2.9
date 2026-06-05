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
  - experience dungeon
  - dungeon gate
  - drop rules
  - finish back home
- Added legacy patch module `script/modules/legacy_patches.lua` for migrated dp2 entry hooks:
  - tower gold notice fix
  - save-town fix
  - open extra dungeons
- Added hot reload module `script/modules/hot_reload.lua` for test-server `Work_Reload.lua` reloading.
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
- Wired `hot_reload` through bootstrap and config; the module is disabled by default and exposes `dp/dpx/game/world/logger/item_handler/utils/config` to the reload script.

### Notes

- The migration branch now contains runtime entry wiring and modular handler loading.
- High-risk handlers are present but gated by config switches and still require real item/PVF validation.
- Legacy entry patches are present but disabled by default and require test-server validation before enabling.
- Hot reload is present but disabled by default and should only be enabled on test/dev servers.
- `frida.js` is not treated as part of the default DP loading chain; DP defaults to `df_game_r.lua` and `df_game_r.js`.
