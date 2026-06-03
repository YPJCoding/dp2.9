# Changelog

## Unreleased

### Added

- Added README for the `dp2.9` base branch.
- Added architecture documentation.
- Added coding standards.
- Added initial code review notes for `df_game_r.lua` and `df_game_r.js`.
- Added Lua config template: `script/config.lua`.
- Added Lua utils template: `script/utils.lua`.
- Added Lua bootstrap template: `script/bootstrap.lua`.
- Added handler module directory and module templates.
- Added handler module implementations for:
  - quest
  - job
  - item cleanup
  - inherit
  - pvp
- Added P3 refactor plan.
- Added `df_game_r.js` audit notes.
- Added `df_game_r.js` index draft.
- Added `dp2` reference evaluation notes.
- Added risk guide.

### Changed

- Updated README TODO list with completed documentation, template and audit steps.
- Updated architecture document with current module migration status.

### Notes

- Runtime entry wiring has not been changed yet.
- `df_game_r.lua` still contains the original handlers.
- Migrated handler modules are prepared but not yet loaded by the runtime entry.
- `frida.js` is not treated as part of the default DP loading chain.
