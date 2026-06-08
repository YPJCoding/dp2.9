# Feature Recovery: Phase 1 & 2 Design

Date: 2026-06-04
Status: approved

## Overview

Goal: advance dp2.9 from ~61% full-feature-recovery to progressively higher coverage, following path C:

```
Phase 1 infrastructure modules
  → Phase 2 high-risk handler verification (SQL → delete → shell)
  → Phase 3 gameplay modules (future spec)
  → Phase 4 801xx operating items (future spec)
  → Phase 5 high-risk GM/JS features (future spec)
```

This spec covers Phase 1 and Phase 2.

---

## Phase 1: Infrastructure Modules

Four low-risk Lua modules that provide foundational capabilities for all subsequent migration.

### 1.1 `script/modules/online.lua` — Online Player Table

**Responsibility**: maintain in-memory online player list, expose query and iteration APIs.

**Hooks registered**:
- `Reach_GameWord` → `online.add(user)` — records account_id, charac_id, charac_name, login_time
- `Leave_GameWord` → `online.remove(user)` — removes from table

**API**:
```lua
online.add(user)              -- add player on login
online.remove(user)           -- remove player on logout
online.each(function(c) end)  -- iterate all online, c contains {aid, cid, name, time, user}
online.count()                -- return online count
online.find_by_name(name)     -- find by charac_name, returns entry or nil
online.find_by_aid(aid)       -- find by account_id, returns entry or nil
```

**Storage**: Lua table keyed by charac_id. Each entry: `{aid, cid, name, login_time, user}`.

**Config**: `config.features.enable_online_module` (default `true`, low risk).

**Logging**: login/logout events with account_id + charac_name at info level.

**Dependencies**: none.

**Error handling**: failures in hook callbacks are logged but never propagate — a broken online tracking must not affect game logic.

---

### 1.2 `script/modules/broadcast.lua` — Server-wide Broadcast

**Responsibility**: send system messages to all online players with rate limiting.

**Dependencies**: `online.lua`.

**API**:
```lua
broadcast.send(message, msg_type)       -- broadcast to all online
broadcast.send_to_aid(aid, message)     -- send to specific account
```

**Rate limiting**: configurable max broadcasts per minute. Counter resets each minute. Excess calls are silently dropped with a warning log.

**Config**:
- `config.features.enable_broadcast_module` (default `false`)
- `config.limits.broadcast_rate_per_min` (default `5`)

**Logging**: every broadcast attempt logs count, message preview, and whether it was allowed or rate-limited.

**Error handling**: iterates safely — a broken user pointer for one player skips that player and continues. Rate limit prevents runaway loops.

---

### 1.3 `script/modules/gm_permissions.lua` — GM Permission Check

**Responsibility**: determine whether a user has GM privileges.

**Dependencies**: none.

**API**:
```lua
gm.is_gm(user)    -- returns boolean
```

**Auth methods** (checked in order, first match wins):
1. Account ID whitelist in config
2. In-game GM level check via DPX API (if available)

**Config**:
- `config.gm.admin_accounts` — table of account IDs, e.g. `{12345, 67890}`
- `config.gm.min_gm_level` — integer, default `1`

**Logging**: every permission check logs account_id and result at debug level.

---

### 1.4 `script/modules/item_query.lua` — Item Query Commands

**Responsibility**: chat commands to look up item IDs and names.

**Dependencies**: `gm_permissions.lua`.

**Commands**:
- `//viewid <name>` — search items by name substring, returns matching IDs and names
- `//viewname <ID>` — look up item name by numeric ID

**Implementation**: registers a `GmInput` hook handler. Checks GM permission before processing. Calls DPX item info API. Returns results as system messages to the requesting player only.

**Config**: `config.features.enable_item_query` (default `false`).

**Logging**: each query logs account_id, charac_name, command, and result count.

**Error handling**: invalid item IDs return "not found" message. API failures return error message and log warning. Non-GM users get no response (silent ignore).

---

### 1.5 Module Dependency Graph

```
online.lua (no deps)
    ↓
broadcast.lua (depends on online)

gm_permissions.lua (no deps)
    ↓
item_query.lua (depends on gm_permissions)
```

### 1.6 Bootstrap Integration

Each module is loaded by `script/bootstrap.lua` via `pcall(require(...))` with config gating:

```lua
if config.features.enable_online_module then
    online = require("script.modules.online")
end
```

Modules follow the same ctx-passing pattern as handler modules. Each module receives `{dp, dpx, game, world, logger, config}` on setup.

---

## Phase 2: High-Risk Handler Verification

Verify handlers that are already implemented but default-disabled in dp2.9. Each category is tested independently on test server before any config change goes to production.

### 2.1 Verification Principles

1. **One category at a time** — enable only one risk flag per verification window
2. **SQL first, delete second, shell last** — increasing risk order
3. **Database backup confirmed before each round**
4. **Use actual items in PVF** — no code-only verification; real items on real server
5. **Record all results** in `docs/RISK_VERIFICATION.md`

### 2.2 Step 1: SQL Handlers

**Config**: `config.risk.enable_sql_handlers = true`

| Item ID | Function | Test Method |
|---|---|---|
| `2021458807` | Female slayer job change (job.lua) | Create level 1 female slayer, use item, verify charac_info.job |
| `2023458801` | Mercenary deployment (misc.lua) | Use item, verify charac_link_bonus changes |
| `2023458803` | Design skill boost (misc.lua) | Use item, verify item_making_skill_info changes |

**Checklist per item**:
- Item consumed on success
- SQL writes correct field values
- Failure scenario protection works (item returned)
- Logging: account_id, charac_id, item_id, SQL statement, result

### 2.3 Step 2: Delete Handlers

**Config**: `config.risk.enable_delete_handlers = true`

| Item ID | Function | Test Method |
|---|---|---|
| `2021458806` | Pet cleanup | Have pets in creature slots, use item, verify creature_items cleared |
| `2022110503` | Avatar cleanup | Have avatars in avatar slots, use item, verify user_items cleared |
| `2022110504` | Equipment disjoint | Have equipment in inventory, use item, verify equipment disassembled |

**Additional protection**: consider adding confirmation dialog (in-game popup) before delete execution.

### 2.4 Step 3: Shell Handler

**Config**: `config.risk.enable_shell_handlers = true`

| Item ID | Function | Test Method |
|---|---|---|
| `2541121` | PVP exp book | Use item, verify shell script executes, PVP exp changes |

**Additional checks**:
- Script path correctness on target server
- Script execution permissions
- SQL output correctness from script
- Failure protection (nil handle, empty query result)

### 2.5 Completion Criteria

Each handler must pass:
1. **Happy path** — item works as intended
2. **Edge case 1** — user lacks prerequisites (wrong job, no pets, etc.)
3. **Edge case 2** — item used twice in succession
4. **Failure injection** — simulate API/SQL failure → item returned to user
5. **Log completeness** — all log entries present and correct

Results recorded to `docs/RISK_VERIFICATION.md` with: date, tester, server, item_id, test cases run, pass/fail, notes.

---

## Implementation Order

```
Phase 1:
  1. online.lua (no deps, foundations)
  2. gm_permissions.lua (no deps, can be parallel)
  3. broadcast.lua (depends on online)
  4. item_query.lua (depends on gm_permissions)
  5. Bootstrap integration for all four

Phase 2:
  6. SQL handler verification (in test server)
  7. Delete handler verification (in test server)
  8. Shell handler verification (in test server)
  9. Record results, update ROADMAP.md

Phase 2 work can begin once Phase 1 steps 1-2 are complete,
as the high-risk verification does not depend on broadcast or item_query.
```

## Config Changes Summary

New entries to add to `script/config.lua`:

```lua
-- features section additions:
features = {
    -- ... existing ...
    enable_online_module = true,
    enable_broadcast_module = false,
    enable_item_query = false,
},

-- gm section (new):
gm = {
    admin_accounts = {},
    min_gm_level = 1,
},

-- limits section additions:
limits = {
    -- ... existing ...
    broadcast_rate_per_min = 5,
},
```
