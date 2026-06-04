---@type DP
local dp = _DP
---@type DPXGame
local dpx = _DPX

-- DP 2.9 的默认 package.path 只包含 /dp2/lua 与 /dp2/lua2。
-- 这里补充 /dp2，确保 require("script.bootstrap") 能加载 /dp2/script/bootstrap.lua。
package.path = "/dp2/?.lua;/dp2/?/init.lua;" .. package.path

local luv = require("luv")
local game = require("df.game")
local world = require("df.game.mgr.world")
local logger = require("df.logger")
local item_handler = {}

logger.info("opt: %s", dpx.opt())
-- see dp2/lua/df/doc for more information !

local function split_fallback(str, sep)
    local result = {}
    if str == nil or sep == nil then
        return result
    end

    string.gsub(str, "[^" .. sep .. "]+", function(part)
        table.insert(result, part)
    end)

    return result
end

local function decode_unicode_fallback(str)
    if str == nil then
        return ""
    end

    return (str:gsub("\\u(%x%x%x%x)", function(code)
        return utf8.char(tonumber(code, 16))
    end))
end

local function get_utils(bootstrap_ctx)
    if bootstrap_ctx and bootstrap_ctx.utils then
        return bootstrap_ctx.utils
    end

    return {
        split = split_fallback,
        decode_unicode = decode_unicode_fallback,
    }
end

local bootstrap_ctx = nil
local ok_bootstrap, bootstrap = pcall(require, "script.bootstrap")
if ok_bootstrap and bootstrap then
    bootstrap_ctx = bootstrap.setup(item_handler, {
        dp = dp,
        dpx = dpx,
        game = game,
        world = world,
        logger = logger,
    })
else
    logger.error("[bootstrap] skipped: %s", tostring(bootstrap))
end

local utils = get_utils(bootstrap_ctx)
local config = bootstrap_ctx and bootstrap_ctx.config or {}
local debug_config = config.debug or {}
logger.info("[debug] enable_useitem_trace=%s", tostring(debug_config.enable_useitem_trace == true))

-- enable frida framework
local frida = require("df.frida")

-- frida 调用 dp 功能
local function on_frida_call(arg1, arg2, arg3)
    logger.info("from frida call, arg1=%d, arg2=%f, arg3=%s", arg1, arg2, arg3)
    if not arg1 or arg1 < 0 then
        logger.error("Invalid arguments on frida_call")
        return 0
    end
    if not arg3 then
        logger.error("Invalid arguments on frida_call")
        return 0
    end

    local _ptr = world.FindUserByAcc(arg1)
    local user = game.fac.user(_ptr)
    local data = utils.split(arg3, ',')
    local f_name = string.lower(data[1])
    local f_index = tonumber(data[2])

    if f_name == "additem" then
        dpx.item.add(user.cptr, f_index)
        logger.info("[additem] acc: %d chr: %d item_id: %d", user:GetAccId(), user:GetCharacNo(), f_index)
    elseif f_name == "enterdungeon" then
        logger.info("[enterdungeon] No function")
    else
        logger.info("[default] No function")
    end

    return 0
end

frida.load("DP2 load success!", on_frida_call)
logger.info("[frida] loaded")

local function mainDpLoad(_user)
    local user = game.fac.user(_user)
    logger.info("[hook][Reach_GameWord] acc: %d chr: %d", user:GetAccId(), user:GetCharacNo())
    user:SendNotiPacketMessage(
        utils.decode_unicode('\\u795e\\u8ff9\\u0020\\u003a\\u0020\\u6b64\\u7248\\u672c\\u514d\\u8d39\\u53d1\\u5e03\\u4e8e\\u4e92\\u8054\\u7f51\\uff0c\\u0020\\u4ec5\\u4f9b\\u5b66\\u4e60\\u548c\\u7814\\u7a76\\u4f7f\\u7528\\uff0c\\u0020\\u4efb\\u4f55\\u76c8\\u5229\\u884c\\u4e3a\\u6240\\u5e26\\u6765\\u7684\\u6cd5\\u5f8b\\u8d23\\u4efb\\u7531\\u76f4\\u63a5\\u53d7\\u76ca\\u4eba\\u627f\\u62c5\\u0021'),
        14
    )
end

dpx.hook(game.HookType.Reach_GameWord, mainDpLoad)
logger.info("[hook] registered Reach_GameWord")

---------------------------------- 通用物品使用处理逻辑 -------------------------------- !
local my_useitem2 = function(_user, item_id)
    local user = game.fac.user(_user)
    local handler = item_handler[item_id]

    if debug_config.enable_useitem_trace == true then
        logger.info("[useitem][trace] acc: %d chr: %d item_id: %d has_handler: %s", user:GetAccId(), user:GetCharacNo(), item_id, tostring(handler ~= nil))
    end

    if handler then
        handler(user, item_id)
        logger.info("[useitem] acc: %d chr: %d item_id: %d", user:GetAccId(), user:GetCharacNo(), item_id)
    end
end

local function apply_dpx_startup_fallback()
    dpx.set_auction_min_level(95)
    dpx.enable_creator()
    dpx.set_unlimit_towerofdespair()
    dpx.disable_item_routing()
    dpx.disable_security_protection()
    dpx.extend_teleport_item()
    dpx.disable_trade_limit()
    dpx.set_auction_min_level(10)
    dpx.fix_auction_regist_item(200000000)
    dpx.liberate_random_option()
    dpx.disable_redeem_item()
    dpx.disable_mobile_rewards()
    dpx.set_item_unlock_time(1)
end

if bootstrap_ctx and bootstrap and type(bootstrap.apply_dpx_startup) == "function" then
    bootstrap.apply_dpx_startup(bootstrap_ctx)
else
    logger.error("[bootstrap] apply dpx startup fallback")
    apply_dpx_startup_fallback()
end

dpx.hook(game.HookType.UseItem2, my_useitem2) -- 物品使用 hook
logger.info("[hook] registered UseItem2")

-- dpx.enable_game_master() -- 开启GM模式(需把UID添加到GM数据库中)
-- dpx.disable_giveup_panalty() -- 退出副本后角色默认不虚弱
