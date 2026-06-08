
/**
 * 用于存放所有的和游戏相关的公共方法
 */

// ===== Native: Declarations =====

// ===== Debug Flag =====
var DP2_DEBUG = false;
function dp2_log() { if (DP2_DEBUG) console.log.apply(console, arguments); }
//获取UTC时间(秒)
const getCurSec = new NativeFunction(Module.getExportByName(null, 'time'), 'int', ['pointer'], {"abi":"sysv"});

//根据server_id查找user
const GameWorld_find_from_world = new NativeFunction(ptr(0x86C4B9C), 'pointer', ['pointer', 'int'], {"abi":"sysv"});
//城镇瞬移
const GameWorld_move_area = new NativeFunction(ptr(0x86C5A84), 'pointer', ['pointer', 'pointer', 'int', 'int', 'int', 'int', 'int', 'int', 'int', 'int', 'int'], {"abi":"sysv"});


const G_CGameManager = new NativeFunction(ptr(0x080cc18e), 'pointer', [], {"abi":"sysv"});
const CGameManager_GetPremiumLetheManager = new NativeFunction(ptr(0x08298e88), 'int', ['pointer'], {"abi":"sysv"});
const CEventManager_GetRepeatEvent = new NativeFunction(ptr(0x08115998), 'pointer', ['pointer','int'], {"abi":"sysv"});
const EventClassify_CEventScriptMng_process_level_up_reward = new NativeFunction(ptr(0x0810bf56), 'pointer', ['pointer','pointer','int'], {"abi":"sysv"});
const GuildParameterScript_getGuildLevelUpParam = new NativeFunction(ptr(0x08979648), 'pointer', ['pointer','int'], {"abi":"sysv"});
const GuildParameterScript_getGuildExpBook = new NativeFunction(ptr(0x08979672), 'int', ['pointer','int'], {"abi":"sysv"});

//道具是否为消耗品
const CItem_GetIncreaseStatusIntData = new NativeFunction(ptr(0x08694658), 'int', ['pointer','int','pointer'], {"abi":"sysv"});
const CItem_GetIncreaseStatusType = new NativeFunction(ptr(0x086946b6), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetUsablePvPRank = new NativeFunction(ptr(0x086946c4), 'int', ['pointer'], {"abi":"sysv"});


const CMonitorServerProxy_SendCharLevelGrowType = new NativeFunction(ptr(0x08470c04), 'int', ['pointer','int','int','int','int'], {"abi":"sysv"});
const CMonitorServerProxy_SendPacket = new NativeFunction(ptr(0x08470df4), 'int', ['pointer','pointer','int'], {"abi":"sysv"});
const CServerProxyMgr_CMonitorServerProxy_GetServerProxy = new NativeFunction(ptr(0x0811208a), 'pointer', ['pointer','int'], {"abi":"sysv"});
const CServerProxyMgr_CGuildServerProxy_GetServerProxy = new NativeFunction(ptr(0x0811d3b8), 'pointer', ['pointer','int'], {"abi":"sysv"});
const CGuildServerProxy_SendCharLevelGrowType = new NativeFunction(ptr(0x0846da9a), 'int', ['pointer','int','int','int','int'], {"abi":"sysv"});

//执行debug命令
const DoUserDefineCommand = new NativeFunction(ptr(0x0820BA90), 'int', ['pointer', 'int', 'pointer'], {"abi":"sysv"});

//设置角色等级(最高70级)
const DisPatcher_DebugCommand__debugCommandSetLevel = new NativeFunction(ptr(0x0858EFDE), 'int', ['pointer', 'pointer', 'int'], {"abi":"sysv"});//需要临时开GM权限

//获取队伍中玩家
const CParty_send_to_party = new NativeFunction(ptr(0x0859d14e), 'int', ['pointer','pointer'], {"abi":"sysv"});

const cMyTrace_cMyTrace = new NativeFunction(ptr(0x0854f718), 'void', ['pointer','pointer','int','int'], {"abi":"sysv"});
const cMyTrace_operator = new NativeFunction(ptr(0x0854f788), 'void', ['int','pointer','pointer'], {"abi":"sysv"});

const CGuildServerProxy_SendIncreaseGuildExp = new NativeFunction(ptr(0x0846ece2), 'int', ['pointer','int','int','int','int'], {"abi":"sysv"});
const PvPSkillTreeParameterScript_getPvPSkillPoint = new NativeFunction(ptr(0x08a5dd62), 'int', ['pointer','int','int','int','int','int'], {"abi":"sysv"});
const ServerParameterScript_isDungeonOpen = new NativeFunction(ptr(0x082687fc), 'int', [], {"abi":"sysv"});
const XNuclear_CHades_ExpUp = new NativeFunction(ptr(0x084b953e), 'int', ['pointer','int'], {"abi":"sysv"});
const WarRoom_SendToRoom = new NativeFunction(ptr(0x086be0cc), 'int', ['pointer','pointer'], {"abi":"sysv"});

const CCharacterView_enableSaveCharacView = new NativeFunction(ptr(0x0822fbda), 'pointer', ['pointer'], {"abi":"sysv"});
const CLevelDungeonPlayStatistic_IncreaseLevelDungeonPlay = new NativeFunction(ptr(0x0860ecc6), 'pointer', ['pointer','int','int'], {"abi":"sysv"});
const expert_job_CExpertJob_IncreaseExpertJobExp = new NativeFunction(ptr(0x08375026), 'void', ['pointer','pointer'], {"abi":"sysv"});
const APSystem_CUserProc_ClearActionAndSendtoUser = new NativeFunction(ptr(0x08122390), 'void', ['pointer','int','int','int'], {"abi":"sysv"});
const DB_InsertUnlimitSupportLog_makeRequest = new NativeFunction(ptr(0x080cbc9e), 'void', ['pointer','int','pointer'], {"abi":"sysv"});
const DB_InsertArchieveEventLog_makeRequest = new NativeFunction(ptr(0x08115998), 'void', ['int','int','int'], {"abi":"sysv"});
const RDARScriptStringManager_findString = new NativeFunction(ptr(0x08aa57fe), 'pointer', ['pointer','int','pointer','int'], {"abi":"sysv"});
const ImportSpPerLevelReferenceTable = new NativeFunction(ptr(0x08910505), 'int', ['pointer','pointer'], {"abi":"sysv"});
const stSpPerLevelTable = new NativeFunction(ptr(0x0837f544), 'void', ['pointer'], {"abi":"sysv"});
//获取背包槽中的道具
const INVENTORY_TYPE_CREATURE = 3;        //宠物装备(0-241)

//通知客户端更新背包栏
const ENUM_ITEMSPACE_INVENTORY = 0;       //物品栏
const ENUM_ITEMSPACE_AVATAR = 1;          //时装栏
const ENUM_ITEMSPACE_CARGO = 2;           //仓库
const ENUM_ITEMSPACE_CREATURE = 7;        //宠物栏
const ENUM_ITEMSPACE_ACCOUNT_CARGO = 12;  //账号仓库

//服务器环境
const G_CEnvironment = new NativeFunction(ptr(0x080CC181), 'pointer', [], { "abi": "sysv" });
//获取当前服务器配置文件名
const CEnvironment_get_file_name = new NativeFunction(ptr(0x80DA39A), 'pointer', ['pointer'], { "abi": "sysv" });

const CUserCharacInfo_setDemensionInoutValue = new NativeFunction(ptr(0x0822f184), 'int', ['pointer','int','int'], {"abi":"sysv"});
//获取角色上次退出游戏时间
const CUserCharacInfo_getCurCharacLastPlayTick = new NativeFunction(ptr(0x82A66AA), 'int', ['pointer'], {"abi":"sysv"});
// 价差分解机用户的状态 参数 用户  239 背包类型 位置
const CUserCharacInfo_GetCurCharacExpertJob = new NativeFunction(ptr(0x822f8d4), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_GetCurCharacMaxEquipLevel = new NativeFunction(ptr(0x086467a0), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_SetCurCharacMaxEquipLevel = new NativeFunction(ptr(0x086467c2), 'int', ['pointer','int'], {"abi":"sysv"});
const CUserCharacInfo_getCurCharacSkillR = new NativeFunction(ptr(0x0822f130), 'pointer', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_getCurCharacSkillW = new NativeFunction(ptr(0x0822f140), 'pointer', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_getCurCharacR = new NativeFunction(ptr(0x0854f718), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_get_charac_exp = new NativeFunction(ptr(0x084ec05c), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_setCurCharacExp = new NativeFunction(ptr(0x0819a87c), 'int', ['pointer','int'], {"abi":"sysv"});
const CUserCharacInfo_addCurCharacExp = new NativeFunction(ptr(0x086967be), 'int', ['pointer','int'], {"abi":"sysv"});
const CUserCharacInfo_incCurCharacLevel = new NativeFunction(ptr(0x08696762), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_resetCharacFatigueGrownUpBuff = new NativeFunction(ptr(0x08696386), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_getCurCharacGrowType = new NativeFunction(ptr(0x0815741c), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_set_charac_fatigue_buf_bonus_exp = new NativeFunction(ptr(0x08469a02), 'int', ['pointer', 'int'], {"abi":"sysv"});
const CUserCharacInfo_getCurCharacCreateTime = new NativeFunction(ptr(0x0822f202), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_ResetCurCharacDungeonPlayCount = new NativeFunction(ptr(0x086969fe), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_GetCurCharacExpertJobExp = new NativeFunction(ptr(0x08375026), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_GetCurCharacDungeonPlayCount = new NativeFunction(ptr(0x085bfc78), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_get_charac_job = new NativeFunction(ptr(0x080fdf20), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_get_pvp_grade = new NativeFunction(ptr(0x0819ee4a), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_getCurCharSecondGrowType = new NativeFunction(ptr(0x0822f23c), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_getCurCharFirstGrowType = new NativeFunction(ptr(0x08110c94), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_GetCurCharacExpertJobType = new NativeFunction(ptr(0x0822f894), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_GetCurCharacSkillTreeIndex = new NativeFunction(ptr(0x0822f33c), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_setCurCharacFatigue = new NativeFunction(ptr(0x0822f2ce), 'int', ['pointer','int'], {"abi":"sysv"});
const CUserCharacInfo_add_guild_exp = new NativeFunction(ptr(0x08645c76), 'int', ['pointer','int'], {"abi":"sysv"});
const CUserCharacInfo_setCurCharacStamina = new NativeFunction(ptr(0x082f0914), 'int', ['pointer','int'], {"abi":"sysv"});
const CUserCharacInfo_IncreasePowerWarPoint = new NativeFunction(ptr(0x08687efc), 'int', ['pointer','int'], {"abi":"sysv"});
const CUserCharacInfo_getCurCharacInvenR = new NativeFunction(ptr(0x080da27e), 'pointer', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_get_charac_guildkey = new NativeFunction(ptr(0x0822f46c), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_getCurCharacFatigue = new NativeFunction(ptr(0x0822f2ae), 'int', ['pointer'], {"abi":"sysv"});
const CUserCharacInfo_getCurCharacAddInfoRefW = new NativeFunction(ptr(0x086960d8), 'int', ['pointer'], {"abi":"sysv"});

const CInventory_GetInvenData = new NativeFunction(ptr(0x084fbf2c), 'int', ['pointer','int','pointer'], {"abi":"sysv"});
const CInventory_GetInvenSlot = new NativeFunction(ptr(0x084fb918), 'pointer', ['pointer', 'int', 'int', 'int'], {"abi":"sysv"});
const CInventory_update_item = new NativeFunction(ptr(0x085000ae), 'int', ['pointer','int','int','int','int','int','int','int','int','int','int','int','int','int','int','int','int','int','int'], {"abi":"sysv"});
const CInventory_insertItemIntoInventory = new NativeFunction(ptr(0x08502d86), 'int', ['pointer','int','int','int','int','int','int','int','int','int','int','int','int','int','int','int','int','int'], {"abi":"sysv"});
const CInventory_GetEventCoin = new NativeFunction(ptr(0x08110c7a), 'int', ['pointer'], {"abi":"sysv"});
const CInventory_SetEventCoin = new NativeFunction(ptr(0x08110c86), 'pointer', ['pointer','int'], {"abi":"sysv"});
const CInventory_GetCoin = new NativeFunction(ptr(0x0822d68a), 'int', ['pointer'], {"abi":"sysv"});
const CInventory_SetCoin = new NativeFunction(ptr(0x0822d67c), 'pointer', ['pointer','int'], {"abi":"sysv"});
const CInventory_get_inven_slot_no = new NativeFunction(ptr(0x0850cd62), 'int', ['pointer', 'int'], {"abi":"sysv"});


// 分解机 参数 角色 位置 背包类型  239  角色（谁的） 0xFFFF
const DisPatcher_DisJointItem_disjoint = new NativeFunction(ptr(0x81f92ca), 'int', ['pointer', 'int', 'int', 'int','pointer','int'], {"abi":"sysv"});
// 获取账号金库一个空的格子
const CAccountCargo_GetEmptySlot = new NativeFunction(ptr(0x0828a580), 'int', ['pointer'], {"abi":"sysv"});
// 将已经物品移动到某个格子 第一个账号金库，第二个移入的物品，第三个格子位置
const CAccountCargo_InsertItem = new NativeFunction(ptr(0x08289c82), 'int', ['pointer','pointer','int'], {"abi":"sysv"});
// 向客户端发送账号金库列表
const CAccountCargo_SendItemList = new NativeFunction(ptr(0x0828a88a), 'int', ['pointer'], {"abi":"sysv"});

const CAccountCargo_CheckValidSlot = new NativeFunction(ptr(0x0828A554), 'int', ['pointer', 'int'], { "abi": "sysv" });
const CAccountCargo_ResetSlot = new NativeFunction(ptr(0x082898C0), 'int', ['pointer', 'int'], { "abi": "sysv" });
const ARAD_Singleton_ServiceRestrictManager_Get = new NativeFunction(ptr(0x081625E6), 'pointer', [], { "abi": "sysv" });
const ServiceRestrictManager_isRestricted = new NativeFunction(ptr(0x0816E6B8), 'uint8', ['int', 'pointer', 'int', 'int'], { "abi": "sysv" });
const CUser_SendCmdErrorPacket = new NativeFunction(ptr(0x0867BF42), 'int', ['pointer', 'int', 'uint8'], { "abi": "sysv" });
const CSecu_ProtectionField_Check = new NativeFunction(ptr(0x08288A02), 'int', ['pointer', 'pointer', 'int'], { "abi": "sysv" });
const CUserCharacInfo_getCurCharacMoney = new NativeFunction(ptr(0x0817A188), 'int', ['pointer'], { "abi": "sysv" });
const CAccountCargo_CheckMoneyLimit = new NativeFunction(ptr(0x0828A4CA), 'int', ['pointer', 'uint'], { "abi": "sysv" });

//设置幸运点数
const CUserCharacInfo_SetCurCharacLuckPoint = new NativeFunction(ptr(0x0864670A), 'int', ['pointer', 'int'], { "abi": "sysv" });
//获取角色当前幸运点
const CUserCharacInfo_GetCurCharacLuckPoint = new NativeFunction(ptr(0x822F828), 'int', ['pointer'], { "abi": "sysv" });
//设置角色属性改变脏标记(角色上线时把所有属性从数据库缓存到内存中, 只有设置了脏标记, 角色下线时才能正确存档到数据库, 否则变动的属性下线后可能会回档)
const CUserCharacInfo_enableSaveCharacStat = new NativeFunction(ptr(0x819A870), 'int', ['pointer'], { "abi": "sysv" });
//获取角色状态
const CUser_get_state = new NativeFunction(ptr(0x80DA38C), 'int', ['pointer'], { "abi": "sysv" });
//获取角色账号id
const CUser_get_acc_id = new NativeFunction(ptr(0x80DA36E), 'int', ['pointer'], { "abi": "sysv" });
const Stream_operator_p = new NativeFunction(ptr(0x0861C796), 'int', ['pointer', 'int'], { "abi": "sysv" });
const NumberToString = new NativeFunction(ptr(0x0810904B), 'uint', ['uint', 'int'], { "abi": "sysv" });
const Stream_GetOutBuffer_SIG_ACCOUNT_CARGO_DATA = new NativeFunction(ptr(0x08453A26), 'int', ['pointer'], { "abi": "sysv" });
const CAccountCargo_GetMoney = new NativeFunction(ptr(0x0822F020), 'int', ['pointer'], { "abi": "sysv" });
//获取当前角色id
const CUserCharacInfo_getCurCharacNo = new NativeFunction(ptr(0x80CBC4E), 'int', ['pointer'], { "abi": "sysv" });
//获取角色等级
const CUserCharacInfo_get_charac_level = new NativeFunction(ptr(0x80DA2B8), 'int', ['pointer'], { "abi": "sysv" });
//获取角色名字
const CUserCharacInfo_getCurCharacName = new NativeFunction(ptr(0x8101028), 'pointer', ['pointer'], { "abi": "sysv" });
//获取角色当前等级升级所需经验
const CUserCharacInfo_get_level_up_exp = new NativeFunction(ptr(0x0864E3BA), 'int', ['pointer', 'int'], { "abi": "sysv" });
//获取角色背包
const CUserCharacInfo_getCurCharacInvenW = new NativeFunction(ptr(0x80DA28E), 'pointer', ['pointer'], { "abi": "sysv" });
//获取副本id
const CDungeon_get_index = new NativeFunction(ptr(0x080FDCF0), 'int', ['pointer'], { "abi": "sysv" });
//获取背包槽中的道具
const CInventory_GetInvenRef = new NativeFunction(ptr(0x84FC1DE), 'pointer', ['pointer', 'int', 'int'], { "abi": "sysv" });
//道具是否是装备
const Inven_Item_isEquipableItemType = new NativeFunction(ptr(0x08150812), 'int', ['pointer'], { "abi": "sysv" });
//是否魔法封印装备
const CEquipItem_IsRandomOption = new NativeFunction(ptr(0x8514E5E), 'int', ['pointer'], { "abi": "sysv" });
//解封魔法封印
const random_option_CRandomOptionItemHandle_give_option = new NativeFunction(ptr(0x85F2CC6), 'int', ['pointer', 'int', 'int', 'int', 'int', 'int', 'pointer'], { "abi": "sysv" });
//获取装备品级
const CItem_get_rarity = new NativeFunction(ptr(0x080F12D6), 'int', ['pointer'], { "abi": "sysv" });
//获取装备可穿戴等级
const CItem_getUsableLevel = new NativeFunction(ptr(0x80F12EE), 'int', ['pointer'], { "abi": "sysv" });
//获取装备[item group name]
const CItem_getItemGroupName = new NativeFunction(ptr(0x80F1312), 'int', ['pointer'], { "abi": "sysv" });
//获取装备魔法封印等级
const CEquipItem_GetRandomOptionGrade = new NativeFunction(ptr(0x8514E6E), 'int', ['pointer'], { "abi": "sysv" });
const CEquipItem_GetUsableEquipmentType = new NativeFunction(ptr(0x0832e036), 'int', ['pointer'], {"abi":"sysv"});
const CEquipItem_GetSubType = new NativeFunction(ptr(0x833eecc), 'int', ['pointer'], {"abi":"sysv"});
//检查背包中道具是否为空
const Inven_Item_isEmpty = new NativeFunction(ptr(0x811ED66), 'int', ['pointer'], { "abi": "sysv" });
//获取背包中道具item_id
const Inven_Item_getKey = new NativeFunction(ptr(0x850D14E), 'int', ['pointer'], { "abi": "sysv" });
//获取道具附加信息
const Inven_Item_get_add_info = new NativeFunction(ptr(0x80F783A), 'int', ['pointer'], { "abi": "sysv" });

const CItem_GetIndex = new NativeFunction(ptr(0x8110c48), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetGrade = new NativeFunction(ptr(0x8110c54), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetPrice = new NativeFunction(ptr(0x822c84a), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetGenRate = new NativeFunction(ptr(0x822c84a), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetNeedLevel = new NativeFunction(ptr(0x8545fda), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetUsableLevel = new NativeFunction(ptr(0x80f12ee), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetRarity = new NativeFunction(ptr(0x80f12d6), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetItemGroupName = new NativeFunction(ptr(0x80f1312), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetUpSkillType = new NativeFunction(ptr(0x8545fcc), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetGetExpertJobCompoundMaterialVariation = new NativeFunction(ptr(0x850d292), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetExpertJobCompoundRateVariation = new NativeFunction(ptr(0x850d2aa), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetExpertJobCompoundResultVariation = new NativeFunction(ptr(0x850d2c2), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetExpertJobSelfDisjointBigWinRate = new NativeFunction(ptr(0x850d2de), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetExpertJobSelfDisjointResultVariation = new NativeFunction(ptr(0x850d2f6), 'int', ['pointer'], {"abi":"sysv"});
const CItem_GetExpertJobAdditionalExp = new NativeFunction(ptr(0x850d30e), 'int', ['pointer'], {"abi":"sysv"});

//获取时装插槽数据
const WongWork_CAvatarItemMgr_getJewelSocketData = new NativeFunction(ptr(0x82F98F8), 'pointer', ['pointer', 'int'], { "abi": "sysv" });
//获取DataManager实例
const G_CDataManager = new NativeFunction(ptr(0x80CC19B), 'pointer', [], { "abi": "sysv" });
//获取时装管理器
const CInventory_GetAvatarItemMgrR = new NativeFunction(ptr(0x80DD576), 'pointer', ['pointer'], { "abi": "sysv" });
//获取装备pvf数据
const CDataManager_find_item = new NativeFunction(ptr(0x835FA32), 'pointer', ['pointer', 'int'], { "abi": "sysv" });
//从pvf中获取任务数据
const CDataManager_find_quest = new NativeFunction(ptr(0x835FDC6), 'pointer', ['pointer', 'int'], { "abi": "sysv" });

//获取DataManager实例 用于处理pvf的
const CDataManager_get_level_exp = new NativeFunction(ptr(0x08360442), 'int', ['pointer','int'], {"abi":"sysv"});
const CDataManager_getDailyTrainingQuest = new NativeFunction(ptr(0x083640fe), 'pointer', ['pointer','int'], {"abi":"sysv"});
const CDataManager_GetSpAtLevelUp = new NativeFunction(ptr(0x08360cb8), 'int', ['pointer','int'], {"abi":"sysv"});
const CDataManager_get_event_script_mng = new NativeFunction(ptr(0x08110b62), 'pointer', ['pointer'], {"abi":"sysv"});
const CDataManager_GetExpertJobScript = new NativeFunction(ptr(0x0822b5f2), 'pointer', ['pointer','int'], {"abi":"sysv"});
const CDataManager_get_dimensionInout = new NativeFunction(ptr(0x0822b612), 'int', ['pointer','int'], {"abi":"sysv"});

//获取消耗品类型
const CStackableItem_GetItemType = new NativeFunction(ptr(0x8514A84), 'int', ['pointer'], { "abi": "sysv" });
//获取徽章支持的镶嵌槽类型
const CStackableItem_getJewelTargetSocket = new NativeFunction(ptr(0x0822CA28), 'int', ['pointer'], { "abi": "sysv" });
//背包道具
const Inven_Item_Inven_Item = new NativeFunction(ptr(0x80CB854), 'pointer', ['pointer'], { "abi": "sysv" });
//获取角色点券余额
const CUser_GetCera = new NativeFunction(ptr(0x080FDF7A), 'int', ['pointer'], { "abi": "sysv" });
//获取玩家任务信息
const CUser_getCurCharacQuestW = new NativeFunction(ptr(0x814AA5E), 'pointer', ['pointer'], { "abi": "sysv" });
//获取系统时间
const CSystemTime_getCurSec = new NativeFunction(ptr(0x80CBC9E), 'int', ['pointer'], { "abi": "sysv" });
const GlobalData_s_systemTime_ = ptr(0x941F714);
//本次登录时间
const CUserCharacInfo_GetLoginTick = new NativeFunction(ptr(0x822F692), 'int', ['pointer'], { "abi": "sysv" });
//道具是否被锁
const CUser_CheckItemLock = new NativeFunction(ptr(0x8646942), 'int', ['pointer', 'int', 'int'], { "abi": "sysv" });
//道具是否为消耗品
const CItem_is_stackable = new NativeFunction(ptr(0x80F12FA), 'int', ['pointer'], { "abi": "sysv" });
//任务是否已完成
const WongWork_CQuestClear_isClearedQuest = new NativeFunction(ptr(0x808BAE0), 'int', ['pointer', 'int'], { "abi": "sysv" });
const UserQuest_finish_quest = new NativeFunction(ptr(0x86AC854), 'int', ['pointer', 'int'], {"abi":"sysv"});
//重置所有任务为未完成状态
const UserQuest_reset = new NativeFunction(ptr(0x86AB894), 'int', ['pointer'], {"abi":"sysv"});
const UserQuest_get_mail_quest_info = new NativeFunction(ptr(0x086abd7a), 'int', ['int','int','pointer'], {"abi":"sysv"});
const UserQuest_ResetUrgentQuestWaitingList = new NativeFunction(ptr(0x086ad178),  'pointer', ['pointer'], {"abi":"sysv"});
//设置任务为已完成状态
const WongWork_CQuestClear_setClearedQuest = new NativeFunction(ptr(0x808BA78), 'int', ['pointer', 'int'], {"abi":"sysv"});
//重置任务为未完成状态
const WongWork_CQuestClear_resetClearedQuests = new NativeFunction(ptr(0x808BAAC), 'int', ['pointer', 'int'], {"abi":"sysv"});
//根据账号查找已登录角色
const GameWorld_find_user_from_world_byaccid = new NativeFunction(ptr(0x86C4D40), 'pointer', ['pointer', 'int'], { "abi": "sysv" });
//任务相关操作(第二个参数为协议编号: 33=接受任务, 34=放弃任务, 35=任务完成条件已满足, 36=提交任务领取奖励)
const CUser_quest_action = new NativeFunction(ptr(0x0866DA8A), 'int', ['pointer', 'int', 'int', 'int', 'int'], { "abi": "sysv" });
//设置GM完成任务模式(无条件完成任务)
const CUser_setGmQuestFlag = new NativeFunction(ptr(0x822FC8E), 'int', ['pointer', 'int'], { "abi": "sysv" });
//删除背包槽中的道具
const Inven_Item_reset = new NativeFunction(ptr(0x080CB7D8), 'int', ['pointer'], { "abi": "sysv" });
//减少金币
const CInventory_use_money = new NativeFunction(ptr(0x84FF54C), 'int', ['pointer', 'int', 'int', 'int'], { "abi": "sysv" });
const CInventory_gain_money = new NativeFunction(ptr(0x084ff29C), 'pointer', ['pointer', 'int', 'int', 'int', 'int'], { "abi": "sysv" });
const CAccountCargo_AddMoney = new NativeFunction(ptr(0x0828A742), 'pointer', ['pointer', 'uint'], { "abi": "sysv" });
const CAccountCargo_SendNotifyMoney = new NativeFunction(ptr(0x0828A7DC), 'pointer', ['int', 'int'], { "abi": "sysv" });
const CUser_CheckMoney = new NativeFunction(ptr(0x0866AF1C), 'int', ['pointer', 'int'], { "abi": "sysv" });
const CAccountCargo_SubMoney = new NativeFunction(ptr(0x0828A764), 'pointer', ['pointer', 'uint'], { "abi": "sysv" });
//背包中删除道具(背包指针, 背包类型, 槽, 数量, 删除原因, 记录删除日志)
const CInventory_delete_item = new NativeFunction(ptr(0x850400C), 'int', ['pointer', 'int', 'int', 'int', 'int', 'int'], { "abi": "sysv" });
//角色增加经验
const CUser_gain_exp_sp = new NativeFunction(ptr(0x866A3FE), 'int', ['pointer', 'int', 'pointer', 'pointer', 'int', 'int', 'int'], { "abi": "sysv" });
//时装镶嵌数据存盘
const DB_UpdateAvatarJewelSlot_makeRequest = new NativeFunction(ptr(0x843081C), 'pointer', ['int', 'int', 'pointer'], { "abi": "sysv" });
//发包给客户端
const CUser_Send = new NativeFunction(ptr(0x86485BA), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
//给角色发消息
const CUser_SendNotiPacketMessage = new NativeFunction(ptr(0x86886CE), 'int', ['pointer', 'pointer', 'int'], { "abi": "sysv" });
//将协议发给所有在线玩家(慎用! 广播类接口必须限制调用频率, 防止CC攻击)
//除非必须使用, 否则改用对象更加明确的CParty::send_to_party/GameWorld::send_to_area
const GameWorld_send_all = new NativeFunction(ptr(0x86C8C14), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
const GameWorld_send_all_with_state = new NativeFunction(ptr(0x86C9184), 'int', ['pointer', 'pointer', 'int'], { "abi": "sysv" });
//通知客户端道具更新(客户端指针, 通知方式[仅客户端=1, 世界广播=0, 小队=2, war room=3], itemSpace[装备=0, 时装=1], 道具所在的背包槽)
const CUser_SendUpdateItemList = new NativeFunction(ptr(0x867C65A), 'int', ['pointer', 'int', 'int', 'int'], { "abi": "sysv" });
//通知客户端更新已完成任务列表
const CUser_send_clear_quest_list = new NativeFunction(ptr(0x868B044), 'int', ['pointer'], { "abi": "sysv" });
//通知客户端更新角色任务列表
const UserQuest_get_quest_info = new NativeFunction(ptr(0x86ABBA8), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
//获取在线玩家数量
const GameWorld_get_UserCount_InWorld = new NativeFunction(ptr(0x86C4550), 'int', ['pointer'], { "abi": "sysv" });
//在线玩家列表(用于std::map遍历)
const gameworld_user_map_begin = new NativeFunction(ptr(0x80F78A6), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
const gameworld_user_map_end = new NativeFunction(ptr(0x80F78CC), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
const gameworld_user_map_not_equal = new NativeFunction(ptr(0x80F78F2), 'bool', ['pointer', 'pointer'], { "abi": "sysv" });
const gameworld_user_map_get = new NativeFunction(ptr(0x80F7944), 'pointer', ['pointer'], { "abi": "sysv" });
const gameworld_user_map_next = new NativeFunction(ptr(0x80F7906), 'pointer', ['pointer', 'pointer'], { "abi": "sysv" });
const GameWorld_getDungeonMinimumRequiredLevel = new NativeFunction(ptr(0x086c9076), 'int', ['pointer','int'], {"abi":"sysv"});
const GameWorld_send_user_dungeon_inout_message = new NativeFunction(ptr(0x086c8fc8), 'void', ['pointer','pointer','int','int'], {"abi":"sysv"});
const GameWorld_IsPvPSkilTreeChannel = new NativeFunction(ptr(0x0823441e), 'int', ['pointer'], {"abi":"sysv"});

//发系统邮件(多道具)
const WongWork_CMailBoxHelper_ReqDBSendNewSystemMultiMail = new NativeFunction(ptr(0x8556B68), 'int', ['pointer', 'pointer', 'int', 'int', 'int', 'pointer', 'int', 'int', 'int', 'int'], { "abi": "sysv" });
const WongWork_CMailBoxHelper_MakeSystemMultiMailPostal = new NativeFunction(ptr(0x8556A14), 'int', ['pointer', 'pointer', 'int'], { "abi": "sysv" });
//发系统邮件(时装)(仅支持在线角色发信)
const WongWork_CMailBoxHelper_ReqDBSendNewAvatarMail = new NativeFunction(ptr(0x85561B0), 'pointer', ['pointer', 'int', 'int', 'int', 'int', 'int', 'int', 'pointer', 'int'], { "abi": "sysv" });

const WongWork_CUserPremium_GetGoldBonus = new NativeFunction(ptr(0x08694a64), 'int', ['pointer','int'], {"abi":"sysv"});
const WongWork_CUserPremium_RecalcAdditionalInfo = new NativeFunction(ptr(0x086ae8c6), 'pointer', ['pointer','pointer'], {"abi":"sysv"});
const WongWork_CGMAccounts_isGM = new NativeFunction(ptr(0x08109346), 'int', ['pointer','int'], {"abi":"sysv"});
const WongWork_CSkillChanger_CheckCondition = new NativeFunction(ptr(0x08609d10), 'int', ['pointer'], {"abi":"sysv"});
const WongWork_CSkillChanger_d_CSkillChanger = new NativeFunction(ptr(0x08234fc4), 'void', ['pointer'], {"abi":"sysv"});
const WongWork_CSkillChanger_CSkillChanger = new NativeFunction(ptr(0x08234fbe), 'void', ['pointer'], {"abi":"sysv"});
const WongWork_CSkillChanger_SkillInitialize = new NativeFunction(ptr(0x08609e90), 'pointer', ['pointer','pointer','int','int'], {"abi":"sysv"});
const WongWork_CMailBoxHelper_ReqDBSendNewSystemMail = new NativeFunction(ptr(0x085555e8), 'int', ['pointer'], {"abi":"sysv"});

//检测当前角色是否可接该任务
const stSelectQuestParam_stSelectQuestParam = new NativeFunction(ptr(0x83480B4), 'pointer', ['pointer', 'pointer'], {"abi":"sysv"});
const Quest_check_possible = new NativeFunction(ptr(0x8352D86), 'int', ['pointer', 'pointer'], {"abi":"sysv"});

const AvatarCoin_Add = new NativeFunction(ptr(0x0817fefa), 'int', ['pointer','int'], {"abi":"sysv"});
const AvatarCoin_SaveToDB = new NativeFunction(ptr(0x081800d6), 'int', ['pointer'], {"abi":"sysv"});
const AvatarCoin_SendSyncPacket = new NativeFunction(ptr(0x0817ffe4), 'int', ['pointer'], {"abi":"sysv"});
const AvatarCoin_HistoryLog_AddLog = new NativeFunction(ptr(0x0817ff9c), 'void', ['pointer','pointer'], {"abi":"sysv"});


const CPremiumLetheManager_InitLetheSkill = new NativeFunction(ptr(0x085c4008), 'int', ['int','pointer','int'], {"abi":"sysv"});
const CPremiumLetheManager_UpdateBackupSkillFlag = new NativeFunction(ptr(0x085c3f30), 'int', ['int','pointer','int'], {"abi":"sysv"});
const CPremiumLetheManager_ConfirmSkillReq = new NativeFunction(ptr(0x085c3d70), 'int', ['pointer','pointer'], {"abi":"sysv"});

const SkillSlot_get_remain_sp_at_index = new NativeFunction(ptr(0x08603528), 'int', ['pointer','pointer'], {"abi":"sysv"});
const SkillSlot_get_remain_sfp_at_index = new NativeFunction(ptr(0x086035f2), 'int', ['pointer','pointer'], {"abi":"sysv"});
const SkillSlot_growtype_skill = new NativeFunction(ptr(0x086040bc), 'int', ['pointer','pointer','int','int','int'], {"abi":"sysv"});
const SkillSlot_set_remain_sp_at_index = new NativeFunction(ptr(0x086034f8), 'int', ['int','int','int'], {"abi":"sysv"});
const SkillSlot_clear_sfp_skills = new NativeFunction(ptr(0x08604e78), 'int', ['int','int','pointer'], {"abi":"sysv"});
const SkillSlot_clear_all_skills = new NativeFunction(ptr(0x08604d90), 'int', ['pointer','int'], {"abi":"sysv"});
const SkillSlot_clear_all_skills_both = new NativeFunction(ptr(0x08604e08), 'int', ['pointer'], {"abi":"sysv"});
const SkillSlot_set_parent = new NativeFunction(ptr(0x0822ee2e), 'pointer', ['pointer','pointer'], {"abi":"sysv"});
const addSkillOnCreateCharacter = new NativeFunction(ptr(0x08604fe2), 'void', ['int','int'], {"abi":"sysv"});
const CCharacter_get_give_skill = new NativeFunction(ptr(0x08348798), 'int', ['int','int','int','int','int'], {"abi":"sysv"});

const CQuestShop_clearQP = new NativeFunction(ptr(0x085ef54c), 'int', ['pointer', 'pointer'], {"abi":"sysv"});
const CQuestShop_sendCharacQp = new NativeFunction(ptr(0x085ef6fc), 'void', ['pointer', 'pointer','int'], {"abi":"sysv"});

//通知客户端QuestPiece更新
const GET_USER = new NativeFunction(ptr(0x084bb9cf),  'int', ['pointer'], {"abi":"sysv"});
// 通知客户端更新背包栏
const CUser_send_itemspace = new NativeFunction(ptr(0x865DB6C),  'int', ['pointer', 'int'], {"abi":"sysv"});
//是否GM任务模式
const CUser_getGmQuestFlag = new NativeFunction(ptr(0x822FC8E),  'int', ['pointer'], {"abi":"sysv"});
//计算任务基础奖励(不包含道具奖励)
const CUser_quest_basic_reward = new NativeFunction(ptr(0x866E7A8),  'int', ['pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'int'], {"abi":"sysv"});
//通知客户端QP更新
const CUser_sendCharacQp = new NativeFunction(ptr(0x868AC24),  'int', ['pointer'], {"abi":"sysv"});
//通知客户端QuestPiece更新
const CUser_sendCharacQuestPiece = new NativeFunction(ptr(0x868AF2C),  'int', ['pointer'], {"abi":"sysv"});
// 获取账号金库
const CUser_GetAccountCargo = new NativeFunction(ptr(0x0822fc22), 'pointer', ['pointer'], {"abi":"sysv"});
//重置异界/极限祭坛次数
const CUser_DimensionInoutUpdate = new NativeFunction(ptr(0x8656C12),  'int', ['pointer', 'int', 'int'], {"abi":"sysv"});
// 设置用户最大等级 int为等级
const CUser_SetUserMaxLevel = new NativeFunction(ptr(0x0868fec8), 'pointer', ['pointer', 'int'], {"abi":"sysv"});
const CUser_CalcurateUserMaxLevel = new NativeFunction(ptr(0x0868ff04), 'pointer', ['pointer'], {"abi":"sysv"});
//返回选择角色界面
const CUser_ReturnToSelectCharacList = new NativeFunction(ptr(0x8686FEE), 'int', ['pointer', 'int'], {"abi":"sysv"});
const CUser_onLevelUp = new NativeFunction(ptr(0x0866311a), 'void', ['pointer'], {"abi":"sysv"});
const CUser_getHades = new NativeFunction(ptr(0x08230800), 'pointer', ['pointer'], {"abi":"sysv"});
const CUser_check_level_up = new NativeFunction(ptr(0x08662aea), 'int', ['pointer','int','int','int','int'], {"abi":"sysv"});
const CUser_gain_sp = new NativeFunction(ptr(0x0866a9a0), 'int', ['pointer','int'], {"abi":"sysv"});
const CUser_gain_sfp = new NativeFunction(ptr(0x0866aad2), 'int', ['pointer','int'], {"abi":"sysv"});
const CUser_history_log_sp = new NativeFunction(ptr(0x0866ac0e), 'pointer', ['pointer','int','int','int'], {"abi":"sysv"});
const CUser_history_log_sfp = new NativeFunction(ptr(0x0866acd0), 'pointer', ['pointer','int','int','int'], {"abi":"sysv"});
const CUser_GetTutorialSkipable = new NativeFunction(ptr(0x084ecad4), 'int', ['pointer'], {"abi":"sysv"});
const CUser_UpdateTutorialSkipable = new NativeFunction(ptr(0x08697318), 'int', ['pointer'], {"abi":"sysv"});
const CUser_update_charac_stat = new NativeFunction(ptr(0x086646c8), 'int', ['pointer','int'], {"abi":"sysv"});
const CUser_GetServerGroup = new NativeFunction(ptr(0x080cbc90), 'int', ['pointer'], {"abi":"sysv"});
const CUser_makeGuildLevelUpMessage = new NativeFunction(ptr(0x08679754), 'void', ['pointer','int'], {"abi":"sysv"});
const CUser_getCurCharacQuestR = new NativeFunction(ptr(0x0819a8a6),  'pointer', ['pointer'], {"abi":"sysv"});
const CUser_UpdateUserInfo4Guild = new NativeFunction(ptr(0x0867cd20), 'void', ['pointer'], {"abi":"sysv"});
const CUser_get_charac_no = new NativeFunction(ptr(0x0815741c), 'int', ['pointer','int'], {"abi":"sysv"});
const CUser_VerifyPresentAvengerTitle = new NativeFunction(ptr(0x0868b552), 'int', ['pointer'], {"abi":"sysv"});
const CUser_AddCurCharacMercenaryInfo = new NativeFunction(ptr(0x0868e596), 'pointer', ['pointer'], {"abi":"sysv"});
const CUser_decide_growth_power_reward_system = new NativeFunction(ptr(0x0868d780), 'int', ['pointer'], {"abi":"sysv"});
const CUser_ReCalcChattingEmoticon = new NativeFunction(ptr(0x08689a22), 'void', ['pointer'], {"abi":"sysv"});
const CUser_SendChattingEmoticon = new NativeFunction(ptr(0x08689b90), 'void', ['pointer'], {"abi":"sysv"});
const CUser_isAffectedPremium = new NativeFunction(ptr(0x080e600e), 'int', ['int', 'int'], {"abi":"sysv"});
const CUser_processNPCGiftOnLevelUp = new NativeFunction(ptr(0x0866407a), 'void', ['pointer'], {"abi":"sysv"});
const CUser_processLevelUpEventReward = new NativeFunction(ptr(0x08663cc0), 'int', ['pointer','int'], {"abi":"sysv"});
const CUser_processLevelUpEvent = new NativeFunction(ptr(0x0869115a), 'int', ['pointer'], {"abi":"sysv"});
const CUser_incPlayExpAdd = new NativeFunction(ptr(0x0869729a), 'pointer', ['pointer', 'int'], {"abi":"sysv"});
const CUser_CheckInTrade = new NativeFunction(ptr(0x080da2fe), 'uint16', ['pointer'], {"abi":"sysv"});
const CUser_getCurCharacTotalFatigue = new NativeFunction(ptr(0x08657766), 'int', ['pointer'], {"abi":"sysv"});
const CUser_IsGuildMaster = new NativeFunction(ptr(0x08230172), 'int', ['pointer'], {"abi":"sysv"});
const CUser_GetGuildDBInfo = new NativeFunction(ptr(0x08230164), 'pointer', ['pointer'], {"abi":"sysv"});
const CUser_CalLevelUpItemCheck = new NativeFunction(ptr(0x08689d06), 'int', ['pointer','int'], {"abi":"sysv"});
const CUser_CalLevelUpItemState = new NativeFunction(ptr(0x08689d74), 'int', ['pointer', 'pointer', 'pointer','int','int'], {"abi":"sysv"});
const CUser_GetCurExpertJobLevel = new NativeFunction(ptr(0x0868bc7c), 'int', ['pointer','int'], {"abi":"sysv"});
const CUser_send_skill_info = new NativeFunction(ptr(0x0866c46a), 'void', ['pointer'], {"abi":"sysv"});
const CUser_make_basic_info = new NativeFunction(ptr(0x0865a44e), 'int', ['pointer','pointer','int'], {"abi":"sysv"});
const CUser_GetWarRoom = new NativeFunction(ptr(0x086551de), 'pointer', ['pointer'], {"abi":"sysv"});
const CUser_adjust_charac_stat = new NativeFunction(ptr(0x08664766), 'int', ['pointer'], {"abi":"sysv"});
const CUser_increase_status = new NativeFunction(ptr(0x086657fc), 'void', ['pointer', 'int'], {"abi":"sysv"});
const CUser_SendTagCharacInfo = new NativeFunction(ptr(0x086903f8), 'void', ['pointer'], {"abi":"sysv"});
const CUser_giveCharacLinkBonusExp = new NativeFunction(ptr(0x08652564), 'void', ['pointer', 'int'], {"abi":"sysv"});
const CUser_RecoverFatigue = new NativeFunction(ptr(0x08657ada), 'int', ['pointer','int'], {"abi":"sysv"});
const CUser_SendFatigue = new NativeFunction(ptr(0x08656540), 'void', ['pointer'], {"abi":"sysv"});
const CUser_processLevelReward = new NativeFunction(ptr(0x0868745e), 'pointer', ['pointer','int','int','int'], {"abi":"sysv"});
const CUser_givePvPSkillTree = new NativeFunction(ptr(0x08665400), 'int', ['pointer','int','int','int'], {"abi":"sysv"});
const CUser_rewardExp = new NativeFunction(ptr(0x0868b20c), 'void', ['pointer', 'int', 'int', 'int', 'pointer', 'pointer','int','int'], {"abi":"sysv"});

//vector相关操作
const std_vector_std_pair_int_int_vector = new NativeFunction(ptr(0x81349D6), 'pointer', ['pointer'], { "abi": "sysv" });
const std_vector_std_pair_int_int_clear = new NativeFunction(ptr(0x817A342), 'pointer', ['pointer'], { "abi": "sysv" });
const std_make_pair_int_int = new NativeFunction(ptr(0x81B8D41), 'pointer', ['pointer', 'pointer', 'pointer'], { "abi": "sysv" });
const std_vector_std_pair_int_int_push_back = new NativeFunction(ptr(0x80DD606), 'pointer', ['pointer', 'pointer'], { "abi": "sysv" });
const vector_unsigned_int_operator = new NativeFunction(ptr(0x0808e1dc), 'pointer', ['pointer','int'], {"abi":"sysv"});
const std_vector_std_pair_int_int_size = new NativeFunction(ptr(0x080dd814), 'int', ['pointer'], {"abi":"sysv"});
const std_vector_std_pair_int_int_operator = new NativeFunction(ptr(0x080ea8a4), 'pointer', ['pointer','int'], {"abi":"sysv"});
const std_vector_std_pair_int_int_d_vector = new NativeFunction(ptr(0x081349ea), 'void', ['pointer'], {"abi":"sysv"});
const std_vector_charac_info_size = new NativeFunction(ptr(0x081a0b9a), 'int', ['pointer'], {"abi":"sysv"});
const std_vector_Charac_info_operatorArr = new NativeFunction(ptr(0x081a0bb8), 'int', ['pointer','int'], {"abi":"sysv"});

const LogManager_logFormat = new NativeFunction(ptr(0x08ad3c0a), 'int', ['pointer','int','pointer','pointer','pointer','pointer','...','pointer'], {"abi":"sysv"});
const cUserHistoryLog_EventCoinAdd = new NativeFunction(ptr(0x08683c58), 'pointer', ['pointer','int','int','int'], {"abi":"sysv"});
const cUserHistoryLog_CoinAdd = new NativeFunction(ptr(0x08683b90), 'int', ['pointer','int','int','int'], {"abi":"sysv"});
const HistoryLog_WriteLevelUp = new NativeFunction(ptr(0x084b9e5e), 'int', ['pointer','pointer'], {"abi":"sysv"});
const cUserHistoryLog_LevelUp = new NativeFunction(ptr(0x086845b2), 'int', ['pointer', 'int', 'int'], {"abi":"sysv"});
const cUserHistoryLog_ItemAdd = new NativeFunction(ptr(0x08682e84), 'int', ['int','int','int','int','pointer','int'], {"abi":"sysv"});

//点券充值
const WongWork_IPG_CIPGHelper_IPGInput = new NativeFunction(ptr(0x80FFCA4), 'int', ['pointer', 'pointer', 'int', 'int', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer'], { "abi": "sysv" });
//同步点券数据库
const WongWork_IPG_CIPGHelper_IPGQuery = new NativeFunction(ptr(0x8100790), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
//代币充值
const WongWork_IPG_CIPGHelper_IPGInputPoint = new NativeFunction(ptr(0x80FFFC0), 'int', ['pointer', 'pointer', 'int', 'int', 'pointer', 'pointer'], { "abi": "sysv" });
//从客户端封包中读取数据
const PacketBuf_get_byte = new NativeFunction(ptr(0x858CF22), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
const PacketBuf_get_short = new NativeFunction(ptr(0x858CFC0), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
const PacketBuf_get_int = new NativeFunction(ptr(0x858D27E), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
const PacketBuf_get_binary = new NativeFunction(ptr(0x858D3B2), 'int', ['pointer', 'pointer', 'int'], { "abi": "sysv" });
//服务器组包
const PacketGuard_PacketGuard = new NativeFunction(ptr(0x858DD4C), 'int', ['pointer'], { "abi": "sysv" });
const InterfacePacketBuf_put_header = new NativeFunction(ptr(0x80CB8FC), 'int', ['pointer', 'int', 'int'], { "abi": "sysv" });
const InterfacePacketBuf_put_byte = new NativeFunction(ptr(0x80CB920), 'int', ['pointer', 'uint8'], { "abi": "sysv" });
const InterfacePacketBuf_put_short = new NativeFunction(ptr(0x80D9EA4), 'int', ['pointer', 'uint16'], { "abi": "sysv" });
const InterfacePacketBuf_put_int = new NativeFunction(ptr(0x80CB93C), 'int', ['pointer', 'int'], { "abi": "sysv" });
const InterfacePacketBuf_put_binary = new NativeFunction(ptr(0x811DF08), 'int', ['pointer', 'pointer', 'int'], { "abi": "sysv" });
const InterfacePacketBuf_finalize = new NativeFunction(ptr(0x80CB958), 'int', ['pointer', 'int'], { "abi": "sysv" });
const Destroy_PacketGuard_PacketGuard = new NativeFunction(ptr(0x858DE80), 'int', ['pointer'], { "abi": "sysv" });
const InterfacePacketBuf_clear = new NativeFunction(ptr(0x080CB8E6), 'int', ['pointer'], { "abi": "sysv" });
const InterfacePacketBuf_put_packet = new NativeFunction(ptr(0x0815098E), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
const CAccountCargo_GetItemCount = new NativeFunction(ptr(0x0828A794), 'int', ['pointer'], { "abi": "sysv" });
const GetIntegratedPvPItemAttr = new NativeFunction(ptr(0x084FC5FF), 'int', ['pointer'], { "abi": "sysv" });
const PacketGuard_free_PacketGuard = new NativeFunction(ptr(0x0858de80), 'void', ['pointer'], {"abi":"sysv"});
const Packet_Monitor_Max_Level_BroadCast_Packet_Monitor_Max_Level_BroadCast = new NativeFunction(ptr(0x08694560), 'void', ['pointer'], {"abi":"sysv"});

const G_GameWorld = new NativeFunction(ptr(0x080DA3A7), 'pointer', [], { "abi": "sysv" });
const GameWorld_IsEnchantRevisionChannel = new NativeFunction(ptr(0x082343FC), 'int', ['pointer'], { "abi": "sysv" });
const stAmplifyOption_t_getAbilityType = new NativeFunction(ptr(0x08150732), 'uint8', ['pointer'], { "abi": "sysv" });
const stAmplifyOption_t_getAbilityValue = new NativeFunction(ptr(0x08150772), 'uint16', ['pointer'], { "abi": "sysv" });
//linux读本地文件
const fopen = new NativeFunction(Module.getExportByName(null, 'fopen'), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
const fread = new NativeFunction(Module.getExportByName(null, 'fread'), 'int', ['pointer', 'int', 'int', 'int'], { "abi": "sysv" });
const fclose = new NativeFunction(Module.getExportByName(null, 'fclose'), 'int', ['int'], { "abi": "sysv" });
//MYSQL操作
//游戏中已打开的数据库索引(游戏数据库非线程安全 谨慎操作)
const TAIWAN_CAIN = 2;
const DBMgr_GetDBHandle = new NativeFunction(ptr(0x83F523E), 'pointer', ['pointer', 'int', 'int'], { "abi": "sysv" });
const MySQL_MySQL = new NativeFunction(ptr(0x83F3AC8), 'pointer', ['pointer'], { "abi": "sysv" });
const MySQL_init = new NativeFunction(ptr(0x83F3CE4), 'int', ['pointer'], { "abi": "sysv" });
const MySQL_open = new NativeFunction(ptr(0x83F4024), 'int', ['pointer', 'pointer', 'int', 'pointer', 'pointer', 'pointer'], { "abi": "sysv" });
const MySQL_close = new NativeFunction(ptr(0x83F3E74), 'int', ['pointer'], { "abi": "sysv" });
const MySQL_set_query_2 = new NativeFunction(ptr(0x83F41C0), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
const MySQL_set_query_3 = new NativeFunction(ptr(0x83F41C0), 'int', ['pointer', 'pointer', 'pointer'], { "abi": "sysv" });
const MySQL_set_query_4 = new NativeFunction(ptr(0x83F41C0), 'int', ['pointer', 'pointer', 'int', 'int'], { "abi": "sysv" });
const MySQL_set_query_5 = new NativeFunction(ptr(0x83F41C0), 'int', ['pointer', 'pointer', 'int', 'int', 'int'], { "abi": "sysv" });
const MySQL_set_query_6 = new NativeFunction(ptr(0x83F41C0), 'int', ['pointer', 'pointer', 'int', 'int', 'int', 'int'], { "abi": "sysv" });
const MySQL_exec = new NativeFunction(ptr(0x83F4326), 'int', ['pointer', 'int'], { "abi": "sysv" });
const MySQL_exec_query = new NativeFunction(ptr(0x083F5348), 'int', ['pointer'], { "abi": "sysv" });
const MySQL_get_n_rows = new NativeFunction(ptr(0x80E236C), 'int', ['pointer'], { "abi": "sysv" });
const MySQL_fetch = new NativeFunction(ptr(0x83F44BC), 'int', ['pointer'], { "abi": "sysv" });
const MySQL_get_int = new NativeFunction(ptr(0x811692C), 'int', ['pointer', 'int', 'pointer'], { "abi": "sysv" });
const MySQL_get_short = new NativeFunction(ptr(0x0814201C), 'int', ['pointer', 'int', 'pointer'], { "abi": "sysv" });
const MySQL_get_uint = new NativeFunction(ptr(0x80E22F2), 'int', ['pointer', 'int', 'pointer'], { "abi": "sysv" });
const MySQL_get_ulonglong = new NativeFunction(ptr(0x81754C8), 'int', ['pointer', 'int', 'pointer'], { "abi": "sysv" });
const MySQL_get_ushort = new NativeFunction(ptr(0x8116990), 'int', ['pointer'], { "abi": "sysv" });
const MySQL_get_float = new NativeFunction(ptr(0x844D6D0), 'int', ['pointer', 'int', 'pointer'], { "abi": "sysv" });
const MySQL_get_binary = new NativeFunction(ptr(0x812531A), 'int', ['pointer', 'int', 'pointer', 'int'], { "abi": "sysv" });
const MySQL_get_binary_length = new NativeFunction(ptr(0x81253DE), 'int', ['pointer', 'int'], { "abi": "sysv" });
const MySQL_get_str = new NativeFunction(ptr(0x80ECDEA), 'int', ['pointer', 'int', 'pointer', 'int'], { "abi": "sysv" });
const MySQL_blob_to_str = new NativeFunction(ptr(0x83F452A), 'pointer', ['pointer', 'int', 'pointer', 'int'], { "abi": "sysv" });
const compress_zip = new NativeFunction(ptr(0x86B201F), 'int', ['pointer', 'pointer', 'pointer', 'int'], { "abi": "sysv" });
const uncompress_zip = new NativeFunction(ptr(0x86B2102), 'int', ['pointer', 'pointer', 'pointer', 'int'], { "abi": "sysv" });
const StreamPool_Acquire = new NativeFunction(ptr(0x0828FA86), 'pointer', ['pointer', 'pointer', 'int'], { "abi": "sysv" });
const CStreamGuard_CStreamGuard = new NativeFunction(ptr(0x080C8C26), 'void', ['pointer', 'pointer', 'int'], { "abi": "sysv" });
const CStreamGuard_operator = new NativeFunction(ptr(0x080C8C46), 'int', ['int'], { "abi": "sysv" });
const CStreamGuard_operator_int = new NativeFunction(ptr(0x080C8C56), 'int', ['pointer', 'int'], { "abi": "sysv" });
const CStreamGuard_operator_p = new NativeFunction(ptr(0x080C8C4E), 'int', ['int'], { "abi": "sysv" });
const CStreamGuard_GetInBuffer_SIG_ACCOUNT_CARGO_DATA = new NativeFunction(ptr(0x08453A10), 'pointer', ['pointer'], { "abi": "sysv" });
const MsgQueueMgr_put = new NativeFunction(ptr(0x08570FDE), 'int', ['int', 'int', 'pointer'], { "abi": "sysv" });
const CAccountCargo_SetStable = new NativeFunction(ptr(0x0844DC16), 'pointer', ['pointer'], { "abi": "sysv" });
const Destroy_CStreamGuard_CStreamGuard = new NativeFunction(ptr(0x0861C8D2), 'void', ['pointer'], { "abi": "sysv" });
const AccountCargoScript_GetCurrUpgradeInfo = new NativeFunction(ptr(0x088C80BA), 'int', ['pointer', 'int'], { "abi": "sysv" });
const CStackableItem_getStackableLimit = new NativeFunction(ptr(0x0822C9FC), 'int', ['pointer'], { "abi": "sysv" });
const CItem_isPackagable = new NativeFunction(ptr(0x0828B5B4), 'int', ['pointer'], { "abi": "sysv" });
const stAmplifyOption_t_GetLock = new NativeFunction(ptr(0x0828B5A8), 'int', ['pointer'], { "abi": "sysv" });
const CUser_GetCharacExpandDataR = new NativeFunction(ptr(0x0828B5DE), 'int', ['int', 'int'], { "abi": "sysv" });
const item_lock_CItemLock_CheckItemLock = new NativeFunction(ptr(0x08541A96), 'int', ['int', 'int'], { "abi": "sysv" });
const CItem_GetAttachType = new NativeFunction(ptr(0x80F12E2), 'int', ['pointer'], { "abi": "sysv" });
const UpgradeSeparateInfo_IsTradeRestriction = new NativeFunction(ptr(0x08110B0A), 'int', ['pointer'], { "abi": "sysv" });
const CUser_isGMUser = new NativeFunction(ptr(0x0814589C), 'int', ['pointer'], { "abi": "sysv" });
const CItem_getUsablePeriod = new NativeFunction(ptr(0x08110C60), 'int', ['pointer'], { "abi": "sysv" });
const CItem_getExpirationDate = new NativeFunction(ptr(0x080F1306), 'int', ['pointer'], { "abi": "sysv" });
//线程安全锁
const Guard_Mutex_Guard = new NativeFunction(ptr(0x810544C), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
const Destroy_Guard_Mutex_Guard = new NativeFunction(ptr(0x8105468), 'int', ['pointer'], { "abi": "sysv" });
//服务器内置定时器队列
const G_TimerQueue = new NativeFunction(ptr(0x80F647C), 'pointer', [], { "abi": "sysv" });
//需要在dispatcher线程执行的任务队列(热加载后会被清空)
var timer_dispatcher_list = [];
const INVENTORY_TYPE_BODY = 0; //身上穿的装备
const INVENTORY_TYPE_ITEM = 1; //物品栏
const INVENTORY_TYPE_AVATAR = 2; //时装栏
//已打开的数据库句柄
var mysql_taiwan_cain = null;
var mysql_taiwan_cain_2nd = null;
var mysql_taiwan_billing = null;
var mysql_frida = null;
// 怪物攻城活动状态常量已迁移到 script/js/village_attack_state.js。
// startup_modules.js 会无条件加载该状态模块，供 DB 存档和活动启动逻辑使用。

const CUser_AddItem = new NativeFunction(ptr(0x867B6D4), 'int', ['pointer', 'int', 'int', 'int', 'pointer', 'int'], {"abi":"sysv"});
//获取角色所在队伍
const CUser_GetParty = new NativeFunction(ptr(0x0865514C), 'pointer', ['pointer'], { "abi": "sysv" });
//获取队伍中玩家
const CParty_get_user = new NativeFunction(ptr(0x08145764), 'pointer', ['pointer', 'int'], { "abi": "sysv" });
//获取角色扩展数据
const CUser_GetCharacExpandData = new NativeFunction(ptr(0x080DD584), 'pointer', ['pointer', 'int'], { "abi": "sysv" });
//绝望之塔层数
const TOD_Layer_TOD_Layer = new NativeFunction(ptr(0x085FE7B4), 'pointer', ['pointer', 'int'], { "abi": "sysv" });
//设置绝望之塔层数
const TOD_UserState_setEnterLayer = new NativeFunction(ptr(0x086438FC), 'pointer', ['pointer', 'pointer'], { "abi": "sysv" });
//获取角色当前持有金币数量
const CInventory_get_money = new NativeFunction(ptr(0x81347D6), 'int', ['pointer'], { "abi": "sysv" });
//通知客户端更新角色身上装备
const CUser_SendNotiPacket = new NativeFunction(ptr(0x0867BA5C), 'int', ['pointer', 'int', 'int', 'int'], { "abi": "sysv" });
//开启怪物攻城
const Inter_VillageAttackedStart_dispatch_sig = new NativeFunction(ptr(0x84DF47A), 'pointer', ['pointer', 'pointer', 'pointer'], { "abi": "sysv" });
//结束怪物攻城
const village_attacked_CVillageMonsterMgr_OnDestroyVillageMonster = new NativeFunction(ptr(0x086B43D4), 'pointer', ['pointer', 'int'], { "abi": "sysv" });
const GlobalData_s_villageMonsterMgr = ptr(0x941F77C);
const nullptr = Memory.alloc(4);
const Inven_Item = new NativeFunction(ptr(0x080CB854), 'void', ['pointer'], { "abi": "sysv" });
const GetItem_index = new NativeFunction(ptr(0x08110C48), 'int', ['pointer'], { "abi": "sysv" });
const GetCurCharacNo = new NativeFunction(ptr(0x80CBC4E), 'int', ['pointer'], { "abi": "sysv" });
const GetServerGroup = new NativeFunction(ptr(0x080CBC90), 'int', ['pointer'], { "abi": "sysv" });
const GetCurVAttackCount = new NativeFunction(ptr(0x084EC216), 'int', ['pointer'], { "abi": "sysv" });
const ReqDBSendNewSystemMail = new NativeFunction(ptr(0x085555E8), 'int', ['pointer', 'pointer', 'int', 'int', 'pointer', 'int', 'int', 'int', 'char', 'char'], { "abi": "sysv" });

//测试系统API
const strlen = new NativeFunction(Module.getExportByName(null, 'strlen'), 'int', ['pointer'], { "abi": "sysv" });
var global_config = {};


// ===== Utils: Logging / Config / Recharge =====
//获取道具名
const CItem_GetItemName = new NativeFunction(ptr(0x811ED82), 'pointer', ['pointer'], { "abi": "sysv" });

//本地时间戳
function get_timestamp() {
	var date = new Date();
	date = new Date(date.setHours(date.getHours())); //转换到本地时间
	const year = date.getFullYear().toString();
	const month = (date.getMonth() + 1).toString();
	const day = date.getDate().toString();
	const hour = date.getHours().toString();
	const minute = date.getMinutes().toString();
	const second = date.getSeconds().toString();
	const ms = date.getMilliseconds().toString();
	return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

//linux创建文件夹
function api_mkdir(path) {
	const opendir = new NativeFunction(Module.getExportByName(null, 'opendir'), 'int', ['pointer'], { "abi": "sysv" });
	const mkdir = new NativeFunction(Module.getExportByName(null, 'mkdir'), 'int', ['pointer', 'int'], { "abi": "sysv" });
	const path_ptr = Memory.allocUtf8String(path);
	if (opendir(path_ptr))
		return true;
	return mkdir(path_ptr, 0x1FF);
}

//字符串压缩(返回压缩后的指针与长度)
function api_compress_zip(s)
{
	const input = Memory.allocUtf8String(s);
	const alloc_buf_size = 1000 + strlen(s)*2;
	const output = Memory.alloc(alloc_buf_size);
	const output_len = Memory.alloc(4);
	output_len.writeInt(alloc_buf_size);
	compress_zip(output, output_len, input, strlen(s));

	return [output, output_len.readInt()];
}

//二进制数据解压缩
function api_uncompress_zip(p, len)
{
	const alloc_buf_size = 1000 + (len*10);
	const output = Memory.alloc(alloc_buf_size);
	const output_len = Memory.alloc(4);
	output_len.writeInt(alloc_buf_size);
	uncompress_zip(output, output_len, p, len);

	return output.readUtf8String(output_len.readInt());
}

//获取当前频道名
function api_CEnvironment_get_file_name() {
	const filename = CEnvironment_get_file_name(G_CEnvironment());
	return filename.readUtf8String(-1);
}

// 怪物攻城活动默认状态已迁移到 script/js/village_attack_state.js。
// 该模块会在缺失时创建 villageAttackEventInfo，避免热加载时重置活动数据。

//文件记录日志
const frida_log_dir_path = './frida_log/'
var f_log = null;
var log_day = null;
function log(msg) {
	var date = new Date();
	date = new Date(date.setHours(date.getHours())); //转换到本地时间
	const year = date.getFullYear().toString();
	const month = (date.getMonth() + 1).toString();
	const day = date.getDate().toString();
	const hour = date.getHours().toString();
	const minute = date.getMinutes().toString();
	const second = date.getSeconds().toString();
	const ms = date.getMilliseconds().toString();
	//日志按日期记录
	if ((f_log == null) || (log_day != day)) {
		api_mkdir(frida_log_dir_path);
		f_log = new File(frida_log_dir_path + 'frida_' + api_CEnvironment_get_file_name() + '_' + year + '_' + month + '_' + day + '.log', 'a+');
		log_day = day;
	}
	//时间戳
	const timestamp = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + ms;
	//控制台日志
	console.log('[' + get_timestamp() + '] [frida] [info] ' + msg + '\n');
	//文件日志
	f_log.write('[' + timestamp + ']' + msg + '\n');
	//立即写日志到文件中
	f_log.flush();
}

//内存十六进制打印
function bin2hex(p, len) {
	var hex = '';
	for (var i = 0; i < len; i++) {
		var s = p.add(i).readU8().toString(16);
		if (s.length == 1)
			s = '0' + s;
		hex += s;
		if (i != len - 1)
			hex += ' ';
	}
	return hex;
}

//获取道具名字
function api_CItem_GetItemName(item_id) {
	const citem = CDataManager_find_item(G_CDataManager(), item_id);
	if (!citem.isNull()) {
		return CItem_GetItemName(citem).readUtf8String(-1);
	}

	return item_id.toString();
}

//获取随机数
function get_random_int(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

//读取文件
function api_read_file(path, mode, len) {
	const path_ptr = Memory.allocUtf8String(path);
	const mode_ptr = Memory.allocUtf8String(mode);
	const f = fopen(path_ptr, mode_ptr);
	if (f == 0)
		return null;
	const data = Memory.alloc(len);
	const fread_ret = fread(data, 1, len, f);
	fclose(f);
	//返回字符串
	if (mode == 'r')
		return data.readUtf8String(fread_ret);
	//返回二进制buff指针
	return data;
}

//加载本地配置文件(json格式)
function load_config(path) {
	const data = api_read_file(path, 'r', 10 * 1024 * 1024);
	global_config = JSON.parse(data);
}

// 动态加载外部 JS 模块（通过 api_read_file + eval）
function dp_load(name) {
	const path = '/dp2/script/js/' + name + '.js';
	const code = api_read_file(path, 'r', 1024 * 1024);
	if (!code) {
		console.log('[dp_load] FAILED: cannot read ' + path);
		return false;
	}
	try {
		eval(code);
		console.log('[dp_load] loaded: ' + name + '.js');
		return true;
	} catch (e) {
		console.log('[dp_load] FAILED: ' + name + '.js - ' + e.message);
		return false;
	}
}

//获取系统UTC时间(秒)
function api_CSystemTime_getCurSec() {
	return GlobalData_s_systemTime_.readInt();
}

//获取道具数据
function find_item(item_id) {
	return CDataManager_find_item(G_CDataManager(), item_id);
}

//邮件函数封装
function CMailBoxHelperReqDBSendNewSystemMail(User, item_id, item_count, mail_title, mail_contact) {
	const retitem = find_item(item_id);
	if (retitem) {
		const Inven_ItemPr = Memory.alloc(100);
		Inven_Item(Inven_ItemPr); //清空道具
		const itemid = GetItem_index(retitem);
		const itemtype = retitem.add(8).readU8();
		Inven_ItemPr.writeU8(itemtype);
		Inven_ItemPr.add(2).writeInt(itemid);
		Inven_ItemPr.add(7).writeInt(item_count);
		// set_add_info(Inven_ItemPr, item_count);
		const GoldValue = 0;
		const TitlePr = Memory.allocUtf8String(mail_title);
		const TxtValue = mail_contact;
		const UserID = GetCurCharacNo(User);
		const TxtValuePr = Memory.allocUtf8String(TxtValue);
		const TxtValueLength = toString(TxtValue).length;
		const ServerGroup = GetServerGroup(User);
		const MailDate = 30;
		ReqDBSendNewSystemMail(TitlePr, Inven_ItemPr, GoldValue, UserID, TxtValuePr, TxtValueLength, MailDate, ServerGroup, 0, 0);
	}
}

//获取角色名字
function api_CUserCharacInfo_getCurCharacName(user) {
	const p = CUserCharacInfo_getCurCharacName(user);
	if (p.isNull()) {
		return '';
	}
	return p.readUtf8String(-1);
}

//点券充值 (禁止直接修改billing库所有表字段, 点券相关操作务必调用数据库存储过程!)
function api_recharge_cash_cera(user, amount) {
	//充值
	WongWork_IPG_CIPGHelper_IPGInput(ptr(0x941F734).readPointer(), user, 5, amount, ptr(0x8C7FA20), ptr(0x8C7FA20),
		Memory.allocUtf8String('GM'), ptr(0), ptr(0), ptr(0));
	//通知客户端充值结果
	WongWork_IPG_CIPGHelper_IPGQuery(ptr(0x941F734).readPointer(), user);
}

//代币充值 (禁止直接修改billing库所有表字段, 点券相关操作务必调用数据库存储过程!)
function api_recharge_cash_cera_point(user, amount) {
	//充值
	WongWork_IPG_CIPGHelper_IPGInputPoint(ptr(0x941F734).readPointer(), user, amount, 4, ptr(0), ptr(0));
	//通知客户端充值结果
	WongWork_IPG_CIPGHelper_IPGQuery(ptr(0x941F734).readPointer(), user);
}

//给角色发道具
function api_CUser_AddItem(user, item_id, item_cnt)
{
	const item_space = Memory.alloc(4);
	const slot = CUser_AddItem(user, item_id, item_cnt, 6, item_space, 0);

	if(slot >= 0)
	{
		//通知客户端有游戏道具更新
		CUser_SendUpdateItemList(user, 1, item_space.readInt(), slot);
	}

	return;
}

//抽取幸运在线玩家活动
function on_event_lucky_online_user() {
	//在线玩家数量
	const online_player_cnt = GameWorld_get_UserCount_InWorld(G_GameWorld());

	//没有在线玩家时跳过本轮活动
	if (online_player_cnt > 0) {
		//幸运在线玩家
		var lucky_user = null;

		//遍历在线玩家列表
		const it = api_gameworld_user_map_begin();
		const end = api_gameworld_user_map_end();

		//随机抽取一名在线玩家
		var user_index = get_random_int(0, online_player_cnt);

		while (user_index >= 0) {
			user_index--;

			//判断在线玩家列表遍历是否已结束
			if (gameworld_user_map_not_equal(it, end)) {
				//当前被遍历到的玩家
				lucky_user = api_gameworld_user_map_get(it);

				//state > 2 的玩家才有资格参加抽奖
				if (CUser_get_state(lucky_user) < 3) {
					lucky_user = null;
				}

				//继续遍历下一个玩家
				api_gameworld_user_map_next(it);
			}
			else {
				break;
			}
		}

		//给幸运玩家发奖
		if (lucky_user) {
			//获取该活动配置文件
			const config = global_config["lucky_online_user_event"];

			//道具奖励
			var reward_msg = '';
			for (var i = 0; i < config["reward_items_list"].length; ++i) {
				const item_id = config["reward_items_list"][i][0];
				const item_cnt = config["reward_items_list"][i][1];

				api_CUser_AddItem(lucky_user, item_id, item_cnt);

				reward_msg += api_CItem_GetItemName(item_id) + '*' + item_cnt + '\n';
			}

			//点券奖励
			api_recharge_cash_cera(lucky_user, config["reward_cash_cera"]);
			reward_msg += config["reward_cash_cera"] + ' 点券';

			//世界广播本轮幸运在线玩家
			api_GameWorld_SendNotiPacketMessage('<幸运在线玩家活动>开奖:\n恭喜 [' + api_CUserCharacInfo_getCurCharacName(lucky_user) + '] 成为本轮活动幸运玩家, 已发送奖励:\n' + reward_msg, 0);

		}
	}

	//定时开启下一次活动
	start_event_lucky_online_user();
}

//每小时开启抽取幸运在线玩家活动
function start_event_lucky_online_user() {
	//获取当前系统时间
	const cur_time = api_CSystemTime_getCurSec();

	//计算距离下次抽取幸运玩家时间(每小时执行一次)
	const delay_time = 3600 - (cur_time % 3600) + 3;

	//log('距离下次抽取幸运在线玩家还有:' + delay_time/60 + '分钟');

	//定时开启活动
	api_scheduleOnMainThread_delay(on_event_lucky_online_user, null, delay_time * 1000);

}

//获取在线玩家列表表头
function api_gameworld_user_map_begin() {
	const begin = Memory.alloc(4);
	gameworld_user_map_begin(begin, G_GameWorld().add(308));
	return begin;
}

//获取在线玩家列表表尾
function api_gameworld_user_map_end() {
	const end = Memory.alloc(4);
	gameworld_user_map_end(end, G_GameWorld().add(308));
	return end;
}

//获取当前正在遍历的玩家
function api_gameworld_user_map_get(it) {
	return gameworld_user_map_get(it).add(4).readPointer();
}

//遍历在线玩家列表
function api_gameworld_user_map_next(it) {
	const next = Memory.alloc(4);
	gameworld_user_map_next(next, it);
	return next;
}

//对全服在线玩家执行回调函数
function api_gameworld_foreach(f, args) {
	//遍历在线玩家列表
	const it = api_gameworld_user_map_begin();
	const end = api_gameworld_user_map_end();

	//判断在线玩家列表遍历是否已结束
	while (gameworld_user_map_not_equal(it, end)) {
		//当前被遍历到的玩家
		const user = api_gameworld_user_map_get(it);

		//只处理已登录角色
		if (CUser_get_state(user) >= 3) {
			//执行回调函数
			f(user, args);
		}
		//继续遍历下一个玩家
		api_gameworld_user_map_next(it);

// ===== Native: Mail / Packet / MySQL =====
	}
}

//设置角色当前绝望之塔层数
function api_TOD_UserState_setEnterLayer(user, layer) {
	const tod_layer = Memory.alloc(100);
	TOD_Layer_TOD_Layer(tod_layer, layer);
	const expand_data = CUser_GetCharacExpandData(user, 13);
	TOD_UserState_setEnterLayer(expand_data, tod_layer);
}

//根据角色id查询角色名
function api_get_charac_name_by_charac_no(charac_no) {
	//从数据库中查询角色名
	if (api_MySQL_exec(mysql_taiwan_cain, "select charac_name from charac_info where charac_no=" + charac_no + ";")) {
		if (MySQL_get_n_rows(mysql_taiwan_cain) == 1) {
			if (MySQL_fetch(mysql_taiwan_cain)) {
				const charac_name = api_MySQL_get_str(mysql_taiwan_cain, 0);
				return charac_name;
			}
		}
	}
	return charac_no.toString();
}

//发系统邮件(多道具)(角色charac_no, 邮件标题, 邮件正文, 金币数量, 道具列表)
function api_WongWork_CMailBoxHelper_ReqDBSendNewSystemMultiMail(target_charac_no, title, text, gold, item_list) {
	//添加道具附件
	const vector = Memory.alloc(100);
	std_vector_std_pair_int_int_vector(vector);
	std_vector_std_pair_int_int_clear(vector);

	for (var i = 0; i < item_list.length; ++i) {
		const item_id = Memory.alloc(4); //道具id
		const item_cnt = Memory.alloc(4); //道具数量
		item_id.writeInt(item_list[i][0]);
		item_cnt.writeInt(item_list[i][1]);
		const pair = Memory.alloc(100);
		std_make_pair_int_int(pair, item_id, item_cnt);
		std_vector_std_pair_int_int_push_back(vector, pair);
	}
	//邮件支持10个道具附件格子
	const addition_slots = Memory.alloc(1000);
	for (var i = 0; i < 10; ++i) {
		Inven_Item_Inven_Item(addition_slots.add(i * 61));
	}
	WongWork_CMailBoxHelper_MakeSystemMultiMailPostal(vector, addition_slots, 10);
	const title_ptr = Memory.allocUtf8String(title); //邮件标题
	const text_ptr = Memory.allocUtf8String(text); //邮件正文
	const text_len = strlen(text_ptr); //邮件正文长度
	//发邮件给角色
	WongWork_CMailBoxHelper_ReqDBSendNewSystemMultiMail(title_ptr, addition_slots, item_list.length, gold, target_charac_no, text_ptr, text_len, 0, 99, 1);
}

//全服在线玩家发信
function api_gameworld_send_mail(title, text, gold, item_list) {
	//遍历在线玩家列表
	const it = api_gameworld_user_map_begin();
	const end = api_gameworld_user_map_end();

	//判断在线玩家列表遍历是否已结束
	while (gameworld_user_map_not_equal(it, end)) {
		//当前被遍历到的玩家
		const user = api_gameworld_user_map_get(it);

		//只处理已登录角色
		if (CUser_get_state(user) >= 3) {
			//角色uid
			const charac_no = CUserCharacInfo_getCurCharacNo(user);
			//给角色发信
			api_WongWork_CMailBoxHelper_ReqDBSendNewSystemMultiMail(charac_no, title, text, gold, item_list);
		}
		//继续遍历下一个玩家
		api_gameworld_user_map_next(it);
	}
}

//服务器组包
function api_PacketGuard_PacketGuard() {
	const packet_guard = Memory.alloc(0x20000);
	PacketGuard_PacketGuard(packet_guard);
	return packet_guard;
}

//从客户端封包中读取数据(失败会抛异常, 调用方必须做异常处理)
function api_PacketBuf_get_byte(packet_buf) {
	const data = Memory.alloc(1);
	if (PacketBuf_get_byte(packet_buf, data)) {
		return data.readU8();
	}
	throw new Error('PacketBuf_get_byte Fail!');
}

function api_PacketBuf_get_short(packet_buf) {
	const data = Memory.alloc(2);

	if (PacketBuf_get_short(packet_buf, data)) {
		return data.readShort();
	}
	throw new Error('PacketBuf_get_short Fail!');
}

function api_PacketBuf_get_int(packet_buf) {
	const data = Memory.alloc(4);

	if (PacketBuf_get_int(packet_buf, data)) {
		return data.readInt();
	}
	throw new Error('PacketBuf_get_int Fail!');
}

function api_PacketBuf_get_binary(packet_buf, len) {
	const data = Memory.alloc(len);

	if (PacketBuf_get_binary(packet_buf, data, len)) {
		return data.readByteArray(len);
	}
	throw new Error('PacketBuf_get_binary Fail!');
}

//获取原始封包数据
function api_PacketBuf_get_buf(packet_buf) {
	return packet_buf.add(20).readPointer().add(13);
}

//给角色发消息
function api_CUser_SendNotiPacketMessage(user, msg, msg_type) {
	const p = Memory.allocUtf8String(msg);
	CUser_SendNotiPacketMessage(user, p, msg_type);
	return;
}

//发送字符串给客户端
function api_InterfacePacketBuf_put_string(packet_guard, s) {
	const p = Memory.allocUtf8String(s);
	const len = strlen(p);
	InterfacePacketBuf_put_int(packet_guard, len);
	InterfacePacketBuf_put_binary(packet_guard, p, len);
	return;
}

//世界广播(频道内公告)
function api_GameWorld_SendNotiPacketMessage(msg, msg_type) {
	const packet_guard = api_PacketGuard_PacketGuard();
	InterfacePacketBuf_put_header(packet_guard, 0, 12);
	InterfacePacketBuf_put_byte(packet_guard, msg_type);
	InterfacePacketBuf_put_short(packet_guard, 0);
	InterfacePacketBuf_put_byte(packet_guard, 0);
	api_InterfacePacketBuf_put_string(packet_guard, msg);
	InterfacePacketBuf_finalize(packet_guard, 1);
	GameWorld_send_all_with_state(G_GameWorld(), packet_guard, 3); //只给state >= 3 的玩家发公告
	Destroy_PacketGuard_PacketGuard(packet_guard);
}

//打开数据库
function api_MYSQL_open(db_name, db_ip, db_port, db_account, db_password) {
	//mysql初始化
	const mysql = Memory.alloc(0x80000);
	MySQL_MySQL(mysql);
	MySQL_init(mysql);
	//连接数据库
	const db_ip_ptr = Memory.allocUtf8String(db_ip);
	const db_name_ptr = Memory.allocUtf8String(db_name);
	const db_account_ptr = Memory.allocUtf8String(db_account);
	const db_password_ptr = Memory.allocUtf8String(db_password);
	const ret = MySQL_open(mysql, db_ip_ptr, db_port, db_name_ptr, db_account_ptr, db_password_ptr);
	if (ret) {
		//log('Connect MYSQL DB <' + db_name + '> SUCCESS!');
		return mysql;
	}
	return null;
}

//mysql查询(返回mysql句柄)(注意线程安全)
function api_MySQL_exec(mysql, sql) {
	const sql_ptr = Memory.allocUtf8String(sql);
	MySQL_set_query_2(mysql, sql_ptr);
	return MySQL_exec(mysql, 1);
}

//查询sql结果
//使用前务必保证api_MySQL_exec返回0
//并且MySQL_get_n_rows与预期一致
function api_MySQL_get_int(mysql, field_index) {
	const v = Memory.alloc(4);
	if (1 == MySQL_get_int(mysql, field_index, v))
		return v.readInt();
	//log('api_MySQL_get_int Fail!!!');
	return null;
}

function api_MySQL_get_uint(mysql, field_index) {
	const v = Memory.alloc(4);
	if (1 == MySQL_get_uint(mysql, field_index, v))
		return v.readUInt();
	//log('api_MySQL_get_uint Fail!!!');
	return null;
}

function api_MySQL_get_short(mysql, field_index) {
	const v = Memory.alloc(4);
	if (1 == MySQL_get_short(mysql, field_index, v))
		return v.readShort();
	//log('MySQL_get_short Fail!!!');
	return null;
}

function api_MySQL_get_float(mysql, field_index) {
	const v = Memory.alloc(4);
	if (1 == MySQL_get_float(mysql, field_index, v))
		return v.readFloat();
	//log('MySQL_get_float Fail!!!');
	return null;
}

function api_MySQL_get_str(mysql, field_index) {
	const binary_length = MySQL_get_binary_length(mysql, field_index);
	if (binary_length > 0) {
		const v = Memory.alloc(binary_length);
		if (1 == MySQL_get_binary(mysql, field_index, v, binary_length))
			return v.readUtf8String(binary_length);
	}
	//log('MySQL_get_str Fail!!!');
	return null;
}

function api_MySQL_get_binary(mysql, field_index) {
	const binary_length = MySQL_get_binary_length(mysql, field_index);
	if (binary_length > 0) {
		const v = Memory.alloc(binary_length);
		if (1 == MySQL_get_binary(mysql, field_index, v, binary_length))
			return v.readByteArray(binary_length);
	}
	//log('api_MySQL_get_binary Fail!!!');
	return null;
}

//初始化数据库(打开数据库/建库建表/数据库字段扩展)
function init_db() {
	//配置文件
	const config = global_config['db_config'];
	//打开数据库连接
	if (mysql_taiwan_cain == null) {
		mysql_taiwan_cain = api_MYSQL_open('taiwan_cain', '127.0.0.1', 3306, config['account'], config['password']);
	}
	if (mysql_taiwan_cain_2nd == null) {
		mysql_taiwan_cain_2nd = api_MYSQL_open('taiwan_cain_2nd', '127.0.0.1', 3306, config['account'], config['password']);
	}
	if (mysql_taiwan_billing == null) {
		mysql_taiwan_billing = api_MYSQL_open('taiwan_billing', '127.0.0.1', 3306, config['account'], config['password']);
	}
	//建库frida
	api_MySQL_exec(mysql_taiwan_cain, 'create database if not exists frida default charset utf8;');
	if (mysql_frida == null) {
		mysql_frida = api_MYSQL_open('frida', '127.0.0.1', 3306, config['account'], config['password']);
	}
	//建表frida.game_event
	api_MySQL_exec(mysql_frida, 'CREATE TABLE game_event (\
        event_id varchar(30) NOT NULL, event_info mediumtext NULL,\
        PRIMARY KEY  (event_id)\
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;');
	//载入活动数据
	event_villageattack_load_from_db();
}

//关闭数据库（卸载插件前调用）
function uninit_db() {
	//活动数据存档
	event_villageattack_save_to_db();
	//关闭数据库连接
	if (mysql_taiwan_cain) {
		MySQL_close(mysql_taiwan_cain);
		mysql_taiwan_cain = null;
	}
	if (mysql_taiwan_cain_2nd) {
		MySQL_close(mysql_taiwan_cain_2nd);
		mysql_taiwan_cain_2nd = null;
	}
	if (mysql_taiwan_billing) {
		MySQL_close(mysql_taiwan_billing);
		mysql_taiwan_billing = null;
	}
	if (mysql_frida) {
		MySQL_close(mysql_frida);
		mysql_frida = null;

// ===== Feature: Village Attack (怪物攻城) =====
	}
}

//怪物攻城活动数据存档
function event_villageattack_save_to_db() {
	api_MySQL_exec(mysql_frida, "replace into game_event (event_id, event_info) values ('villageattack', '" + JSON.stringify(villageAttackEventInfo) + "');");
}

//从数据库载入怪物攻城活动数据
function event_villageattack_load_from_db() {
	if (api_MySQL_exec(mysql_frida, "select event_info from game_event where event_id = 'villageattack';")) {
		if (MySQL_get_n_rows(mysql_frida) == 1) {
			MySQL_fetch(mysql_frida);
			const info = api_MySQL_get_str(mysql_frida, 0);
			villageAttackEventInfo = JSON.parse(info);
		}
	}
}

//处理到期的自定义定时器
function do_timer_dispatch() {
	//当前待处理的定时器任务列表
	const task_list = [];

	//线程安全
	const guard = api_Guard_Mutex_Guard();
	//依次取出队列中的任务
	while (timer_dispatcher_list.length > 0) {
		//先入先出
		const task = timer_dispatcher_list.shift();
		task_list.push(task);
	}
	Destroy_Guard_Mutex_Guard(guard);
	//执行任务
	for (var i = 0; i < task_list.length; ++i) {
		const task = task_list[i];

		const f = task[0];
		const args = task[1];
		f.apply(null, args);
	}
}

//申请锁(申请后务必手动释放!!!)
function api_Guard_Mutex_Guard() {
	const a1 = Memory.alloc(100);
	Guard_Mutex_Guard(a1, G_TimerQueue().add(16));

	return a1;
}

//挂接消息分发线程 确保代码线程安全
function hook_TimerDispatcher_dispatch() {
	//hook TimerDispatcher::dispatch
	//服务器内置定时器 每秒至少执行一次
	Interceptor.attach(ptr(0x8632A18),
		{
			onEnter: function (args) { },
			onLeave: function (retval) {
				//清空等待执行的任务队列
				do_timer_dispatch();
			}
		});
}

//在dispatcher线程执行(args为函数f的参数组成的数组, 若f无参数args可为null)
function api_scheduleOnMainThread(f, args) {
	//线程安全
	const guard = api_Guard_Mutex_Guard();
	timer_dispatcher_list.push([f, args]);
	Destroy_Guard_Mutex_Guard(guard);
	return;
}

//设置定时器 到期后在dispatcher线程执行
function api_scheduleOnMainThread_delay(f, args, delay) {
	setTimeout(api_scheduleOnMainThread, delay, f, args);
}

//重置活动数据
// 怪物攻城纯状态函数已迁移到 script/js/village_attack_state.js。
// 保留旧函数名兼容：reset_villageattack_info / set_villageattack_dungeon_difficult /

//怪物攻城活动计时器(每5秒触发一次)
function event_villageattack_timer() {
	if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_END)
		return;
	//活动结束检测
	const remain_time = event_villageattack_get_remain_time();
	if (remain_time <= 0) {
		//活动结束
		on_end_event_villageattack();
		return;
	}
	//当前应扣除的PT
	var damage = 0;
	//P2/P3阶段GBL主教扣PT
	if ((villageAttackEventInfo.state == VILLAGEATTACK_STATE_P2) || (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P3)) {
		for (var i = 0; i < villageAttackEventInfo.gbl_cnt; ++i) {
			if (get_random_int(0, 100) < (4 + villageAttackEventInfo.difficult)) {
				damage += 1;
			}
		}
	}
	//P3阶段世界BOSS自身回血
	if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P3) {
		if (get_random_int(0, 100) < (6 + villageAttackEventInfo.difficult)) {
			damage += 1;
		}
	}
	//扣除PT
	if (damage > 0) {
		villageAttackEventInfo.score -= damage;
		if (villageAttackEventInfo.score < EVENT_VILLAGEATTACK_TARGET_SCORE[villageAttackEventInfo.state - 1]) {
			villageAttackEventInfo.score = EVENT_VILLAGEATTACK_TARGET_SCORE[villageAttackEventInfo.state - 1]
		}
		//更新PT
		gameworld_update_villageattack_score();
	}
	//重复触发计时器
	if (villageAttackEventInfo.state != VILLAGEATTACK_STATE_END) {
		api_scheduleOnMainThread_delay(event_villageattack_timer, null, 5000);
	}
}

//开启怪物攻城活动
function start_villageattack() {
	console.log('start_villageattack-------------');
	const a3 = Memory.alloc(100);
	a3.add(10).writeInt(EVENT_VILLAGEATTACK_TOTAL_TIME); //活动剩余时间
	a3.add(14).writeInt(villageAttackEventInfo.score); //当前频道PT点数
	a3.add(18).writeInt(EVENT_VILLAGEATTACK_TARGET_SCORE[2]); //成功防守所需点数
	Inter_VillageAttackedStart_dispatch_sig(ptr(0), ptr(0), a3);
}

//开始怪物攻城活动
function on_start_event_villageattack() {
	//重置活动数据
	reset_villageattack_info();
	//通知全服玩家活动开始 并刷新城镇怪物
	start_villageattack();
	//开启活动计时器
	api_scheduleOnMainThread_delay(event_villageattack_timer, null, 5000);
	//公告通知当前活动进度
	event_villageattack_broadcast_difficulty();
}

//开启怪物攻城活动定时器
function start_event_villageattack_timer() {
	//获取当前系统时间
	const cur_time = api_CSystemTime_getCurSec();
	//计算距离下次开启怪物攻城活动的时间
	var delay_time = (3600 * EVENT_VILLAGEATTACK_START_HOUR) - (cur_time % (3600 * 24));
	if (delay_time <= 0)
		delay_time += 3600 * 24;
	//delay_time = 10;
	console.log('<>:' + delay_time);
	//log('距离下次开启<怪物攻城活动>还有:' + delay_time / 3600 + '小时');
	//log('距离下次开启<怪物攻城活动>还有:' + delay_time * 1000);
	//定时开启活动
	api_scheduleOnMainThread_delay(on_start_event_villageattack, null, delay_time * 1000);
}

//开启怪物攻城活动
function start_event_villageattack() {
	//patch相关函数, 修复活动流程
	hook_VillageAttack();
	console.log('-------------------- start_event_villageattack-----------------');
	if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_END) {
		//开启怪物攻城活动定时器
		start_event_villageattack_timer();
	}
	else {
		//开启活动计时器
		api_scheduleOnMainThread_delay(event_villageattack_timer, null, 5000);
	}
}


//计算活动剩余时间

//更新怪物攻城当前进度(广播给频道内在线玩家)
function gameworld_update_villageattack_score() {
	//计算活动剩余时间
	const remain_time = event_villageattack_get_remain_time();
	if ((remain_time <= 0) || (villageAttackEventInfo.state == VILLAGEATTACK_STATE_END))
		return;
	const packet_guard = api_PacketGuard_PacketGuard();
	InterfacePacketBuf_put_header(packet_guard, 0, 247); //协议: ENUM_NOTIPACKET_UPDATE_VILLAGE_ATTACKED
	InterfacePacketBuf_put_int(packet_guard, remain_time); //活动剩余时间
	InterfacePacketBuf_put_int(packet_guard, villageAttackEventInfo.score); //当前频道PT点数
	InterfacePacketBuf_put_int(packet_guard, EVENT_VILLAGEATTACK_TARGET_SCORE[2]); //成功防守所需点数
	InterfacePacketBuf_finalize(packet_guard, 1);
	GameWorld_send_all(G_GameWorld(), packet_guard);
	Destroy_PacketGuard_PacketGuard(packet_guard);
}

//通知玩家怪物攻城进度
function notify_villageattack_score(user) {
	//玩家当前PT点
	const charac_no = CUserCharacInfo_getCurCharacNo(user).toString();
	var villageattack_pt = 0;
	if (charac_no in villageAttackEventInfo.user_pt_info)
		villageattack_pt = villageAttackEventInfo.user_pt_info[charac_no][1];
	//计算活动剩余时间
	const remain_time = event_villageattack_get_remain_time();
	//log("remain_time=" + remain_time);
	if ((remain_time <= 0) || (villageAttackEventInfo.state == VILLAGEATTACK_STATE_END))
		return;
	//发包通知角色打开怪物攻城UI并更新当前进度
	const packet_guard = api_PacketGuard_PacketGuard();
	InterfacePacketBuf_put_header(packet_guard, 0, 248); //协议: ENUM_NOTIPACKET_STARTED_VILLAGE_ATTACKED
	InterfacePacketBuf_put_int(packet_guard, remain_time); //活动剩余时间
	InterfacePacketBuf_put_int(packet_guard, villageAttackEventInfo.score); //当前频道PT点数
	InterfacePacketBuf_put_int(packet_guard, EVENT_VILLAGEATTACK_TARGET_SCORE[2]); //成功防守所需点数
	InterfacePacketBuf_put_int(packet_guard, villageattack_pt); //个人PT点数
	InterfacePacketBuf_finalize(packet_guard, 1);
	CUser_Send(user, packet_guard);
	Destroy_PacketGuard_PacketGuard(packet_guard);
}

//怪物攻城活动相关patch
function hook_VillageAttack() {
	//怪物攻城副本回调
	Interceptor.attach(ptr(0x086B34A0),
		{
			onEnter: function (args) {
				//保存函数参数
				//var CVillageMonster = args[0];
				this.user = args[1];
			},
			onLeave: function (retval) {
				if (retval == 0 && this.user.isNull() == false) {
					VillageAttackedRewardSendReward(this.user);
				}
			}
		});
	//hook挑战攻城怪物副本结束事件, 更新怪物攻城活动各阶段状态
	//village_attacked::CVillageMonster::SendVillageMonsterFightResult
	Interceptor.attach(ptr(0x086B330A),
		{
			onEnter: function (args) {
				this.village_monster = args[0]; //当前挑战的攻城怪物
				this.user = args[1]; //当前挑战的角色
				this.result = args[2].toInt32(); //挑战结果: 1==成功
			},
			onLeave: function (retval) {
				//玩家杀死了攻城怪物
				if (this.result == 1) {
					if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_END) //攻城活动已结束
						return;
					//当前杀死的攻城怪物id
					const village_monster_id = this.village_monster.add(2).readUShort();
					//当前阶段杀死每只攻城怪物PT点数奖励: (1, 2, 4, 8, 16)
					const bonus_pt = 2 ** villageAttackEventInfo.difficult;
					//玩家所在队伍
					const party = CUser_GetParty(this.user);
					if (party.isNull())
						return;
					//更新队伍中的所有玩家PT点数
					for (var i = 0; i < 4; ++i) {
						const user = CParty_get_user(party, i);
						if (!user.isNull()) {
							//角色当前PT点数(游戏中的原始PT数据记录在village_attack_dungeon表中)
							const charac_no = CUserCharacInfo_getCurCharacNo(user).toString();
							if (!(charac_no in villageAttackEventInfo.user_pt_info))
								villageAttackEventInfo.user_pt_info[charac_no] = [CUser_get_acc_id(user), 0]; //记录角色accid, 方便离线充值
							//更新角色当前PT点数
							villageAttackEventInfo.user_pt_info[charac_no][1] += bonus_pt;

							//击杀世界BOSS, 额外获得PT奖励
							if ((village_monster_id == TAU_META_COW_MONSTER_ID) && (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P3)) {
								villageAttackEventInfo.user_pt_info[charac_no][1] += 1000 * (1 + villageAttackEventInfo.difficult);
							}
						}
					}
					if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P1) //怪物攻城一阶段
					{
						//更新频道内总PT
						villageAttackEventInfo.score += bonus_pt;

						//P1阶段未完成
						if (villageAttackEventInfo.score < EVENT_VILLAGEATTACK_TARGET_SCORE[0]) {
							//若杀死了牛头统帅, 则攻城难度+1
							if (village_monster_id == TAU_CAPTAIN_MONSTER_ID) {
								if (villageAttackEventInfo.difficult < 4) {
									villageAttackEventInfo.difficult += 1;
									//怪物攻城副本难度
									set_villageattack_dungeon_difficult(villageAttackEventInfo.difficult);
									//下次刷新出的攻城怪物为: 牛头统帅
									villageAttackEventInfo.next_village_monster_id = TAU_CAPTAIN_MONSTER_ID;
									//公告通知客户端活动进度
									event_villageattack_broadcast_difficulty();
								}
							}
						} else {
							//P1阶段已结束, 进入P2
							villageAttackEventInfo.state = VILLAGEATTACK_STATE_P2;
							villageAttackEventInfo.score = EVENT_VILLAGEATTACK_TARGET_SCORE[0];
							villageAttackEventInfo.p2_last_killed_monster_time = 0;
							villageAttackEventInfo.last_killed_monster_id = 0;
							villageAttackEventInfo.p2_kill_combo = 0;
							//公告通知客户端活动进度
							event_villageattack_broadcast_difficulty();
						}
					} else if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P2) //怪物攻城二阶段
					{
						//计算连杀时间
						const cur_time = api_CSystemTime_getCurSec();
						const diff_time = cur_time - villageAttackEventInfo.p2_last_killed_monster_time;

						//1分钟内连续击杀相同攻城怪物
						if ((diff_time < 60) && (village_monster_id == villageAttackEventInfo.last_killed_monster_id)) {
							//连杀点数+1
							villageAttackEventInfo.p2_kill_combo += 1;
							if (villageAttackEventInfo.p2_kill_combo >= 3) {
								//三连杀增加当前阶段总PT
								villageAttackEventInfo.score += 33;
								//重新计算连杀
								villageAttackEventInfo.last_killed_monster_id = 0;
								villageAttackEventInfo.p2_kill_combo = 0;
							}
						} else {
							//重新计算连杀
							villageAttackEventInfo.last_killed_monster_id = village_monster_id;
							villageAttackEventInfo.p2_kill_combo = 1;
						}
						//保存本次击杀时间
						villageAttackEventInfo.p2_last_killed_monster_time = cur_time;
						//P2阶段已结束, 进入P3
						if (villageAttackEventInfo.score >= EVENT_VILLAGEATTACK_TARGET_SCORE[1]) {
							//P2阶段已结束, 进入P3
							villageAttackEventInfo.state = VILLAGEATTACK_STATE_P3;
							villageAttackEventInfo.score = EVENT_VILLAGEATTACK_TARGET_SCORE[1];
							villageAttackEventInfo.next_village_monster_id = TAU_META_COW_MONSTER_ID;
							//公告通知客户端活动进度
							event_villageattack_broadcast_difficulty();
						}
					} else if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P3) //怪物攻城三阶段
					{
						//击杀世界boss
						if (village_monster_id == TAU_META_COW_MONSTER_ID) {
							//更新世界BOSS血量(PT)
							villageAttackEventInfo.score += 25;
							//继续刷新世界BOSS
							villageAttackEventInfo.next_village_monster_id = TAU_META_COW_MONSTER_ID;

							//世界广播
							api_GameWorld_SendNotiPacketMessage('<怪物攻城活动> 世界BOSS已被[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']击杀!', 14);

							//P3阶段已结束
							if (villageAttackEventInfo.score >= EVENT_VILLAGEATTACK_TARGET_SCORE[2]) {
								//怪物攻城活动防守成功, 立即结束活动
								villageAttackEventInfo.defend_success = 1;
								api_scheduleOnMainThread(on_end_event_villageattack, null);
								return;
							}
						}
					}
					//世界广播当前活动进度
					gameworld_update_villageattack_score();
					//通知队伍中的所有玩家更新PT点数
					for (var i = 0; i < 4; ++i) {
						const user = CParty_get_user(party, i);
						if (!user.isNull()) {
							notify_villageattack_score(user);
						}
					}
					//更新存活GBL主教数量
					if (village_monster_id == GBL_POPE_MONSTER_ID) {
						if (villageAttackEventInfo.gbl_cnt > 0) {
							villageAttackEventInfo.gbl_cnt -= 1;
						}
					}
				}
			}
		});
	//hook 刷新攻城怪物函数, 控制下一只刷新的攻城怪物id
	//village_attacked::CVillageMonsterArea::GetAttackedMonster
	Interceptor.attach(ptr(0x086B3AEA),
		{
			onEnter: function (args) { },
			onLeave: function (retval) {
				//返回值为下一次刷新的攻城怪物
				if (retval != 0) {
					//下一只刷新的攻城怪物
					const next_village_monster = ptr(retval);
					const next_village_monster_id = next_village_monster.readUShort();

					//当前刷新的怪物为机制怪物
					if ((next_village_monster_id == TAU_META_COW_MONSTER_ID) || (next_village_monster_id == TAU_CAPTAIN_MONSTER_ID)) {
						//替换为随机怪物
						next_village_monster.writeUShort(get_random_int(1, 17));
					}
					//如果需要刷新指定怪物
					if (villageAttackEventInfo.next_village_monster_id) {
						if ((villageAttackEventInfo.state == VILLAGEATTACK_STATE_P1) || (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P2)) {
							//P1 P2阶段立即刷新怪物
							next_village_monster.writeUShort(villageAttackEventInfo.next_village_monster_id);
							villageAttackEventInfo.next_village_monster_id = 0;
						} else if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P3) {
							//P3阶段 几率刷新出世界BOSS
							if (get_random_int(0, 100) < 44) {
								next_village_monster.writeUShort(villageAttackEventInfo.next_village_monster_id);
								villageAttackEventInfo.next_village_monster_id = 0;
								//世界广播
								api_GameWorld_SendNotiPacketMessage('<怪物攻城活动> 世界BOSS已刷新, 请勇士们前往挑战!', 14);
							}
						}
					}
					//统计存活GBL主教数量
					if (next_village_monster.readUShort() == GBL_POPE_MONSTER_ID) {
						villageAttackEventInfo.gbl_cnt += 1;
					}
				}
			}
		});
	//当前正在处理挑战的攻城怪物请求
	var state_on_fighting = false;
	//当前正在被挑战的怪物id
	var on_fighting_village_monster_id = 0;
	//hook 挑战攻城怪物函数 控制副本刷怪流程
	//CParty::OnFightVillageMonster
	Interceptor.attach(ptr(0x085B9596),
		{
			onEnter: function (args) {
				state_on_fighting = true;
				on_fighting_village_monster_id = 0;
			},
			onLeave: function (retval) {
				on_fighting_village_monster_id = 0;
				state_on_fighting = false;
			}
		});
	//village_attacked::CVillageMonster::OnFightVillageMonster
	Interceptor.attach(ptr(0x086B3240),
		{
			onEnter: function (args) {
				if (state_on_fighting) {
					const village_monster = args[0];

					//记录当前正在挑战的攻城怪物id
					on_fighting_village_monster_id = village_monster.add(2).readU16();
				}
			},
			onLeave: function (retval) { }
		});
	//hook 副本刷怪函数 控制副本内怪物的数量和属性
	//MapInfo::Add_Mob
	const read_f = new NativeFunction(ptr(0x08151612), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
	Interceptor.replace(ptr(0x08151612), new NativeCallback(function (map_info, monster) {
		//当前刷怪的副本id
		//var map_id = map_info.add(4).readUInt();
		//怪物攻城副本
		//if((map_id >= 40001) && (map_id <= 40095))
		if (state_on_fighting) {
			//怪物攻城活动未结束
			if (villageAttackEventInfo != VILLAGEATTACK_STATE_END) {
				//正在挑战世界BOSS
				if (on_fighting_village_monster_id == TAU_META_COW_MONSTER_ID) {
					//P3阶段
					if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P3) {
						//副本中有几率刷新出世界BOSS, 当前PT点数越高, 活动难度越大, 刷新出世界BOSS概率越大
						if (get_random_int(0, 100) < ((villageAttackEventInfo.score - EVENT_VILLAGEATTACK_TARGET_SCORE[1]) + (6 * villageAttackEventInfo.difficult))) {
							monster.add(0xc).writeUInt(TAU_META_COW_MONSTER_ID);
						}
					}
				}
				if (villageAttackEventInfo.difficult == 0) {
					//难度0: 无变化
					return read_f(map_info, monster);
				} else if (villageAttackEventInfo.difficult == 1) {
					//难度1: 怪物等级提升至100级
					monster.add(16).writeU8(100);
					return read_f(map_info, monster);
				} else if (villageAttackEventInfo.difficult == 2) {
					//难度2: 怪物等级提升至110级; 随机刷新紫名怪
					monster.add(16).writeU8(110);
					//非BOSS怪
					if (monster.add(8).readU8() != 3) {
						if (get_random_int(0, 100) < 50) {
							monster.add(8).writeU8(1); //怪物类型: 0-3
						}
					}
					return read_f(map_info, monster);
				} else if (villageAttackEventInfo.difficult == 3) {
					//难度3: 怪物等级提升至120级; 随机刷新不灭粉名怪; 怪物数量*2
					monster.add(16).writeU8(120);
					//非BOSS怪
					if (monster.add(8).readU8() != 3) {
						if (get_random_int(0, 100) < 75) {
							monster.add(8).writeU8(2); //怪物类型: 0-3
						}
					}
					//执行原始刷怪流程
					read_f(map_info, monster);
					//刷新额外的怪物(同一张地图内, 怪物index和怪物uid必须唯一, 这里为怪物分配新的index和uid)
					//额外刷新怪物数量
					var cnt = 1;
					//新的怪物uid偏移
					const uid_offset = 1000;
					//返回值
					var ret = 0;
					while (cnt > 0) {
						--cnt;
						//新增怪物index
						monster.writeUInt(monster.readUInt() + uid_offset);
						//新增怪物uid
						monster.add(4).writeUInt(monster.add(4).readUInt() + uid_offset);

						//为当前地图刷新额外的怪物
						ret = read_f(map_info, monster);
					}
					return ret;
				} else if (villageAttackEventInfo.difficult == 4) {
					//难度4: 怪物等级提升至127级; 随机刷新橙名怪; 怪物数量*4
					monster.add(16).writeU8(127);
					//非BOSS怪
					if (monster.add(8).readU8() != 3) {
						//英雄级副本精英怪类型等于2的怪为橙名怪
						monster.add(8).writeU8(get_random_int(1, 3)); //怪物类型: 0-3
					}
					//执行原始刷怪流程
					read_f(map_info, monster);
					//刷新额外的怪物(同一张地图内, 怪物index和怪物uid必须唯一, 这里为怪物分配新的index和uid)
					//额外刷新怪物数量
					var cnt = 3;
					//新的怪物uid偏移
					const uid_offset = 1000;
					//返回值
					var ret = 0;
					while (cnt > 0) {
						--cnt;
						//新增怪物index
						monster.writeUInt(monster.readUInt() + uid_offset);
						//新增怪物uid
						monster.add(4).writeUInt(monster.add(4).readUInt() + uid_offset);

						//为当前地图刷新额外的怪物
						ret = read_f(map_info, monster);
					}
					return ret;
				}
			}
		}
		//执行原始刷怪流程
		return read_f(map_info, monster);
	}, 'int', ['pointer', 'pointer']));
	//每次通关额外获取当前等级升级所需经验的0%-0.1%
	//village_attacked::CVillageMonsterMgr::OnKillVillageMonster
	Interceptor.attach(ptr(0x086B4866),
		{
			onEnter: function (args) {
				this.user = args[1];
				this.result = args[2].toInt32();
			},
			onLeave: function (retval) {
				if (retval == 0) {
					//挑战成功
					if (this.result) {
						//玩家所在队伍
						const party = CUser_GetParty(this.user);
						//怪物攻城挑战成功, 给队伍中所有成员发送额外通关发经验
						for (var i = 0; i < 4; ++i) {
							const user = CParty_get_user(party, i);
							if (!user.isNull()) {
								//随机经验奖励
								const cur_level = CUserCharacInfo_get_charac_level(user);
								const reward_exp = Math.floor(CUserCharacInfo_get_level_up_exp(user, cur_level) * get_random_int(0, 1000) / 1000000);
								//发经验
								api_CUser_gain_exp_sp(user, reward_exp);
								//通知玩家获取额外奖励
								api_CUser_SendNotiPacketMessage(user, '怪物攻城挑战成功, 获取额外经验奖励' + reward_exp, 0);
							}
						}
					}
				}
			}
		});
}

//结束怪物攻城活动(立即销毁攻城怪物, 不开启逆袭之谷, 不发送活动奖励)
function end_villageattack() {
	village_attacked_CVillageMonsterMgr_OnDestroyVillageMonster(GlobalData_s_villageMonsterMgr.readPointer(), 2);
}

//结束怪物攻城活动
function on_end_event_villageattack() {
	if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_END)
		return;
	//设置活动状态
	villageAttackEventInfo.state = VILLAGEATTACK_STATE_END;
	//立即结束怪物攻城活动
	end_villageattack();
	//防守成功
	if (villageAttackEventInfo.defend_success) {
		//频道内在线玩家发奖
		//发信奖励: 金币+道具
		const reward_gold = 1000000 * (1 + villageAttackEventInfo.difficult); //金币
		const reward_item_list =
			[
				[7745, 5 * (1 + villageAttackEventInfo.difficult)], //士气冲天
				[2600028, 5 * (1 + villageAttackEventInfo.difficult)], //天堂痊愈
				[42, 5 * (1 + villageAttackEventInfo.difficult)], //复活币
				[3314, 1 + villageAttackEventInfo.difficult], //绝望之塔通关奖章
			];
		api_gameworld_send_mail('<怪物攻城活动>', '恭喜勇士!', reward_gold, reward_item_list);

		//特殊奖励
		api_gameworld_foreach(function (user, args) {
			//设置绝望之塔当前层数为100层
			api_TOD_UserState_setEnterLayer(user, 99);
			//随机选择一件穿戴中的装备
			const inven = CUserCharacInfo_getCurCharacInvenW(user);
			const slot = get_random_int(10, 21); //12件装备slot范围10-21
			const equ = CInventory_GetInvenRef(inven, INVENTORY_TYPE_BODY, slot);
			if (Inven_Item_getKey(equ)) {
				//读取装备强化等级
				var upgrade_level = equ.add(6).readU8();
				if (upgrade_level < 31) {
					//提升装备的强化/增幅等级
					const bonus_level = get_random_int(1, 1 + villageAttackEventInfo.difficult);
					upgrade_level += bonus_level;
					if (upgrade_level >= 31)
						upgrade_level = 31;
					//提升强化/增幅等级
					equ.add(6).writeU8(upgrade_level);
					//通知客户端更新装备
					CUser_SendUpdateItemList(user, 1, 3, slot);
				}
			}
		}, null);
		//榜一大哥
		var rank_first_charac_no = 0;
		var rank_first_account_id = 0;
		var max_pt = 0;
		//论功行赏
		for (var charac_no in villageAttackEventInfo.user_pt_info) {
			//发点券
			const account_id = villageAttackEventInfo.user_pt_info[charac_no][0];
			const pt = villageAttackEventInfo.user_pt_info[charac_no][1];
			const reward_cera = pt * 10; //点券奖励 = 个人PT * 10
			const user_pr = GameWorld_find_user_from_world_byaccid(G_GameWorld(), account_id);
			api_recharge_cash_cera(user_pr, reward_cera);
			//找出榜一大哥
			if (pt > max_pt) {
				rank_first_charac_no = charac_no;
				rank_first_account_id = account_id;
				max_pt = pt;
			}
		}
		//频道内公告活动已结束
		api_GameWorld_SendNotiPacketMessage('<怪物攻城活动> 防守成功, 奖励已发送!', 14);
		if (rank_first_charac_no) {
			//个人积分排行榜第一名 额外获得10倍点券奖励
			const user_pr = GameWorld_find_user_from_world_byaccid(G_GameWorld(), rank_first_account_id);
			api_recharge_cash_cera(user_pr, max_pt * 10);

			//频道内广播本轮活动排行榜第一名玩家名字
			const rank_first_charac_name = api_get_charac_name_by_charac_no(rank_first_charac_no);
			api_GameWorld_SendNotiPacketMessage('<怪物攻城活动> 恭喜勇士 [' + rank_first_charac_name + '] 成为个人积分排行榜第一名(' + max_pt + 'pt)!', 14);
		}
	} else {
		//防守失败
		api_gameworld_foreach(function (user, args) {
			//获取角色背包
			const inven = CUserCharacInfo_getCurCharacInvenW(user);
			//在线玩家被攻城怪物随机掠夺一件穿戴中的装备
			if (get_random_int(0, 100) < 7) {
				//随机删除一件穿戴中的装备
				const slot = get_random_int(10, 21); //12件装备slot范围10-21
				const equ = CInventory_GetInvenRef(inven, INVENTORY_TYPE_BODY, slot);

				if (Inven_Item_getKey(equ)) {
					Inven_Item_reset(equ);
					//通知客户端更新装备
					CUser_SendNotiPacket(user, 1, 2, 3);
				}
			}
			//在线玩家被攻城怪物随机掠夺1%-10%所持金币
			const rate = get_random_int(1, 11);
			const cur_gold = CInventory_get_money(inven);
			const tax = Math.floor((rate / 100) * cur_gold);
			CInventory_use_money(inven, tax, 0, 0);
			//通知客户端更新金币数量
			CUser_SendUpdateItemList(user, 1, 0, 0);
		}, null);
		//频道内公告活动已结束
		api_GameWorld_SendNotiPacketMessage('<怪物攻城活动> 防守失败, 请勇士们再接再厉!', 14);
	}
	//释放空间
	villageAttackEventInfo.user_pt_info = {};
	//存档
	event_villageattack_save_to_db();
	//开启怪物攻城活动定时器

// ===== Feature: Quest / TOD Fixes =====
	start_event_villageattack_timer();
}

//无条件完成指定任务并领取奖励
function api_force_clear_quest(user, quest_id) {
	//设置GM完成任务模式(无条件完成任务)
	CUser_setGmQuestFlag(user, 1);
	//接受任务
	CUser_quest_action(user, 33, quest_id, 0, 0);
	//完成任务
	CUser_quest_action(user, 35, quest_id, 0, 0);
	//领取任务奖励(倒数第二个参数表示领取奖励的编号, -1=领取不需要选择的奖励; 0=领取可选奖励中的第1个奖励; 1=领取可选奖励中的第二个奖励)
	CUser_quest_action(user, 36, quest_id, -1, 1);

	//服务端有反作弊机制: 任务完成时间间隔不能小于1秒.  这里将上次任务完成时间清零 可以连续提交任务
	user.add(0x79644).writeInt(0);

	//关闭GM完成任务模式(不需要材料直接完成)
	CUser_setGmQuestFlag(user, 0);
	return;
}

//完成指定任务并领取奖励
function clear_doing_questEx(user, quest_id) { //完成指定任务并领取奖励1
	//玩家任务信息
	const user_quest = CUser_getCurCharacQuestW(user);
	//玩家已完成任务信息
	const WongWork_CQuestClear = user_quest.add(4);
	//pvf数据
	const data_manager = G_CDataManager();
	//跳过已完成的任务
	if (!WongWork_CQuestClear_isClearedQuest(WongWork_CQuestClear, quest_id)) {
		//获取pvf任务数据
		const quest = CDataManager_find_quest(data_manager, quest_id);
		if (!quest.isNull()) {
			//无条件完成指定任务并领取奖励
			api_force_clear_quest(user, quest_id);
			//通知客户端更新已完成任务列表
			CUser_send_clear_quest_list(user);
			//通知客户端更新任务列表
			const packet_guard = api_PacketGuard_PacketGuard();
			UserQuest_get_quest_info(user_quest, packet_guard);
			CUser_Send(user, packet_guard);
			Destroy_PacketGuard_PacketGuard(packet_guard);
		}
	} else {
		//公告通知客户端本次自动完成任务数据
		api_CUser_SendNotiPacketMessage(user, '当前任务已完成: ', 14);
	}
}

const QUEST_GRADE_COMMON_UNIQUE = 5;                  //任务脚本中[grade]字段对应的常量定义 可以在importQuestScript函数中找到
const QUEST_GRADE_NORMALLY_REPEAT = 4;                 //可重复提交的重复任务
const QUEST_GRADE_DAILY = 3;                          //每日任务
const QUEST_GRADE_EPIC = 0;
//完成角色当前可接的所有任务(仅发送金币/经验/QP等基础奖励 无道具奖励)
function clear_all_quest_by_character_level(user)
{
	//玩家任务信息
	const user_quest = CUser_getCurCharacQuestW(user);
	//玩家已完成任务信息
	const WongWork_CQuestClear = user_quest.add(4);
	//玩家当前等级
	const charac_lv = CUserCharacInfo_get_charac_level(user);

	//本次完成任务数量
	var clear_quest_cnt = 0;

	//pvf数据
	const data_manager = G_CDataManager();

	//首先完成当前已接任务
	clear_doing_quest(user);

	//完成当前等级所有任务总经验奖励
	var total_exp_bonus = 0;
	//完成当前等级所有任务总金币奖励
	var total_gold_bonus = 0;
	//任务点奖励
	var total_quest_point_bonus = 0;
	var total_quest_piece_bonus = 0;

	//任务最大编号: 29999
	for(var quest_id=1; quest_id<30000; quest_id++)
	{
		//跳过已完成的任务
		if(WongWork_CQuestClear_isClearedQuest(WongWork_CQuestClear, quest_id))
			continue;

		//获取任务数据
		const quest = CDataManager_find_quest(data_manager, quest_id);
		if(!quest.isNull())
		{
			//任务类型
			const quest_grade = quest.add(8).readInt();

			//跳过grade为[common unique]类型的任务(转职等任务)
			//跳过可重复提交的任务
			//跳过每日任务
			if((quest_grade != QUEST_GRADE_COMMON_UNIQUE) && (quest_grade != QUEST_GRADE_NORMALLY_REPEAT) && (quest_grade != QUEST_GRADE_DAILY))
			{
				//判断任务当前是否可接
				//var stSelectQuestParam = Memory.alloc(100);
				//stSelectQuestParam_stSelectQuestParam(stSelectQuestParam, user);
				//if(Quest_check_possible(quest, stSelectQuestParam))

				//只判断任务最低等级要求 忽略 职业/前置 等任务要求 可一次性完成当前等级所有任务
				const quest_min_lv = quest.add(0x20).readInt();
				if(quest_min_lv <= charac_lv)
				{
					//获取该任务的基础奖励
					const exp_bonus = Memory.alloc(4);
					const gold_bonus = Memory.alloc(4);
					const quest_point_bonus = Memory.alloc(4);
					const quest_piece_bonus = Memory.alloc(4);
					//QP奖励已直接发送到角色 经验/金币只返回结果  需要手动发送
					CUser_quest_basic_reward(user,quest, exp_bonus, gold_bonus, quest_point_bonus, quest_piece_bonus, 1);

					//统计本次自动完成任务的基础奖励
					const exp = exp_bonus.readInt();
					const gold = gold_bonus.readInt();
					const quest_point = quest_point_bonus.readInt();
					const quest_piece = quest_piece_bonus.readInt();
					if(exp > 0)
						total_exp_bonus += exp;
					if(gold > 0)
						total_gold_bonus += gold;
					if(quest_point > 0)
						total_quest_point_bonus += quest_point;     //没有[quest point]字段的任务quest_point=10000
					if(quest_piece > 0)
						total_quest_piece_bonus += quest_piece;

					//将该任务设置为已完成状态
					WongWork_CQuestClear_setClearedQuest(user_quest.add(4), quest_id);

					//本次自动完成任务计数
					clear_quest_cnt++;
				}
			}
		}
	}

	//通知客户端更新
	if(clear_quest_cnt > 0)
	{
		//发送任务经验奖励
		if(total_exp_bonus > 0)
			api_CUser_gain_exp_sp(user, total_exp_bonus);
		//发送任务金币奖励
		if(total_gold_bonus > 0)
			CInventory_gain_money(CUserCharacInfo_getCurCharacInvenW(user), total_gold_bonus, 0, 0, 0);

		//通知客户端更新奖励数据
		if ( CUser_get_state(user) == 3 )
		{
			CUser_SendNotiPacket(user, 0, 2, 0);
			CUser_SendNotiPacket(user, 1, 2, 1);

			CUser_SendUpdateItemList(user, 1, 0, 0);
			CUser_sendCharacQp(user);
			CUser_sendCharacQuestPiece(user);
		}

		//通知客户端更新已完成任务列表
		CUser_send_clear_quest_list(user);

		//通知客户端更新任务列表
		const packet_guard = api_PacketGuard_PacketGuard();
		UserQuest_get_quest_info(user_quest, packet_guard);
		CUser_Send(user, packet_guard);
		Destroy_PacketGuard_PacketGuard(packet_guard);

		//公告通知客户端本次自动完成任务数据
		api_CUser_SendNotiPacketMessage(user, '已自动完成当前等级任务数量: ' + clear_quest_cnt, 14);
		api_CUser_SendNotiPacketMessage(user, '任务经验奖励: ' + total_exp_bonus, 14);
		api_CUser_SendNotiPacketMessage(user, '任务金币奖励: ' + total_gold_bonus, 14);
		api_CUser_SendNotiPacketMessage(user, '任务QuestPoint奖励: ' + total_quest_point_bonus, 14);
		api_CUser_SendNotiPacketMessage(user, '任务QuestPiece奖励: ' + total_quest_piece_bonus, 14);
	}
	return;
}

//修复绝望之塔 skip_user_apc: 为true时, 跳过每10层的UserAPC
function fix_TOD(skip_user_apc) {
	//每10层挑战玩家APC 服务器内角色不足10个无法进入
	if (skip_user_apc) {
		//跳过10/20/.../90层
		//TOD_UserState::getTodayEnterLayer
		Interceptor.attach(ptr(0x0864383E),
			{
				onEnter: function (args) {
					//绝望之塔当前层数
					const today_enter_layer = args[1].add(0x14).readShort();

					if (((today_enter_layer % 10) == 9) && (today_enter_layer > 0) && (today_enter_layer < 100)) {
						//当前层数为10的倍数时  直接进入下一层
						args[1].add(0x14).writeShort(today_enter_layer + 1);
					}
				},
				onLeave: function (retval) {
				}
			});
	}

	//修复金币异常
	//CParty::UseAncientDungeonItems
	const CParty_UseAncientDungeonItems_ptr = ptr(0x859EAC2);
	const CParty_UseAncientDungeonItems = new NativeFunction(CParty_UseAncientDungeonItems_ptr, 'int', ['pointer', 'pointer', 'pointer', 'pointer'], { "abi": "sysv" });
	Interceptor.replace(CParty_UseAncientDungeonItems_ptr, new NativeCallback(function (party, dungeon, inven_item, a4) {
		//当前进入的地下城id
		const dungeon_index = CDungeon_get_index(dungeon);
		//根据地下城id判断是否为绝望之塔
		if ((dungeon_index >= 11008) && (dungeon_index <= 11107)) {
			//绝望之塔 不再扣除金币
			return 1;
		}
		//其他副本执行原始扣除道具逻辑
		return CParty_UseAncientDungeonItems(party, dungeon, inven_item, a4);
	}, 'int', ['pointer', 'pointer', 'pointer', 'pointer']));
}

//获取时装在数据库中的uid
function api_get_avatar_ui_id(avatar) {
	return avatar.add(7).readInt();
}

//设置时装插槽数据(时装插槽数据指针, 插槽, 徽章id)
// jewel_type: 红=0x1, 黄=0x2, 绿=0x4, 蓝=0x8, 白金=0x10
function api_set_JewelSocketData(jewelSocketData, slot, emblem_item_id) {
	if (!jewelSocketData.isNull()) {
		//每个槽数据长6个字节: 2字节槽类型+4字节徽章item_id
		//镶嵌不改变槽类型, 这里只修改徽章id
		jewelSocketData.add(slot * 6 + 2).writeInt(emblem_item_id);
	}

// ===== Feature: Emblem Fix =====
	return;
}

//修复时装镶嵌
function fix_use_emblem() {
	//Dispatcher_UseJewel::dispatch_sig
	Interceptor.attach(ptr(0x8217BD6),
		{
			onEnter: function (args) {
				try {
					const user = args[1];
					const packet_buf = args[2];
					//校验角色状态是否允许镶嵌
					const state = CUser_get_state(user);
					if (state != 3) {
						return;
					}
					//解析packet_buf
					//时装所在的背包槽
					const avatar_inven_slot = api_PacketBuf_get_short(packet_buf);
					//时装item_id
					const avatar_item_id = api_PacketBuf_get_int(packet_buf);
					//本次镶嵌徽章数量
					const emblem_cnt = api_PacketBuf_get_byte(packet_buf);
					//获取时装道具
					const inven = CUserCharacInfo_getCurCharacInvenW(user);
					const avatar = CInventory_GetInvenRef(inven, INVENTORY_TYPE_AVATAR, avatar_inven_slot);
					//校验时装 数据是否合法
					if (Inven_Item_isEmpty(avatar) || (Inven_Item_getKey(avatar) != avatar_item_id) || CUser_CheckItemLock(user, 2, avatar_inven_slot)) {
						return;
					}
					//获取时装插槽数据
					const avatar_add_info = Inven_Item_get_add_info(avatar);
					const inven_avatar_mgr = CInventory_GetAvatarItemMgrR(inven);
					const jewel_socket_data = WongWork_CAvatarItemMgr_getJewelSocketData(inven_avatar_mgr, avatar_add_info);

					if (jewel_socket_data.isNull()) {
						return;
					}
					//最多只支持3个插槽
					if (emblem_cnt <= 3) {
						const emblems = {};
						for (var i = 0; i < emblem_cnt; i++) {
							//徽章所在的背包槽
							const emblem_inven_slot = api_PacketBuf_get_short(packet_buf);
							//徽章item_id
							const emblem_item_id = api_PacketBuf_get_int(packet_buf);
							//该徽章镶嵌的时装插槽id
							const avatar_socket_slot = api_PacketBuf_get_byte(packet_buf);
							//log('emblem_inven_slot=' + emblem_inven_slot + ', emblem_item_id=' + emblem_item_id + ', avatar_socket_slot=' + avatar_socket_slot);
							//获取徽章道具
							const emblem = CInventory_GetInvenRef(inven, INVENTORY_TYPE_ITEM, emblem_inven_slot);
							//校验徽章及插槽数据是否合法
							if (Inven_Item_isEmpty(emblem) || (Inven_Item_getKey(emblem) != emblem_item_id) || (avatar_socket_slot >= 3)) {
								return;
							}
							//校验徽章是否满足时装插槽颜色要求
							//获取徽章pvf数据
							const citem = CDataManager_find_item(G_CDataManager(), emblem_item_id);
							if (citem.isNull()) {
								return;
							}
							//校验徽章类型
							if (!CItem_is_stackable(citem) || (CStackableItem_GetItemType(citem) != 20)) {
								return;
							}
							//获取徽章支持的插槽
							const emblem_socket_type = CStackableItem_getJewelTargetSocket(citem);
							//获取要镶嵌的时装插槽类型
							const avatar_socket_type = jewel_socket_data.add(avatar_socket_slot * 6).readShort()
							if (!(emblem_socket_type & avatar_socket_type)) {
								//插槽类型不匹配
								//log('socket type not match!');
								return;
							}
							emblems[avatar_socket_slot] = [emblem_inven_slot, emblem_item_id];
						}
						//开始镶嵌
						for (var avatar_socket_slot in emblems) {
							//删除徽章
							const emblem_inven_slot = emblems[avatar_socket_slot][0];
							CInventory_delete_item(inven, 1, emblem_inven_slot, 1, 8, 1);
							//设置时装插槽数据
							const emblem_item_id = emblems[avatar_socket_slot][1];
							api_set_JewelSocketData(jewel_socket_data, avatar_socket_slot, emblem_item_id);
							//log('徽章item_id=' + emblem_item_id + '已成功镶嵌进avatar_socket_slot=' + avatar_socket_slot + '的槽内!');
						}
						//时装插槽数据存档
						DB_UpdateAvatarJewelSlot_makeRequest(CUserCharacInfo_getCurCharacNo(user), api_get_avatar_ui_id(avatar), jewel_socket_data);
						//通知客户端时装数据已更新
						CUser_SendUpdateItemList(user, 1, 1, avatar_inven_slot);
						//回包给客户端
						const packet_guard = api_PacketGuard_PacketGuard();
						InterfacePacketBuf_put_header(packet_guard, 1, 204);
						InterfacePacketBuf_put_int(packet_guard, 1);
						InterfacePacketBuf_finalize(packet_guard, 1);
						CUser_Send(user, packet_guard);
						Destroy_PacketGuard_PacketGuard(packet_guard);
						//log('镶嵌请求已处理完成!');
					}
				} catch (error) {
					console.log('fix_use_emblem throw Exception:' + error);
				}
			},
			onLeave: function (retval) {
				//返回值改为0  不再踢线
				retval.replace(0);
			}
		});
}

//捕获玩家游戏事件
function hook_history_log() {
	//cHistoryTrace::operator()
	Interceptor.attach(ptr(0x854F990),
		{
			onEnter: function (args) {
				//解析日志内容: "18000008",18000008,D,145636,"nickname",1,72,8,0,192.168.200.1,192.168.200.1,50963,11, DungeonLeave,"龍人之塔",0,0,"aabb","aabb","N/A","N/A","N/A"
				const history_log = args[1].readUtf8String(-1);
				const group = history_log.split(',');
				//角色信息
				const account_id = parseInt(group[1]);
				const time_hh_mm_ss = group[3];
				const charac_name = group[4];
				const charac_no = group[5];
				const charac_level = group[6];
				const charac_job = group[7];
				const charac_growtype = group[8];
				const user_web_address = group[9];
				const user_peer_ip2 = group[10];
				const user_port = group[11];
				const channel_index = group[12]; //当前频道id
				//玩家游戏事件
				const game_event = group[13].slice(1); //删除多余空格
				//触发游戏事件的角色
				const user = GameWorld_find_user_from_world_byaccid(G_GameWorld(), account_id);
				if (user.isNull())
					return;
				//道具减少:  Item-,1,10000113,63,1,3,63,0,0,0,0,0,0000000000000000000000000000,0,0,00000000000000000000
				if (game_event == 'Item-') {
					const item_id = parseInt(group[15]); //本次操作道具id
					const item_cnt = parseInt(group[17]); //本次操作道具数量
					const reason = parseInt(group[18]); //本次操作原因
					//log('玩家[' + charac_name + '道具减少, 原因:' + reason + '(道具id=' + item_id + ', 使用数量=' + item_cnt
					if (5 == reason) {
						//丢弃道具
					} else if (3 == reason) {
						//使用道具
						UserUseItemEvent(user, item_id, account_id); //角色使用道具触发事件
						//这里并未改变道具原始效果 原始效果成功执行后触发下面的代码
					} else if (9 == reason) {
						//分解道具
					} else if (10 == reason) {
						//使用属性石头
					}
				}
				//道具增加:  Item-,
				else if (game_event == 'Item+') {
					const item_id = parseInt(group[15]);
					const group_18 = parseInt(group[18]);
					if (group_18 == 4) {
						//processing_data(item_id, user, 3257, 2500, get_random_int(50, 888));
					}
				}
				else if (game_event == 'KillMob') //杀死怪物
				{
					//魔法封印装备词条升级
					//boost_random_option_equ(user);
				} else if (game_event == 'Money+') {
					const cur_money = parseInt(group[14]); //当前持有的金币数量
					const add_money = parseInt(group[15]); //本次获得金币数量
					const reason = parseInt(group[16]); //本次获得金币原因
					//log('玩家[' + charac_name + ']获取金币, 原因:' + reason + '(当前持有金币=' + cur_money + ', 本次获得金币数量=' + add_money);
					if (4 == reason) {
						//副本拾取
					} else if (5 == reason) {
						//副本通关翻牌获取金币
					}
				} else if (game_event == 'DungeonLeave') {
					//离开副本
				}
			},
			onLeave: function (retval) {
			}
		});
}

//角色获取道具发送全服通知
function processing_data(item_id, user, award_item_id, award_item_count, count) {
	const itemName = api_CItem_GetItemName(item_id);
	//pvf中获取装备数据
	const citem = CDataManager_find_item(G_CDataManager(), item_id);
	const rarity = CItem_get_rarity(citem);
	if( parseInt(rarity) >= 3){
		api_GameWorld_SendNotiPacketMessage("恭喜玩家[" +
		"" + api_CUserCharacInfo_getCurCharacName(user) + "" +
		"]在地下城中获得了"+rarity+"[" + itemName + "], 随机奖励点券：" + count + "", 14);
		api_recharge_cash_cera(user, count);
	}

// ===== Hook: History Log / User In-Out =====
}

//角色登入登出处理
function hook_user_inout_game_world() {
	//选择角色处理函数 Hook GameWorld::reach_game_world
	Interceptor.attach(ptr(0x86C4E50),
		{
			//函数入口, 拿到函数参数args
			onEnter: function (args) {
				//保存函数参数
				this.user = args[1];
				//console.log('[GameWorld::reach_game_world] this.user=' + this.user);
			},
			//原函数执行完毕, 这里可以得到并修改返回值retval
			onLeave: function (retval) {
				use_ftcoin_change_luck_point(this.user); //开启幸运点
				console.log('hook_user_inout_game_world——villageAttackEventInfo.state=' + villageAttackEventInfo.state);
				//怪物攻城活动更新进度
				if (villageAttackEventInfo.state != VILLAGEATTACK_STATE_END) {
					//通知客户端打开活动UI
					notify_villageattack_score(this.user);
					//公告通知客户端活动进度
					event_villageattack_broadcast_difficulty();
				}
				//给角色发消息问候
				api_CUser_SendNotiPacketMessage(this.user, 'Hello ' + api_CUserCharacInfo_getCurCharacName(this.user), 2);
			}
		});
	//角色退出时处理函数 Hook GameWorld::leave_game_world
	Interceptor.attach(ptr(0x86C5288),
		{
			onEnter: function (args) {
				const user = args[1];
				//console.log('[GameWorld::leave_game_world] user=' + user);
			},
			onLeave: function (retval) { }
		});
}

//怪物攻城副本回调奖励处理函数
function VillageAttackedRewardSendReward(user) {
	const VAttackCount = GetCurVAttackCount(user);
	const mail_title = "GM"
	const mail_contact = "怪物攻城奖励："
	switch (VAttackCount) {
		case 1:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3037, 5, mail_title, mail_contact);
			break;
		case 2:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3037, 5, mail_title, mail_contact);
			break;
		case 3:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3037, 10, mail_title, mail_contact);
			break;
		case 4:
			CMailBoxHelperReqDBSendNewSystemMail(user, 1085, 2, mail_title, mail_contact);
			break;
		case 5:
			CMailBoxHelperReqDBSendNewSystemMail(user, 1085, 5, mail_title, mail_contact);
			break;
		case 6:
			CMailBoxHelperReqDBSendNewSystemMail(user, 1085, 2, mail_title, mail_contact);
			break;
		case 7:
			CMailBoxHelperReqDBSendNewSystemMail(user, 8, 2, mail_title, mail_contact);
			break;
		case 8:
			CMailBoxHelperReqDBSendNewSystemMail(user, 8, 5, mail_title, mail_contact);
			break;
		case 9:
			CMailBoxHelperReqDBSendNewSystemMail(user, 8, 2, mail_title, mail_contact);
			break;
		case 10:
			CMailBoxHelperReqDBSendNewSystemMail(user, 36, 1, mail_title, mail_contact);
			break;
		case 11:
			CMailBoxHelperReqDBSendNewSystemMail(user, 36, 1, mail_title, mail_contact);
			break;
		case 12:
			CMailBoxHelperReqDBSendNewSystemMail(user, 15, 1, mail_title, mail_contact);
			break;
		case 13:
			CMailBoxHelperReqDBSendNewSystemMail(user, 15, 1, mail_title, mail_contact);
			break;
		case 14:
			CMailBoxHelperReqDBSendNewSystemMail(user, 1031, 1, mail_title, mail_contact);
			break;
		case 15:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3262, 2, mail_title, mail_contact);
			break;
		case 16:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3262, 3, mail_title, mail_contact);
			break;
		case 17:
			CMailBoxHelperReqDBSendNewSystemMail(user, 2600261, 1, mail_title, mail_contact);
			break;
		case 18:
			CMailBoxHelperReqDBSendNewSystemMail(user, 2600261, 1, mail_title, mail_contact);
			break;
		case 19:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3037, 5, mail_title, mail_contact);
			break;
		case 20:
			CMailBoxHelperReqDBSendNewSystemMail(user, 1085, 2, mail_title, mail_contact);
			break;
		case 21:
			CMailBoxHelperReqDBSendNewSystemMail(user, 8, 2, mail_title, mail_contact);
			break;
		case 22:
			CMailBoxHelperReqDBSendNewSystemMail(user, 1085, 2, mail_title, mail_contact);
			break;
		case 23:
			CMailBoxHelperReqDBSendNewSystemMail(user, 8, 5, mail_title, mail_contact);
			break;
		case 24:
			CMailBoxHelperReqDBSendNewSystemMail(user, 15, 1, mail_title, mail_contact);
			break;
		case 25:
			CMailBoxHelperReqDBSendNewSystemMail(user, 15, 2, mail_title, mail_contact);
			break;
		case 26:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3262, 5, mail_title, mail_contact);
			break;
		case 27:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3262, 2, mail_title, mail_contact);
			break;
		case 28:
			CMailBoxHelperReqDBSendNewSystemMail(user, 10000160, 1, mail_title, mail_contact);
			break;
		case 29:
			CMailBoxHelperReqDBSendNewSystemMail(user, 1085, 2, mail_title, mail_contact);
			break;
		case 30:
			CMailBoxHelperReqDBSendNewSystemMail(user, 8, 2, mail_title, mail_contact);
			break;
		case 31:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3037, 5, mail_title, mail_contact);
			break;
		case 32:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3037, 5, mail_title, mail_contact);
			break;
		case 33:
			CMailBoxHelperReqDBSendNewSystemMail(user, 8, 2, mail_title, mail_contact);
			break;
		case 34:
			CMailBoxHelperReqDBSendNewSystemMail(user, 1085, 2, mail_title, mail_contact);
			break;
		case 35:
			CMailBoxHelperReqDBSendNewSystemMail(user, 2600261, 1, mail_title, mail_contact);
			break;
		case 36:
			CMailBoxHelperReqDBSendNewSystemMail(user, 10000161, 1, mail_title, mail_contact);
			break;
		default:
			CMailBoxHelperReqDBSendNewSystemMail(user, 3037, 5, mail_title, mail_contact);
	}
}

//增加魔法封印装备的魔法封印等级
function _boost_random_option_equ(inven_item) {
	//空装备
	if (Inven_Item_isEmpty(inven_item))
		return false;
	//获取装备当前魔法封印属性
	const random_option = inven_item.add(37);
	//随机选取一个词条槽
	const random_option_slot = get_random_int(0, 3);
	//若词条槽已有魔法封印
	if (random_option.add(3 * random_option_slot).readU8()) {
		//每个词条有2个属性值
		const value_slot = get_random_int(1, 3);
		//当前词条等级
		const random_option_level = random_option.add(3 * random_option_slot + value_slot).readU8();
		if (random_option_level < 0xFF) {
			//1%概率词条等级+1
			if (get_random_int(random_option_level, 100000) < 1000) {
				random_option.add(3 * random_option_slot + value_slot).writeU8(random_option_level + 1);
				return true;
			}
		}
	}
	return false;
}

//穿戴中的魔法封印装备词条升级
function boost_random_option_equ(user) {
	//遍历身上的装备 为拥有魔法封印属性的装备提升魔法封印等级
	const inven = CUserCharacInfo_getCurCharacInvenW(user);
	for (var slot = 10; slot <= 21; slot++) {
		const inven_item = CInventory_GetInvenRef(inven, INVENTORY_TYPE_BODY, slot);
		if (_boost_random_option_equ(inven_item)) {
			//通知客户端更新
			CUser_SendUpdateItemList(user, 1, 3, slot);
		}
	}
}

//魔法封印属性转换时可以继承
function change_random_option_inherit() {
	//random_option::CRandomOptionItemHandle::change_option
	Interceptor.attach(ptr(0x85F3340),
		{
			onEnter: function (args) {
				//保存原始魔法封印属性
				this.random_option = args[7];
				//本次变换的属性编号
				this.change_random_option_index = args[6].toInt32();
				//记录原始属性
				this.random_optio_type = this.random_option.add(3 * this.change_random_option_index).readU8();
				this.random_optio_value_1 = this.random_option.add(3 * this.change_random_option_index + 1).readU8();
				this.random_optio_value_2 = this.random_option.add(3 * this.change_random_option_index + 2).readU8();
			},
			onLeave: function (retval) {
				//魔法封印转换成功
				if (retval == 1) {
					//获取未被附魔的魔法封印槽
					var index = -1;
					if (this.random_option.add(0).readU8() == 0)
						index = 0;
					else if (this.random_option.add(3).readU8() == 0)
						index = 1;
					else if (this.random_option.add(6).readU8() == 0)
						index = 2;

					//当魔法封印词条不足3个时, 若变换出等级极低的属性, 可直接附魔到装备空的魔法封印槽内
					if (index >= 0) {
						if ((this.random_option.add(11).readU8() <= 5) && (this.random_option.add(12).readU8() <= 5)) {
							//魔法封印附魔
							this.random_option.add(3 * index).writeU8(this.random_option.add(10).readU8());
							this.random_option.add(3 * index + 1).writeU8(this.random_option.add(11).readU8());
							this.random_option.add(3 * index + 2).writeU8(this.random_option.add(12).readU8());

							//清空本次变换的属性(可以继续选择其他词条变换)
							this.random_option.add(10).writeInt(0);

							return;
						}
					}
					//用变换后的词条覆盖原始魔法封印词条
					this.random_option.add(3 * this.change_random_option_index).writeU8(this.random_option.add(10).readU8());
					//若变换后的属性低于原来的值 则继承原有属性值 否则使用变换后的属性
					if (this.random_option.add(11).readU8() > this.random_optio_value_1)
						this.random_option.add(3 * this.change_random_option_index + 1).writeU8(this.random_option.add(11).readU8());
					if (this.random_option.add(12).readU8() > this.random_optio_value_2)
						this.random_option.add(3 * this.change_random_option_index + 2).writeU8(this.random_option.add(12).readU8());
					//清空本次变换的属性(可以继续选择其他词条变换)
					this.random_option.add(10).writeInt(0);
				}
			}
		});
}

//魔法封印自动解封
function auto_unseal_random_option_equipment(user) {
	//CInventory::insertItemIntoInventory
	Interceptor.attach(ptr(0x8502D86),
		{
			onEnter: function (args) {
				this.user = args[0].readPointer();
			},
			onLeave: function (retval) {
				//物品栏新增物品的位置
				const slot = retval.toInt32();
				if (slot > 0) {
					//获取道具的角色
					const user = this.user;
					//角色背包
					const inven = CUserCharacInfo_getCurCharacInvenW(user);
					//背包中新增的道具
					const inven_item = CInventory_GetInvenRef(inven, INVENTORY_TYPE_ITEM, slot);
					//过滤道具类型
					if (!Inven_Item_isEquipableItemType(inven_item))
						return;
					//装备id
					const item_id = Inven_Item_getKey(inven_item);
					//pvf中获取装备数据
					const citem = CDataManager_find_item(G_CDataManager(), item_id);
					//检查装备是否为魔法封印类型
					if (!CEquipItem_IsRandomOption(citem))
						return;
					//是否已被解除魔法封印（魔法封印前10个字节是否为0）
					const random_option = inven_item.add(37);
					if (random_option.readU32() || random_option.add(4).readU32() || random_option.add(8).readShort()) {
						return;
					}
					//尝试解除魔法封印
					const ret = random_option_CRandomOptionItemHandle_give_option(ptr(0x941F820).readPointer(), item_id, CItem_get_rarity(citem), CItem_getUsableLevel(citem), CItem_getItemGroupName(citem), CEquipItem_GetRandomOptionGrade(citem), inven_item.add(37));
					if (ret) {
						//通知客户端有装备更新
						CUser_SendUpdateItemList(user, 1, 0, slot);
					}
				}
			}
		});
}

//幸运点上下限
const MAX_LUCK_POINT = 99999;
const MIN_LUCK_POINT = 1;

//设置角色幸运点
function api_CUserCharacInfo_SetCurCharacLuckPoint(user, new_luck_point) {
	if (new_luck_point > MAX_LUCK_POINT)
		new_luck_point = MAX_LUCK_POINT;
	else if (new_luck_point < MIN_LUCK_POINT)
		new_luck_point = MIN_LUCK_POINT;
	CUserCharacInfo_enableSaveCharacStat(user);
	CUserCharacInfo_SetCurCharacLuckPoint(user, new_luck_point);
	return new_luck_point;
}

//使用命运硬币后, 可以改变自身幸运点
//查询角色当前幸运点GM命令: //show lp
//当前角色幸运点拉满GM命令: //max lp
function use_ftcoin_change_luck_point(user) {
	//抛命运硬币
	const rand = get_random_int(0, 100);

	//当前幸运点数
	var new_luck_point = null;

	if (rand == 0) {
		//1%几率将玩家幸运点充满(最大值10W)
		new_luck_point = MAX_LUCK_POINT;
	}
	else if (rand == 1) {
		//1%几率将玩家幸运点耗尽
		new_luck_point = MIN_LUCK_POINT;
	}
	else if (rand < 51) {
		//49%几率当前幸运点增加20%
		new_luck_point = Math.floor(CUserCharacInfo_GetCurCharacLuckPoint(user) * 1.2);
	}
	else {
		//49%几率当前幸运点降低20%
		new_luck_point = Math.floor(CUserCharacInfo_GetCurCharacLuckPoint(user) * 0.8);
	}
	//修改角色幸运点
	new_luck_point = api_CUserCharacInfo_SetCurCharacLuckPoint(user, new_luck_point);
	//通知客户端当前角色幸运点已改变
	api_CUser_SendNotiPacketMessage(user, '命运已被改变, 当前幸运点数: ' + new_luck_point, 0);
}

//使用角色幸运值加成装备爆率
function enable_drop_use_luck_point() {
	//由于roll点爆装函数拿不到user, 在杀怪和翻牌函数入口保存当前正在处理的user
	var cur_luck_user = null;
	//DisPatcher_DieMob::dispatch_sig
	Interceptor.attach(ptr(0x81EB0C4),
		{
			onEnter: function (args) {
				cur_luck_user = args[1];
			},
			onLeave: function (retval) {
				cur_luck_user = null;
			}
		});

	//CParty::SetPlayResult
	Interceptor.attach(ptr(0x85B2412),
		{
			onEnter: function (args) {
				cur_luck_user = args[1];
			},
			onLeave: function (retval) {
				cur_luck_user = null;
			}
		});

	//修改决定出货品质(rarity)的函数 使出货率享受角色幸运值加成
	//CLuckPoint::GetItemRarity
	const CLuckPoint_GetItemRarity_ptr = ptr(0x8550BE4);
	const CLuckPoint_GetItemRarity = new NativeFunction(CLuckPoint_GetItemRarity_ptr, 'int', ['pointer', 'pointer', 'int', 'int'], { "abi": "sysv" });
	Interceptor.replace(CLuckPoint_GetItemRarity_ptr, new NativeCallback(function (a1, a2, roll, a4) {
		//使用角色幸运值roll点代替纯随机roll点
		if (cur_luck_user) {
			//获取当前角色幸运值
			const luck_point = CUserCharacInfo_GetCurCharacLuckPoint(cur_luck_user);

			//roll点范围1-100W, roll点越大, 出货率越高
			//角色幸运值范围1-10W
			//使用角色 [当前幸运值*10] 作为roll点下限, 幸运值越高, roll点越大
			roll = get_random_int(luck_point * 10, 1000000);
		}
		//执行原始计算爆装品质函数
		const rarity = CLuckPoint_GetItemRarity(a1, a2, roll, a4);
		//调整角色幸运值
		if (cur_luck_user) {
			var rate = 1.0;

			//出货粉装以上, 降低角色幸运值
			if (rarity >= 3) {
				//出货品质越高, 幸运值下降约快
				rate = 1 - (rarity * 0.01);
			}
			else {
				//未出货时, 提升幸运值
				rate = 1.01;
			}
			//设置新的幸运值
			const new_luck_point = Math.floor(CUserCharacInfo_GetCurCharacLuckPoint(cur_luck_user) * rate);
			api_CUserCharacInfo_SetCurCharacLuckPoint(cur_luck_user, new_luck_point);
		}
		return rarity;
	}, 'int', ['pointer', 'pointer', 'int', 'int']));
}

//取消新账号送成长契约

// ===== Patch: Random Option / Luck Point / Mobile Auth / Strengthen =====
function InterSelectMobileAuthReward() {
	//还原 InterSelectMobileAuthReward::dispatch_sig 函数
	const Defptr = ptr(0x08161384);
	const value = Defptr.readU8()
	if (value != 0x0F) {
		Memory.protect(Defptr, 10, 'rwx');
		Defptr.writeShort(0x840F);
	}
	//重写InterSelectMobileAuthReward::dispatch_sig 函数
	const Inter_DispatchPr = ptr(0x0816132A);
	const Inter_Dispatch = new NativeFunction(Inter_DispatchPr, 'int', ['pointer', 'pointer', 'pointer'], { "abi": "sysv" });
	Interceptor.replace(Inter_DispatchPr, new NativeCallback(function (InterSelectMobileAuthReward, CUser, a3) {
		//var Inter_DispatchOpen = true;
		const Inter_DispatchOpen = false;
		if (Inter_DispatchOpen) {
			a3.add(4).writeInt(0);
			return Inter_Dispatch(InterSelectMobileAuthReward, CUser, a3); //执行原函数发送成长契约
		}
		return 0; //取消新账号送成长契约    返回0表示正常返回
	}, 'int', ['pointer', 'pointer', 'pointer']));
}

//解除每日创建角色数量限制
function disable_check_create_character_limit() {
	//DB_CreateCharac::CheckLimitCreateNewCharac
	Interceptor.attach(ptr(0x8401922),
		{
			onEnter: function (args) {
			},
			onLeave: function (retval) {
				//强制返回允许创建
				retval.replace(1);
			}
		});
}

//+13以上强化券自动刷新物品栏
function DP_Strengthen_SendUpdateItemList() {
	Interceptor.attach(ptr(0x080FC850), {
		onEnter: function (args) {
			this.equiPos = args[2].add(27).readU16();
			this.user = args[1];
		},
		onLeave: function (retval) {
			CUser_SendUpdateItemList(this.user, 1, 0, this.equiPos);
		}
	});
}

//黑暗武士技能栏修复
function check_move_comboSkillSlot_force_true() {
	Interceptor.attach(ptr(0x8608C98), {
		onEnter: function (args) {

		},
		onLeave: function (retval) {
			//强制返回1
			retval.replace(1);
			//log('checkMoveComboSkillSlot:'+retval.toInt32());
		}
	});
}

//角色使用道具触发事件
function UserUseItemEvent(user, item_id, accid) {
	switch (item_id) {
		case 20206321:
		case 20206322:
		case 20206323:
		case 20206324:
		case 20206325:
		case 20206326:
		case 20206327:
		case 20206328:
		case 20206329:
		case 20206330:
		case 20226321:
		case 20226322:
		case 20226323:
		case 20226324:
		case 20226325:
		case 20226326:
		case 20226327:
		case 20226328:
		case 20226329:
		case 20226330:
			//api_CUser_AddItem(user, item_id, 2);
			//dp2_lua_call(accid, 0.0, "additem,"+item_id);
			CMailBoxHelperReqDBSendNewSystemMail(user, item_id, 1, "GM", "返还坐骑变身器：");
			break;
		case 1047:
			//use_ftcoin_change_luck_point(user);
			break;
		case 10303917:
			//辅助装备任务完成券
			//clear_doing_questEx(user, 674);
			break;
		case 10303918:
			//魔法石任务完成券
			//clear_doing_questEx(user, 675);
			break;
		default:
			return;
	}
}

//加载主功能
function start() {
	console.log('[' + get_timestamp() + '] [frida] [info] --------------------------- set function ----------------------------');

	// 加载配置文件（由 Lua bootstrap 自动生成，包含 features 开关）
	load_config('/dp2/frida/frida_config.json');
	const cfg = (global_config && global_config.features) ? global_config.features : {};

	// 绝望之塔金币修复：仍保留在入口内，后续再专项拆分。
	if (cfg.enable_tod_fix !== false) { fix_TOD(true); }

	// 已拆分模块集中启动：统一处理模块加载、函数缺失、重复加载和单功能异常。
	dp_load('startup_helpers');
	dp_load('startup_modules');
	startMigratedModules(cfg);

	// 初始化数据库
	api_scheduleOnMainThread(init_db, null);

	// 挂接消息分发线程
	hook_TimerDispatcher_dispatch();

	console.log('[' + get_timestamp() + '] [frida] [info] ----------------------- set function success ------------------------');
}

// ===== Feature: Return User (回归勇士) =====

// 回归勇士时间设置（来源：dp2/frida.js）
function set_return_user(day) {
	const time = day * 86400;
	Memory.protect(ptr(0x84C753D), 32, 'rwx');
	ptr(0x84C753D).writeU32(time);
}

// ===== Feature: Hidden Option (时装潜能) =====

// 随机数辅助函数（来源：dp2/frida.js）
function get_random_int(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

// 覆盖系统分配属性并下发随机时装潜能（来源：dp2/frida.js）
function hidden_option() {
	Memory.protect(ptr(0x08509D49), 3, 'rwx');
	ptr(0x08509D49).writeByteArray([0xEB]);

	Memory.protect(ptr(0x08509D34), 3, 'rwx');
	ptr(0x08509D34).writeUShort(get_random_int(1, 64));
}

// 挂接时装潜能激活钩子（来源：dp2/frida.js）
function start_hidden_option() {
	Interceptor.attach(ptr(0x08509B9E), {
		onEnter: function (args) { hidden_option(); },
		onLeave: function (retval) {}
	});
	Interceptor.attach(ptr(0x0817EDEC), {
		onEnter: function (args) {},
		onLeave: function (retval) { retval.replace(1); }
	});
}

// ===== Feature: Ranking (战力排行榜) =====

// 战力排行榜数据（来源：dp2/frida.js）
var ranklist = {
	"1": { "rank": 100, "characname": "虚位以待", "job": 0, "lev": 85, "Grow": 17, "Guilkey": 1, "Guilname": "", "str": "111！", "equip": [101531433, 101551558, 101501731, 101571413, 101561697, 101521488, 101511859, 101541622, 0, -1, 101040146] },
	"2": { "rank": 90, "characname": "虚位以待", "job": 1, "lev": 85, "Grow": 17, "Guilkey": 1, "Guilname": "", "str": "222！", "equip": [45486, 43101, 44757, 43879, 43541, 44283, 45155, 45935, 0, -1, 102040100] },
	"3": { "rank": 80, "characname": "虚位以待", "job": 4, "lev": 85, "Grow": 17, "Guilkey": 1, "Guilname": "", "str": "333！", "equip": [57519, 55153, 56754, 55922, 55533, 56332, 57147, 57946, 0, -1, 108030043] },
};

// 获取战力排名分数（来源：dp2/frida.js）
function GetRankNumber(charac_no) {
	const insertQuery = "SELECT ZLZ FROM frida.battle WHERE CID='" + charac_no + "';";
	if (api_MySQL_exec(mysql_taiwan_cain, insertQuery)) {
		if (MySQL_get_n_rows(mysql_taiwan_cain) == 1) {
			MySQL_fetch(mysql_taiwan_cain);
			return parseInt(api_MySQL_get_str(mysql_taiwan_cain, 0));
		}
	}
}

// 获取自身排行榜数据（来源：dp2/frida.js）
function GetMyEquInfo(user) {
	const MyRanklist = { "rank": 0, "characname": "", "job": 0, "lev": 0, "Grow": 0, "Guilkey": 0, "Guilname": "", "str": "", "equip": [] };
	const charac_no = CUserCharacInfo_getCurCharacNo(user);
	MyRanklist.rank = GetRankNumber(charac_no);
	MyRanklist.characname = api_CUserCharacInfo_getCurCharacName(user) + "";
	MyRanklist.job = CUserCharacInfo_get_charac_job(user);
	MyRanklist.lev = CUserCharacInfo_get_charac_level(user);
	MyRanklist.Grow = CUserCharacInfo_getCurCharacGrowType(user);
	MyRanklist.Guilkey = CUserCharacInfo_get_charac_guildkey(user);
	MyRanklist.Guilname = api_CUser_GetGuildName(user);
	if (!MyRanklist.Guilname) { MyRanklist.Guilname = '未加入公会'; }
	const InvenW = CUserCharacInfo_getCurCharacInvenW(user);
	for (var i = 0; i <= 10; i++) {
		if (i != 9) {
			const inven_item = CInventory_GetInvenRef(InvenW, INVENTORY_TYPE_BODY, i);
			MyRanklist.equip.push(Inven_Item_getKey(inven_item));
		} else {
			MyRanklist.equip.push(-1);
		}
	}
	return MyRanklist;
}

// 保存排名并重新排序（来源：dp2/frida.js）
function SetRanking(user) {
	const MyRanklist = GetMyEquInfo(user);
	const existingIndex = Object.values(ranklist).findIndex(function(item) { return item.characname === MyRanklist.characname; });
	if (MyRanklist.rank) {
		if (existingIndex !== -1) {
			ranklist[existingIndex + 1] = MyRanklist;
		} else {
			ranklist["4"] = MyRanklist;
		}
		const rankArray = Object.values(ranklist);
		rankArray.sort(function(a, b) { return b.rank - a.rank; });
		const topThree = rankArray.slice(0, 3);
		const tmp = {};
		topThree.forEach(function(item, index) { tmp[(index + 1).toString()] = item; });
		delete ranklist["4"];
		ranklist = tmp;
	}
}

// 下发排行榜数据到客户端（来源：dp2/frida.js）
function SendRankLits(user, all) {
	const packet_guard = api_PacketGuard_PacketGuard();
	InterfacePacketBuf_put_header(packet_guard, 0, 182);
	InterfacePacketBuf_put_byte(packet_guard, Object.keys(ranklist).length);
	for (var key in ranklist) {
		if (ranklist.hasOwnProperty(key)) {
			api_InterfacePacketBuf_put_string(packet_guard, ranklist[key].characname);
			InterfacePacketBuf_put_byte(packet_guard, ranklist[key].lev);
			InterfacePacketBuf_put_byte(packet_guard, ranklist[key].job);
			InterfacePacketBuf_put_byte(packet_guard, ranklist[key].Grow);
			api_InterfacePacketBuf_put_string(packet_guard, ranklist[key].Guilname);
			InterfacePacketBuf_put_int(packet_guard, ranklist[key].Guilkey);
			for (var i = 0; i < ranklist[key].equip.length; i++) {
				InterfacePacketBuf_put_int(packet_guard, ranklist[key].equip[i]);
			}
		}
	}
	InterfacePacketBuf_finalize(packet_guard, 1);
	if (all) { GameWorld_send_all(G_GameWorld(), packet_guard); }
	else { CUser_Send(user, packet_guard); }
	Destroy_PacketGuard_PacketGuard(packet_guard);
}

// 从数据库加载排行榜数据（来源：dp2/frida.js）
function event_rankinfo_load_from_db() {
	if (api_MySQL_exec(mysql_frida, "select event_info from game_event where event_id = 'rankinfo';")) {
		if (MySQL_get_n_rows(mysql_frida) == 1) {
			MySQL_fetch(mysql_frida);
			const info = api_MySQL_get_str(mysql_frida, 0);
			ranklist = JSON.parse(info);
		}
	}
}

// 保存排行榜数据到数据库（来源：dp2/frida.js）
function event_rankinfo_save_to_db() {
	try {
		api_MySQL_exec(mysql_frida, "replace into game_event (event_id, event_info) values ('rankinfo', '" + JSON.stringify(ranklist) + "');");
	} catch (error) {}
}

// 启动排行榜系统（来源：dp2/frida.js）
function start_ranking() {
	event_rankinfo_load_from_db();
	// 将排行榜下发和排名保存集成到上下线 hook 中
	// 需配合 enable_user_inout_hook 使用
}

// ===== Feature: VIP Login (VIP 登录公告) =====

// VIP 等级对应任务 ID（来源：dp2/df_game_r.js）
function getQuestIds1() { return [8892]; }
function getQuestIds2() { return [8893]; }
function getQuestIds3() { return [8894]; }
function getQuestIds4() { return [8895]; }
function getQuestIds5() { return [8896]; }

// 检查任务完成状态（来源：dp2/df_game_r.js）
function Inspection_tasks(user, quest_ids) {
	const WongWork_CQuestClear = CUser_getCurCharacQuestW(user).add(4);
	const completedQuests = [];
	for (var i = 0; i < quest_ids.length; i++) {
		if (WongWork_CQuestClear_isClearedQuest(WongWork_CQuestClear, quest_ids[i])) {
			completedQuests.push(quest_ids[i]);
		}
	}
	return completedQuests;
}

// VIP 登录公告（来源：dp2/df_game_r.js）
function vip_Login() {
	Interceptor.attach(ptr(0x86C4E50), {
		onEnter: function (args) { this.user = args[1]; },
		onLeave: function (retval) {
			const user = this.user;
			const c1 = Inspection_tasks(user, getQuestIds1()).length;
			const c2 = Inspection_tasks(user, getQuestIds2()).length;
			const c3 = Inspection_tasks(user, getQuestIds3()).length;
			const c4 = Inspection_tasks(user, getQuestIds4()).length;
			const c5 = Inspection_tasks(user, getQuestIds5()).length;
			if (c5 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip5玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
			else if (c4 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip4玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
			else if (c3 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip3玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
			else if (c2 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip2玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
			else if (c1 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip1玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
		}
	});
}

// ===== Utils: Batch Item Add (批量物品添加) =====

// 批量添加道具到背包（来源：dp2/df_game_r.js）
function api_CUser_Add_Item_list(user, item_list) {
	for (var i in item_list) {
		api_CUser_AddItem(user, item_list[i][0], item_list[i][1]);
	}
	SendItemWindowNotification(user, item_list);
}

// 获取道具时使用 UI 显示（来源：dp2/df_game_r.js）
function SendItemWindowNotification(user, item_list) {
	const packet_guard = api_PacketGuard_PacketGuard();
	InterfacePacketBuf_put_header(packet_guard, 1, 163);
	InterfacePacketBuf_put_byte(packet_guard, 1);
	InterfacePacketBuf_put_short(packet_guard, 0);
	InterfacePacketBuf_put_int(packet_guard, 0);
	InterfacePacketBuf_put_short(packet_guard, item_list.length);
	for (var i = 0; i < item_list.length; i++) {
		InterfacePacketBuf_put_int(packet_guard, item_list[i][0]);
		InterfacePacketBuf_put_int(packet_guard, item_list[i][1]);
	}
	InterfacePacketBuf_finalize(packet_guard, 1);
	CUser_Send(user, packet_guard);
	Destroy_PacketGuard_PacketGuard(packet_guard);
}

// Bridge: Frida Integration
// dp2_resolver, frida_main, frida_handler, rpc.exports


//============================================= dp集成frida =============================================

/*
frida 官网地址: https://frida.re/

frida提供的js api接口文档地址: https://frida.re/docs/javascript-api/

关于dp2支持frida的说明, 请参阅: /dp2/lua/df/frida.lua
*/

// 入口点
// int frida_main(lua_State* ls, const char* args);
function frida_main(ls, _args) {
	// args是lua调用时传过来的字符串
	// 建议约定lua和js通讯采用json格式
	const args = _args.readUtf8String();

	// 在这里做你需要的事情
	console.log('[' + get_timestamp() + '] [frida] [info] frida main, args = ' + args);

	return 0;
}

// 当lua调用js时触发
// int frida_handler(lua_State* ls, int arg1, float arg2, const char* arg3);
function frida_handler(ls, arg1, arg2, _arg3) {
	const arg3 = _arg3.readUtf8String();

	// 如果需要通讯, 在这里编写逻辑
	// 比如: arg1是功能号, arg3是数据内容 (建议json格式)

	// just for test
	//dp2_lua_call(arg1, arg2, arg3)

	return 0;
}

// 获取dp2的符号
// void* dp2_frida_resolver(const char* fname);
var __dp2_resolver = null;
function dp2_resolver(fname) {
	return __dp2_resolver(Memory.allocUtf8String(fname));
}

// 通讯 (调用lua)
// int lua_call(int arg1, float arg2, const char* arg3);
var __dp2_lua_call = null;
function dp2_lua_call(arg1, arg2, _arg3) {
	var arg3 = null;
	if (_arg3 != null) {
		arg3 = Memory.allocUtf8String(_arg3);
	}
	return __dp2_lua_call(arg1, arg2, arg3);
}

// 准备工作
function setup() {
	//dp 安装 frida的
	var addr = Module.getExportByName('libdp2.so', 'dp2_frida_resolver');
	__dp2_resolver = new NativeFunction(addr, 'pointer', ['pointer']);

	addr = dp2_resolver('lua.call');
	__dp2_lua_call = new NativeFunction(addr, 'int', ['int', 'float', 'pointer']);

	addr = dp2_resolver('frida.main');
	Interceptor.replace(addr, new NativeCallback(frida_main, 'int', ['pointer', 'pointer']));

	addr = dp2_resolver('frida.handler');
	Interceptor.replace(addr, new NativeCallback(frida_handler, 'int', ['pointer', 'int', 'float', 'pointer']));

	Interceptor.flush();
	console.log('[' + get_timestamp() + '] [frida] [info] -------------------------- setup success ---------------------------');

	// frida自己的配置
	start();

}

//延迟加载插件
function awake() {
	//Hook check_argv
	console.log('[' + get_timestamp() + '] [frida] [info] ------------------------------- awake ------------------------------');
	Interceptor.attach(ptr(0x829EA5A),
		{
			onEnter: function (args) { },
			onLeave: function (retval) {
				//等待check_argv函数执行结束 再加载插件
				console.log('[' + get_timestamp() + '] [frida] [info] ------------------------------- setup -------------------------------');
				setup();
			}
		});
}

rpc.exports = {
	init: function (stage, parameters) {
		console.log('[' + get_timestamp() + '] [frida] [info] Frida Init Stage:' + stage);

		if (stage == 'early') {
			//awake();
			setup();
		} else {
			//热重载:  直接加载
			console.log('[' + get_timestamp() + '] [frida] [info] ------------------------------- reload ------------------------------');
			setup();
		}
	},
	dispose: function () {
		console.log('[' + get_timestamp() + '] [frida] [info] ------------------------------ dispose ------------------------------');
	}
};
