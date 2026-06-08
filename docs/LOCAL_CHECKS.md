# Local Checks

This directory documents local validation scripts available in `tools/`.

## JS Syntax Check

Check `df_game_r.js` and all `script/js/*.js` files for syntax errors using `node --check`.

```bash
bash tools/check_js_syntax.sh
```

## Lua Syntax Check

Check `df_game_r.lua` and all `script/**/*.lua` files for syntax errors using `luac -p`.

```bash
bash tools/check_lua_syntax.sh
```

Requires `luac` to be installed.

## JS Legacy Markers Check

Verify that previously cleaned JS legacy functions no longer remain in `df_game_r.js`.

```bash
bash tools/check_js_legacy_markers.sh
```

Checks for the following cleaned legacy function markers:
- `set_return_user`
- `hidden_option`
- `start_hidden_option`
- `getQuestIds1` (VIP login)
- `Inspection_tasks` (VIP login)
- `vip_Login` (VIP login)

Note: `ranking` legacy implementation has **not** been cleaned yet and is not part of this check.

## Legacy Cleanup Archive

The directory `tools/archive/legacy-cleanup/` contains one-time migration patch scripts that have already been executed. These scripts removed legacy inline implementations from `df_game_r.js` that were migrated to `script/js/*.js` modules. They are archived here for reference only and should not be re-run.
