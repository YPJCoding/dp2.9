-- dp2 旧入口补丁迁移模块
--
-- 本模块迁移旧 dp2/df_game_r.lua 中的三个入口 hook：
-- 1. 修复绝望之塔卡金币/金币提示异常
-- 2. 城镇下线卡镇魂修复
-- 3. 开放极限祭坛等指定副本
--
-- 这些 hook 属于全局运行逻辑，统一受 config.features.enable_legacy_patches
-- 和 config.legacy_patches.* 控制。

local M = {}

local function get_patch_config(ctx)
    local config = ctx.config or {}
    return config.legacy_patches or {}
end

local function is_module_enabled(ctx)
    local config = ctx.config or {}
    local features = config.features or {}
    return features.enable_legacy_patches == true
end

local function build_id_set(ids)
    local set = {}
    if type(ids) ~= "table" then
        return set
    end

    for _, id in ipairs(ids) do
        local n = tonumber(id)
        if n then
            set[n] = true
        end
    end

    return set
end

local function setup_tower_gold_notice_fix(ctx, patch_config)
    local dpx = ctx.dpx
    local game = ctx.game
    local logger = ctx.logger

    if patch_config.enable_tower_gold_notice_fix ~= true then
        if logger then
            logger.info("[legacy_patches] tower_gold_notice_fix disabled")
        end
        return
    end

    local min_id = tonumber(patch_config.tower_dungeon_min_id) or 11008
    local max_id = tonumber(patch_config.tower_dungeon_max_id) or 11107

    local function on_use_ancient_dungeon_items(fnext, _party, _dungeon, _item)
        local dungeon = game.fac.dungeon(_dungeon)
        local dungeon_index = dungeon:GetIndex()

        if dungeon_index >= min_id and dungeon_index <= max_id then
            return true
        end

        return fnext()
    end

    dpx.hook(game.HookType.CParty_UseAncientDungeonItems, on_use_ancient_dungeon_items)

    if logger then
        logger.info(
            "[legacy_patches] registered tower_gold_notice_fix min_id=%d max_id=%d",
            min_id,
            max_id
        )
    end
end

local function setup_save_town_fix(ctx, patch_config)
    local dpx = ctx.dpx
    local game = ctx.game
    local logger = ctx.logger

    if patch_config.enable_save_town_fix ~= true then
        if logger then
            logger.info("[legacy_patches] save_town_fix disabled")
        end
        return
    end

    local from_town_id = tonumber(patch_config.save_town_from_id) or 13
    local to_town_id = tonumber(patch_config.save_town_to_id) or 11

    local function on_save_town(_user, pre_town_id, post_town_id)
        if post_town_id == from_town_id then
            return to_town_id
        end

        return post_town_id
    end

    dpx.hook(game.HookType.CUser_SaveTown, on_save_town)

    if logger then
        logger.info(
            "[legacy_patches] registered save_town_fix from_town_id=%d to_town_id=%d",
            from_town_id,
            to_town_id
        )
    end
end

local function setup_open_dungeon_patch(ctx, patch_config)
    local dpx = ctx.dpx
    local game = ctx.game
    local logger = ctx.logger

    if patch_config.enable_open_extra_dungeons ~= true then
        if logger then
            logger.info("[legacy_patches] open_extra_dungeons disabled")
        end
        return
    end

    local allowed_dungeons = build_id_set(patch_config.open_dungeon_ids or {11007})

    local function on_open_dungeon(fnext, dgn_idx)
        if allowed_dungeons[dgn_idx] then
            return true
        end

        return fnext(dgn_idx)
    end

    dpx.hook(game.HookType.Open_Dungeon, on_open_dungeon)

    if logger then
        local count = 0
        for _ in pairs(allowed_dungeons) do
            count = count + 1
        end
        logger.info("[legacy_patches] registered open_extra_dungeons count=%d", count)
    end
end

function M.setup(ctx)
    local logger = ctx.logger

    if not is_module_enabled(ctx) then
        if logger then
            logger.info("[legacy_patches] module disabled")
        end
        return M
    end

    local patch_config = get_patch_config(ctx)

    setup_tower_gold_notice_fix(ctx, patch_config)
    setup_save_town_fix(ctx, patch_config)
    setup_open_dungeon_patch(ctx, patch_config)

    if logger then
        logger.info("[legacy_patches] setup complete")
    end

    return M
end

return M
