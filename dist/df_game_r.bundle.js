// 运行时地址集中管理
// 来源：全部从旧 frida.js 迁移
// 用途：集中管理所有 ptr(0x...) 地址，不要散落在业务模块中
//
// 为什么需要集中管理：
// 1. 游戏版本更新时只需修改一处
// 2. 一目了然哪些地址被使用了
// 3. 避免不同模块引用同一个地址但写法不同造成混乱
//
// 每个地址至少需要注释：作用、对应原函数或 hook 点、来源、风险点

const PROJECT_ADDRESSES = {

  // ==================== 系统/环境相关地址 ====================

  // G_CEnvironment 全局环境实例
  // 来源：从旧 frida.js G_CEnvironment 迁移
  // 用途：获取服务器环境配置对象
  // 风险：游戏版本更新后地址可能变化
  g_cenvironment: ptr('0x080CC181'),

  // CEnvironment::get_file_name
  // 来源：从旧 frida.js CEnvironment_get_file_name 迁移
  // 用途：获取当前频道配置文件名（用于日志文件命名）
  // 风险：仅用于日志，功能影响较小
  cenvironment_get_file_name: ptr('0x80DA39A'),

  // GlobalData::s_systemTime_
  // 来源：从旧 frida.js GlobalData_s_systemTime_ 迁移
  // 用途：直接读取游戏服务器系统时间（UTC 秒）
  // 风险：直接读全局变量而非函数调用，地址偏移可能随版本变化
  globaldata_system_time: ptr('0x941F714'),

  // CSystemTime::getCurSec
  // 来源：从旧 frida.js CSystemTime_getCurSec 迁移
  // 用途：获取系统时间，部分模块可能用这个函数而非直接读全局变量
  csystemtime_get_cur_sec: ptr('0x80CBC9E'),

  // ==================== 角色相关地址 ====================

  // CUserCharacInfo::enableSaveCharacStat
  // 来源：从旧 frida.js CUserCharacInfo_enableSaveCharacStat 迁移
  // 用途：设置角色属性改变脏标记，角色下线时只有设置了此标记才会存档
  // 风险：不设置脏标记会导致属性修改在下线后回档
  cusercharacinfo_enable_save_charac_stat: ptr('0x819A870'),

  // CUser::get_state
  // 来源：从旧 frida.js CUser_get_state 迁移
  // 用途：获取角色当前状态（0=未登录, 1=创建角色, 2=选择角色, 3=已进入游戏）
  cuser_get_state: ptr('0x80DA38C'),

  // CUser::get_acc_id
  // 来源：从旧 frida.js CUser_get_acc_id 迁移
  // 用途：获取角色所属账号 ID
  cuser_get_acc_id: ptr('0x80DA36E'),

  // CUserCharacInfo::getCurCharacNo
  // 来源：从旧 frida.js CUserCharacInfo_getCurCharacNo 迁移
  // 用途：获取当前角色的唯一 ID (charac_no)
  cusercharacinfo_get_cur_charac_no: ptr('0x80CBC4E'),

  // CUserCharacInfo::get_charac_level
  // 来源：从旧 frida.js CUserCharacInfo_get_charac_level 迁移
  // 用途：获取角色等级
  cusercharacinfo_get_charac_level: ptr('0x80DA2B8'),

  // CUserCharacInfo::getCurCharacName
  // 来源：从旧 frida.js CUserCharacInfo_getCurCharacName 迁移
  // 用途：获取角色名字
  cusercharacinfo_get_cur_charac_name: ptr('0x8101028'),

  // CUserCharacInfo::get_level_up_exp
  // 来源：从旧 frida.js CUserCharacInfo_get_level_up_exp 迁移
  // 用途：获取角色当前等级升级所需经验值
  cusercharacinfo_get_level_up_exp: ptr('0x0864E3BA'),

  // CUserCharacInfo::getCurCharacInvenW
  // 来源：从旧 frida.js CUserCharacInfo_getCurCharacInvenW 迁移
  // 用途：获取角色背包指针
  cusercharacinfo_get_cur_charac_inven_w: ptr('0x80DA28E'),

  // CUserCharacInfo::get_charac_job
  // 来源：从旧 frida.js CUserCharacInfo_get_charac_job 迁移
  // 用途：获取角色职业
  cusercharacinfo_get_charac_job: ptr('0x80FDF20'),

  // CUserCharacInfo::getCurCharacGrowType
  // 来源：从旧 frida.js CUserCharacInfo_getCurCharacGrowType 迁移
  // 用途：获取角色 PVP 段位类型
  cusercharacinfo_get_cur_charac_grow_type: ptr('0x815741C'),

  // CUserCharacInfo::get_charac_guildkey
  // 来源：从旧 frida.js CUserCharacInfo_get_charac_guildkey 迁移
  // 用途：获取角色公会 ID
  cusercharacinfo_get_charac_guildkey: ptr('0x822F46C'),

  // CUser::GetGuildName
  // 来源：从旧 frida.js CUser_GetGuildName 迁移
  // 用途：获取角色公会名称
  cuser_get_guild_name: ptr('0x869742A'),

  // CUserCharacInfo::GetLoginTick
  // 来源：从旧 frida.js CUserCharacInfo_GetLoginTick 迁移
  // 用途：获取角色本次登录时间戳
  cusercharacinfo_get_login_tick: ptr('0x822F692'),

  // CUser::GetParty
  // 来源：从旧 frida.js CUser_GetParty 迁移
  // 用途：获取角色所在的队伍
  cuser_get_party: ptr('0x0865514C'),

  // CUser::GetCharacExpandData
  // 来源：从旧 frida.js CUser_GetCharacExpandData 迁移
  // 用途：获取角色扩展数据（如绝望之塔状态等）
  cuser_get_charac_expand_data: ptr('0x080DD584'),

  // CUser::GetCera
  // 来源：从旧 frida.js CUser_GetCera 迁移
  // 用途：获取角色点券余额
  cuser_get_cera: ptr('0x080FDF7A'),

  // CUser::getCurCharacQuestW
  // 来源：从旧 frida.js CUser_getCurCharacQuestW 迁移
  // 用途：获取角色任务信息
  cuser_get_cur_charac_quest_w: ptr('0x814AA5E'),

  // CUser::CheckItemLock
  // 来源：从旧 frida.js CUser_CheckItemLock 迁移
  // 用途：检查道具是否被锁定
  cuser_check_item_lock: ptr('0x8646942'),

  // CUser::Send
  // 来源：从旧 frida.js CUser_Send 迁移
  // 用途：发包给客户端
  cuser_send: ptr('0x86485BA'),

  // CUser::SendNotiPacketMessage
  // 来源：从旧 frida.js CUser_SendNotiPacketMessage 迁移
  // 用途：给角色发送通知消息
  cuser_send_noti_packet_message: ptr('0x86886CE'),

  // CUser::SendUpdateItemList
  // 来源：从旧 frida.js CUser_SendUpdateItemList 迁移
  // 用途：通知客户端道具更新
  cuser_send_update_item_list: ptr('0x867C65A'),

  // CUser::send_clear_quest_list
  // 来源：从旧 frida.js CUser_send_clear_quest_list 迁移
  // 用途：通知客户端更新已完成任务列表
  cuser_send_clear_quest_list: ptr('0x868B044'),

  // UserQuest::get_quest_info
  // 来源：从旧 frida.js UserQuest_get_quest_info 迁移
  // 用途：通知客户端更新角色任务列表
  userquest_get_quest_info: ptr('0x86ABBA8'),

  // CUser::SendNotiPacket
  // 来源：从旧 frida.js CUser_SendNotiPacket 迁移
  // 用途：通知客户端更新角色身上装备
  cuser_send_noti_packet: ptr('0x0867BA5C'),

  // CUser::quest_action
  // 来源：从旧 frida.js CUser_quest_action 迁移
  // 用途：任务操作（第二个参数为协议编号: 33=接受, 34=放弃, 35=完成条件满足, 36=提交奖励）
  cuser_quest_action: ptr('0x0866DA8A'),

  // CUser::setGmQuestFlag
  // 来源：从旧 frida.js CUser_setGmQuestFlag 迁移
  // 用途：设置 GM 完成任务模式（无条件完成任务）
  cuser_set_gm_quest_flag: ptr('0x822FC8E'),

  // CUser::gain_exp_sp
  // 来源：从旧 frida.js CUser_gain_exp_sp 迁移
  // 用途：角色增加经验
  cuser_gain_exp_sp: ptr('0x866A3FE'),

  // CUser::GetServerGroup
  // 来源：从旧 frida.js GetServerGroup 迁移
  // 用途：获取角色服务器组编号
  cuser_get_server_group: ptr('0x080CBC90'),

  // CUser::GetCurVAttackCount
  // 来源：从旧 frida.js GetCurVAttackCount 迁移
  // 用途：获取角色本次怪物攻城挑战次数
  cuser_get_cur_vattack_count: ptr('0x084EC216'),

  // ==================== 背包/道具相关地址 ====================

  // CInventory::GetInvenRef
  // 来源：从旧 frida.js CInventory_GetInvenRef 迁移
  // 用途：获取背包指定槽位的道具
  cinventory_get_inven_ref: ptr('0x84FC1DE'),

  // Inven_Item::isEquipableItemType
  // 来源：从旧 frida.js Inven_Item_isEquipableItemType 迁移
  // 用途：判断道具是否为装备类型
  inven_item_is_equipable_item_type: ptr('0x08150812'),

  // Inven_Item::isEmpty
  // 来源：从旧 frida.js Inven_Item_isEmpty 迁移
  // 用途：检查背包中道具槽是否为空
  inven_item_is_empty: ptr('0x811ED66'),

  // Inven_Item::getKey
  // 来源：从旧 frida.js Inven_Item_getKey 迁移
  // 用途：获取背包中道具的 item_id
  inven_item_get_key: ptr('0x850D14E'),

  // Inven_Item::get_add_info
  // 来源：从旧 frida.js Inven_Item_get_add_info 迁移
  // 用途：获取道具附加信息（时装插槽相关）
  inven_item_get_add_info: ptr('0x80F783A'),

  // Inven_Item::Inven_Item (构造函数)
  // 来源：从旧 frida.js Inven_Item_Inven_Item 迁移
  // 用途：初始化/清空背包道具
  inven_item_constructor: ptr('0x80CB854'),

  // Inven_Item::reset
  // 来源：从旧 frida.js Inven_Item_reset 迁移
  // 用途：删除背包槽中的道具（重置为空）
  // 风险：直接删除玩家道具，误用会导致玩家道具丢失
  inven_item_reset: ptr('0x080CB7D8'),

  // CInventory::use_money
  // 来源：从旧 frida.js CInventory_use_money 迁移
  // 用途：扣除角色金币
  // 风险：直接操作角色金币，误扣无法恢复
  cinventory_use_money: ptr('0x84FF54C'),

  // CInventory::delete_item
  // 来源：从旧 frida.js CInventory_delete_item 迁移
  // 用途：从背包中删除道具
  // 风险：直接删除玩家道具，误删会导致道具丢失
  cinventory_delete_item: ptr('0x850400C'),

  // CInventory::get_money
  // 来源：从旧 frida.js CInventory_get_money 迁移
  // 用途：获取角色当前持有金币数量
  cinventory_get_money: ptr('0x81347D6'),

  // CInventory::GetAvatarItemMgrR
  // 来源：从旧 frida.js CInventory_GetAvatarItemMgrR 迁移
  // 用途：获取时装管理器
  cinventory_get_avatar_item_mgr_r: ptr('0x80DD576'),

  // ==================== 道具/装备相关地址 ====================

  // CItem::get_rarity
  // 来源：从旧 frida.js CItem_get_rarity 迁移
  // 用途：获取装备品级
  citem_get_rarity: ptr('0x080F12D6'),

  // CItem::getUsableLevel
  // 来源：从旧 frida.js CItem_getUsableLevel 迁移
  // 用途：获取装备可穿戴等级
  citem_get_usable_level: ptr('0x80F12EE'),

  // CItem::getItemGroupName
  // 来源：从旧 frida.js CItem_getItemGroupName 迁移
  // 用途：获取装备组名称
  citem_get_item_group_name: ptr('0x80F1312'),

  // CItem::is_stackable
  // 来源：从旧 frida.js CItem_is_stackable 迁移
  // 用途：判断道具是否为可堆叠（消耗品）类型
  citem_is_stackable: ptr('0x80F12FA'),

  // GetItem_index
  // 来源：从旧 frida.js GetItem_index 迁移
  // 用途：从道具 PVF 数据中获取 item_id
  getitem_index: ptr('0x08110C48'),

  // ==================== 时装/徽章相关地址 ====================

  // WongWork::CAvatarItemMgr::getJewelSocketData
  // 来源：从旧 frida.js WongWork_CAvatarItemMgr_getJewelSocketData 迁移
  // 用途：获取时装徽章插槽数据
  cavataritemmgr_get_jewel_socket_data: ptr('0x82F98F8'),

  // CStackableItem::GetItemType
  // 来源：从旧 frida.js CStackableItem_GetItemType 迁移
  // 用途：获取消耗品类型（20 = 徽章）
  cstackableitem_get_item_type: ptr('0x8514A84'),

  // CStackableItem::getJewelTargetSocket
  // 来源：从旧 frida.js CStackableItem_getJewelTargetSocket 迁移
  // 用途：获取徽章支持的镶嵌槽类型（红=0x1, 黄=0x2, 绿=0x4, 蓝=0x8, 白金=0x10）
  cstackableitem_get_jewel_target_socket: ptr('0x0822CA28'),

  // DB_UpdateAvatarJewelSlot::makeRequest
  // 来源：从旧 frida.js DB_UpdateAvatarJewelSlot_makeRequest 迁移
  // 用途：时装徽章镶嵌数据存盘
  db_update_avatar_jewel_slot_make_request: ptr('0x843081C'),

  // ==================== 世界/GameWorld 相关地址 ====================

  // G_GameWorld 全局实例
  // 来源：从旧 frida.js G_GameWorld 迁移
  // 用途：获取 GameWorld 单例
  g_gameworld: ptr('0x80DA3A7'),

  // GameWorld::send_all
  // 来源：从旧 frida.js GameWorld_send_all 迁移
  // 用途：向所有在线玩家发包
  // 风险：广播类接口必须限制调用频率，防止刷屏/CC 攻击
  gameworld_send_all: ptr('0x86C8C14'),

  // GameWorld::send_all_with_state
  // 来源：从旧 frida.js GameWorld_send_all_with_state 迁移
  // 用途：向指定状态以上的所有在线玩家发包
  // 风险：同上，广播类接口需限制频率
  gameworld_send_all_with_state: ptr('0x86C9184'),

  // GameWorld::get_UserCount_InWorld
  // 来源：从旧 frida.js GameWorld_get_UserCount_InWorld 迁移
  // 用途：获取在线玩家数量
  gameworld_get_user_count_in_world: ptr('0x86C4550'),

  // GameWorld::find_user_from_world_byaccid
  // 来源：从旧 frida.js GameWorld_find_user_from_world_byaccid 迁移
  // 用途：根据账号 ID 查找已登录角色
  gameworld_find_user_from_world_byaccid: ptr('0x86C4D40'),

  // ==================== 在线玩家遍历相关地址 ====================

  // std::map begin/end/not_equal/get/next 系列
  // 来源：从旧 frida.js gameworld_user_map_* 系列迁移
  // 用途：遍历在线玩家列表（底层是 std::map 迭代器操作）
  gameworld_user_map_begin: ptr('0x80F78A6'),
  gameworld_user_map_end: ptr('0x80F78CC'),
  gameworld_user_map_not_equal: ptr('0x80F78F2'),
  gameworld_user_map_get: ptr('0x80F7944'),
  gameworld_user_map_next: ptr('0x80F7906'),

  // ==================== 邮件相关地址 ====================

  // WongWork::CMailBoxHelper::ReqDBSendNewSystemMultiMail
  // 来源：从旧 frida.js WongWork_CMailBoxHelper_ReqDBSendNewSystemMultiMail 迁移
  // 用途：发送多道具系统邮件
  cmailboxhelper_req_db_send_new_system_multi_mail: ptr('0x8556B68'),

  // WongWork::CMailBoxHelper::MakeSystemMultiMailPostal
  // 来源：从旧 frida.js WongWork_CMailBoxHelper_MakeSystemMultiMailPostal 迁移
  // 用途：组装多道具邮件附件
  cmailboxhelper_make_system_multi_mail_postal: ptr('0x8556A14'),

  // WongWork::CMailBoxHelper::ReqDBSendNewAvatarMail
  // 来源：从旧 frida.js WongWork_CMailBoxHelper_ReqDBSendNewAvatarMail 迁移
  // 用途：发送时装邮件（仅支持在线角色）
  cmailboxhelper_req_db_send_new_avatar_mail: ptr('0x85561B0'),

  // ReqDBSendNewSystemMail (单道具)
  // 来源：从旧 frida.js ReqDBSendNewSystemMail 迁移
  // 用途：发送单道具系统邮件（怪物攻城奖励用）
  req_db_send_new_system_mail: ptr('0x085555E8'),

  // ==================== Vector 操作相关地址 ====================

  // std::vector<std::pair<int, int>> 操作系列
  // 来源：从旧 frida.js std_vector/std_make_pair 系列迁移
  // 用途：构造邮件附件列表（vector<pair<item_id, count>>）
  std_vector_pair_int_int_constructor: ptr('0x81349D6'),
  std_vector_pair_int_int_clear: ptr('0x817A342'),
  std_make_pair_int_int: ptr('0x81B8D41'),
  std_vector_pair_int_int_push_back: ptr('0x80DD606'),

  // ==================== 点券/充值相关地址 ====================

  // WongWork::IPG::CIPGHelper::IPGInput
  // 来源：从旧 frida.js WongWork_IPG_CIPGHelper_IPGInput 迁移
  // 用途：点券充值
  // 风险：禁止直接修改 billing 库所有表字段，务必调用数据库存储过程
  cipghelper_ipg_input: ptr('0x80FFCA4'),

  // WongWork::IPG::CIPGHelper::IPGQuery
  // 来源：从旧 frida.js WongWork_IPG_CIPGHelper_IPGQuery 迁移
  // 用途：同步点券数据库（通知客户端充值结果）
  cipghelper_ipg_query: ptr('0x8100790'),

  // WongWork::IPG::CIPGHelper::IPGInputPoint
  // 来源：从旧 frida.js WongWork_IPG_CIPGHelper_IPGInputPoint 迁移
  // 用途：代币充值
  // 风险：同上，禁止直接修改 billing 表字段
  cipghelper_ipg_input_point: ptr('0x80FFFC0'),

  // ==================== 封包读取/组包相关地址 ====================

  // PacketBuf::get_byte
  // 来源：从旧 frida.js PacketBuf_get_byte 迁移
  // 用途：从客户端封包读取 1 字节
  packetbuf_get_byte: ptr('0x858CF22'),

  // PacketBuf::get_short
  // 来源：从旧 frida.js PacketBuf_get_short 迁移
  // 用途：从客户端封包读取 2 字节
  packetbuf_get_short: ptr('0x858CFC0'),

  // PacketBuf::get_int
  // 来源：从旧 frida.js PacketBuf_get_int 迁移
  // 用途：从客户端封包读取 4 字节
  packetbuf_get_int: ptr('0x858D27E'),

  // PacketBuf::get_binary
  // 来源：从旧 frida.js PacketBuf_get_binary 迁移
  // 用途：从客户端封包读取二进制数据
  packetbuf_get_binary: ptr('0x858D3B2'),

  // ==================== 服务器组包相关地址 ====================

  // PacketGuard::PacketGuard (构造函数)
  // 来源：从旧 frida.js PacketGuard_PacketGuard 迁移
  // 用途：初始化服务器封包
  packetguard_constructor: ptr('0x858DD4C'),

  // InterfacePacketBuf::put_header
  // 来源：从旧 frida.js InterfacePacketBuf_put_header 迁移
  // 用途：写入封包头
  interfacepacketbuf_put_header: ptr('0x80CB8FC'),

  // InterfacePacketBuf::put_byte
  // 来源：从旧 frida.js InterfacePacketBuf_put_byte 迁移
  // 用途：向封包写入 1 字节
  interfacepacketbuf_put_byte: ptr('0x80CB920'),

  // InterfacePacketBuf::put_short
  // 来源：从旧 frida.js InterfacePacketBuf_put_short 迁移
  // 用途：向封包写入 2 字节
  interfacepacketbuf_put_short: ptr('0x80D9EA4'),

  // InterfacePacketBuf::put_int
  // 来源：从旧 frida.js InterfacePacketBuf_put_int 迁移
  // 用途：向封包写入 4 字节
  interfacepacketbuf_put_int: ptr('0x80CB93C'),

  // InterfacePacketBuf::put_binary
  // 来源：从旧 frida.js InterfacePacketBuf_put_binary 迁移
  // 用途：向封包写入二进制数据
  interfacepacketbuf_put_binary: ptr('0x811DF08'),

  // InterfacePacketBuf::finalize
  // 来源：从旧 frida.js InterfacePacketBuf_finalize 迁移
  // 用途：封包完成，准备发送
  interfacepacketbuf_finalize: ptr('0x80CB958'),

  // Destroy_PacketGuard_PacketGuard (析构函数)
  // 来源：从旧 frida.js Destroy_PacketGuard_PacketGuard 迁移
  // 用途：销毁封包对象，释放内存
  destroy_packetguard: ptr('0x858DE80'),

  // ==================== 数据库/MYSQL 相关地址 ====================

  // DBMgr::GetDBHandle
  // 来源：从旧 frida.js DBMgr_GetDBHandle 迁移
  // 用途：获取当前打开的数据库句柄
  dbmgr_get_db_handle: ptr('0x83F523E'),

  // MySQL 构造函数
  // 来源：从旧 frida.js MySQL_MySQL 迁移
  // 用途：初始化 MySQL 对象
  mysql_constructor: ptr('0x83F3AC8'),

  // MySQL::init
  // 来源：从旧 frida.js MySQL_init 迁移
  // 用途：初始化 MySQL 连接内部结构
  mysql_init: ptr('0x83F3CE4'),

  // MySQL::open
  // 来源：从旧 frida.js MySQL_open 迁移
  // 用途：打开 MySQL 数据库连接
  mysql_open: ptr('0x83F4024'),

  // MySQL::close
  // 来源：从旧 frida.js MySQL_close 迁移
  // 用途：关闭 MySQL 数据库连接
  mysql_close: ptr('0x83F3E74'),

  // MySQL::set_query (通用查询设置)
  // 来源：从旧 frida.js MySQL_set_query_2/3/4/5/6 迁移
  // 注意：这些函数共享同一个地址，只是参数个数不同
  mysql_set_query: ptr('0x83F41C0'),

  // MySQL::exec
  // 来源：从旧 frida.js MySQL_exec 迁移
  // 用途：执行 SQL 查询
  // 风险：游戏数据库非线程安全，谨慎操作
  mysql_exec: ptr('0x83F4326'),

  // MySQL::exec_query
  // 来源：从旧 frida.js MySQL_exec_query 迁移
  // 用途：执行查询并获取结果
  mysql_exec_query: ptr('0x083F5348'),

  // MySQL::get_n_rows
  // 来源：从旧 frida.js MySQL_get_n_rows 迁移
  // 用途：获取查询结果行数
  mysql_get_n_rows: ptr('0x80E236C'),

  // MySQL::fetch
  // 来源：从旧 frida.js MySQL_fetch 迁移
  // 用途：获取下一行查询结果
  mysql_fetch: ptr('0x83F44BC'),

  // MySQL 字段读取函数集合
  // 来源：从旧 frida.js MySQL_get_* 系列迁移
  mysql_get_int: ptr('0x811692C'),
  mysql_get_short: ptr('0x0814201C'),
  mysql_get_uint: ptr('0x80E22F2'),
  mysql_get_ulonglong: ptr('0x81754C8'),
  mysql_get_ushort: ptr('0x8116990'),
  mysql_get_float: ptr('0x844D6D0'),
  mysql_get_binary: ptr('0x812531A'),
  mysql_get_binary_length: ptr('0x81253DE'),
  mysql_get_str: ptr('0x80ECDEA'),
  mysql_blob_to_str: ptr('0x83F452A'),

  // ==================== 压缩/解压相关地址 ====================

  // compress_zip
  // 来源：从旧 frida.js compress_zip 迁移
  // 用途：ZIP 压缩
  compress_zip: ptr('0x86B201F'),

  // uncompress_zip
  // 来源：从旧 frida.js uncompress_zip 迁移
  // 用途：ZIP 解压
  uncompress_zip: ptr('0x86B2102'),

  // ==================== 线程安全相关地址 ====================

  // Guard::Mutex::Guard
  // 来源：从旧 frida.js Guard_Mutex_Guard 迁移
  // 用途：获取线程锁（在 dispatcher 线程操作共享数据时使用）
  // 风险：申请锁后务必手动释放，否则会导致死锁
  guard_mutex_guard: ptr('0x810544C'),

  // Destroy::Guard::Mutex::Guard
  // 来源：从旧 frida.js Destroy_Guard_Mutex_Guard 迁移
  // 用途：释放线程锁
  destroy_guard_mutex_guard: ptr('0x8105468'),

  // ==================== 定时器相关地址 ====================

  // G_TimerQueue 全局实例
  // 来源：从旧 frida.js G_TimerQueue 迁移
  // 用途：获取服务器内置定时器队列（用于线程锁和任务调度）
  g_timer_queue: ptr('0x80F647C'),

  // ==================== 数据管理相关地址 ====================

  // G_CDataManager 全局实例
  // 来源：从旧 frida.js G_CDataManager 迁移
  // 用途：获取 DataManager（PVF 数据查询）
  g_cdata_manager: ptr('0x80CC19B'),

  // CDataManager::find_item
  // 来源：从旧 frida.js CDataManager_find_item 迁移
  // 用途：从 PVF 数据中查询道具
  cdata_manager_find_item: ptr('0x835FA32'),

  // CDataManager::find_quest
  // 来源：从旧 frida.js CDataManager_find_quest 迁移
  // 用途：从 PVF 数据中查询任务
  cdata_manager_find_quest: ptr('0x835FDC6'),

  // ==================== 副本/地下城相关地址 ====================

  // CDungeon::get_index
  // 来源：从旧 frida.js CDungeon_get_index 迁移
  // 用途：获取副本 ID
  cdungeon_get_index: ptr('0x080FDCF0'),

  // ==================== 任务相关地址 ====================

  // WongWork::CQuestClear::isClearedQuest
  // 来源：从旧 frida.js WongWork_CQuestClear_isClearedQuest 迁移
  // 用途：检查任务是否已完成
  cquestclear_is_cleared_quest: ptr('0x808BAE0'),

  // ==================== 队伍相关地址 ====================

  // CParty::get_user
  // 来源：从旧 frida.js CParty_get_user 迁移
  // 用途：获取队伍中指定位置的玩家
  cparty_get_user: ptr('0x08145764'),

  // ==================== 绝望之塔相关地址 ====================

  // TOD_Layer::TOD_Layer (构造函数)
  // 来源：从旧 frida.js TOD_Layer_TOD_Layer 迁移
  // 用途：构造绝望之塔层数对象
  tod_layer_constructor: ptr('0x085FE7B4'),

  // TOD_UserState::setEnterLayer
  // 来源：从旧 frida.js TOD_UserState_setEnterLayer 迁移
  // 用途：设置角色当前绝望之塔层数
  tod_userstate_set_enter_layer: ptr('0x086438FC'),

  // ==================== 怪物攻城相关地址 ====================

  // GlobalData::s_villageMonsterMgr
  // 来源：从旧 frida.js GlobalData_s_villageMonsterMgr 迁移
  // 用途：怪物攻城管理器全局实例指针
  globaldata_villagemonstermgr: ptr('0x941F77C'),

  // Inter::VillageAttackedStart::dispatch_sig
  // 来源：从旧 frida.js Inter_VillageAttackedStart_dispatch_sig 迁移
  // 用途：开启怪物攻城活动
  inter_village_attacked_start_dispatch: ptr('0x84DF47A'),

  // village_attacked::CVillageMonsterMgr::OnDestroyVillageMonster
  // 来源：从旧 frida.js village_attacked_CVillageMonsterMgr_OnDestroyVillageMonster 迁移
  // 用途：结束怪物攻城活动（销毁攻城怪物）
  cvillagemonstermgr_on_destroy_village_monster: ptr('0x086B43D4'),

  // ==================== Hook 目标地址 ====================

  // ---- 通用系统 hook ----

  // TimerDispatcher::dispatch
  // 来源：从旧 frida.js hook_TimerDispatcher_dispatch 迁移
  // 用途：服务器内置定时器调度，每秒至少执行一次
  // Hook 点：onLeave 时执行自定义任务队列
  timer_dispatcher_dispatch: ptr('0x8632A18'),

  // check_argv (延迟启动 hook)
  // 来源：从旧 frida.js awake 函数迁移
  // 用途：首次加载时等待 check_argv 执行完毕后再加载插件
  // 为什么需要：服务器初始化完成前不能 hook，否则可能访问未初始化的数据
  check_argv: ptr('0x829EA5A'),

  // ---- 在线奖励 hook ----

  // CUser::WorkPerFiveMin
  // 来源：从旧 frida.js enable_online_reward 迁移
  // 用途：每 5 分钟执行一次的角色工作函数（在线奖励、副本恢复等）
  cuser_work_per_five_min: ptr('0x8652F0C'),

  // ---- 绝望之塔 hook ----

  // TOD 门票检查跳过
  // 来源：从旧 frida.js fix_TOD 第一个 hook 迁移
  // 用途：让挑战成功后可以继续使用同一张门票再次挑战
  // Hook 点：onLeave 时替换返回值为 0
  tod_ticket_check: ptr('0x0864387E'),

  // TOD_UserState::getTodayEnterLayer
  // 来源：从旧 frida.js fix_TOD skip_user_apc hook 迁移
  // 用途：获取今日进入的绝望之塔层数
  // Hook 点：onEnter 时修改层数跳过 10 的倍数层（UserAPC 层）
  tod_get_today_enter_layer: ptr('0x0864383E'),

  // CParty::UseAncientDungeonItems (replace)
  // 来源：从旧 frida.js fix_TOD 绝望之塔金币 hook 迁移
  // 用途：使用远古地下城门票
  // Hook 点：replace 后对绝望之塔直接返回 1，跳过金币扣除
  cparty_use_ancient_dungeon_items: ptr('0x859EAC2'),

  // ---- 时装徽章镶嵌 hook ----

  // Dispatcher_UseJewel::dispatch_sig
  // 来源：从旧 frida.js fix_use_emblem 迁移
  // 用途：处理时装徽章镶嵌请求
  // 风险：协议解析错误可能导致客户端异常或角色数据异常
  // Hook 点：onEnter 解析封包、校验、镶嵌、存档；onLeave 替换返回值为 0
  use_jewel_dispatch: ptr('0x8217BD6'),

  // ---- 时装潜能 hook ----

  // 时装潜能属性下发 hook 点 1
  // 来源：从旧 frida.js start_hidden_option 第一个 hook 迁移
  // 用途：时装潜能生成入口
  // Hook 点：onEnter 调用 hidden_option() 修改内存
  hidden_option_entry: ptr('0x08509B9E'),

  // 时装潜能属性下发 hook 点 2
  // 来源：从旧 frida.js start_hidden_option 第二个 hook 迁移
  // 用途：跳过系统默认属性分配
  // Hook 点：onLeave 替换返回值为 1
  hidden_option_return_1: ptr('0x0817EDEC'),

  // 时装潜能内存 patch 地址 1 (关闭系统分配)
  // 来源：从旧 frida.js hidden_option 迁移
  // 用途：nop 掉系统属性分配逻辑
  hidden_option_patch_1: ptr('0x08509D49'),

  // 时装潜能内存 patch 地址 2 (写入随机属性)
  // 来源：从旧 frida.js hidden_option 迁移
  // 用途：写入随机时装潜能属性值
  hidden_option_patch_2: ptr('0x08509D34'),

  // ---- 玩家上下线 hook ----

  // GameWorld::reach_game_world (玩家进入游戏世界)
  // 来源：从旧 frida.js hook_user_inout_game_world 第一个 hook 迁移
  // 用途：玩家选择角色后进入游戏世界的处理
  // Hook 点：onLeave 时发送排行榜、怪物攻城进度通知、问候消息
  gameworld_reach_game_world: ptr('0x86C4E50'),

  // GameWorld::leave_game_world (玩家离开游戏世界)
  // 来源：从旧 frida.js hook_user_inout_game_world 第二个 hook 迁移
  // 用途：玩家退出游戏世界的处理
  // Hook 点：onEnter 时更新排行榜排名
  gameworld_leave_game_world: ptr('0x86C5288'),

  // ---- 怪物攻城 hook (共 6 个) ----

  // village_attacked::CVillageMonster::OnKillVillageMonster (攻城副本回调)
  // 来源：从旧 frida.js hook_VillageAttack 第一个 hook 迁移
  // 用途：队友击杀攻城怪物后的队伍奖励处理
  // Hook 点：onLeave retval==0 时发奖励
  village_monster_on_kill: ptr('0x086B34A0'),

  // village_attacked::CVillageMonster::SendVillageMonsterFightResult (挑战结果回调)
  // 来源：从旧 frida.js hook_VillageAttack 第二个 hook 迁移
  // 用途：挑战攻城怪物副本结束事件，更新各阶段状态
  // Hook 点：onLeave 根据 result 更新 PT、阶段、难度等
  village_monster_send_fight_result: ptr('0x086B330A'),

  // village_attacked::CVillageMonsterArea::GetAttackedMonster (刷新攻城怪物)
  // 来源：从旧 frida.js hook_VillageAttack 第三个 hook 迁移
  // 用途：控制下一只刷新的攻城怪物 ID
  // Hook 点：onLeave 修改刷新出来的怪物 ID
  village_monster_area_get_attacked_monster: ptr('0x086B3AEA'),

  // CParty::OnFightVillageMonster (队伍挑战攻城怪物入口)
  // 来源：从旧 frida.js hook_VillageAttack 第四个 hook 迁移
  // 用途：标记正在挑战攻城怪物状态
  // Hook 点：onEnter/onLeave 切换 state_on_fighting 状态
  cparty_on_fight_village_monster: ptr('0x085B9596'),

  // village_attacked::CVillageMonster::OnFightVillageMonster
  // 来源：从旧 frida.js hook_VillageAttack 第五个 hook 迁移
  // 用途：记录当前正在挑战的攻城怪物 ID
  // Hook 点：onEnter 记录 on_fighting_village_monster_id
  village_monster_on_fight: ptr('0x086B3240'),

  // MapInfo::Add_Mob (replace) - 副本刷怪
  // 来源：从旧 frida.js hook_VillageAttack replace hook 迁移
  // 用途：控制怪物攻城副本内怪物的数量和属性
  // 为什么用 replace 而不是 attach：
  //   需要完全控制刷怪流程，包括修改怪物等级、类型、数量等
  mapinfo_add_mob: ptr('0x08151612'),

  // village_attacked::CVillageMonsterMgr::OnKillVillageMonster (通关额外奖励)
  // 来源：从旧 frida.js hook_VillageAttack 最后一个 hook 迁移
  // 用途：怪物攻城挑战成功时给队伍发送额外经验奖励
  // Hook 点：onLeave retval==0 且 result==1 时发经验
  villagemonstermgr_on_kill_village_monster: ptr('0x086B4866'),

  // 怪物攻城副本难度内存 patch 地址
  // 来源：从旧 frida.js set_villageattack_dungeon_difficult 迁移
  // 用途：通过直接写内存修改副本难度（0-4）
  // 风险：直接修改代码段数据，不正确使用可能导致副本异常
  villageattack_dungeon_difficult: ptr('0x085B9605'),

  // ---- 勇士归来 hook ----

  // 回归勇士时间判定 patch
  // 来源：从旧 frida.js set_return_user 迁移
  // 用途：直接修改内存中的回归判定时间阈值
  // 风险：修改代码段数据，版本更新后需确认地址
  return_user_time_patch: ptr('0x84C753D'),

  // CIPGHelper 全局实例
  // 来源：从旧 frida.js 点券充值逻辑迁移
  // 用途：点券/代币充值 IPG 输入/查询帮助器
  // 风险：点券/代币经济相关，高风险地址，禁止直接修改 billing 库表字段
  cipghelper_global: ptr('0x941F734'),

  // 空字符串/默认字符串指针
  // 来源：从旧 frida.js 点券充值逻辑迁移
  // 用途：CIPGHelper::IPGInput 参数占位
  // 风险：必须确认该地址在目标版本仍然有效
  ipg_empty_string: ptr('0x8C7FA20'),

  // ---- 字符串长度函数 ----

  // strlen (libc)
  // 来源：从旧 frida.js strlen 迁移
  // 用途：计算字符串长度
  strlen: ptr('0x0807E3B0'),
};

if (typeof globalThis !== 'undefined') {
  globalThis.PROJECT_ADDRESSES = PROJECT_ADDRESSES;
}
// JS Runtime 配置中心
// 来源：从旧 frida.js 迁移并重构
// 用途：集中管理所有功能开关和参数，不要在 df_game_r.js 或业务模块中硬编码
//
// 为什么需要集中配置：
// 1. 热重载时可以快速关闭某个出问题的模块
// 2. 不同环境（测试服/正式服）可以用不同配置
// 3. 新人接手时不用翻遍代码找开关

const PROJECT_JS_CONFIG = {
  features: {
    // 定时器调度（dispatcher 线程安全）
    // 几乎所有功能都依赖它，必须开启
    timer_dispatcher: true,

    // 数据库初始化（frida 库建表、活动数据加载）
    // 排行榜和怪物攻城依赖此模块
    database: true,

    // 绝望之塔修复：门票/金币/每10层跳过用户APC
    tod_fix: true,

    // 时装徽章镶嵌修复
    emblem_fix: true,

    // 时装潜能（隐藏属性下发）
    hidden_option: true,

    // 勇士归来时间设置
    return_user: true,

    // 战力排行（前三名站街显示）
    ranking: true,

    // 玩家上线/下线处理（排行榜下发、怪物攻城进度通知等）
    user_inout: true,

    // 怪物攻城活动
    village_attack: true,

    // 在线奖励（每5分钟送点券）
    // 默认关闭，因为涉及充值点券操作，过于高风险
    online_reward: false,
  },

  // 绝望之塔配置
  // 来源：从旧 frida.js fix_TOD(true) 迁移
  tod_fix: {
    // 是否跳过每10层的 UserAPC 挑战
    // 设为 true 时，10/20/.../90 层会跳过玩家 APC，直接进入下一层
    skip_user_apc: true,
  },

  // 勇士归来时间配置
  // 来源：从旧 frida.js set_return_user(15) 迁移
  // day: 回归判定天数（距离上次登录超过此天数即为回归勇士）
  return_user: {
    day: 15,
  },

  // 怪物攻城活动配置
  // 来源：从旧 frida.js EVENT_VILLAGEATTACK_* 系列常量迁移
  village_attack: {
    // 每日活动开启时间（UTC 小时，北京时间 = UTC+8）
    // 12 = 北京时间 20:00
    start_hour: 12,

    // 活动总时长（秒）
    total_time: 3600,

    // 各阶段目标 PT 点数
    // 来源：从旧 frida.js EVENT_VILLAGEATTACK_TARGET_SCORE 迁移
    target_score: [100, 200, 300],
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.PROJECT_JS_CONFIG = PROJECT_JS_CONFIG;
}
// NativeFunction 工厂与统一管理
// 来源：从旧 frida.js 重构
// 用途：提供统一的 nf() 工厂函数，集中管理所有 NativeFunction 创建
//
// 为什么需要统一工厂：
// 1. 所有 NativeFunction 都使用相同的 abi: 'sysv'
// 2. 统一管理便于后续切换 abi 或添加额外逻辑
// 3. 业务模块通过 ctx.native 调用，不直接创建 NativeFunction

// NativeFunction 工厂函数
// address: ptr 地址
// retType: 返回值类型字符串 (如 'int', 'pointer', 'void', 'bool')
// argTypes: 参数类型数组 (如 ['pointer', 'int'])
//
// 为什么需要地址校验：
// 能在启动阶段暴露地址缺失/为空的问题，避免 hook 时才崩溃
function nf(address, retType, argTypes) {
  if (!address) {
    throw new Error('NativeFunction address is missing (retType=' + retType + ')');
  }
  if (typeof address.isNull === 'function' && address.isNull()) {
    throw new Error('NativeFunction address is null (retType=' + retType + ')');
  }
  return new NativeFunction(address, retType, argTypes || [], { abi: 'sysv' });
}

if (typeof globalThis !== 'undefined') {
  globalThis.nf = nf;
}
// 日志模块
// 来源：从旧 frida.js 迁移
// 用途：统一日志输出（控制台 + 文件）
// 风险：文件日志依赖 libc fopen/fread 等底层函数，如果运行环境变化可能失效

var g_log_file = null;
var g_log_day = null;
const g_log_dir_path = './frida_log/';

// 日志对象，挂载到 globalThis 供所有模块使用
function createLogger(ctx) {
  // 打开目录
  const opendir = new NativeFunction(Module.getGlobalExportByName('opendir'), 'int', ['pointer'], {'abi': 'sysv'});
  const mkdir = new NativeFunction(Module.getGlobalExportByName('mkdir'), 'int', ['pointer', 'int'], {'abi': 'sysv'});

  function ensureDir(path) {
    const pathPtr = Memory.allocUtf8String(path);
    if (opendir(pathPtr)) {
      return true;
    }
    return mkdir(pathPtr, 0x1FF);
  }

  // 获取时间戳字符串
  function getTimestamp() {
    var date = new Date();
    date = new Date(date.setHours(date.getHours() + 0));
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const hour = date.getHours().toString();
    const minute = date.getMinutes().toString();
    const second = date.getSeconds().toString();
    const ms = date.getMilliseconds().toString();
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + ms;
  }

  // 获取频道名
  function getChannelName() {
    if (ctx && ctx.getChannelName) {
      return ctx.getChannelName();
    }
    return 'unknown';
  }

  // 日志主函数
  // 注意：日志模块依赖 globalThis.fopen 和 globalThis.fread 等全局 NativeFunction，
  // 这些需要在启动前由 bindings 初始化好。
  function log(msg) {
    var date = new Date();
    date = new Date(date.setHours(date.getHours() + 0));
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const hour = date.getHours().toString();
    const minute = date.getMinutes().toString();
    const second = date.getSeconds().toString();
    const ms = date.getMilliseconds().toString();

    // 按日期轮转日志文件
    if ((g_log_file === null) || (g_log_day != day)) {
      ensureDir(g_log_dir_path);
      // 依赖 globalThis 上注册的 fopen 等函数
      if (typeof globalThis.fopen !== 'undefined') {
        g_log_file = new File(g_log_dir_path + 'frida_' + getChannelName() + '_' + year + '_' + month + '_' + day + '.log', 'a+');
      }
      g_log_day = day;
    }

    const timestamp = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + ms;

    // 控制台日志
    console.log('[' + timestamp + '] ' + msg + '\n');

    // 文件日志
    if (g_log_file !== null) {
      try {
        g_log_file.write('[' + timestamp + '] ' + msg + '\n');
        g_log_file.flush();
      } catch (e) {
        // 日志写入失败不应影响主流程
      }
    }
  }

  return { log: log, getTimestamp: getTimestamp };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createLogger = createLogger;
}
// 时间模块
// 来源：从旧 frida.js 迁移
// 用途：提供系统时间、时间戳等相关工具函数

function createTimeModule(addr) {
  // 系统时间全局变量地址
  // 来源：从旧 frida.js 迁移，原代码: GlobalData_s_systemTime_
  // 用途：读取游戏服务器的系统 UTC 时间（秒）
  // 风险：地址依赖特定游戏版本，升级后需确认是否仍然有效
  // 注意：地址由调用方从 runtime_addresses.js 传入，不使用裸地址回退
  const systemTimePtr = addr.system_time || null;

  if (!systemTimePtr) {
    console.log('[time] system_time 地址未提供，时间模块将返回 0');
  }

  // 获取系统UTC时间(秒)
  function getCurSec() {
    if (!systemTimePtr) {
      return 0;
    }
    return systemTimePtr.readInt();
  }

  return { getCurSec: getCurSec };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createTimeModule = createTimeModule;
}
// 随机数模块
// 来源：从旧 frida.js 迁移
// 用途：提供统一的随机数生成函数，避免各模块重复定义 get_random_int

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

if (typeof globalThis !== 'undefined') {
  globalThis.getRandomInt = getRandomInt;
}
// 内存操作模块
// 来源：从旧 frida.js 迁移
// 用途：封装 Memory.protect 和 patch 字节写入等内存操作
// 风险：内存 patch 直接修改进程代码段，错误操作可能导致崩溃

// 内存十六进制打印（调试用）
// p: NativePointer
// len: 字节长度
function bin2hex(p, len) {
  var hex = '';
  for (var i = 0; i < len; i++) {
    var s = p.add(i).readU8().toString(16);
    if (s.length == 1) {
      s = '0' + s;
    }
    hex += s;
    if (i != len - 1) {
      hex += ' ';
    }
  }
  return hex;
}

// 安全写入内存
// 用途：修改内存保护属性后写入数据，写入后可选恢复保护
// 风险：修改代码段内存容易导致崩溃，务必确认地址正确
function protectAndWrite(address, size, data, restoreProtection) {
  try {
    // 修改内存保护属性为可读可写可执行
    Memory.protect(address, size, 'rwx');

    if (typeof data === 'number') {
      if (size == 1) {
        address.writeU8(data);
      } else if (size == 2) {
        address.writeUShort(data);
      } else if (size == 4) {
        address.writeU32(data);
      } else {
        address.writeInt(data);
      }
    } else if (data instanceof Array) {
      // byte array
      address.writeByteArray(data);
    }
  } catch (err) {
    console.log('[memory] protectAndWrite failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.bin2hex = bin2hex;
  globalThis.memoryProtectAndWrite = protectAndWrite;
}
// 文件操作模块
// 来源：从旧 frida.js 迁移并重构
// 用途：封装 Linux 文件读写操作
// 风险：依赖 libc 原生函数（fopen/fread/fclose），运行环境变化可能导致失效
//
// 为什么需要自初始化 libc 函数：
// 不依赖外部 globalThis.fopen/fread/fclose，避免启动顺序问题

function createFileModule() {
  // ---- 自初始化 libc 文件 API ----
  // 为什么放在内部：避免依赖外部 globalThis 上的传入值
  // fopen 返回 pointer 而非 int（避免 32 位截断问题）
  var _fopen = null;
  var _fread = null;
  var _fclose = null;

  function initLibc() {
    if (_fopen !== null) {
      return true;
    }
    try {
      _fopen = new NativeFunction(Module.getGlobalExportByName('fopen'), 'pointer', ['pointer', 'pointer'], { abi: 'sysv' });
      _fread = new NativeFunction(Module.getGlobalExportByName('fread'), 'int', ['pointer', 'int', 'int', 'pointer'], { abi: 'sysv' });
      _fclose = new NativeFunction(Module.getGlobalExportByName('fclose'), 'int', ['pointer'], { abi: 'sysv' });
      return true;
    } catch (e) {
      console.log('[file] 初始化 libc 文件 API 失败: ' + e);
      return false;
    }
  }

  // 读取文件
  // path: 文件路径
  // mode: 'r'=读, 'rb'=二进制读
  // len: 读取缓冲区大小
  function readFile(path, mode, len) {
    if (!initLibc()) {
      console.log('[file] libc 文件 API 未初始化，无法读取文件: ' + path);
      return null;
    }

    const pathPtr = Memory.allocUtf8String(path);
    const modePtr = Memory.allocUtf8String(mode);
    const f = _fopen(pathPtr, modePtr);

    // 使用 .isNull() 判断 fopen 失败（pointer 类型）
    if (f.isNull()) {
      console.log('[file] fopen 失败: ' + path);
      return null;
    }

    const data = Memory.alloc(len);
    const freadRet = _fread(data, 1, len, f);
    _fclose(f);

    if (mode == 'r') {
      return data.readUtf8String(freadRet);
    }
    return data;
  }

  // 加载本地 JSON 配置文件
  function loadConfig(path) {
    const data = readFile(path, 'r', 10 * 1024 * 1024);
    if (!data) {
      console.log('[file] 配置文件读取失败: ' + path);
      return null;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.log('[file] JSON 解析失败: ' + path + ' - ' + e);
      return null;
    }
  }

  return { readFile: readFile, loadConfig: loadConfig };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createFileModule = createFileModule;
}
// Hook 防重复模块
// 来源：新增模块，用于防止热重载时重复 hook 造成逻辑叠加
// 用途：所有 Interceptor.attach 和 Interceptor.replace 都必须走这里
//
// 为什么必须有这一层：
// 1. Frida 热重载时原有的 Interceptor hook 不会被自动清除
// 2. 重复 attach 会导致同一个函数被多次 hook，造成逻辑叠加
// 3. 比如一个扣血 hook 重复 attach 3 次，角色受伤会翻 3 倍
// 4. 统一管理能确保同一个 key 只 hook 一次
//
// 为什么缓存必须挂到 globalThis：
// dp_load 每加载一次本文件，局部变量 `var g_hook_xxx = {}` 会被重新初始化。
// 将缓存挂在 globalThis 上，确保重复 dp_load 不会清空已注册的 hook key。

// 从 globalThis 恢复持久化缓存，避免重复 dp_load 清空
if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.__dp_hook_attached === 'undefined') {
    globalThis.__dp_hook_attached = {};
  }
  if (typeof globalThis.__dp_hook_replaced === 'undefined') {
    globalThis.__dp_hook_replaced = {};
  }
}

var g_hook_attached = (typeof globalThis !== 'undefined')
  ? globalThis.__dp_hook_attached
  : {};

var g_hook_replaced = (typeof globalThis !== 'undefined')
  ? globalThis.__dp_hook_replaced
  : {};

// 防止重复 attach
// key: 唯一标识，同一 key 多次调用只执行一次
// address: hook 的目标地址 (NativePointer)
// callbacks: { onEnter: function(args) {}, onLeave: function(retval) {} }
//
// 返回值语义：
//   true  = 已注册过（幂等）或本次注册成功
//   false = 注册失败（已输出日志），调用方应判断并做兜底处理
function attachOnce(key, address, callbacks) {
  if (g_hook_attached[key]) {
    // 已经 attach 过，跳过（视为成功）
    return true;
  }

  try {
    Interceptor.attach(address, callbacks);
    g_hook_attached[key] = true;
    return true;
  } catch (err) {
    console.log('[hook_guard] attach failed, key=' + key + ', error=' + err);
    return false;
  }
}

// 防止重复 replace
// key: 唯一标识
// address: 要替换的函数地址 (NativePointer)
// callback: 替换后的实现
// retType: 返回值类型
// argTypes: 参数类型数组
//
// 返回值语义：
//   true  = 已替换过（幂等）或本次替换成功
//   false = 替换失败（已输出日志）
function replaceOnce(key, address, callback, retType, argTypes) {
  if (g_hook_replaced[key]) {
    // 已经 replace 过，跳过（视为成功）
    return true;
  }

  try {
    Interceptor.replace(address, new NativeCallback(callback, retType, argTypes));
    g_hook_replaced[key] = true;
    return true;
  } catch (err) {
    console.log('[hook_guard] replace failed, key=' + key + ', error=' + err);
    return false;
  }
}

// 重置状态（手动调用，会清除 globalThis 上的持久化缓存）
function resetHookGuard() {
  g_hook_attached = {};
  g_hook_replaced = {};

  if (typeof globalThis !== 'undefined') {
    globalThis.__dp_hook_attached = g_hook_attached;
    globalThis.__dp_hook_replaced = g_hook_replaced;
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.attachOnce = attachOnce;
  globalThis.replaceOnce = replaceOnce;
  globalThis.resetHookGuard = resetHookGuard;
}
// 封包操作 binding
// 来源：从旧 frida.js PacketBuf_* 和 InterfacePacketBuf_* 系列迁移
// 用途：客户端封包读取 + 服务器封包组包

function createPacketBinding(addr) {
  // ---- 客户端封包读取 ----

  // 从客户端封包中读取 1 字节（失败会抛异常，调用方必须做异常处理）
  const _getByte = nf(addr.packetbuf_get_byte, 'int', ['pointer', 'pointer']);

  function getByte(packetBuf) {
    const data = Memory.alloc(1);
    if (_getByte(packetBuf, data)) {
      return data.readU8();
    }
    throw new Error('PacketBuf_get_byte Fail!');
  }

  const _getShort = nf(addr.packetbuf_get_short, 'int', ['pointer', 'pointer']);

  function getShort(packetBuf) {
    const data = Memory.alloc(2);
    if (_getShort(packetBuf, data)) {
      return data.readShort();
    }
    throw new Error('PacketBuf_get_short Fail!');
  }

  const _getInt = nf(addr.packetbuf_get_int, 'int', ['pointer', 'pointer']);

  function getInt(packetBuf) {
    const data = Memory.alloc(4);
    if (_getInt(packetBuf, data)) {
      return data.readInt();
    }
    throw new Error('PacketBuf_get_int Fail!');
  }

  const _getBinary = nf(addr.packetbuf_get_binary, 'int', ['pointer', 'pointer', 'int']);

  function getBinary(packetBuf, len) {
    const data = Memory.alloc(len);
    if (_getBinary(packetBuf, data, len)) {
      return data.readByteArray(len);
    }
    throw new Error('PacketBuf_get_binary Fail!');
  }

  // 获取原始封包 buffer 指针地址
  // 来源：从旧 frida.js api_PacketBuf_get_buf 迁移
  function getBuf(packetBuf) {
    return packetBuf.add(20).readPointer().add(13);
  }

  // ---- 服务器组包 ----

  const _PacketGuardConstructor = nf(addr.packetguard_constructor, 'int', ['pointer']);
  const _PutHeader = nf(addr.interfacepacketbuf_put_header, 'int', ['pointer', 'int', 'int']);
  const _PutByte = nf(addr.interfacepacketbuf_put_byte, 'int', ['pointer', 'uint8']);
  const _PutShort = nf(addr.interfacepacketbuf_put_short, 'int', ['pointer', 'uint16']);
  const _PutInt = nf(addr.interfacepacketbuf_put_int, 'int', ['pointer', 'int']);
  const _PutBinary = nf(addr.interfacepacketbuf_put_binary, 'int', ['pointer', 'pointer', 'int']);
  const _Finalize = nf(addr.interfacepacketbuf_finalize, 'int', ['pointer', 'int']);
  const _DestroyPacketGuard = nf(addr.destroy_packetguard, 'int', ['pointer']);

  // 初始化封包对象
  function createPacketGuard() {
    const packetGuard = Memory.alloc(0x20000);
    _PacketGuardConstructor(packetGuard);
    return packetGuard;
  }

  function putHeader(packetGuard, flag, protocolId) {
    _PutHeader(packetGuard, flag, protocolId);
  }

  function putByte(packetGuard, value) {
    _PutByte(packetGuard, value);
  }

  function putShort(packetGuard, value) {
    _PutShort(packetGuard, value);
  }

  function putInt(packetGuard, value) {
    _PutInt(packetGuard, value);
  }

  function putBinary(packetGuard, ptr, len) {
    _PutBinary(packetGuard, ptr, len);
  }

  function finalize(packetGuard, flag) {
    _Finalize(packetGuard, flag);
  }

  function destroyPacketGuard(packetGuard) {
    _DestroyPacketGuard(packetGuard);
  }

  // 向封包写入字符串（协议中字符串格式：4字节长度 + 内容）
  const _strlen = nf(addr.strlen, 'int', ['pointer']);

  function putString(packetGuard, s) {
    const p = Memory.allocUtf8String(s);
    const len = _strlen(p);
    _PutInt(packetGuard, len);
    _PutBinary(packetGuard, p, len);
  }

  return {
    getByte: getByte,
    getShort: getShort,
    getInt: getInt,
    getBinary: getBinary,
    getBuf: getBuf,
    createPacketGuard: createPacketGuard,
    putHeader: putHeader,
    putByte: putByte,
    putShort: putShort,
    putInt: putInt,
    putBinary: putBinary,
    putString: putString,
    finalize: finalize,
    destroyPacketGuard: destroyPacketGuard,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createPacketBinding = createPacketBinding;
}
// MySQL 数据库操作 binding
// 来源：从旧 frida.js MySQL_* 系列函数迁移
// 用途：封装 MySQL 连接、查询、结果读取
//
// 风险说明：
// 1. 游戏数据库非线程安全，务必在 dispatcher 线程中操作
// 2. SQL 拼接未做转义，后续如需防注入需集中在此处修改
// 3. 直接操作游戏数据库，错误 SQL 可能导致数据损坏

function createMysqlBinding(addr) {
  // MySQL 底层函数
  const _MySQLConstructor = nf(addr.mysql_constructor, 'pointer', ['pointer']);
  const _MySQLInit = nf(addr.mysql_init, 'int', ['pointer']);
  const _MySQLOpen = nf(addr.mysql_open, 'int', ['pointer', 'pointer', 'int', 'pointer', 'pointer', 'pointer']);
  const _MySQLClose = nf(addr.mysql_close, 'int', ['pointer']);
  const _MySQLSetQuery2 = nf(addr.mysql_set_query, 'int', ['pointer', 'pointer']);
  const _MySQLExec = nf(addr.mysql_exec, 'int', ['pointer', 'int']);
  const _MySQLGetNRows = nf(addr.mysql_get_n_rows, 'int', ['pointer']);
  const _MySQLFetch = nf(addr.mysql_fetch, 'int', ['pointer']);
  const _MySQLGetInt = nf(addr.mysql_get_int, 'int', ['pointer', 'int', 'pointer']);
  const _MySQLGetUint = nf(addr.mysql_get_uint, 'int', ['pointer', 'int', 'pointer']);
  const _MySQLGetShort = nf(addr.mysql_get_short, 'int', ['pointer', 'int', 'pointer']);
  const _MySQLGetFloat = nf(addr.mysql_get_float, 'int', ['pointer', 'int', 'pointer']);
  const _MySQLGetBinaryLength = nf(addr.mysql_get_binary_length, 'int', ['pointer', 'int']);
  const _MySQLGetBinary = nf(addr.mysql_get_binary, 'int', ['pointer', 'int', 'pointer', 'int']);

  // 打开数据库连接
  // 来源：从旧 frida.js api_MYSQL_open 迁移
  // 风险：连接失败返回 null，调用方必须检查
  function open(dbName, dbIp, dbPort, dbAccount, dbPassword) {
    const mysql = Memory.alloc(0x80000);
    _MySQLConstructor(mysql);
    _MySQLInit(mysql);

    const dbIpPtr = Memory.allocUtf8String(dbIp);
    const dbNamePtr = Memory.allocUtf8String(dbName);
    const dbAccountPtr = Memory.allocUtf8String(dbAccount);
    const dbPasswordPtr = Memory.allocUtf8String(dbPassword);

    const ret = _MySQLOpen(mysql, dbIpPtr, dbPort, dbNamePtr, dbAccountPtr, dbPasswordPtr);
    if (ret) {
      return mysql;
    }
    return null;
  }

  // 关闭数据库连接
  function close(mysql) {
    if (mysql) {
      _MySQLClose(mysql);
    }
  }

  // 执行 SQL 查询
  // 注意：此处返回底层 MySQLExec 的原始返回值（由游戏引擎封装，非标准 libmysqlclient）。
  // 根据旧 frida.js 实际使用经验，非零值表示成功，零值表示失败。
  // 业务层请使用 ctx.fridaDb.exec(sql)（已封装为布尔语义），不要直接依赖本函数的 raw 返回码。
  function exec(mysql, sql) {
    const sqlPtr = Memory.allocUtf8String(sql);
    _MySQLSetQuery2(mysql, sqlPtr);
    return _MySQLExec(mysql, 1);
  }

  // 获取查询结果行数
  function getNRows(mysql) {
    return _MySQLGetNRows(mysql);
  }

  // 获取下一行
  function fetch(mysql) {
    return _MySQLFetch(mysql);
  }

  // 读取整数字段
  function getInt(mysql, fieldIndex) {
    const v = Memory.alloc(4);
    if (1 == _MySQLGetInt(mysql, fieldIndex, v)) {
      return v.readInt();
    }
    return null;
  }

  function getUint(mysql, fieldIndex) {
    const v = Memory.alloc(4);
    if (1 == _MySQLGetUint(mysql, fieldIndex, v)) {
      return v.readUInt();
    }
    return null;
  }

  function getShort(mysql, fieldIndex) {
    const v = Memory.alloc(4);
    if (1 == _MySQLGetShort(mysql, fieldIndex, v)) {
      return v.readShort();
    }
    return null;
  }

  function getFloat(mysql, fieldIndex) {
    const v = Memory.alloc(4);
    if (1 == _MySQLGetFloat(mysql, fieldIndex, v)) {
      return v.readFloat();
    }
    return null;
  }

  // 读取字符串字段
  function getStr(mysql, fieldIndex) {
    const binaryLength = _MySQLGetBinaryLength(mysql, fieldIndex);
    if (binaryLength > 0) {
      const v = Memory.alloc(binaryLength);
      if (1 == _MySQLGetBinary(mysql, fieldIndex, v, binaryLength)) {
        return v.readUtf8String(binaryLength);
      }
    }
    return null;
  }

  // 读取二进制字段
  function getBinary(mysql, fieldIndex) {
    const binaryLength = _MySQLGetBinaryLength(mysql, fieldIndex);
    if (binaryLength > 0) {
      const v = Memory.alloc(binaryLength);
      if (1 == _MySQLGetBinary(mysql, fieldIndex, v, binaryLength)) {
        return v.readByteArray(binaryLength);
      }
    }
    return null;
  }

  return {
    open: open,
    close: close,
    exec: exec,
    getNRows: getNRows,
    fetch: fetch,
    getInt: getInt,
    getUint: getUint,
    getShort: getShort,
    getFloat: getFloat,
    getStr: getStr,
    getBinary: getBinary,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createMysqlBinding = createMysqlBinding;
}
// 角色操作 binding
// 来源：从旧 frida.js CUser* 系列函数迁移
// 用途：封装角色状态、属性、数据相关操作
//
// 风险：这些函数直接操作角色对象，参数需确保是有效的 CUser 指针

function createUserBinding(addr) {
  const _GetState = nf(addr.cuser_get_state, 'int', ['pointer']);
  const _GetAccId = nf(addr.cuser_get_acc_id, 'int', ['pointer']);
  const _GetCurCharacNo = nf(addr.cusercharacinfo_get_cur_charac_no, 'int', ['pointer']);
  const _GetCharacLevel = nf(addr.cusercharacinfo_get_charac_level, 'int', ['pointer']);
  const _GetCurCharacName = nf(addr.cusercharacinfo_get_cur_charac_name, 'pointer', ['pointer']);
  const _GetLevelUpExp = nf(addr.cusercharacinfo_get_level_up_exp, 'int', ['pointer', 'int']);
  const _GetCurCharacInvenW = nf(addr.cusercharacinfo_get_cur_charac_inven_w, 'pointer', ['pointer']);
  const _GetCharacJob = nf(addr.cusercharacinfo_get_charac_job, 'int', ['pointer']);
  const _GetCurCharacGrowType = nf(addr.cusercharacinfo_get_cur_charac_grow_type, 'int', ['pointer']);
  const _GetCharacGuildkey = nf(addr.cusercharacinfo_get_charac_guildkey, 'int', ['pointer']);
  const _GetGuildName = nf(addr.cuser_get_guild_name, 'pointer', ['pointer']);
  const _GetLoginTick = nf(addr.cusercharacinfo_get_login_tick, 'int', ['pointer']);
  const _GetParty = nf(addr.cuser_get_party, 'pointer', ['pointer']);
  const _GetCharacExpandData = nf(addr.cuser_get_charac_expand_data, 'pointer', ['pointer', 'int']);
  const _GetCera = nf(addr.cuser_get_cera, 'int', ['pointer']);
  const _GetCurCharacQuestW = nf(addr.cuser_get_cur_charac_quest_w, 'pointer', ['pointer']);
  const _CheckItemLock = nf(addr.cuser_check_item_lock, 'int', ['pointer', 'int', 'int']);
  const _Send = nf(addr.cuser_send, 'int', ['pointer', 'pointer']);
  const _SendNotiPacketMessage = nf(addr.cuser_send_noti_packet_message, 'int', ['pointer', 'pointer', 'int']);
  const _SendUpdateItemList = nf(addr.cuser_send_update_item_list, 'int', ['pointer', 'int', 'int', 'int']);
  const _SendClearQuestList = nf(addr.cuser_send_clear_quest_list, 'int', ['pointer']);
  const _QuestAction = nf(addr.cuser_quest_action, 'int', ['pointer', 'int', 'int', 'int', 'int']);
  const _SetGmQuestFlag = nf(addr.cuser_set_gm_quest_flag, 'int', ['pointer', 'int']);
  const _GainExpSp = nf(addr.cuser_gain_exp_sp, 'int', ['pointer', 'int', 'pointer', 'pointer', 'int', 'int', 'int']);
  const _SendNotiPacket = nf(addr.cuser_send_noti_packet, 'int', ['pointer', 'int', 'int', 'int']);
  const _GetServerGroup = nf(addr.cuser_get_server_group, 'int', ['pointer']);
  const _GetCurVAttackCount = nf(addr.cuser_get_cur_vattack_count, 'int', ['pointer']);
  const _EnableSaveCharacStat = nf(addr.cusercharacinfo_enable_save_charac_stat, 'int', ['pointer']);

  // 获取角色状态
  // 返回：0=未登录, 1=创建角色, 2=选择角色, 3=已进入游戏
  function getState(user) {
    return _GetState(user);
  }

  // 获取账号 ID
  function getAccId(user) {
    return _GetAccId(user);
  }

  // 获取当前角色 ID (charac_no)
  function getCurCharacNo(user) {
    return _GetCurCharacNo(user);
  }

  // 获取角色等级
  function getCharacLevel(user) {
    return _GetCharacLevel(user);
  }

  // 获取角色名字
  function getCurCharacName(user) {
    const p = _GetCurCharacName(user);
    if (p.isNull()) {
      return '';
    }
    return p.readUtf8String(-1);
  }

  // 获取当前等级升级所需经验
  function getLevelUpExp(user, level) {
    return _GetLevelUpExp(user, level);
  }

  // 获取角色背包指针
  function getCurCharacInvenW(user) {
    return _GetCurCharacInvenW(user);
  }

  // 获取角色职业
  function getCharacJob(user) {
    return _GetCharacJob(user);
  }

  // 获取 PVP 段位
  function getCurCharacGrowType(user) {
    return _GetCurCharacGrowType(user);
  }

  // 获取角色公会 ID
  function getCharacGuildkey(user) {
    return _GetCharacGuildkey(user);
  }

  // 获取角色公会名称
  function getGuildName(user) {
    const p = _GetGuildName(user);
    if (p.isNull()) {
      return '';
    }
    return p.readUtf8String(-1);
  }

  // 获取本次登录时间
  function getLoginTick(user) {
    return _GetLoginTick(user);
  }

  // 获取角色所在队伍
  function getParty(user) {
    return _GetParty(user);
  }

  // 获取角色扩展数据
  function getCharacExpandData(user, expandType) {
    return _GetCharacExpandData(user, expandType);
  }

  // 获取角色点券余额
  function getCera(user) {
    return _GetCera(user);
  }

  // 获取角色任务信息
  function getCurCharacQuestW(user) {
    return _GetCurCharacQuestW(user);
  }

  // 检查道具是否被锁定
  function checkItemLock(user, invenType, slot) {
    return _CheckItemLock(user, invenType, slot);
  }

  // 发包给客户端
  function send(user, packetGuard) {
    return _Send(user, packetGuard);
  }

  // 给角色发消息
  function sendNotiPacketMessage(user, msg, msgType) {
    const p = Memory.allocUtf8String(msg);
    _SendNotiPacketMessage(user, p, msgType);
  }

  // 通知客户端道具更新
  function sendUpdateItemList(user, notifyType, itemSpace, slot) {
    return _SendUpdateItemList(user, notifyType, itemSpace, slot);
  }

  // 通知客户端更新已完成任务列表
  function sendClearQuestList(user) {
    return _SendClearQuestList(user);
  }

  // 任务操作
  // action: 33=接受任务, 34=放弃任务, 35=任务完成条件已满足, 36=提交任务领取奖励
  function questAction(user, action, questId, arg3, arg4) {
    return _QuestAction(user, action, questId, arg3, arg4);
  }

  // 设置 GM 完成任务模式（无条件完成任务）
  function setGmQuestFlag(user, flag) {
    return _SetGmQuestFlag(user, flag);
  }

  // 给角色增加经验
  function gainExpSp(user, exp) {
    const a2 = Memory.alloc(4);
    const a3 = Memory.alloc(4);
    return _GainExpSp(user, exp, a2, a3, 0, 0, 0);
  }

  // 通知客户端更新角色身上装备
  function sendNotiPacket(user, notifyType, arg2, arg3) {
    return _SendNotiPacket(user, notifyType, arg2, arg3);
  }

  // 获取角色服务器组编号
  function getServerGroup(user) {
    return _GetServerGroup(user);
  }

  // 获取角色本次怪物攻城挑战次数
  function getCurVAttackCount(user) {
    return _GetCurVAttackCount(user);
  }

  // 设置角色属性改变脏标记
  // 为什么需要：角色上线时属性从 DB 缓存到内存，只有设置了脏标记，
  // 下线时才能正确存档到数据库，否则变动的属性下线后可能回档
  function enableSaveCharacStat(user) {
    return _EnableSaveCharacStat(user);
  }

  return {
    getState: getState,
    getAccId: getAccId,
    getCurCharacNo: getCurCharacNo,
    getCharacLevel: getCharacLevel,
    getCurCharacName: getCurCharacName,
    getLevelUpExp: getLevelUpExp,
    getCurCharacInvenW: getCurCharacInvenW,
    getCharacJob: getCharacJob,
    getCurCharacGrowType: getCurCharacGrowType,
    getCharacGuildkey: getCharacGuildkey,
    getGuildName: getGuildName,
    getLoginTick: getLoginTick,
    getParty: getParty,
    getCharacExpandData: getCharacExpandData,
    getCera: getCera,
    getCurCharacQuestW: getCurCharacQuestW,
    checkItemLock: checkItemLock,
    send: send,
    sendNotiPacketMessage: sendNotiPacketMessage,
    sendUpdateItemList: sendUpdateItemList,
    sendClearQuestList: sendClearQuestList,
    questAction: questAction,
    setGmQuestFlag: setGmQuestFlag,
    gainExpSp: gainExpSp,
    sendNotiPacket: sendNotiPacket,
    getServerGroup: getServerGroup,
    getCurVAttackCount: getCurVAttackCount,
    enableSaveCharacStat: enableSaveCharacStat,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createUserBinding = createUserBinding;
}
// 背包/道具 binding
// 来源：从旧 frida.js CInventory*/Inven_Item* 系列函数迁移
// 用途：封装背包操作、道具查询等
//
// 风险：直接操作玩家背包，错误操作可能导致道具丢失

function createInventoryBinding(addr) {
  const _GetInvenRef = nf(addr.cinventory_get_inven_ref, 'pointer', ['pointer', 'int', 'int']);
  const _IsEquipable = nf(addr.inven_item_is_equipable_item_type, 'int', ['pointer']);
  const _IsEmpty = nf(addr.inven_item_is_empty, 'int', ['pointer']);
  const _GetKey = nf(addr.inven_item_get_key, 'int', ['pointer']);
  const _GetAddInfo = nf(addr.inven_item_get_add_info, 'int', ['pointer']);
  const _InvenItemConstructor = nf(addr.inven_item_constructor, 'pointer', ['pointer']);
  const _Reset = nf(addr.inven_item_reset, 'int', ['pointer']);
  const _UseMoney = nf(addr.cinventory_use_money, 'int', ['pointer', 'int', 'int', 'int']);
  const _DeleteItem = nf(addr.cinventory_delete_item, 'int', ['pointer', 'int', 'int', 'int', 'int', 'int']);
  const _GetMoney = nf(addr.cinventory_get_money, 'int', ['pointer']);
  const _GetAvatarItemMgrR = nf(addr.cinventory_get_avatar_item_mgr_r, 'pointer', ['pointer']);

  // 背包类型常量（来源：从旧 frida.js 迁移）
  const TYPE_BODY = 0;   // 身上穿的装备
  const TYPE_ITEM = 1;   // 物品栏
  const TYPE_AVARTAR = 2; // 时装栏

  // 获取背包指定槽位的道具
  function getInvenRef(inven, invenType, slot) {
    return _GetInvenRef(inven, invenType, slot);
  }

  // 判断道具是否为装备类型
  function isEquipableItemType(item) {
    return _IsEquipable(item);
  }

  // 检查背包中道具槽是否为空
  function isItemEmpty(item) {
    return _IsEmpty(item);
  }

  // 获取道具 item_id
  function getItemKey(item) {
    return _GetKey(item);
  }

  // 获取道具附加信息（时装插槽相关）
  function getAddInfo(item) {
    return _GetAddInfo(item);
  }

  // 初始化/清空背包道具
  function initItem(itemPtr) {
    _InvenItemConstructor(itemPtr);
  }

  // 删除背包槽中的道具（重置为空）
  // 风险：直接删除玩家道具，误用会导致道具丢失
  function resetItem(item) {
    return _Reset(item);
  }

  // 扣除角色金币
  // 风险：直接操作角色金币，误扣无法恢复
  function useMoney(inven, amount, arg2, arg3) {
    return _UseMoney(inven, amount, arg2, arg3);
  }

  // 从背包中删除道具
  // invenType: 背包类型, slot: 槽位, count: 数量, reason: 删除原因, log: 是否记录日志
  // 风险：直接删除玩家道具，误删会导致道具丢失
  function deleteItem(inven, invenType, slot, count, reason, log) {
    return _DeleteItem(inven, invenType, slot, count, reason, log);
  }

  // 获取角色当前持有金币数量
  function getMoney(inven) {
    return _GetMoney(inven);
  }

  // 获取时装管理器
  function getAvatarItemMgrR(inven) {
    return _GetAvatarItemMgrR(inven);
  }

  return {
    TYPE_BODY: TYPE_BODY,
    TYPE_ITEM: TYPE_ITEM,
    TYPE_AVARTAR: TYPE_AVARTAR,
    getInvenRef: getInvenRef,
    isEquipableItemType: isEquipableItemType,
    isItemEmpty: isItemEmpty,
    getItemKey: getItemKey,
    getAddInfo: getAddInfo,
    initItem: initItem,
    resetItem: resetItem,
    useMoney: useMoney,
    deleteItem: deleteItem,
    getMoney: getMoney,
    getAvatarItemMgrR: getAvatarItemMgrR,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createInventoryBinding = createInventoryBinding;
}
// 道具/装备数据 binding
// 来源：从旧 frida.js CItem* / CStackableItem* 系列函数迁移
// 用途：封装道具属性查询、PVF 数据查询等

function createItemBinding(addr) {
  const _GetRarity = nf(addr.citem_get_rarity, 'int', ['pointer']);
  const _GetUsableLevel = nf(addr.citem_get_usable_level, 'int', ['pointer']);
  const _GetItemGroupName = nf(addr.citem_get_item_group_name, 'int', ['pointer']);
  const _IsStackable = nf(addr.citem_is_stackable, 'int', ['pointer']);
  const _GetItemIndex = nf(addr.getitem_index, 'int', ['pointer']);
  const _GetStackableItemType = nf(addr.cstackableitem_get_item_type, 'int', ['pointer']);
  const _GetJewelTargetSocket = nf(addr.cstackableitem_get_jewel_target_socket, 'int', ['pointer']);

  // PVF 数据查询
  const _G_CDataManager = nf(addr.g_cdata_manager, 'pointer', []);
  const _FindItem = nf(addr.cdata_manager_find_item, 'pointer', ['pointer', 'int']);
  const _FindQuest = nf(addr.cdata_manager_find_quest, 'pointer', ['pointer', 'int']);

  // 获取装备品级
  function getRarity(item) {
    return _GetRarity(item);
  }

  // 获取装备可穿戴等级
  function getUsableLevel(item) {
    return _GetUsableLevel(item);
  }

  // 获取装备组名称
  function getItemGroupName(item) {
    return _GetItemGroupName(item);
  }

  // 判断道具是否为可堆叠（消耗品）类型
  function isStackable(item) {
    return _IsStackable(item);
  }

  // 从道具 PVF 数据中获取 item_id
  function getIndex(item) {
    return _GetItemIndex(item);
  }

  // 从 PVF 数据中查询道具
  function findItem(itemId) {
    return _FindItem(_G_CDataManager(), itemId);
  }

  // 从 PVF 数据中查询任务
  function findQuest(questId) {
    return _FindQuest(_G_CDataManager(), questId);
  }

  // 获取消耗品类型（20 = 徽章）
  function getStackableItemType(item) {
    return _GetStackableItemType(item);
  }

  // 获取徽章支持的镶嵌槽类型
  // 红=0x1, 黄=0x2, 绿=0x4, 蓝=0x8, 白金=0x10
  function getJewelTargetSocket(item) {
    return _GetJewelTargetSocket(item);
  }

  return {
    getRarity: getRarity,
    getUsableLevel: getUsableLevel,
    getItemGroupName: getItemGroupName,
    isStackable: isStackable,
    getIndex: getIndex,
    findItem: findItem,
    findQuest: findQuest,
    getStackableItemType: getStackableItemType,
    getJewelTargetSocket: getJewelTargetSocket,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createItemBinding = createItemBinding;
}
// 邮件系统 binding
// 来源：从旧 frida.js CMailBoxHelper*/ReqDBSendNewSystemMail* 系列函数迁移
// 用途：封装系统邮件发送操作（多道具、时装、单道具）
//
// 风险：邮件发送会写入数据库，发送前务必确认目标角色存在且在线

function createMailBinding(addr) {
  const _MakeMultiMailPostal = nf(addr.cmailboxhelper_make_system_multi_mail_postal, 'int', ['pointer', 'pointer', 'int']);
  const _SendMultiMail = nf(addr.cmailboxhelper_req_db_send_new_system_multi_mail, 'int', ['pointer', 'pointer', 'int', 'int', 'int', 'pointer', 'int', 'int', 'int', 'int']);
  const _SendAvatarMail = nf(addr.cmailboxhelper_req_db_send_new_avatar_mail, 'pointer', ['pointer', 'int', 'int', 'int', 'int', 'int', 'int', 'pointer', 'int']);
  const _SendSingleMail = nf(addr.req_db_send_new_system_mail, 'int', ['pointer', 'pointer', 'int', 'int', 'pointer', 'int', 'int', 'int', 'char', 'char']);

  // Vector 操作（用于邮件附件列表）
  const _VectorConstructor = nf(addr.std_vector_pair_int_int_constructor, 'pointer', ['pointer']);
  const _VectorClear = nf(addr.std_vector_pair_int_int_clear, 'pointer', ['pointer']);
  const _MakePair = nf(addr.std_make_pair_int_int, 'pointer', ['pointer', 'pointer', 'pointer']);
  const _VectorPushBack = nf(addr.std_vector_pair_int_int_push_back, 'pointer', ['pointer', 'pointer']);

  // 道具构造（用于邮件附件）
  const _InvenItemConstructor = nf(addr.inven_item_constructor, 'pointer', ['pointer']);
  const _GetItemIndex = nf(addr.getitem_index, 'int', ['pointer']);

  // 获取 strlen
  const _strlen = nf(addr.strlen, 'int', ['pointer']);

  // 发送多道具系统邮件
  // targetCharacNo: 目标角色 charac_no
  // title: 邮件标题
  // text: 邮件正文
  // gold: 金币数量
  // itemList: 道具列表 [[item_id, count], ...]
  function sendMultiMail(targetCharacNo, title, text, gold, itemList) {
    // 构造道具附件 vector
    const vector = Memory.alloc(100);
    _VectorConstructor(vector);
    _VectorClear(vector);

    for (var i = 0; i < itemList.length; ++i) {
      const itemId = Memory.alloc(4);
      const itemCnt = Memory.alloc(4);
      itemId.writeInt(itemList[i][0]);
      itemCnt.writeInt(itemList[i][1]);
      const pair = Memory.alloc(100);
      _MakePair(pair, itemId, itemCnt);
      _VectorPushBack(vector, pair);
    }

    // 邮件支持 10 个道具附件格子
    const additionSlots = Memory.alloc(1000);
    for (var i = 0; i < 10; ++i) {
      _InvenItemConstructor(additionSlots.add(i * 61));
    }
    _MakeMultiMailPostal(vector, additionSlots, 10);

    const titlePtr = Memory.allocUtf8String(title);
    const textPtr = Memory.allocUtf8String(text);
    const textLen = _strlen(textPtr);

    _SendMultiMail(titlePtr, additionSlots, itemList.length, gold, targetCharacNo, textPtr, textLen, 0, 99, 1);
  }

  // 发送单道具系统邮件（怪物攻城奖励用）
  // itemType + itemId 需要从 PVF 解析的道具对象构建
  function sendSingleMail(itemPtr, titlePtr, gold, userId, textPtr, textLen, mailDate, serverGroup) {
    return _SendSingleMail(titlePtr, itemPtr, gold, userId, textPtr, textLen, mailDate, serverGroup, 0, 0);
  }

  return {
    sendMultiMail: sendMultiMail,
    sendSingleMail: sendSingleMail,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createMailBinding = createMailBinding;
}
// GameWorld 操作 binding
// 来源：从旧 frida.js G_GameWorld / GameWorld_* 系列函数迁移
// 用途：封装游戏世界操作（全服广播、玩家遍历、查找玩家等）
//
// 风险：
// 1. send_all 是广播类接口，必须限制调用频率，防止 CC 攻击
// 2. 除非必须使用广播，否则建议用 CParty::send_to_party 或 GameWorld::send_to_area

function createGameWorldBinding(addr) {
  const _G_GameWorld = nf(addr.g_gameworld, 'pointer', []);
  const _SendAll = nf(addr.gameworld_send_all, 'int', ['pointer', 'pointer']);
  const _SendAllWithState = nf(addr.gameworld_send_all_with_state, 'int', ['pointer', 'pointer', 'int']);
  const _GetUserCountInWorld = nf(addr.gameworld_get_user_count_in_world, 'int', ['pointer']);
  const _FindUserFromWorldByAccid = nf(addr.gameworld_find_user_from_world_byaccid, 'pointer', ['pointer', 'int']);

  // 世界广播消息（底层实现）
  // 来源：从旧 frida.js api_GameWorld_SendNotiPacketMessage 迁移
  //
  // 为什么在 gw binding 中提供：
  // notify.js 和 settlement.js 都需要世界广播能力，集中在此处
  // 风险：广播类接口必须限制调用频率，防止刷屏
  const _PacketGuardConstructor = nf(addr.packetguard_constructor, 'int', ['pointer']);
  const _PutHeader = nf(addr.interfacepacketbuf_put_header, 'int', ['pointer', 'int', 'int']);
  const _PutByte = nf(addr.interfacepacketbuf_put_byte, 'int', ['pointer', 'uint8']);
  const _PutShort = nf(addr.interfacepacketbuf_put_short, 'int', ['pointer', 'uint16']);
  const _PutInt = nf(addr.interfacepacketbuf_put_int, 'int', ['pointer', 'int']);
  const _PutBinary = nf(addr.interfacepacketbuf_put_binary, 'int', ['pointer', 'pointer', 'int']);
  const _Finalize = nf(addr.interfacepacketbuf_finalize, 'int', ['pointer', 'int']);
  const _DestroyPacketGuard = nf(addr.destroy_packetguard, 'int', ['pointer']);
  const _Strlen = nf(addr.strlen, 'int', ['pointer']);

  // 在线玩家遍历（底层 std::map 迭代器）
  const _MapBegin = nf(addr.gameworld_user_map_begin, 'int', ['pointer', 'pointer']);
  const _MapEnd = nf(addr.gameworld_user_map_end, 'int', ['pointer', 'pointer']);
  const _MapNotEqual = nf(addr.gameworld_user_map_not_equal, 'bool', ['pointer', 'pointer']);
  const _MapGet = nf(addr.gameworld_user_map_get, 'pointer', ['pointer']);
  const _MapNext = nf(addr.gameworld_user_map_next, 'pointer', ['pointer', 'pointer']);

  // 获取 CUser 状态（用于遍历时筛选已登录角色）
  const _GetState = nf(addr.cuser_get_state, 'int', ['pointer']);

  // 获取 GameWorld 单例
  function getGameWorld() {
    return _G_GameWorld();
  }

  // 向所有在线玩家发包
  // 风险：广播类接口，必须限制调用频率
  function sendAll(gameWorld, packetGuard) {
    return _SendAll(gameWorld, packetGuard);
  }

  // 向指定状态以上的在线玩家发包
  function sendAllWithState(gameWorld, packetGuard, state) {
    return _SendAllWithState(gameWorld, packetGuard, state);
  }

  // 获取在线玩家数量
  function getUserCountInWorld(gameWorld) {
    return _GetUserCountInWorld(gameWorld);
  }

  // 根据账号 ID 查找已登录角色
  function findUserFromWorldByAccid(gameWorld, accountId) {
    return _FindUserFromWorldByAccid(gameWorld, accountId);
  }

  // ---- 世界广播消息 ----
  // 来源：从旧 frida.js api_GameWorld_SendNotiPacketMessage 迁移
  // msg: 消息字符串
  // msgType: 消息类型（14=系统公告）
  function sendNotiPacketMessage(msg, msgType) {
    const packetGuard = Memory.alloc(0x20000);
    _PacketGuardConstructor(packetGuard);

    _PutHeader(packetGuard, 0, 12);
    _PutByte(packetGuard, msgType);
    _PutShort(packetGuard, 0);
    _PutByte(packetGuard, 0);

    // 写入字符串（协议格式：4字节长度 + 内容）
    const p = Memory.allocUtf8String(msg);
    const len = _Strlen(p);
    _PutInt(packetGuard, len);
    _PutBinary(packetGuard, p, len);

    _Finalize(packetGuard, 1);
    _SendAllWithState(_G_GameWorld(), packetGuard, 3); // 只给 state >= 3 的玩家发公告
    _DestroyPacketGuard(packetGuard);
  }

  // ---- 在线玩家遍历 ----

  // 获取在线玩家列表遍历起始迭代器
  function mapBegin() {
    const begin = Memory.alloc(4);
    _MapBegin(begin, _G_GameWorld().add(308));
    return begin;
  }

  // 获取在线玩家列表遍历结束迭代器
  function mapEnd() {
    const end = Memory.alloc(4);
    _MapEnd(end, _G_GameWorld().add(308));
    return end;
  }

  // 获取当前迭代器指向的玩家
  function mapGet(it) {
    return _MapGet(it).add(4).readPointer();
  }

  // 判断迭代器是否未到末尾
  function mapNotEqual(a, b) {
    return _MapNotEqual(a, b);
  }

  // 迭代器前进（返回新的迭代器）
  // 为什么必须用返回值更新 it：
  // 如果底层 mapNext 不是原地修改（即返回新迭代器），
  // 忽略返回值会导致死循环
  function mapNext(it) {
    const next = Memory.alloc(4);
    _MapNext(next, it);
    return next;
  }

  // 遍历所有在线玩家并执行回调
  // 为什么需要这个函数：多个模块需要遍历在线玩家（怪物攻城发奖、世界广播等）
  // f: 回调函数，参数为 (user, args)
  // args: 传给回调的额外参数
  //
  // 为什么有 guardCount 保护：
  // 如果迭代器逻辑异常或在线玩家数异常增长，避免无限循环
  function forEachUser(f, args) {
    var it = mapBegin();
    const end = mapEnd();
    var guardCount = 0;
    const maxCount = 10000;

    while (mapNotEqual(it, end) && guardCount < maxCount) {
      guardCount++;
      const user = mapGet(it);

      // 只处理已登录角色 (state >= 3)
      if (_GetState(user) >= 3) {
        f(user, args);
      }
      // 必须更新迭代器，否则可能死循环
      it = mapNext(it);
    }

    if (guardCount >= maxCount) {
      console.log('[game_world] forEachUser 因 guardCount 上限停止, 遍历了 ' + guardCount + ' 个在线玩家');
    }
  }

  return {
    getGameWorld: getGameWorld,
    sendAll: sendAll,
    sendAllWithState: sendAllWithState,
    getUserCountInWorld: getUserCountInWorld,
    findUserFromWorldByAccid: findUserFromWorldByAccid,
    sendNotiPacketMessage: sendNotiPacketMessage,
    forEachUser: forEachUser,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createGameWorldBinding = createGameWorldBinding;
}
// 定时器调度 binding
// 来源：从旧 frida.js timer_dispatcher_list + do_timer_dispatch 迁移
// 用途：在 dispatcher 线程安全地执行任务
//
// 为什么需要线程安全：
// 1. 游戏服务器是多线程的，dispatcher 线程是主逻辑线程
// 2. Frida JS 回调可能在非 dispatcher 线程触发
// 3. 直接操作游戏数据（如数据库、角色属性）会破坏线程安全
// 4. 所有可能修改游戏数据的操作都必须调度到 dispatcher 线程执行
// 5. 热重载时 dispatcher 线程中的任务队列会被清空

function createTimerDispatcherBinding(addr) {
  const _GuardMutex = nf(addr.guard_mutex_guard, 'int', ['pointer', 'pointer']);
  const _DestroyGuardMutex = nf(addr.destroy_guard_mutex_guard, 'int', ['pointer']);
  const _G_TimerQueue = nf(addr.g_timer_queue, 'pointer', []);

  // 需要在 dispatcher 线程执行的任务队列
  // 热加载后会被清空
  const taskList = [];

  // 获取线程锁
  // 风险：申请后必须手动释放，否则会导致死锁
  function lock() {
    const a1 = Memory.alloc(100);
    _GuardMutex(a1, _G_TimerQueue().add(16));
    return a1;
  }

  // 释放线程锁
  function unlock(guard) {
    _DestroyGuardMutex(guard);
  }

  // 在 dispatcher 线程执行任务
  // f: 回调函数
  // args: 传给 f 的参数数组（如果 f 无参数可为 null）
  function schedule(f, args) {
    const guard = lock();
    taskList.push([f, args]);
    unlock(guard);
  }

  // 设置定时器，到期后在 dispatcher 线程执行
  // delay: 延迟毫秒数
  function scheduleDelay(f, args, delay) {
    setTimeout(schedule, delay, f, args);
  }

  // 处理到期的任务队列
  // 此函数在 TimerDispatcher::dispatch 的 onLeave 中调用
  function dispatch() {
    const activeList = [];

    const guard = lock();
    while (taskList.length > 0) {
      var task = taskList.shift();
      activeList.push(task);
    }
    unlock(guard);

    for (var i = 0; i < activeList.length; ++i) {
      var task = activeList[i];
      const f = task[0];
      const args = task[1];
      f.apply(null, args);
    }
  }

  return {
    schedule: schedule,
    scheduleDelay: scheduleDelay,
    dispatch: dispatch,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createTimerDispatcherBinding = createTimerDispatcherBinding;
}
// 任务系统 binding
// 来源：从旧 frida.js quest 相关函数迁移
// 用途：封装任务完成、提交奖励等操作
//
// 风险：直接操作任务状态和奖励领取，错误使用可能导致任务卡死或重复领奖

function createQuestBinding(addr) {
  const _IsClearedQuest = nf(addr.cquestclear_is_cleared_quest, 'int', ['pointer', 'int']);
  const _GetUserQuestInfo = nf(addr.userquest_get_quest_info, 'int', ['pointer', 'pointer']);

  // 检查任务是否已完成
  function isClearedQuest(questClear, questId) {
    return _IsClearedQuest(questClear, questId);
  }

  // 获取用户任务信息并组包发给客户端
  function getUserQuestInfo(userQuest, packetGuard) {
    return _GetUserQuestInfo(userQuest, packetGuard);
  }

  // 无条件完成指定任务并领取奖励
  // 为什么需要这样做：
  // 1. 需要设置 GM 任务模式绕过材料检查
  // 2. 服务端有反作弊机制：任务完成时间间隔不能小于 1 秒，
  //    需要清零上次完成时间才能连续提交
  // 3. 完成后需要关闭 GM 模式避免影响后续正常任务
  //
  // user: CUser 指针
  // questId: 任务 ID
  // userBinding: createUserBinding 返回的对象
  function forceClearQuest(user, questId, userBinding) {
    // 设置 GM 完成任务模式（无条件完成任务）
    userBinding.setGmQuestFlag(user, 1);
    // 接受任务
    userBinding.questAction(user, 33, questId, 0, 0);
    // 完成任务
    userBinding.questAction(user, 35, questId, 0, 0);
    // 领取任务奖励
    // 倒数第二个参数表示领取奖励的编号:
    //   -1=领取不需要选择的奖励, 0=领取可选奖励中的第1个, 1=领取可选奖励中的第2个
    userBinding.questAction(user, 36, questId, -1, 1);

    // 反作弊：将上次任务完成时间清零，允许连续提交任务
    // 偏移 0x79644 来源于游戏逆向分析，记录上次任务完成时间戳
    user.add(0x79644).writeInt(0);

    // 关闭 GM 完成任务模式
    userBinding.setGmQuestFlag(user, 0);
  }

  return {
    isClearedQuest: isClearedQuest,
    getUserQuestInfo: getUserQuestInfo,
    forceClearQuest: forceClearQuest,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createQuestBinding = createQuestBinding;
}
// 绝望之塔修复模块
// 来源：从旧 frida.js fix_TOD(skip_user_apc) 迁移
// 用途：修复绝望之塔的门票、金币、每10层跳过用户APC
//
// 包含以下修复：
// 1. 挑战成功后可以继续使用门票（不再需要重新购买）
// 2. 可选跳过每10层的 UserAPC（当 skip_user_apc=true 时）
// 3. 绝望之塔不再扣除金币

var g_tod_fix_started = false;

function startTodFixFeature(ctx) {
  if (g_tod_fix_started) {
    console.log('[tod_fix] already started');
    return;
  }

  const addr = ctx.addresses;
  const cfg = ctx.config.tod_fix;

  try {
    // ---- 修复1：挑战成功后可以继续使用门票 ----
    // 来源：从旧 frida.js fix_TOD 第一个 hook 迁移
    // 原函数：TOD_UserState 相关逻辑
    // 为什么需要：原版成功挑战后门票被消耗，需要重新购买
    // Hook 点：onLeave 替换返回值为 0，表示门票未消耗
    // 风险：如果门票消耗逻辑变更，此修复可能失效
    attachOnce('tod_ticket_check', addr.tod_ticket_check, {
      onEnter: function (args) {
        // 不需要修改参数
      },
      onLeave: function (retval) {
        retval.replace(0);
      }
    });

    // ---- 修复2：跳过每10层的 UserAPC ----
    // 来源：从旧 frida.js fix_TOD skip_user_apc hook 迁移
    // 原函数：TOD_UserState::getTodayEnterLayer
    // 为什么需要：每10层（10/20/.../90）需要挑战玩家 APC，
    //   但服务器内角色不足时无法生成 APC 导致卡关
    // 实现：检测到当前层数为 10 的倍数时，直接跳到下一层
    // 风险：跳过 UserAPC 可能影响一些与层数相关的任务
    if (cfg.skip_user_apc) {
      attachOnce('tod_skip_user_apc', addr.tod_get_today_enter_layer, {
        onEnter: function (args) {
          // 绝望之塔当前层数（偏移 0x14 来源：游戏逆向分析）
          const todayEnterLayer = args[1].add(0x14).readShort();

          // 当下层是 10 的倍数（即 9, 19, 29, ... 99-1=98, 但最后一层=99 需要处理）
          if (((todayEnterLayer % 10) == 9) && (todayEnterLayer > 0) && (todayEnterLayer < 99)) {
            // 直接进入下一层，跳过 UserAPC
            args[1].add(0x14).writeShort(todayEnterLayer + 1);
          }
        },
        onLeave: function (retval) {
          // 不需要修改返回值
        }
      });
    }

    // ---- 修复3：绝望之塔不扣除金币 ----
    // 来源：从旧 frida.js fix_TOD CParty_UseAncientDungeonItems replace 迁移
    // 原函数：CParty::UseAncientDungeonItems
    // 为什么需要 replace（而不是 attach）：
    //   需要完全替换道具消耗逻辑，对绝望之塔直接返回成功
    // 为什么安全：
    //   只在副本 ID 是绝望之塔（11008-11107）时跳过，
    //   其他副本仍然执行原始逻辑
    // 风险：如果绝望之塔副本 ID 范围变更，需要更新判断条件
    const CDungeonGetIndex = nf(addr.cdungeon_get_index, 'int', ['pointer']);
    const originalUseAncientDungeonItems = nf(
      addr.cparty_use_ancient_dungeon_items,
      'int',
      ['pointer', 'pointer', 'pointer', 'pointer']
    );

    replaceOnce('tod_no_gold', addr.cparty_use_ancient_dungeon_items, function (party, dungeon, invenItem, a4) {
      // 当前进入的地下城 ID
      const dungeonIndex = CDungeonGetIndex(dungeon);
      // 根据地下城 ID 判断是否为绝望之塔（范围 11008-11107）
      if ((dungeonIndex >= 11008) && (dungeonIndex <= 11107)) {
        // 绝望之塔 不再扣除金币
        return 1;
      }
      // 其他副本执行原始扣除道具逻辑
      return originalUseAncientDungeonItems(party, dungeon, invenItem, a4);
    }, 'int', ['pointer', 'pointer', 'pointer', 'pointer']);

    g_tod_fix_started = true;
    if (ctx.log) ctx.log('[tod_fix] started');
  } catch (err) {
    if (ctx.log) ctx.log('[tod_fix] failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.startTodFixFeature = startTodFixFeature;
}
// 时装徽章镶嵌修复模块
// 来源：从旧 frida.js fix_use_emblem() 迁移
// 用途：处理时装徽章镶嵌请求，替代游戏原有的（已失效的）镶嵌流程
//
// 为什么需要这个模块：
// 1. 原游戏的时装镶嵌功能可能有 bug 或已损坏
// 2. Frida 可以拦截镶嵌请求包，自行实现完整的镶嵌流程
//
// 处理流程：
// 1. 解析客户端封包（时装位置、item_id、徽章列表）
// 2. 校验角色状态（必须在游戏中）
// 3. 校验时装道具（存在、未被锁定）
// 4. 校验每个徽章（存在、类型正确、插槽颜色匹配）
// 5. 写入插槽数据
// 6. 删除消耗的徽章
// 7. 时装数据存盘
// 8. 通知客户端更新

var g_emblem_fix_started = false;

function startEmblemFixFeature(ctx) {
  if (g_emblem_fix_started) {
    console.log('[emblem_fix] already started');
    return;
  }

  const addr = ctx.addresses;
  const packet = ctx.packet;
  const user = ctx.user;
  const inventory = ctx.inventory;
  const item = ctx.item;

  // ---- 辅助函数：获取时装数据库 UI ID ----
  // 来源：从旧 frida.js api_get_avartar_ui_id 迁移
  function getAvatarUiId(avartar) {
    return avartar.add(7).readInt();
  }

  // ---- 辅助函数：设置时装插槽数据 ----
  // 来源：从旧 frida.js api_set_JewelSocketData 迁移
  // jewelSocketData: 时装插槽数据指针
  // slot: 插槽索引 (0-2)
  // emblemItemId: 要镶嵌的徽章 item_id
  // jewel_type: 红=0x1, 黄=0x2, 绿=0x4, 蓝=0x8, 白金=0x10
  function setJewelSocketData(jewelSocketData, slot, emblemItemId) {
    if (!jewelSocketData.isNull()) {
      // 每个槽数据长 6 字节: 2 字节槽类型 + 4 字节徽章 item_id
      // 镶嵌不改变槽类型，只修改徽章 id
      jewelSocketData.add(slot * 6 + 2).writeInt(emblemItemId);
    }
  }

  // ---- 时装插槽数据存盘 ----
  // 来源：从旧 frida.js DB_UpdateAvatarJewelSlot_makeRequest 迁移
  const _UpdateAvatarJewelSlot = nf(addr.db_update_avatar_jewel_slot_make_request, 'pointer', ['int', 'int', 'pointer']);

  function saveJewelSlotData(characNo, avatarUiId, jewelSocketData) {
    _UpdateAvatarJewelSlot(characNo, avatarUiId, jewelSocketData);
  }

  // ---- 主 Hook：拦截镶嵌请求 ----
  // 来源：从旧 frida.js fix_use_emblem 迁移
  // 原函数：Dispatcher_UseJewel::dispatch_sig
  // 为什么是这个地址：此函数处理客户端发来的时装镶嵌请求
  // 风险：封包解析错误可能导致客户端异常或角色数据异常
  // 为什么 onLeave 替换返回值为 0：原函数返回非 0 会让客户端断线
  attachOnce('emblem_fix_dispatch', addr.use_jewel_dispatch, {
    onEnter: function (args) {
      try {
        const curUser = args[1];
        const packetBuf = args[2];

        // 步骤1：校验角色状态是否允许镶嵌
        // 只在玩家已进入游戏（state == 3）时处理
        const state = user.getState(curUser);
        if (state != 3) {
          return;
        }

        // 步骤2：解析客户端封包
        // 封包格式（来源：协议逆向分析）：
        //   short: 时装所在的背包槽
        //   int: 时装 item_id
        //   byte: 本次镶嵌徽章数量
        //   对每个徽章: short(背包槽) + int(item_id) + byte(目标插槽)

        // 时装所在的背包槽
        const avartarInvenSlot = packet.getShort(packetBuf);
        // 时装 item_id
        const avartarItemId = packet.getInt(packetBuf);
        // 本次镶嵌徽章数量
        const emblemCnt = packet.getByte(packetBuf);

        // 步骤3：获取并校验时装道具
        const inven = user.getCurCharacInvenW(curUser);
        const avartar = inventory.getInvenRef(inven, inventory.TYPE_AVARTAR, avartarInvenSlot);

        // 时装必须存在、ID 匹配、未被锁定
        if (inventory.isItemEmpty(avartar) ||
            inventory.getItemKey(avartar) != avartarItemId ||
            user.checkItemLock(curUser, 2, avartarInvenSlot)) {
          return;
        }

        // 步骤4：获取时装插槽数据
        const avartarAddInfo = inventory.getAddInfo(avartar);
        const invenAvartarMgr = inventory.getAvatarItemMgrR(inven);

        // CAvatarItemMgr::getJewelSocketData
        const _GetJewelSocketData = nf(addr.cavataritemmgr_get_jewel_socket_data, 'pointer', ['pointer', 'int']);
        const jewelSocketData = _GetJewelSocketData(invenAvartarMgr, avartarAddInfo);

        if (jewelSocketData.isNull()) {
          return;
        }

        // 步骤5：最多只支持 3 个插槽
        if (emblemCnt <= 3) {
          const emblems = {};
          for (var i = 0; i < emblemCnt; i++) {
            // 徽章所在的背包槽
            var emblemInvenSlot = packet.getShort(packetBuf);
            // 徽章 item_id
            var emblemItemId = packet.getInt(packetBuf);
            // 该徽章要镶嵌的时装插槽 ID
            var avartarSocketSlot = packet.getByte(packetBuf);

            // 步骤6：校验徽章道具
            const emblem = inventory.getInvenRef(inven, inventory.TYPE_ITEM, emblemInvenSlot);
            if (inventory.isItemEmpty(emblem) ||
                inventory.getItemKey(emblem) != emblemItemId ||
                avartarSocketSlot >= 3) {
              return;
            }

            // 步骤7：校验徽章类型（必须是消耗品且类型为 20 = 徽章）
            const citem = item.findItem(emblemItemId);
            if (citem.isNull()) {
              return;
            }
            if (!item.isStackable(citem) || item.getStackableItemType(citem) != 20) {
              return;
            }

            // 步骤8：校验徽章插槽颜色是否匹配
            // 获取徽章支持的插槽类型
            const emblemSocketType = item.getJewelTargetSocket(citem);
            // 获取时装插槽类型（从插槽数据中读取）
            const avartarSocketType = jewelSocketData.add(avartarSocketSlot * 6).readShort();
            if (!(emblemSocketType & avartarSocketType)) {
              // 插槽类型不匹配，跳过
              return;
            }

            emblems[avartarSocketSlot] = [emblemInvenSlot, emblemItemId];
          }

          // 步骤9：执行镶嵌
          for (var avartarSocketSlot in emblems) {
            // 删除消耗的徽章
            var emblemInvenSlot = emblems[avartarSocketSlot][0];
            inventory.deleteItem(inven, 1, emblemInvenSlot, 1, 8, 1);

            // 设置时装插槽数据
            var emblemItemId = emblems[avartarSocketSlot][1];
            setJewelSocketData(jewelSocketData, avartarSocketSlot, emblemItemId);
          }

          // 步骤10：时装插槽数据存盘
          saveJewelSlotData(
            user.getCurCharacNo(curUser),
            getAvatarUiId(avartar),
            jewelSocketData
          );

          // 步骤11：通知客户端时装数据已更新
          user.sendUpdateItemList(curUser, 1, 1, avartarInvenSlot);

          // 步骤12：回包给客户端通知镶嵌成功
          const packetGuard = packet.createPacketGuard();
          packet.putHeader(packetGuard, 1, 204);
          packet.putInt(packetGuard, 1);
          packet.finalize(packetGuard, 1);
          user.send(curUser, packetGuard);
          packet.destroyPacketGuard(packetGuard);
        }
      } catch (error) {
        // 镶嵌过程中出现异常，记录日志但不影响主流程
        if (ctx.log) ctx.log('[emblem_fix] exception: ' + error);
      }
    },
    onLeave: function (retval) {
      // 返回值改为 0，不再踢线（原函数返回非 0 会导致客户端断线）
      retval.replace(0);
    }
  });

  g_emblem_fix_started = true;
  if (ctx.log) ctx.log('[emblem_fix] started');
}

if (typeof globalThis !== 'undefined') {
  globalThis.startEmblemFixFeature = startEmblemFixFeature;
}
// 时装潜能（隐藏属性）模块
// 来源：从旧 frida.js hidden_option() + start_hidden_option() 迁移
// 用途：修改时装潜能属性下发逻辑
//
// 做了什么：
// 1. 关闭系统分配的默认潜能属性
// 2. 用随机属性值替换（范围 1-63）
// 3. 修改返回值让潜能系统正常工作
//
// 为什么需要这样做：
// 原游戏时装潜能生成机制可能有问题，通过 Frida 直接修改内存
// 中的属性值和跳过分配逻辑来修复

var g_hidden_option_started = false;

function startHiddenOptionFeature(ctx) {
  if (g_hidden_option_started) {
    console.log('[hidden_option] already started');
    return;
  }

  const addr = ctx.addresses;

  try {
    // ---- 内存修改：关闭系统分配 + 写入随机属性 ----
    // 来源：从旧 frida.js hidden_option() 迁移
    function hiddenOption() {
      // 关闭系统分配属性
      // 将指令 nop 掉（写入 0xEB = jmp）
      // 为什么用 nop：跳过系统默认的潜能属性分配逻辑
      // 风险：如果后续版本这段代码结构变化，nop 可能产生错误行为
      Memory.protect(addr.hidden_option_patch_1, 3, 'rwx');
      addr.hidden_option_patch_1.writeByteArray([0xEB]);

      // 下发时装潜能属性
      // 随机写入 1-63 的属性值
      // 为什么范围是 1-63：原游戏时装潜能总共 63 种
      // 风险：属性值随机可能导致客户端显示异常
      Memory.protect(addr.hidden_option_patch_2, 3, 'rwx');
      addr.hidden_option_patch_2.writeUShort(globalThis.getRandomInt(1, 64));
    }

    // ---- Hook 1：时装潜能生成入口 ----
    // 来源：从旧 frida.js start_hidden_option 第一个 hook 迁移
    // 为什么 hook 这里：每次角色进入副本或切换时装时会触发此函数
    // Hook 点：onEnter 时调用 hiddenOption() 修改内存
    attachOnce('hidden_option_entry', addr.hidden_option_entry, {
      onEnter: function (args) {
        hiddenOption();
      },
      onLeave: function (retval) {}
    });

    // ---- Hook 2：跳过系统默认属性分配返回值 ----
    // 来源：从旧 frida.js start_hidden_option 第二个 hook 迁移
    // 为什么 hook 这里：让系统认为属性分配已完成，不再尝试重新分配
    // Hook 点：onLeave 替换返回值为 1
    attachOnce('hidden_option_return_1', addr.hidden_option_return_1, {
      onEnter: function (args) {},
      onLeave: function (retval) {
        retval.replace(1);
      }
    });

    g_hidden_option_started = true;
    if (ctx.log) ctx.log('[hidden_option] started');
  } catch (err) {
    if (ctx.log) ctx.log('[hidden_option] failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.startHiddenOptionFeature = startHiddenOptionFeature;
}
// 勇士归来（回归用户）模块
// 来源：从旧 frida.js set_return_user(day) 迁移
// 用途：修改游戏内存中的回归用户判定时间阈值
//
// 为什么需要：
// 原游戏判定勇士归来需要距离上次登录超过一定天数（如 28 天）。
// 通过修改内存中的判定阈值，可以自定义回归时长。
//
// 风险：
// 1. 直接修改代码段内存，版本更新后地址可能变化
// 2. 设置过小的天数可能导致所有玩家都算回归，破坏游戏平衡

var g_return_user_started = false;

function startReturnUserFeature(ctx) {
  if (g_return_user_started) {
    console.log('[return_user] already started');
    return;
  }

  const addr = ctx.addresses;
  const cfg = ctx.config.return_user;

  try {
    // 计算回归判定时间阈值（秒）
    // day * 86400 秒/天
    const day = cfg.day || 15;
    const time = day * 86400;

    // 修改内存：将回归判定时间写入代码段
    // 来源：从旧 frida.js set_return_user 迁移
    // 为什么直接写内存：原代码中的判定时间是硬编码的常数，
    //   修改它不需要 hook，直接改值即可
    // 为什么用 protect：代码段默认不可写，需要修改保护属性
    // 风险：地址偏移可能随版本变化，写入错误可能导致崩溃
    Memory.protect(addr.return_user_time_patch, 32, 'rwx');
    addr.return_user_time_patch.writeU32(time);

    g_return_user_started = true;
    if (ctx.log) ctx.log('[return_user] day=' + day + ' (threshold=' + time + 's)');
  } catch (err) {
    if (ctx.log) ctx.log('[return_user] failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.startReturnUserFeature = startReturnUserFeature;
}
// 在线奖励模块
// 来源：从旧 frida.js enable_online_reward() + api_recharge_cash_cera() + api_recharge_cash_cera_point() 迁移
// 用途：在线每 5 分钟发放点券奖励
//
// 风险说明：
// 1. 此功能涉及点券充值，直接调用 billing 库存储过程
// 2. 禁止直接修改 billing 库所有表字段
// 3. 在线时间越长奖励越多，可能影响游戏经济平衡
// 4. 默认关闭，只有明确需要时才启用
// 5. 所有真实地址已迁移到 runtime_addresses.js
//
// 奖励规则：
// - 在线 30 分钟后开始计算
// - 每分钟 0.1 点券
// - 最多奖励 12 小时（半天）

var g_online_reward_started = false;

function startOnlineRewardFeature(ctx) {
  if (g_online_reward_started) {
    console.log('[online_reward] already started');
    return;
  }

  const addr = ctx.addresses;

  try {
    // 点券充值函数（来源：从旧 frida.js api_recharge_cash_cera 迁移）
    // 风险：禁止直接修改 billing 库所有表字段，点券相关操作务必调用数据库存储过程
    const _IPGInput = globalThis.nf(addr.cipghelper_ipg_input, 'int', ['pointer', 'pointer', 'int', 'int', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer']);
    const _IPGQuery = globalThis.nf(addr.cipghelper_ipg_query, 'int', ['pointer', 'pointer']);

    function rechargeCashCera(curUser, amount) {
      // 地址来源：runtime_addresses.js cipghelper_global
      const ipgHelper = addr.cipghelper_global.readPointer();
      // 地址来源：runtime_addresses.js ipg_empty_string
      const emptyString = addr.ipg_empty_string;
      _IPGInput(ipgHelper, curUser, 5, amount, emptyString, emptyString, Memory.allocUtf8String('GM'), ptr(0), ptr(0), ptr(0));
      // 通知客户端充值结果
      _IPGQuery(ipgHelper, curUser);
    }

    // 获取登录时间
    const _GetLoginTick = globalThis.nf(addr.cusercharacinfo_get_login_tick, 'int', ['pointer']);

    // Hook CUser::WorkPerFiveMin
    // 来源：从旧 frida.js enable_online_reward 迁移
    // 为什么 hook 这里：每 5 分钟触发一次，正好用于定期发放在线奖励
    // 风险：这是游戏自身的定时函数，hook 它可能会影响其他 5 分钟逻辑
    globalThis.attachOnce('online_reward_work_per_five_min', addr.cuser_work_per_five_min, {
      onEnter: function (args) {
        const curUser = args[0];

        // 当前系统时间
        const curTime = ctx.time.getCurSec();
        // 本次登录时间
        const loginTick = _GetLoginTick(curUser);

        if (loginTick > 0) {
          // 在线时长（分钟）
          const diffTime = Math.floor((curTime - loginTick) / 60);

          // 在线 30 分钟后才开始计算
          if (diffTime < 30) {
            return;
          }

          // 最多奖励 12 小时
          if (diffTime > 12 * 60) {
            return;
          }

          // 奖励：每分钟 0.1 点券
          const REWARD_CASH_CERA_PER_MIN = 0.1;
          const rewardCashCera = Math.floor(diffTime * REWARD_CASH_CERA_PER_MIN);

          // 发放点券
          rechargeCashCera(curUser, rewardCashCera);

          // 通知客户端奖励已发送
          // 使用 ctx.logger.getTimestamp() 获取时间戳（不要用 ctx.log.getTimestamp()）
          if (ctx.user) {
            ctx.user.sendNotiPacketMessage(
              curUser,
              '[' + ctx.logger.getTimestamp() + '] 在线奖励已发送(当前阶段点券奖励:' + rewardCashCera + ')',
              6
            );
          }
        }
      },
      onLeave: function (retval) {
        // 不影响原函数执行
      }
    });

    g_online_reward_started = true;
    if (ctx.log) ctx.log('[online_reward] started');
  } catch (err) {
    if (ctx.log) ctx.log('[online_reward] failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.startOnlineRewardFeature = startOnlineRewardFeature;
}
// 战力排行模块
// 来源：从旧 frida.js ranklist / GetRankNumber / GetMyEquInfo / SetRanking / SendRankLits - 相关函数迁移
// 用途：维护服务器战力排行榜前三名，在城镇显示雕像
//
// 功能说明：
// 1. 查询角色战力值（从数据库 frida.battle 表）
// 2. 角色下线时更新排行
// 3. 向客户端下发排行榜数据
// 4. 排行榜数据持久化到数据库（热重载恢复）
//
// 注意：战力值查询 SQL 需要适配不同的数据库环境
//   - 花枝战力值数据库：SELECT ZLZ FROM frida.battle WHERE CID=?
//   - 暴雨：SELECT ZLZ FROM d_starsky.zhanli WHERE CID=?
//   - 暴雨2：SELECT ZLZ FROM d_baoyu.zhanli WHERE CID=?
//   - RS：SELECT ZLZ FROM Rslogin.battle WHERE ZID=?

// 默认榜单数据（服务器刚启动时使用）
// 来源：从旧 frida.js ranklist 默认数据迁移
// 每个条目包含：
//   rank: 战力值（越大排名越高）
//   characname: 角色名
//   job: 职业
//   lev: 等级
//   Grow: PVP 段位
//   Guilkey: 公会 ID
//   Guilname: 公会名
//   str: 角色名附带空格（屏蔽客户端自定义显示）
//   equip: 外观装备列表（11件: 武器/上衣/下衣/帽子/头发等）
var g_ranklist = {
  '1': {
    'rank': 100,
    'characname': '虚位以待',
    'job': 0,
    'lev': 85,
    'Grow': 17,
    'Guilkey': 1,
    'Guilname': '',
    'str': '111！',
    'equip': [101531433, 101551558, 101501731, 101571413, 101561697, 101521488, 101511859, 101541622, 0, -1, 101040146]
  },
  '2': {
    'rank': 90,
    'characname': '虚位以待',
    'job': 1,
    'lev': 85,
    'Grow': 17,
    'Guilkey': 1,
    'Guilname': '',
    'str': '222！',
    'equip': [45486, 43101, 44757, 43879, 43541, 44283, 45155, 45935, 0, -1, 102040100]
  },
  '3': {
    'rank': 80,
    'characname': '虚位以待',
    'job': 4,
    'lev': 85,
    'Grow': 17,
    'Guilkey': 1,
    'Guilname': '',
    'str': '333！',
    'equip': [57519, 55153, 56754, 55922, 55533, 56332, 57147, 57946, 0, -1, 108030043]
  },
};

// ---- 查询角色战力值 ----
// 来源：从旧 frida.js GetRankNumber 迁移
// characNo: 角色 charac_no
// fridaDb: 绑定 frida 句柄的便捷 DB 对象（ctx.fridaDb）
// 返回: 战力值，查询失败返回 undefined
function getRankNumber(fridaDb, characNo) {
  // DB 未初始化时直接返回 0，不查询
  if (!fridaDb) {
    return 0;
  }
  // SQL 拼接未做转义，characNo 为数字类型是安全的
  const sql = "SELECT ZLZ FROM frida.battle WHERE CID='" + characNo + "';";
  if (fridaDb.exec(sql)) {
    if (fridaDb.getNRows() == 1) {
      fridaDb.fetch();
      return parseInt(fridaDb.getStr(0));
    }
  }
}

// ---- 获取角色排行数据 ----
// 来源：从旧 frida.js GetMyEquInfo 迁移
// 注意：角色名处多加空格用于屏蔽客户端内排行榜对显示框的修改
function getMyEquInfo(ctx, curUser) {
  const MyRanklist = {
    'rank': 0,
    'characname': '',
    'job': 0,
    'lev': 0,
    'Grow': 0,
    'Guilkey': 0,
    'Guilname': '',
    'str': '',
    'equip': []
  };

  const characNo = ctx.user.getCurCharacNo(curUser);
  MyRanklist.rank = getRankNumber(ctx.fridaDb, characNo) || 0;
  // 名字后加空格用于屏蔽客户端自定义显示字符串
  MyRanklist.characname = ctx.user.getCurCharacName(curUser) + ' ';
  MyRanklist.job = ctx.user.getCharacJob(curUser);
  MyRanklist.lev = ctx.user.getCharacLevel(curUser);
  MyRanklist.Grow = ctx.user.getCurCharacGrowType(curUser);
  MyRanklist.Guilkey = ctx.user.getCharacGuildkey(curUser);
  MyRanklist.Guilname = ctx.user.getGuildName(curUser);
  if (!MyRanklist.Guilname) {
    MyRanklist.Guilname = '未加入公会';
  }

  // 读取角色身上穿的装备
  const InvenW = ctx.user.getCurCharacInvenW(curUser);
  for (var i = 0; i <= 10; i++) {
    if (i != 9) {
      const invenItem = ctx.inventory.getInvenRef(InvenW, ctx.inventory.TYPE_BODY, i);
      MyRanklist.equip.push(ctx.inventory.getItemKey(invenItem));
    } else {
      MyRanklist.equip.push(-1);
    }
  }

  return MyRanklist;
}

// ---- 更新个人排名 ----
// 来源：从旧 frida.js SetRanking 迁移
// 原理：获取角色战力值，与现有排行榜比较，只保留前三名
function setRanking(ctx, curUser) {
  const MyRanklist = getMyEquInfo(ctx, curUser);

  // findIndex 可能为 ES6+ 语法，使用循环代替
  var existingIndex = -1;
  const rankKeys = [];
  for (var key in g_ranklist) {
    if (g_ranklist.hasOwnProperty(key)) {
      rankKeys.push(key);
      if (g_ranklist[key].characname === MyRanklist.characname) {
        existingIndex = parseInt(key) - 1;
      }
    }
  }

  if (MyRanklist.rank) {
    if (existingIndex !== -1) {
      // 已在排行榜中，更新信息
      g_ranklist[(existingIndex + 1).toString()] = MyRanklist;
    } else {
      // 新人加入排行
      g_ranklist['4'] = MyRanklist;
    }

    // 排序（按战力值降序）
    const rankArray = [];
    for (var key in g_ranklist) {
      if (g_ranklist.hasOwnProperty(key)) {
        rankArray.push(g_ranklist[key]);
      }
    }
    rankArray.sort(function (a, b) { return b.rank - a.rank; });

    // 只保留前三名
    const topThree = rankArray.slice(0, 3);

    const tmp = {};
    for (var i = 0; i < topThree.length; i++) {
      tmp[(i + 1).toString()] = topThree[i];
    }

    // 删除第四名
    delete g_ranklist['4'];
    g_ranklist = tmp;
  }
}

// ---- 发送排行榜给玩家 ----
// 来源：从旧 frida.js SendRankLits 迁移
// user: CUser 指针
// all: true=全体下发, false=单体下发
function sendRankLits(ctx, curUser, all) {
  const packetGuard = ctx.packet.createPacketGuard();
  // 协议 ENUM_NOTIPACKET_STATUE_POSITION (182)
  ctx.packet.putHeader(packetGuard, 0, 182);
  ctx.packet.putByte(packetGuard, Object.keys(g_ranklist).length);

  for (var key in g_ranklist) {
    if (g_ranklist.hasOwnProperty(key)) {
      const data = g_ranklist[key];
      const characName = data.characname;
      const characLevel = data.lev;
      const characJob = data.job;
      const characGrowType = data.Grow;
      const characGuilname = data.Guilname;
      const characGuilkey = data.Guilkey;
      const equip = data.equip;

      ctx.packet.putString(packetGuard, characName);
      ctx.packet.putByte(packetGuard, characLevel);
      ctx.packet.putByte(packetGuard, characJob);
      ctx.packet.putByte(packetGuard, characGrowType);
      ctx.packet.putString(packetGuard, characGuilname);
      ctx.packet.putInt(packetGuard, characGuilkey);

      for (var i = 0; i < equip.length; i++) {
        const itemId = (i != 9) ? equip[i] : -1;
        ctx.packet.putInt(packetGuard, itemId);
      }
    }
  }

  ctx.packet.finalize(packetGuard, 1);

  if (all) {
    // 全体下发
    ctx.gw.sendAll(ctx.gw.getGameWorld(), packetGuard);
  } else {
    // 单下发
    ctx.user.send(curUser, packetGuard);
  }

  ctx.packet.destroyPacketGuard(packetGuard);
}

// ---- 从数据库加载排行榜 ----
// 来源：从旧 frida.js event_rankinfo_load_from_db 迁移
function loadRankInfoFromDb(fridaDb) {
  if (fridaDb.exec("select event_info from game_event where event_id = 'rankinfo';")) {
    if (fridaDb.getNRows() == 1) {
      fridaDb.fetch();
      const info = fridaDb.getStr(0);
      if (info) {
        try {
          g_ranklist = JSON.parse(info);
        } catch (e) {
          console.log('[ranking] failed to parse saved ranklist: ' + e);
        }
      }
    }
  }
}

// ---- 保存排行榜到数据库 ----
// 来源：从旧 frida.js event_rankinfo_save_to_db 迁移
function saveRankInfoToDb(fridaDb) {
  try {
    // SQL 拼接 JSON，排行榜数据不包含用户输入，相对安全
    // 风险：如果角色名中包含特殊字符可能导致 SQL 语法错误
    // TODO: 后续统一使用参数化查询
    fridaDb.exec("replace into game_event (event_id, event_info) values ('rankinfo', '" + JSON.stringify(g_ranklist) + "');");
  } catch (error) {
    console.log('[ranking] save failed: ' + error);
  }
}

// ---- 启动模块 ----
var g_ranking_started = false;

function startRankingFeature(ctx) {
  if (g_ranking_started) {
    console.log('[ranking] already started');
    return;
  }

  // 从 DB 加载持久化排行数据
  // 使用 ctx.fridaDb（绑定 frida 句柄的便捷 DB 对象）
  if (ctx.fridaDb) {
    try {
      loadRankInfoFromDb(ctx.fridaDb);
    } catch (e) {
      console.log('[ranking] load from db failed: ' + e);
    }
  }

  g_ranking_started = true;
  if (ctx.log) ctx.log('[ranking] started');
}

// ---- 暴露给 user_inout 的回调 ----
// 用户进入时：发送排行榜（全体下发）
function onUserEnterRanking(ctx, curUser) {
  if (!curUser.isNull()) {
    sendRankLits(ctx, curUser, true);
  }
}

// 用户离开时：更新排名
function onUserLeaveRanking(ctx, curUser) {
  // 防御式检查：curUser 可能为空
  if (!curUser || curUser.isNull()) {
    return;
  }

  // DB 不可用时跳过排名更新和持久化
  if (!ctx.fridaDb) {
    if (ctx.log) {
      ctx.log('[ranking] fridaDb 不存在，跳过排行榜更新');
    }
    return;
  }

  setRanking(ctx, curUser);
  // 存盘
  saveRankInfoToDb(ctx.fridaDb);
}

if (typeof globalThis !== 'undefined') {
  globalThis.startRankingFeature = startRankingFeature;
  globalThis.ranking_onUserEnter = onUserEnterRanking;
  globalThis.ranking_onUserLeave = onUserLeaveRanking;
  globalThis.ranking_saveToDb = saveRankInfoToDb;
}
// 玩家上线/下线处理模块
// 来源：从旧 frida.js hook_user_inout_game_world() 迁移
// 用途：处理玩家进入和离开游戏世界的事件
//
// 进入时：
// 1. 发送排行榜数据给全体玩家
// 2. 如果怪物攻城活动进行中，通知当前进度
// 3. 发送问候消息
//
// 离开时：
// 1. 更新个人排行榜排名
//
// 设计原则：
// 不要在 user_inout 里直接写排行榜、怪物攻城等业务细节。
// 通过 ctx 中的回调或函数调用实现解耦。

var g_user_inout_started = false;

function startUserInoutFeature(ctx) {
  if (g_user_inout_started) {
    console.log('[user_inout] already started');
    return;
  }

  const addr = ctx.addresses;

  try {
    // ---- Hook 1: GameWorld::reach_game_world（玩家进入游戏世界） ----
    // 来源：从旧 frida.js hook_user_inout_game_world 第一个 hook 迁移
    // 原函数：玩家选择角色后进入游戏世界
    // 为什么 hook onLeave：需要等原函数完成角色初始化后才能安全操作
    // 风险：游戏初始化完成前访问角色数据可能导致崩溃
    attachOnce('user_inout_reach', addr.gameworld_reach_game_world, {
      onEnter: function (args) {
        // 保存角色指针，onLeave 时使用
        this.user = args[1];
      },
      onLeave: function (retval) {
        const curUser = this.user;

        // 战力排行榜下发（全体）
        // 通过 ctx 的事件回调触发，不直接写排行榜逻辑
        if (ctx.onUserEnter) {
          ctx.onUserEnter(curUser);
        }

        // 怪物攻城活动进度通知
        // 通过 ctx 的事件回调触发
        if (ctx.onUserEnterVillageAttack) {
          ctx.onUserEnterVillageAttack(curUser);
        }

        // 问候消息
        // 来源：从旧 frida.js 移植，向进入游戏的玩家发送问候
        if (ctx.user) {
          const characName = ctx.user.getCurCharacName(curUser);
          ctx.user.sendNotiPacketMessage(curUser, 'Hello : ' + characName, 2);
        }
      }
    });

    // ---- Hook 2: GameWorld::leave_game_world（玩家离开游戏世界） ----
    // 来源：从旧 frida.js hook_user_inout_game_world 第二个 hook 迁移
    // 为什么 hook onEnter：角色离开前最后操作，此时数据仍然完整
    // Hook 点：onEnter 时更新排行榜排名
    attachOnce('user_inout_leave', addr.gameworld_leave_game_world, {
      onEnter: function (args) {
        const curUser = args[1];

        // 通过 ctx 的事件回调触发排行榜更新
        if (ctx.onUserLeave) {
          ctx.onUserLeave(curUser);
        }
      },
      onLeave: function (retval) {}
    });

    g_user_inout_started = true;
    if (ctx.log) ctx.log('[user_inout] started');
  } catch (err) {
    if (ctx.log) ctx.log('[user_inout] failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.startUserInoutFeature = startUserInoutFeature;
}
// 怪物攻城活动常量
// 来源：从旧 frida.js VILLAGEATTACK_STATE_* / EVENT_VILLAGEATTACK_* 常量迁移
// 用途：定义怪物攻城活动的所有常量，供模块内各文件共享

const VILLAGE_ATTACK_CONSTANTS = {
  // 活动阶段
  // 来源：从旧 frida.js 迁移
  STATE_P1: 0,  // 一阶段：小镇周围刷新怪物，击杀牛头统帅提升难度
  STATE_P2: 1,  // 二阶段：城镇出现 GBL 主教，持续扣 PT
  STATE_P3: 2,  // 三阶段：刷新世界 BOSS 机械牛
  STATE_END: 3, // 活动已结束

  // 关键怪物 ID
  // 来源：从旧 frida.js 迁移
  MONSTER_TAU_CAPTAIN: 50071, // 牛头统帅（P1 阶段机制怪，击杀可提升难度）
  MONSTER_GBL_POPE: 262,      // GBL 教主教（P2/P3 城镇怪物，存活时持续扣 PT）
  MONSTER_TAU_META_COW: 17,   // 机械牛（P3 阶段世界 BOSS）

  // 默认配置（可通过 runtime_config.js 覆盖）
  // 来源：从旧 frida.js EVENT_VILLAGEATTACK_* 迁移
  DEFAULT_START_HOUR: 12,     // 每日北京时间 20 点开启（UTC 12 点）
  DEFAULT_TOTAL_TIME: 3600,   // 活动总时长（秒）
  DEFAULT_TARGET_SCORE: [100, 200, 300], // 各阶段目标 PT

  // 奖励表（来源：从旧 frida.js VillageAttackedRewardSendReward 的 switch 迁移）
  // 挑战次数 -> [item_id, count]
  REWARD_TABLE: {
    1: [3037, 5],
    2: [3037, 5],
    3: [3037, 5],
    4: [1085, 2],
    5: [1085, 5],
    6: [1085, 2],
    7: [8, 2],
    8: [8, 5],
    9: [8, 2],
    10: [36, 1],
    11: [36, 1],
    12: [15, 1],
    13: [15, 1],
    14: [3037, 10],
    15: [3262, 2],
    16: [3262, 3],
    17: [2600261, 1],
    18: [2600261, 1],
    19: [3037, 5],
    20: [1031, 2],
    21: [8, 2],
    22: [1085, 2],
    23: [8, 5],
    24: [15, 1],
    25: [15, 2],
    26: [3262, 5],
    27: [3262, 2],
    28: [8, 5],
    29: [1085, 2],
    30: [10000160, 1],
    31: [3037, 5],
    32: [3037, 5],
    33: [8, 2],
    34: [1085, 2],
    35: [2600261, 1],
    36: [10000161, 1],
  },

  // 防守成功奖励道具列表
  // 来源：从旧 frida.js on_end_event_villageattack 防御成功奖励迁移
  DEFEND_SUCCESS_REWARD_ITEMS: [
    [7745, 5],         // 士气冲天
    [2600028, 5],      // 天堂痊愈
    [42, 5],           // 复活币
    [3314, 1],         // 绝望之塔通关奖章
  ],
};

if (typeof globalThis !== 'undefined') {
  globalThis.VILLAGE_ATTACK_CONSTANTS = VILLAGE_ATTACK_CONSTANTS;
}
// 怪物攻城活动状态管理
// 来源：从旧 frida.js villageAttackEventInfo 及其相关状态操作迁移
// 用途：集中管理怪物攻城活动的所有状态数据
//
// 设计原则：
// 不要在其他文件中直接修改 villageAttackEventInfo 的字段。
// 所有状态修改都通过本文件的函数进行，便于追踪和调试。

const C = globalThis.VILLAGE_ATTACK_CONSTANTS;

// 怪物攻城活动数据（全局单例）
// 来源：从旧 frida.js villageAttackEventInfo 迁移
//
// 字段说明：
//   state: 活动当前阶段（STATE_P1/P2/P3/END）
//   score: 当前阶段频道内总 PT
//   start_time: 活动开始时间（UTC 秒）
//   difficult: 活动难度（0-4，对应普通-英雄）
//   next_village_monster_id: 下次要刷新的机制怪物 ID
//   last_killed_monster_id: 上次击杀的攻城怪物 ID（用于连杀计算）
//   p2_last_killed_monster_time: P2 阶段上次击杀时间
//   p2_kill_combo: P2 阶段连杀计数
//   gbl_cnt: 城镇中存活的 GBL 教主教数量
//   defend_success: 防守是否成功（1=成功）
//   user_pt_info: 角色个人 PT 数据 { charac_no: [account_id, pt] }
var g_info = {
  state: C.STATE_END,
  score: 0,
  start_time: 0,
  difficult: 0,
  next_village_monster_id: 0,
  last_killed_monster_id: 0,
  p2_last_killed_monster_time: 0,
  p2_kill_combo: 0,
  gbl_cnt: 0,
  defend_success: 0,
  user_pt_info: {},
};

// ---- 获取/设置状态 ----

function getInfo() {
  return g_info;
}

// 从数据库加载状态后覆盖
function setInfo(info) {
  g_info = info;
}

function getState() {
  return g_info.state;
}

function setState(state) {
  g_info.state = state;
}

function getScore() {
  return g_info.score;
}

function setScore(score) {
  g_info.score = score;
}

function addScore(pts) {
  g_info.score += pts;
}

function getDifficult() {
  return g_info.difficult;
}

function setDifficult(d) {
  g_info.difficult = d;
}

function getStartTime() {
  return g_info.start_time;
}

function setStartTime(t) {
  g_info.start_time = t;
}

function getNextVillageMonsterId() {
  return g_info.next_village_monster_id;
}

function setNextVillageMonsterId(id) {
  g_info.next_village_monster_id = id;
}

function getLastKilledMonsterId() {
  return g_info.last_killed_monster_id;
}

function setLastKilledMonsterId(id) {
  g_info.last_killed_monster_id = id;
}

function getP2KillCombo() {
  return g_info.p2_kill_combo;
}

function setP2KillCombo(c) {
  g_info.p2_kill_combo = c;
}

function getP2LastKilledTime() {
  return g_info.p2_last_killed_monster_time;
}

function setP2LastKilledTime(t) {
  g_info.p2_last_killed_monster_time = t;
}

function getGblCnt() {
  return g_info.gbl_cnt;
}

function setGblCnt(c) {
  g_info.gbl_cnt = c;
}

function addGblCnt(n) {
  g_info.gbl_cnt += n;
}

function getDefendSuccess() {
  return g_info.defend_success;
}

function setDefendSuccess(v) {
  g_info.defend_success = v;
}

// ---- 用户 PT 操作 ----
// characNo: 玩家 charac_no
// accountId: 玩家 account_id
// pt: 当前 PT

function getUserPt(characNo) {
  if (characNo in g_info.user_pt_info) {
    return g_info.user_pt_info[characNo][1];
  }
  return 0;
}

function addUserPt(characNo, accountId, pts) {
  if (!(characNo in g_info.user_pt_info)) {
    g_info.user_pt_info[characNo] = [accountId, 0];
  }
  g_info.user_pt_info[characNo][1] += pts;
}

function getAccountIdByCharacNo(characNo) {
  if (characNo in g_info.user_pt_info) {
    return g_info.user_pt_info[characNo][0];
  }
  return 0;
}

function forEachUserPt(callback) {
  for (var characNo in g_info.user_pt_info) {
    callback(characNo, g_info.user_pt_info[characNo][0], g_info.user_pt_info[characNo][1]);
  }
}

function clearUserPtInfo() {
  g_info.user_pt_info = {};
}

// 计算活动剩余时间（秒）
// systemTime: 当前系统 UTC 时间
// totalTime: 活动总时长
function getRemainTime(systemTime, totalTime) {
  const eventEndTime = g_info.start_time + totalTime;
  return eventEndTime - systemTime;
}

// 重置活动数据（活动开始时调用）
// systemTime: 当前系统时间
function reset(systemTime) {
  g_info.state = C.STATE_P1;
  g_info.score = 0;
  g_info.difficult = 0;
  g_info.next_village_monster_id = C.MONSTER_TAU_CAPTAIN;
  g_info.last_killed_monster_id = 0;
  g_info.p2_kill_combo = 0;
  g_info.user_pt_info = {};
  g_info.gbl_cnt = 0;
  g_info.defend_success = 0;
  g_info.start_time = systemTime;
}

if (typeof globalThis !== 'undefined') {
  globalThis.village_attack_state = {
    getInfo: getInfo,
    setInfo: setInfo,
    getState: getState,
    setState: setState,
    getScore: getScore,
    setScore: setScore,
    addScore: addScore,
    getDifficult: getDifficult,
    setDifficult: setDifficult,
    getStartTime: getStartTime,
    setStartTime: setStartTime,
    getNextVillageMonsterId: getNextVillageMonsterId,
    setNextVillageMonsterId: setNextVillageMonsterId,
    getLastKilledMonsterId: getLastKilledMonsterId,
    setLastKilledMonsterId: setLastKilledMonsterId,
    getP2KillCombo: getP2KillCombo,
    setP2KillCombo: setP2KillCombo,
    getP2LastKilledTime: getP2LastKilledTime,
    setP2LastKilledTime: setP2LastKilledTime,
    getGblCnt: getGblCnt,
    setGblCnt: setGblCnt,
    addGblCnt: addGblCnt,
    getDefendSuccess: getDefendSuccess,
    setDefendSuccess: setDefendSuccess,
    getUserPt: getUserPt,
    addUserPt: addUserPt,
    getAccountIdByCharacNo: getAccountIdByCharacNo,
    forEachUserPt: forEachUserPt,
    clearUserPtInfo: clearUserPtInfo,
    getRemainTime: getRemainTime,
    reset: reset,
  };
}
// 怪物攻城数据库操作
// 来源：从旧 frida.js event_villageattack_save_to_db/load_from_db 迁移
// 用途：持久化怪物攻城活动状态到 frida.game_event 表
//
// 风险：
// 1. SQL 拼接未做转义，JSON 中包含特殊字符可能导致 SQL 语法错误
// 2. 后续如需转义，方便在此处集中修改

// fridaDb: 绑定 frida 句柄的便捷 DB 对象（ctx.fridaDb）
function createVillageAttackDb(fridaDb) {
  // 保存活动数据到数据库
  // 来源：从旧 frida.js event_villageattack_save_to_db 迁移
  function save(info) {
    try {
      // 风险：JSON.stringify 可能产生包含单引号的字符串，
      // 如果包含会导致 SQL 语法错误
      // TODO: 后续统一使用参数化查询
      const json = JSON.stringify(info);
      fridaDb.exec("replace into game_event (event_id, event_info) values ('villageattack', '" + json + "');");
    } catch (error) {
      console.log('[village_attack_db] save failed: ' + error);
    }
  }

  // 从数据库加载活动数据
  // 来源：从旧 frida.js event_villageattack_load_from_db 迁移
  function load() {
    try {
      if (fridaDb.exec("select event_info from game_event where event_id = 'villageattack';")) {
        if (fridaDb.getNRows() == 1) {
          fridaDb.fetch();
          const info = fridaDb.getStr(0);
          if (info) {
            return JSON.parse(info);
          }
        }
      }
    } catch (error) {
      console.log('[village_attack_db] load failed: ' + error);
    }
    return null;
  }

  return {
    save: save,
    load: load,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createVillageAttackDb = createVillageAttackDb;
}
// 怪物攻城世界广播与通知
// 来源：从旧 frida.js event_villageattack_broadcast_diffcult / gameworld_update_villageattack_score / notify_villageattack_score 迁移
// 用途：向玩家发送怪物攻城活动进度和状态通知

function createVillageAttackNotify(ctx) {
  const st = globalThis.village_attack_state;
  const C = globalThis.VILLAGE_ATTACK_CONSTANTS;

  // 世界广播活动当前阶段和难度
  // 来源：从旧 frida.js event_villageattack_broadcast_diffcult 迁移
  // 风险：全局广播有一定频率，不应在高频路径上调用
  function broadcastPhase() {
    if (st.getState() != C.STATE_END) {
      // 使用 gw binding 中封装的 sendNotiPacketMessage 进行世界广播
      ctx.gw.sendNotiPacketMessage(
        '<怪物攻城活动> 当前阶段:' + (st.getState() + 1) + ', 当前难度等级: ' + st.getDifficult(),
        14
      );
    }
  }

  // 世界广播任意消息
  // 用途：活动开始/结束/世界BOSS刷新等需要通知全服玩家的事件
  function broadcastMessage(msg) {
    ctx.gw.sendNotiPacketMessage(msg, 14);
  }

  // 更新怪物攻城当前进度（广播给频道内在线玩家）
  // 来源：从旧 frida.js gameworld_update_villageattack_score 迁移
  // 协议: ENUM_NOTIPACKET_UPDATE_VILLAGE_ATTACKED (247)
  function updateScoreBroadcast() {
    const remainTime = st.getRemainTime(ctx.time.getCurSec(), ctx.villageAttackConfig.total_time);
    if ((remainTime <= 0) || (st.getState() == C.STATE_END)) {
      return;
    }

    const pkt = ctx.packet.createPacketGuard();
    ctx.packet.putHeader(pkt, 0, 247);
    ctx.packet.putInt(pkt, remainTime);                                   // 活动剩余时间
    ctx.packet.putInt(pkt, st.getScore());                                // 当前频道 PT 点数
    ctx.packet.putInt(pkt, ctx.villageAttackConfig.target_score[2]);      // 成功防守所需点数
    ctx.packet.finalize(pkt, 1);

    ctx.gw.sendAll(ctx.gw.getGameWorld(), pkt);
    ctx.packet.destroyPacketGuard(pkt);
  }

  // 通知单个玩家怪物攻城进度
  // 来源：从旧 frida.js notify_villageattack_score 迁移
  // 协议: ENUM_NOTIPACKET_STARTED_VILLAGE_ATTACKED (248)
  // 用途：在玩家进入游戏时调用，打开怪物攻城 UI 并更新当前进度
  function notifyPlayerScore(curUser) {
    const characNo = ctx.user.getCurCharacNo(curUser).toString();
    const pt = st.getUserPt(characNo);

    const remainTime = st.getRemainTime(ctx.time.getCurSec(), ctx.villageAttackConfig.total_time);
    if ((remainTime <= 0) || (st.getState() == C.STATE_END)) {
      return;
    }

    const pkt = ctx.packet.createPacketGuard();
    ctx.packet.putHeader(pkt, 0, 248);
    ctx.packet.putInt(pkt, remainTime);                                   // 活动剩余时间
    ctx.packet.putInt(pkt, st.getScore());                                // 当前频道 PT 点数
    ctx.packet.putInt(pkt, ctx.villageAttackConfig.target_score[2]);      // 成功防守所需点数
    ctx.packet.putInt(pkt, pt);                                           // 个人 PT 点数
    ctx.packet.finalize(pkt, 1);

    ctx.user.send(curUser, pkt);
    ctx.packet.destroyPacketGuard(pkt);
  }

  return {
    broadcastPhase: broadcastPhase,
    broadcastMessage: broadcastMessage,
    updateScoreBroadcast: updateScoreBroadcast,
    notifyPlayerScore: notifyPlayerScore,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createVillageAttackNotify = createVillageAttackNotify;
}
// 怪物攻城挑战奖励模块
// 来源：从旧 frida.js VillageAttackedRewardSendReward() 迁移
// 用途：根据挑战次数发放对应的邮件奖励
//
// 奖励表来源：旧 frida.js 的 switch 语句，36 个 case 每个对应不同的奖励
// 已将 switch 改为数据表（见 constants.js REWARD_TABLE）

function createVillageAttackReward(ctx) {
  const C = globalThis.VILLAGE_ATTACK_CONSTANTS;

  // 发送单道具系统邮件
  // 来源：从旧 frida.js CMailBoxHelperReqDBSendNewSystemMail 迁移
  // 用途：怪物攻城每次挑战成功后发送对应奖励
  function sendChallengeReward(curUser) {
    const VAttackCount = ctx.user.getCurVAttackCount(curUser);
    var reward = C.REWARD_TABLE[VAttackCount];

    if (!reward) {
      // 超出奖励表范围的挑战次数，给默认奖励
      reward = [3037, 5];
    }

    const itemId = reward[0];
    const itemCount = reward[1];

    // 查询道具 PVF 数据
    const retitem = globalThis.nf(ctx.addresses.cdata_manager_find_item, 'pointer', ['pointer', 'int'])(
      globalThis.nf(ctx.addresses.g_cdata_manager, 'pointer', [])(), itemId
    );

    if (!retitem || retitem.isNull()) {
      return;
    }

    // 构造道具对象用于邮件发送
    const InvenItemConstructor = globalThis.nf(ctx.addresses.inven_item_constructor, 'pointer', ['pointer']);
    const GetItemIndex = globalThis.nf(ctx.addresses.getitem_index, 'int', ['pointer']);
    const ReqDBSendNewSystemMail = globalThis.nf(ctx.addresses.req_db_send_new_system_mail, 'int', ['pointer', 'pointer', 'int', 'int', 'pointer', 'int', 'int', 'int', 'char', 'char']);

    const InvenItemPr = Memory.alloc(100);
    InvenItemConstructor(InvenItemPr);

    const itemid = GetItemIndex(retitem);
    const itemtype = retitem.add(8).readU8();
    InvenItemPr.writeU8(itemtype);
    InvenItemPr.add(2).writeInt(itemid);
    InvenItemPr.add(7).writeInt(itemCount);

    const GoldValue = 0;
    const TitlePr = Memory.allocUtf8String('居民代表');
    const TxtValue = '击杀怪物奖励：';
    const UserID = ctx.user.getCurCharacNo(curUser);
    const TxtValuePr = Memory.allocUtf8String(TxtValue);
    const TxtValueLength = TxtValue.length;
    const ServerGroup = ctx.user.getServerGroup(curUser);
    const MailDate = 30;

    ReqDBSendNewSystemMail(TitlePr, InvenItemPr, GoldValue, UserID, TxtValuePr, TxtValueLength, MailDate, ServerGroup, 0, 0);
  }

  return {
    sendChallengeReward: sendChallengeReward,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createVillageAttackReward = createVillageAttackReward;
}
// 怪物攻城活动结算模块
// 来源：从旧 frida.js on_end_event_villageattack 中的结算逻辑迁移
// 用途：活动结束时进行结算（发奖/惩罚）
//
// 风险说明：
// 1. 防守成功：全服发邮件、送装备强化、送点券 → 影响游戏经济
// 2. 防守失败：随机删除装备、扣金币 → 可能导致玩家不满
// 3. 点券充值调用 billing 库存储过程，务必确保操作正确
// 4. 所有真实地址已迁移到 runtime_addresses.js

function createVillageAttackSettlement(ctx) {
  const st = globalThis.village_attack_state;
  const C = globalThis.VILLAGE_ATTACK_CONSTANTS;

  // 点券充值（来源：从旧 frida.js api_recharge_cash_cera 迁移）
  // 风险：禁止直接修改 billing 库所有表字段，点券相关操作务必调用数据库存储过程
  const _IPGInput = globalThis.nf(ctx.addresses.cipghelper_ipg_input, 'int', ['pointer', 'pointer', 'int', 'int', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer']);
  const _IPGQuery = globalThis.nf(ctx.addresses.cipghelper_ipg_query, 'int', ['pointer', 'pointer']);

  function rechargeCashCera(curUser, amount) {
    // 地址来源：runtime_addresses.js cipghelper_global
    const ipgHelper = ctx.addresses.cipghelper_global.readPointer();
    // 地址来源：runtime_addresses.js ipg_empty_string
    const emptyString = ctx.addresses.ipg_empty_string;
    _IPGInput(ipgHelper, curUser, 5, amount, emptyString, emptyString, Memory.allocUtf8String('GM'), ptr(0), ptr(0), ptr(0));
    _IPGQuery(ipgHelper, curUser);
  }

  // 活动结束结算入口
  // 来源：从旧 frida.js on_end_event_villageattack 迁移
  function settle() {
    // 防守成功
    if (st.getDefendSuccess()) {
      settleSuccess();
    } else {
      // 防守失败
      settleFailure();
    }

    // 清理用户 PT 数据
    st.clearUserPtInfo();
  }

  // ---- 防守成功结算 ----
  // 来源：从旧 frida.js on_end_event_villageattack 防守成功分支迁移
  // 包括：全服发信奖励、装备强化、点券奖励、排名第一额外奖励
  function settleSuccess() {
    const diff = st.getDifficult();
    const multiplier = 1 + diff;

    // 1. 全服在线玩家发信：金币 + 道具
    const rewardGold = 1000000 * multiplier;
    const rewardItemList = [];
    const baseItems = C.DEFEND_SUCCESS_REWARD_ITEMS;
    for (var i = 0; i < baseItems.length; i++) {
      rewardItemList.push([baseItems[i][0], baseItems[i][1] * multiplier]);
    }

    // 遍历所有在线玩家发信
    ctx.gw.forEachUser(function (curUser, args) {
      const characNo = ctx.user.getCurCharacNo(curUser);
      ctx.mail.sendMultiMail(characNo, '<怪物攻城活动>', '恭喜勇士! 防守成功!', rewardGold, rewardItemList);
    }, null);

    // 2. 特殊奖励：绝望之塔推至 100 层 + 随机强化一件装备
    // 来源：从旧 frida.js 移植
    const _TODLayerConstructor = globalThis.nf(ctx.addresses.tod_layer_constructor, 'pointer', ['pointer', 'int']);
    const _TODSetEnterLayer = globalThis.nf(ctx.addresses.tod_userstate_set_enter_layer, 'pointer', ['pointer', 'pointer']);

    ctx.gw.forEachUser(function (curUser, args) {
      // 设置绝望之塔层数为 99（对应游戏内 100 层）
      const todLayer = Memory.alloc(100);
      _TODLayerConstructor(todLayer, 99);
      const expandData = ctx.user.getCharacExpandData(curUser, 13);
      _TODSetEnterLayer(expandData, todLayer);

      // 随机选择一件穿戴中的装备提升强化/增幅等级
      const inven = ctx.user.getCurCharacInvenW(curUser);
      const slot = globalThis.getRandomInt(10, 21); // 12 件装备 slot 范围 10-21
      const equ = ctx.inventory.getInvenRef(inven, ctx.inventory.TYPE_BODY, slot);

      if (ctx.inventory.getItemKey(equ)) {
        // 读取装备强化等级（偏移 6，来源：游戏逆向分析）
        var upgradeLevel = equ.add(6).readU8();
        if (upgradeLevel < 31) {
          // 提升强化/增幅等级（随机 1 到 1+difficult）
          const bonusLevel = globalThis.getRandomInt(1, 1 + diff);
          upgradeLevel += bonusLevel;
          if (upgradeLevel >= 31) {
            upgradeLevel = 31;
          }
          // 写入新的强化等级
          equ.add(6).writeU8(upgradeLevel);
          // 通知客户端更新装备
          ctx.user.sendUpdateItemList(curUser, 1, 3, slot);
        }
      }
    }, null);

    // 3. 个人 PT 排名奖励：点券
    // 奖励规则：个人 PT * 10 = 点券
    var rankFirstCharacNo = 0;
    var rankFirstAccountId = 0;
    var maxPt = 0;

    st.forEachUserPt(function (characNo, accountId, pt) {
      const rewardCera = pt * 10;
      const userPr = ctx.gw.findUserFromWorldByAccid(ctx.gw.getGameWorld(), accountId);
      if (!userPr || userPr.isNull()) {
        return;
      }
      rechargeCashCera(userPr, rewardCera);

      // 找出榜一大哥
      if (pt > maxPt) {
        rankFirstCharacNo = characNo;
        rankFirstAccountId = accountId;
        maxPt = pt;
      }
    });

    // 频道内公告活动结束（使用 notify 的 broadcastMessage）
    ctx.va_notify.broadcastMessage('<怪物攻城活动> 防守成功, 奖励已发送!');

    // 4. 榜一大哥额外 10 倍点券
    if (rankFirstCharacNo) {
      var userPr = ctx.gw.findUserFromWorldByAccid(ctx.gw.getGameWorld(), rankFirstAccountId);
      if (userPr && !userPr.isNull()) {
        rechargeCashCera(userPr, maxPt * 10);
      }

      // 广播排行榜第一名
      const rankFirstName = ctx.va_getCharacNameByNo(rankFirstCharacNo);
      ctx.va_notify.broadcastMessage('<怪物攻城活动> 恭喜勇士 【' + rankFirstName + '】 成为个人积分排行榜第一名(' + maxPt + 'pt)!');
    }
  }

  // ---- 防守失败结算 ----
  // 来源：从旧 frida.js on_end_event_villageattack 防守失败分支迁移
  // 惩罚：7% 概率被掠夺一件装备 + 扣除 1%-10% 金币
  // 风险：随机删除装备对玩家影响很大，需确认这个玩法是否被接受
  function settleFailure() {
    ctx.gw.forEachUser(function (curUser, args) {
      const inven = ctx.user.getCurCharacInvenW(curUser);

      // 7% 概率被掠夺一件穿戴中的装备
      if (globalThis.getRandomInt(0, 100) < 7) {
        const slot = globalThis.getRandomInt(10, 21);
        const equ = ctx.inventory.getInvenRef(inven, ctx.inventory.TYPE_BODY, slot);

        if (ctx.inventory.getItemKey(equ)) {
          ctx.inventory.resetItem(equ);
          ctx.user.sendNotiPacket(curUser, 1, 2, 3);
        }
      }

      // 随机掠夺 1%-10% 所持金币
      const rate = globalThis.getRandomInt(1, 11);
      const curGold = ctx.inventory.getMoney(inven);
      const tax = Math.floor((rate / 100) * curGold);
      ctx.inventory.useMoney(inven, tax, 0, 0);
      ctx.user.sendUpdateItemList(curUser, 1, 0, 0);
    }, null);

    // 使用 notify 的 broadcastMessage 进行世界广播
    ctx.va_notify.broadcastMessage('<怪物攻城活动> 防守失败, 请勇士们再接再厉!');
  }

  return {
    settle: settle,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createVillageAttackSettlement = createVillageAttackSettlement;
}
// 怪物攻城活动流程控制
// 来源：从旧 frida.js start_villageattack / on_start_event_villageattack / event_villageattack_timer / on_end_event_villageattack 等迁移
// 用途：控制活动开启、计时、阶段流转、活动结束

function createVillageAttackFlow(ctx) {
  const st = globalThis.village_attack_state;
  const C = globalThis.VILLAGE_ATTACK_CONSTANTS;
  const notify = ctx.va_notify;
  const db = ctx.va_db;

  const _InterVillageAttackedStart = globalThis.nf(ctx.addresses.inter_village_attacked_start_dispatch, 'pointer', ['pointer', 'pointer', 'pointer']);
  const _OnDestroyVillageMonster = globalThis.nf(ctx.addresses.cvillagemonstermgr_on_destroy_village_monster, 'pointer', ['pointer', 'int']);
  const _GlobalVillageMonsterMgr = ctx.addresses.globaldata_villagemonstermgr;

  // 设置怪物攻城副本难度
  // 来源：从旧 frida.js set_villageattack_dungeon_difficult 迁移
  // 为什么直接写内存：难度值硬编码在代码段，hook 不掉，必须直接修改
  // 风险：地址偏移可能随版本变化
  function setDungeonDifficult(difficult) {
    Memory.protect(ctx.addresses.villageattack_dungeon_difficult, 4, 'rwx');
    ctx.addresses.villageattack_dungeon_difficult.writeInt(difficult);
  }

  // 开启怪物攻城活动（调用游戏原生函数）
  // 来源：从旧 frida.js start_villageattack 迁移
  function startGameEvent(totalTime, score, targetScore) {
    const a3 = Memory.alloc(100);
    a3.add(10).writeInt(totalTime);    // 活动剩余时间
    a3.add(14).writeInt(score);        // 当前频道 PT 点数
    a3.add(18).writeInt(targetScore);  // 成功防守所需点数
    _InterVillageAttackedStart(ptr(0), ptr(0), a3);
  }

  // 结束怪物攻城活动（销毁所有攻城怪物）
  // 来源：从旧 frida.js end_villageattack 迁移
  function endGameEvent() {
    _OnDestroyVillageMonster(_GlobalVillageMonsterMgr.readPointer(), 2);
  }

  // 开启活动（入口函数）
  // 来源：从旧 frida.js on_start_event_villageattack 迁移
  function onStart() {
    const curTime = ctx.time.getCurSec();
    // 重置活动状态
    st.reset(curTime);
    setDungeonDifficult(st.getDifficult());

    // 通知全服玩家活动开始并刷新城镇怪物
    startGameEvent(
      ctx.villageAttackConfig.total_time,
      st.getScore(),
      ctx.villageAttackConfig.target_score[2]
    );

    // 开启活动计时器（每 5 秒触发一次）
    ctx.timer.scheduleDelay(onTimer, null, 5000);

    // 世界广播活动开始
    notify.broadcastPhase();
  }

  // 活动计时器（每 5 秒触发一次）
  // 来源：从旧 frida.js event_villageattack_timer 迁移
  // 为什么每 5 秒：平衡实时性和性能开销
  // 为什么需要这个计时器：
  //   1. P2/P3 阶段 GBL 主教持续扣 PT
  //   2. P3 阶段世界 BOSS 自身回血
  //   3. 检测活动是否超时
  function onTimer() {
    if (st.getState() == C.STATE_END) {
      return;
    }

    // 活动结束检测
    const remainTime = st.getRemainTime(ctx.time.getCurSec(), ctx.villageAttackConfig.total_time);
    if (remainTime <= 0) {
      onEnd();
      return;
    }

    // 当前应扣除的 PT
    var damage = 0;

    // P2/P3 阶段 GBL 教主教扣 PT
    if ((st.getState() == C.STATE_P2) || (st.getState() == C.STATE_P3)) {
      for (var i = 0; i < st.getGblCnt(); ++i) {
        if (globalThis.getRandomInt(0, 100) < (4 + st.getDifficult())) {
          damage += 1;
        }
      }
    }

    // P3 阶段世界 BOSS 自身回血
    if (st.getState() == C.STATE_P3) {
      if (globalThis.getRandomInt(0, 100) < (6 + st.getDifficult())) {
        damage += 1;
      }
    }

    // 扣除 PT（不低于当前阶段最低值）
    if (damage > 0) {
      var currentScore = st.getScore() - damage;
      const minScore = ctx.villageAttackConfig.target_score[st.getState() - 1];
      if (currentScore < minScore) {
        currentScore = minScore;
      }
      st.setScore(currentScore);
      notify.updateScoreBroadcast();
    }

    // 重复触发计时器
    if (st.getState() != C.STATE_END) {
      ctx.timer.scheduleDelay(onTimer, null, 5000);
    }
  }

  // 活动结束
  // 来源：从旧 frida.js on_end_event_villageattack 迁移
  // 注意：结算逻辑不在 flow 中，由 settlement 模块负责
  function onEnd() {
    if (st.getState() == C.STATE_END) {
      return;
    }

    // 保存状态
    const wasDefendSuccess = st.getDefendSuccess();
    const wasState = st.getState();

    // 设置活动结束
    st.setState(C.STATE_END);
    endGameEvent();

    // 触发结算
    if (ctx.va_settlement) {
      ctx.va_settlement(onEnd);
    }

    // 持久化保存
    if (db) {
      db.save(st.getInfo());
    }

    // 重新启动定时器等待下一轮活动
    scheduleNextEvent();
  }

  // 安排下一轮活动
  // 来源：从旧 frida.js start_event_villageattack_timer 迁移
  function scheduleNextEvent() {
    const curTime = ctx.time.getCurSec();
    const startHour = ctx.villageAttackConfig.start_hour || C.DEFAULT_START_HOUR;
    // 计算距离下次开启的时间
    var delayTime = (3600 * startHour) - (curTime % (3600 * 24));
    if (delayTime <= 0) {
      delayTime += 3600 * 24;
    }

    if (ctx.log) ctx.log('[village_attack] next event in ' + (delayTime / 3600).toFixed(1) + ' hours');

    // 定时开启活动
    ctx.timer.scheduleDelay(onStart, null, delayTime * 1000);
  }

  // 初始化流程
  // 根据当前状态决定：恢复计时器 or 等待下一轮
  function initFlow() {
    if (st.getState() == C.STATE_END) {
      // 活动已结束，等待下一轮
      scheduleNextEvent();
    } else {
      // 活动进行中，恢复计时器
      ctx.timer.scheduleDelay(onTimer, null, 5000);
    }
  }

  return {
    onStart: onStart,
    onEnd: onEnd,
    initFlow: initFlow,
    setDungeonDifficult: setDungeonDifficult,
    startGameEvent: startGameEvent,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createVillageAttackFlow = createVillageAttackFlow;
}
// 怪物攻城活动 Hook 集合
// 来源：从旧 frida.js hook_VillageAttack() 迁移（约 400 行 hook 代码）
// 用途：包含所有怪物攻城相关的 Interceptor.attach/replace
//
// 设计原则：
// 1. 所有 hook 使用 attachOnce/replaceOnce 防重复
// 2. 每个 hook 上方有中文注释说明原函数、作用、风险
// 3. hook 内尽量只做轻逻辑，复杂逻辑调用 flow/state/notify/reward
// 4. 所有 hook 内部有 try/catch 兜底，防止异常影响主流程
// 5. replace hook 异常时必须兜底调用原函数

function createVillageAttackHooks(ctx) {
  const st = globalThis.village_attack_state;
  const C = globalThis.VILLAGE_ATTACK_CONSTANTS;
  const notify = ctx.va_notify;
  const addr = ctx.addresses;

  // 辅助：获取队伍中所有在线玩家
  const _GetParty = globalThis.nf(addr.cuser_get_party, 'pointer', ['pointer']);
  const _GetPartyUser = globalThis.nf(addr.cparty_get_user, 'pointer', ['pointer', 'int']);

  // =====================================================
  // Hook 1: 攻城副本回调（队友击杀奖励）
  // =====================================================
  // 原函数：village_attacked::CVillageMonster::OnKillVillageMonster
  // 来源：从旧 frida.js hook_VillageAttack 第一个 hook 迁移
  // 用途：队友击杀攻城怪物后发放挑战次数对应奖励
  // Hook 点：onLeave retval==0 时发奖励
  // 风险：如果奖励发放逻辑变更，此处需要同步调整
  attachOnce('va_on_kill', addr.village_monster_on_kill, {
    onEnter: function (args) {
      this.user = args[1];
    },
    onLeave: function (retval) {
      try {
        if (retval == 0 && this.user.isNull() == false) {
          // 发放挑战次数对应奖励
          if (ctx.va_reward) {
            ctx.va_reward.sendChallengeReward(this.user);
          }
        }
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_on_kill] exception: ' + err);
      }
    }
  });

  // =====================================================
  // Hook 2: 挑战攻城怪物结果处理（阶段流转核心）
  // =====================================================
  // 原函数：village_attacked::CVillageMonster::SendVillageMonsterFightResult
  // 来源：从旧 frida.js hook_VillageAttack 第二个 hook 迁移
  // 用途：挑战结果处理，更新各阶段 PT、难度、状态
  // 为什么这个 hook 最复杂：所有阶段流转逻辑都在这里
  // 风险：阶段流转逻辑依赖很多全局状态，线程安全问题需关注
  attachOnce('va_fight_result', addr.village_monster_send_fight_result, {
    onEnter: function (args) {
      this.villageMonster = args[0];  // 当前挑战的攻城怪物对象
      this.user = args[1];            // 当前挑战的角色
      this.result = args[2].toInt32(); // 挑战结果: 1==成功
    },
    onLeave: function (retval) {
      try {
        // 只有挑战成功才处理
        if (this.result != 1) {
          return;
        }

        if (st.getState() == C.STATE_END) {
          return;
        }

        // 当前杀死的攻城怪物 ID
        const villageMonsterId = this.villageMonster.add(2).readUShort();
        // 当前阶段击杀每只攻城怪物 PT 点数奖励: (1, 2, 4, 8, 16)
        const bonusPt = Math.pow(2, st.getDifficult());

        // 获取玩家所在队伍
        const party = _GetParty(this.user);
        if (party.isNull()) {
          return;
        }

        // 更新队伍中的所有玩家 PT 点数
        for (var i = 0; i < 4; ++i) {
          var user = _GetPartyUser(party, i);
          if (!user.isNull()) {
            const characNo = ctx.user.getCurCharacNo(user).toString();
            // 记录角色 accid（方便离线充值）
            st.addUserPt(characNo, ctx.user.getAccId(user), bonusPt);

            // 击杀世界 BOSS 额外获得 PT 奖励
            if ((villageMonsterId == C.MONSTER_TAU_META_COW) && (st.getState() == C.STATE_P3)) {
              st.addUserPt(characNo, ctx.user.getAccId(user), 1000 * (1 + st.getDifficult()));
            }
          }
        }

        // ---- P1 阶段处理 ----
        if (st.getState() == C.STATE_P1) {
          st.addScore(bonusPt);

          if (st.getScore() < ctx.villageAttackConfig.target_score[0]) {
            // P1 未完成：击杀牛头统帅则难度 +1
            if (villageMonsterId == C.MONSTER_TAU_CAPTAIN) {
              if (st.getDifficult() < 4) {
                st.setDifficult(st.getDifficult() + 1);
                ctx.va_flow.setDungeonDifficult(st.getDifficult());
                st.setNextVillageMonsterId(C.MONSTER_TAU_CAPTAIN);
                notify.broadcastPhase();
              }
            }
          } else {
            // P1 完成 -> 进入 P2
            st.setState(C.STATE_P2);
            st.setScore(ctx.villageAttackConfig.target_score[0]);
            st.setP2LastKilledTime(0);
            st.setLastKilledMonsterId(0);
            st.setP2KillCombo(0);
            notify.broadcastPhase();
          }
        }
        // ---- P2 阶段处理 ----
        else if (st.getState() == C.STATE_P2) {
          const curTime = ctx.time.getCurSec();
          const diffTime = curTime - st.getP2LastKilledTime();

          // 1 分钟内连续击杀相同攻城怪物
          if ((diffTime < 60) && (villageMonsterId == st.getLastKilledMonsterId())) {
            st.setP2KillCombo(st.getP2KillCombo() + 1);
            if (st.getP2KillCombo() >= 3) {
              // 三连杀增加总 PT
              st.addScore(33);
              st.setLastKilledMonsterId(0);
              st.setP2KillCombo(0);
            }
          } else {
            st.setLastKilledMonsterId(villageMonsterId);
            st.setP2KillCombo(1);
          }
          st.setP2LastKilledTime(curTime);

          // P2 完成 -> 进入 P3
          if (st.getScore() >= ctx.villageAttackConfig.target_score[1]) {
            st.setState(C.STATE_P3);
            st.setScore(ctx.villageAttackConfig.target_score[1]);
            st.setNextVillageMonsterId(C.MONSTER_TAU_META_COW);
            notify.broadcastPhase();
          }
        }
        // ---- P3 阶段处理 ----
        else if (st.getState() == C.STATE_P3) {
          if (villageMonsterId == C.MONSTER_TAU_META_COW) {
            // 更新世界 BOSS 血量（PT）
            st.addScore(25);
            st.setNextVillageMonsterId(C.MONSTER_TAU_META_COW);

            // 世界广播：世界 BOSS 被击杀
            notify.broadcastMessage(
              '<怪物攻城活动> 世界BOSS已被【' + ctx.user.getCurCharacName(this.user) + '】击杀!'
            );

            // P3 完成 -> 防守成功
            if (st.getScore() >= ctx.villageAttackConfig.target_score[2]) {
              st.setDefendSuccess(1);
              // 在 dispatcher 线程结束活动
              ctx.timer.schedule(ctx.va_flow.onEnd, null);
              return;
            }
          }
        }

        // 世界广播当前进度
        notify.updateScoreBroadcast();

        // 通知队伍中的所有玩家更新 PT 点数
        for (var i = 0; i < 4; ++i) {
          var user = _GetPartyUser(party, i);
          if (!user.isNull()) {
            notify.notifyPlayerScore(user);
          }
        }

        // 更新存活 GBL 主教数量
        if (villageMonsterId == C.MONSTER_GBL_POPE) {
          if (st.getGblCnt() > 0) {
            st.setGblCnt(st.getGblCnt() - 1);
          }
        }
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_fight_result] exception: ' + err);
      }
    }
  });

  // =====================================================
  // Hook 3: 控制刷新攻城怪物
  // =====================================================
  // 原函数：village_attacked::CVillageMonsterArea::GetAttackedMonster
  // 来源：从旧 frida.js hook_VillageAttack 第三个 hook 迁移
  // 用途：控制下一只刷新的攻城怪物 ID
  // Hook 点：onLeave 修改刷新出来的怪物 ID
  // 为什么需要这个 hook：原游戏随机刷怪，需要改为按阶段刷特定怪物
  attachOnce('va_get_attacked_monster', addr.village_monster_area_get_attacked_monster, {
    onEnter: function (args) {},
    onLeave: function (retval) {
      try {
        if (retval == 0) {
          return;
        }

        const nextMonster = ptr(retval);
        const nextMonsterId = nextMonster.readUShort();

        // 当前刷新的怪物为机制怪物（牛头统帅或机械牛）
        // 替换为随机普通怪物，避免机制怪物被刷在错误阶段
        if ((nextMonsterId == C.MONSTER_TAU_META_COW) || (nextMonsterId == C.MONSTER_TAU_CAPTAIN)) {
          nextMonster.writeUShort(globalThis.getRandomInt(1, 17));
        }

        // 如果需要刷新指定怪物
        if (st.getNextVillageMonsterId()) {
          if ((st.getState() == C.STATE_P1) || (st.getState() == C.STATE_P2)) {
            // P1/P2 阶段立即刷新指定怪物
            nextMonster.writeUShort(st.getNextVillageMonsterId());
            st.setNextVillageMonsterId(0);
          } else if (st.getState() == C.STATE_P3) {
            // P3 阶段 44% 概率刷新出世界 BOSS
            // 为什么是 44%：来源旧 frida.js 的经验值，平衡了活动趣味性和难度
            if (globalThis.getRandomInt(0, 100) < 44) {
              nextMonster.writeUShort(st.getNextVillageMonsterId());
              st.setNextVillageMonsterId(0);
              notify.broadcastMessage('<怪物攻城活动> 世界BOSS已刷新, 请勇士们前往挑战!');
            }
          }
        }

        // 统计存活 GBL 主教数量
        if (nextMonster.readUShort() == C.MONSTER_GBL_POPE) {
          st.addGblCnt(1);
        }
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_get_attacked_monster] exception: ' + err);
      }
    }
  });

  // =====================================================
  // Hook 4 & 5: 挑战状态跟踪
  // =====================================================

  // 是否正在处理挑战请求
  var g_va_fighting_state = false;
  // 当前正在被挑战的怪物 ID
  var g_va_fighting_monster_id = 0;

  // Hook 4: CParty::OnFightVillageMonster
  // 来源：从旧 frida.js hook_VillageAttack 第四个 hook 迁移
  // 用途：标记正在挑战攻城怪物的状态
  attachOnce('va_on_fight_party', addr.cparty_on_fight_village_monster, {
    onEnter: function (args) {
      try {
        g_va_fighting_state = true;
        g_va_fighting_monster_id = 0;
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_on_fight_party] exception: ' + err);
      }
    },
    onLeave: function (retval) {
      try {
        g_va_fighting_monster_id = 0;
        g_va_fighting_state = false;
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_on_fight_party] onLeave exception: ' + err);
      }
    }
  });

  // Hook 5: village_attacked::CVillageMonster::OnFightVillageMonster
  // 来源：从旧 frida.js hook_VillageAttack 第五个 hook 迁移
  // 用途：记录当前正在挑战的攻城怪物 ID（用于副本内刷怪控制）
  attachOnce('va_on_fight_monster', addr.village_monster_on_fight, {
    onEnter: function (args) {
      try {
        if (g_va_fighting_state) {
          const villageMonster = args[0];
          g_va_fighting_monster_id = villageMonster.add(2).readU16();
        }
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_on_fight_monster] exception: ' + err);
      }
    },
    onLeave: function (retval) {}
  });

  // =====================================================
  // Hook 6: 副本刷怪控制（Replace - 最复杂的 hook）
  // =====================================================
  // 原函数：MapInfo::Add_Mob
  // 来源：从旧 frida.js MapInfo_Add_Mob replace hook 迁移
  // 用途：控制怪物攻城副本内怪物的数量、等级、类型
  // 为什么用 replace：需要完全控制刷怪流程
  // 为什么安全：只在怪物攻城进行且正在挑战时修改怪物属性
  // 为什么需要 try/catch 兜底原函数：
  //   此 hook 直接改写怪物对象内存，任何异常都可能导致
  //   整个副本刷怪流程崩溃。异常时必须回退到原函数
  // 风险：
  //   1. 直接修改怪物对象内存，如果结构体布局变化会导致崩溃
  //   2. 难度 3/4 额外刷怪逻辑涉及 index/uid 重新分配，需要确保唯一性
  const _OriginalAddMob = globalThis.nf(addr.mapinfo_add_mob, 'int', ['pointer', 'pointer']);

  replaceOnce('va_add_mob', addr.mapinfo_add_mob, function (mapInfo, monster) {
    try {
      // 只在怪物攻城状态中处理
      if (g_va_fighting_state && st.getState() != C.STATE_END) {
        // 正在挑战世界 BOSS 时副本内有几率刷出世界 BOSS
        if (g_va_fighting_monster_id == C.MONSTER_TAU_META_COW &&
            st.getState() == C.STATE_P3) {
          const p3Chance = (st.getScore() - ctx.villageAttackConfig.target_score[1]) + (6 * st.getDifficult());
          if (globalThis.getRandomInt(0, 100) < p3Chance) {
            monster.add(0xc).writeUInt(C.MONSTER_TAU_META_COW);
          }
        }

        const diff = st.getDifficult();

        if (diff == 0) {
          // 难度 0: 无变化
          return _OriginalAddMob(mapInfo, monster);
        } else if (diff == 1) {
          // 难度 1: 怪物等级提升至 100 级
          monster.add(16).writeU8(100);
          return _OriginalAddMob(mapInfo, monster);
        } else if (diff == 2) {
          // 难度 2: 怪物等级 110 级，50% 概率刷紫名怪
          monster.add(16).writeU8(110);
          if (monster.add(8).readU8() != 3) {
            if (globalThis.getRandomInt(0, 100) < 50) {
              monster.add(8).writeU8(1);
            }
          }
          return _OriginalAddMob(mapInfo, monster);
        } else if (diff == 3) {
          // 难度 3: 怪物等级 120 级，75% 刷粉名怪，怪物数量 *2
          monster.add(16).writeU8(120);
          if (monster.add(8).readU8() != 3) {
            if (globalThis.getRandomInt(0, 100) < 75) {
              monster.add(8).writeU8(2);
            }
          }
          _OriginalAddMob(mapInfo, monster);

          const uidOffset = 1000;
          monster.writeUInt(monster.readUInt() + uidOffset);
          monster.add(4).writeUInt(monster.add(4).readUInt() + uidOffset);
          return _OriginalAddMob(mapInfo, monster);
        } else if (diff == 4) {
          // 难度 4: 怪物等级 127 级，随机橙名怪，怪物数量 *4
          monster.add(16).writeU8(127);
          if (monster.add(8).readU8() != 3) {
            monster.add(8).writeU8(globalThis.getRandomInt(1, 3));
          }
          _OriginalAddMob(mapInfo, monster);

          const uidOffset2 = 1000;
          var ret = 0;
          for (var cnt = 3; cnt > 0; cnt--) {
            monster.writeUInt(monster.readUInt() + uidOffset2);
            monster.add(4).writeUInt(monster.add(4).readUInt() + uidOffset2);
            ret = _OriginalAddMob(mapInfo, monster);
          }
          return ret;
        }
      }

      // 非怪物攻城状态，执行原始刷怪逻辑
      return _OriginalAddMob(mapInfo, monster);
    } catch (err) {
      // 异常时兜底执行原函数，确保不阻断副本刷怪
      if (ctx.log) ctx.log('[village_attack][va_add_mob] exception, fallback to original: ' + err);
      return _OriginalAddMob(mapInfo, monster);
    }
  }, 'int', ['pointer', 'pointer']);

  // =====================================================
  // Hook 7: 通关额外经验奖励
  // =====================================================
  // 原函数：village_attacked::CVillageMonsterMgr::OnKillVillageMonster
  // 来源：从旧 frida.js hook_VillageAttack 最后一个 hook 迁移
  // 用途：挑战成功时给队伍所有成员发送额外经验奖励
  // Hook 点：onLeave retval==0 且 result==1 时发经验
  attachOnce('va_kill_village_monster', addr.villagemonstermgr_on_kill_village_monster, {
    onEnter: function (args) {
      this.user = args[1];
      this.result = args[2].toInt32();
    },
    onLeave: function (retval) {
      try {
        if (retval == 0 && this.result) {
          const party = _GetParty(this.user);

          // 给队伍所有成员发额外经验
          for (var i = 0; i < 4; ++i) {
            const user = _GetPartyUser(party, i);
            if (!user.isNull()) {
              const curLevel = ctx.user.getCharacLevel(user);
              // 随机经验奖励：当前等级升级所需经验的 0%-0.1%
              const rewardExp = Math.floor(
                ctx.user.getLevelUpExp(user, curLevel) * globalThis.getRandomInt(0, 1000) / 1000000
              );
              ctx.user.gainExpSp(user, rewardExp);
              ctx.user.sendNotiPacketMessage(user, '怪物攻城挑战成功, 获取额外经验奖励' + rewardExp, 0);
            }
          }
        }
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_kill_village_monster] exception: ' + err);
      }
    }
  });

  // 返回可被外部查询的状态变量
  return {
    isFighting: function () { return g_va_fighting_state; },
    fightingMonsterId: function () { return g_va_fighting_monster_id; },
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createVillageAttackHooks = createVillageAttackHooks;
}
// 怪物攻城活动入口模块
// 来源：从旧 frida.js start_event_villageattack() 迁移
// 用途：启动怪物攻城功能的所有子模块
//
// 启动顺序：
// 1. constants.js（已经通过 globalThis 加载）
// 2. state.js（活动状态管理）
// 3. db.js（数据库持久化）
// 4. notify.js（通知系统）
// 5. flow.js（流程控制）
// 6. hooks.js（hook 注册）
// 7. reward.js（奖励发放）
// 8. settlement.js（结算）

var g_village_attack_started = false;

function startVillageAttackFeature(ctx) {
  if (g_village_attack_started) {
    console.log('[village_attack] already started');
    return;
  }

  try {
    // 配置覆盖默认值
    ctx.villageAttackConfig = {
      start_hour: ctx.config.village_attack.start_hour || 12,
      total_time: ctx.config.village_attack.total_time || 3600,
      target_score: ctx.config.village_attack.target_score || [100, 200, 300],
    };

    // 需要传递给 flow/reward 的配置通过 ctx 传递
    // state 和 constants 已经通过 globalThis 全局可用

    // 初始化数据库模块（使用 ctx.fridaDb 而非 raw ctx.msql）
    // ctx.fridaDb 是绑定 frida 句柄的便捷 DB 对象
    var vaDb = null;
    if (ctx.fridaDb) {
      vaDb = globalThis.createVillageAttackDb(ctx.fridaDb);
    }
    ctx.va_db = vaDb;

    // 从数据库加载活动状态
    if (vaDb) {
      const savedInfo = vaDb.load();
      if (savedInfo) {
        globalThis.village_attack_state.setInfo(savedInfo);
      }
    }

    // 初始化通知模块
    ctx.va_notify = globalThis.createVillageAttackNotify(ctx);

    // 初始化流程模块（先创建，因为 hooks 和 settlement 需要引用它）
    const vaFlow = globalThis.createVillageAttackFlow(ctx);
    ctx.va_flow = vaFlow;

    // 初始化奖励模块
    ctx.va_reward = globalThis.createVillageAttackReward(ctx);

    // 初始化结算模块
    const vaSettlement = globalThis.createVillageAttackSettlement(ctx);
    ctx.va_settlement = vaSettlement.settle;

    // 根据角色 charac_no 查询角色名（结算时广播用）
    // 使用 ctx.fridaDb 进行查询
    ctx.va_getCharacNameByNo = function (characNo) {
      // 从数据库查询角色名
      // 风险：直接拼接 SQL，characNo 为数字类型是安全的
      const fridaDb = ctx.fridaDb;
      if (!fridaDb) {
        return characNo.toString();
      }
      if (fridaDb.exec("select charac_name from charac_info where charac_no=" + characNo + ";")) {
        if (fridaDb.getNRows() == 1) {
          fridaDb.fetch();
          const name = fridaDb.getStr(0);
          if (name) {
            return name;
          }
        }
      }
      return characNo.toString();
    };

    // 注册所有 hook（这是启动的关键步骤）
    globalThis.createVillageAttackHooks(ctx);

    // 启动活动流程（恢复计时器 or 等待下一轮）
    vaFlow.initFlow();

    g_village_attack_started = true;
    if (ctx.log) ctx.log('[village_attack] started');
  } catch (err) {
    if (ctx.log) ctx.log('[village_attack] failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.startVillageAttackFeature = startVillageAttackFeature;
}
// 启动辅助模块
// 来源：从旧 frida.js 工具函数迁移并重构，对齐 main 分支 dp_load 模式
// 用途：
//   - 提供 safeLoadModule() 通过 dp_load 加载模块（带缓存）
//   - 提供创建 startup helpers 对象（日志辅助等）

// 模块加载缓存，避免同一启动流程重复 load
var g_startup_loaded_modules = (typeof g_startup_loaded_modules !== 'undefined') ? g_startup_loaded_modules : {};

// 通过 dp_load 安全加载模块
// moduleName: 模块路径名（如 'core/hook_guard'、'features/ranking'）
// 返回: true=加载成功或已加载, false=加载失败
function safeLoadModule(moduleName) {
  if (!moduleName) {
    return false;
  }

  // 已加载过，跳过
  if (g_startup_loaded_modules[moduleName] === true) {
    return true;
  }

  // dp_load 不存在时无法加载
  if (typeof dp_load !== 'function') {
    console.log('[startup] dp_load 不存在，无法加载模块: ' + moduleName);
    return false;
  }

  try {
    var ok = dp_load(moduleName);
    if (ok !== true) {
      console.log('[startup] dp_load 返回失败: ' + moduleName);
      return false;
    }

    g_startup_loaded_modules[moduleName] = true;
    return true;
  } catch (e) {
    console.log('[startup] dp_load 异常: ' + moduleName + ', error=' + e);
    return false;
  }
}

// 获取服务器环境配置
// 来源：从旧 frida.js G_CEnvironment + CEnvironment_get_file_name 迁移
function createStartupHelpers(addr) {
  var _G_CEnvironment = nf(addr.g_cenvironment, 'pointer', []);
  var _GetFileName = nf(addr.cenvironment_get_file_name, 'pointer', ['pointer']);

  function getChannelName() {
    try {
      var filename = _GetFileName(_G_CEnvironment());
      return filename.readUtf8String(-1);
    } catch (e) {
      return 'unknown';
    }
  }

  // 启动日志辅助
  function logStartup(msg) {
    console.log('[startup] ' + msg);
  }

  function logModuleStart(name) {
    console.log('[startup] starting module: ' + name);
  }

  function logModuleDone(name) {
    console.log('[startup] module started: ' + name);
  }

  function logModuleFailed(name, err) {
    console.log('[startup] module FAILED: ' + name + ' - ' + err);
  }

  return {
    getChannelName: getChannelName,
    logStartup: logStartup,
    logModuleStart: logModuleStart,
    logModuleDone: logModuleDone,
    logModuleFailed: logModuleFailed,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.safeLoadModule = safeLoadModule;
  globalThis.g_startup_loaded_modules = g_startup_loaded_modules;
  globalThis.createStartupHelpers = createStartupHelpers;
}
// 模块启动调度中心
// 来源：从旧 frida.js start() 迁移并重构
// 用途：按配置和顺序启动所有 JS 模块
//
// 在 dp_load 模式下，本文件被 df_game_r.js 通过 dp_load('startup_modules') 加载。
// 加载后会先通过 safeLoadModule() 加载所有依赖子模块，
// 再按 ctx 模式创建 bindings 并启动各功能模块。
//
// 启动顺序推荐（来源：模块依赖关系）：
// 1. Logger/Config（任何模块都依赖日志和配置）
// 2. Runtime Addresses（bindings 依赖地址）
// 3. Native Bindings（所有功能模块依赖 binding）
// 4. Timer Dispatcher（异步任务调度必须最先启动）
// 5. Database（排行榜和怪物攻城需要 DB）
// 6. 基础 Patch 类（tod_fix, emblem_fix, hidden_option, return_user）
// 7. 事件类（user_inout, ranking）
// 8. 大型活动（village_attack）
// 9. 可选模块（online_reward）

var g_runtime_modules_started = false;

// 加载所有依赖子模块（dp_load 模式下必须主动加载）
// 顺序必须与 tools/build_frida_bundle.js 中的拼接顺序一致
//
// 返回: true=全部加载成功或 bundle fallback 模式，false=有模块加载失败
function loadRuntimeDependencies() {
  // bundle fallback：如果 dp_load 不存在，说明可能是 dist/df_game_r.bundle.js 单文件模式
  // 此时模块已经在拼接时加载完成，不需要动态加载依赖
  if (typeof dp_load !== 'function') {
    console.log('[startup] dp_load 不存在，按 bundle fallback 模式运行，跳过动态依赖加载');
    return true;
  }

  if (typeof safeLoadModule !== 'function') {
    console.log('[startup] safeLoadModule 不存在，无法加载依赖模块，终止 runtime 启动');
    return false;
  }

  var modules = [
    // 核心和 binding 已经在 df_game_r.js 中预加载：
    //   runtime_addresses, runtime_config, core/hook_guard,
    //   startup_helpers, startup_modules（本文件）
    // 以下加载其余所有依赖：

    'bindings/native_functions',

    'core/logger',
    'core/time',
    'core/random',
    'core/memory',
    'core/file',

    'bindings/packet',
    'bindings/mysql',
    'bindings/user',
    'bindings/inventory',
    'bindings/item',
    'bindings/mail',
    'bindings/game_world',
    'bindings/timer_dispatcher',
    'bindings/quest',

    'features/tod_fix',
    'features/emblem_fix',
    'features/hidden_option',
    'features/return_user',
    'features/online_reward',
    'features/ranking',
    'features/user_inout',

    'features/village_attack/constants',
    'features/village_attack/state',
    'features/village_attack/db',
    'features/village_attack/notify',
    'features/village_attack/reward',
    'features/village_attack/settlement',
    'features/village_attack/flow',
    'features/village_attack/hooks',
    'features/village_attack/index',
  ];

  var allOk = true;
  for (var i = 0; i < modules.length; i++) {
    if (!safeLoadModule(modules[i])) {
      console.log('[startup] 依赖模块加载失败: ' + modules[i]);
      allOk = false;
    }
  }

  if (!allOk) {
    console.log('[startup] 依赖模块加载失败，终止 runtime 启动');
    return false;
  }

  return true;
}

function startRuntimeModules() {
  if (g_runtime_modules_started) {
    console.log('[startup] runtime modules already started');
    return true;
  }

  console.log('==================== frida runtime start ====================');

  // dp_load 模式：先加载所有依赖子模块
  // bundle 模式：dp_load 不存在时返回 true，不报错
  if (!loadRuntimeDependencies()) {
    return false;
  }

  const addr = globalThis.PROJECT_ADDRESSES;
  const cfg = globalThis.PROJECT_JS_CONFIG;
  const helpers = globalThis.createStartupHelpers(addr);

  helpers.logStartup('initializing runtime...');

  // ---- 第 1 步：Logger ----
  helpers.logModuleStart('logger');
  var logger;
  try {
    logger = globalThis.createLogger({ getChannelName: helpers.getChannelName });
    helpers.logModuleDone('logger');
  } catch (err) {
    helpers.logModuleFailed('logger', err);
    logger = { log: console.log, getTimestamp: function () { return ''; } };
  }

  // ---- 第 2 步：Config（已由文件加载到 globalThis，此处做校验） ----
  helpers.logModuleStart('config');
  if (!cfg || !cfg.features) {
    helpers.logModuleFailed('config', 'PROJECT_JS_CONFIG not found');
    return;
  }
  helpers.logModuleDone('config');

  // ---- 第 3 步：Time Module ----
  helpers.logModuleStart('time');
  var timeMod;
  try {
    timeMod = globalThis.createTimeModule({
      system_time: addr.globaldata_system_time,
    });
    helpers.logModuleDone('time');
  } catch (err) {
    helpers.logModuleFailed('time', err);
    timeMod = { getCurSec: function () { return 0; } };
  }

  // ---- 第 4 步：Native Bindings ----
  helpers.logModuleStart('bindings');

  var packetBind, mysqlBind, userBind, inventoryBind, itemBind, mailBind, gwBind, timerBind, questBind;

  try {
    packetBind = globalThis.createPacketBinding(addr);
    helpers.logModuleDone('packet binding');
  } catch (err) { helpers.logModuleFailed('packet binding', err); packetBind = null; }

  try {
    mysqlBind = globalThis.createMysqlBinding(addr);
    helpers.logModuleDone('mysql binding');
  } catch (err) { helpers.logModuleFailed('mysql binding', err); mysqlBind = null; }

  try {
    userBind = globalThis.createUserBinding(addr);
    helpers.logModuleDone('user binding');
  } catch (err) { helpers.logModuleFailed('user binding', err); userBind = null; }

  try {
    inventoryBind = globalThis.createInventoryBinding(addr);
    helpers.logModuleDone('inventory binding');
  } catch (err) { helpers.logModuleFailed('inventory binding', err); inventoryBind = null; }

  try {
    itemBind = globalThis.createItemBinding(addr);
    helpers.logModuleDone('item binding');
  } catch (err) { helpers.logModuleFailed('item binding', err); itemBind = null; }

  try {
    mailBind = globalThis.createMailBinding(addr);
    helpers.logModuleDone('mail binding');
  } catch (err) { helpers.logModuleFailed('mail binding', err); mailBind = null; }

  try {
    gwBind = globalThis.createGameWorldBinding(addr);
    helpers.logModuleDone('game_world binding');
  } catch (err) { helpers.logModuleFailed('game_world binding', err); gwBind = null; }

  try {
    timerBind = globalThis.createTimerDispatcherBinding(addr);
    helpers.logModuleDone('timer_dispatcher binding');
  } catch (err) { helpers.logModuleFailed('timer_dispatcher binding', err); timerBind = null; }

  try {
    questBind = globalThis.createQuestBinding(addr);
    helpers.logModuleDone('quest binding');
  } catch (err) { helpers.logModuleFailed('quest binding', err); questBind = null; }

  // ---- 构建 ctx 对象（模块之间通过 ctx 通信） ----
  //
  // 数据库上下文说明：
  //   ctx.mysql    = MySQL binding 本身（用于 open/close 等操作）
  //   ctx.db       = 原始数据库句柄集合 { taiwanCain, taiwanCain2nd, taiwanBilling, frida }
  //   ctx.fridaDb  = 绑定 frida 句柄的便捷 DB 对象（用于 exec/fetch/getStr 等）
  //
  // 日志上下文说明：
  //   ctx.logger   = logger 完整对象（有 .log() 和 .getTimestamp()）
  //   ctx.log      = 便捷日志函数 logger.log(msg)
  const ctx = {
    addresses: addr,
    config: cfg,
    logger: logger,
    log: function (msg) {
      logger.log(msg);
    },
    time: timeMod,
    packet: packetBind,
    mysql: mysqlBind,     // MySQL binding（底层 API: exec(handle, sql), close(handle) 等）
    db: null,             // 原始数据库句柄集合，数据库初始化后填充
    fridaDb: null,        // 绑定 frida 句柄的便捷 DB 对象，数据库初始化后填充
    user: userBind,
    inventory: inventoryBind,
    item: itemBind,
    mail: mailBind,
    gw: gwBind,
    timer: timerBind,
    quest: questBind,
  };

  // ---- 第 5 步：Timer Dispatcher ----
  // 为什么必须第一个：所有异步任务都需要在 dispatcher 线程执行
  if (cfg.features.timer_dispatcher) {
    helpers.logModuleStart('timer_dispatcher');
    try {
      // 挂接消息分发线程，确保代码线程安全
      // 来源：从旧 frida.js hook_TimerDispatcher_dispatch 迁移
      attachOnce('timer_dispatcher', addr.timer_dispatcher_dispatch, {
        onEnter: function (args) {},
        onLeave: function (retval) {
          if (timerBind) {
            timerBind.dispatch();
          }
        }
      });
      helpers.logModuleDone('timer_dispatcher');
    } catch (err) {
      helpers.logModuleFailed('timer_dispatcher', err);
    }
  }

  // ---- 第 6 步：Database 初始化 ----
  // 来源：从旧 frida.js init_db 迁移
  var dbInitialized = false;
  if (cfg.features.database) {
    helpers.logModuleStart('database');
    try {
      // 加载本地配置文件（数据库连接信息）
      const fileMod = globalThis.createFileModule();
      const globalConfig = fileMod.loadConfig('frida_config.json');

      if (!globalConfig) {
        // 配置文件读取失败，无法获取数据库账号
        console.log('[database] frida_config.json 读取失败，数据库账号为空，跳过数据库初始化');
      } else {
        const dbConfig = globalConfig['db_config'] || {};

        if (!dbConfig['account'] || !dbConfig['password']) {
          console.log('[database] frida_config.json 中 db_config.account/password 为空，跳过数据库初始化');
        } else if (mysqlBind) {
          // 初始化数据库连接
          // 风险：数据库连接信息使用 localhost:3306，生产环境需从配置读取
          const mysqlTaiwanCain = mysqlBind.open('taiwan_cain', '127.0.0.1', 3306, dbConfig['account'], dbConfig['password']);
          const mysqlTaiwanCain2nd = mysqlBind.open('taiwan_cain_2nd', '127.0.0.1', 3306, dbConfig['account'], dbConfig['password']);
          const mysqlTaiwanBilling = mysqlBind.open('taiwan_billing', '127.0.0.1', 3306, dbConfig['account'], dbConfig['password']);

          // 建库 frida
          if (mysqlTaiwanCain) {
            mysqlBind.exec(mysqlTaiwanCain, 'create database if not exists frida default charset utf8;');
          }

          const mysqlFrida = mysqlBind.open('frida', '127.0.0.1', 3306, dbConfig['account'], dbConfig['password']);

          if (mysqlFrida) {
            // 建表 game_event（存储活动数据和排行榜）
            mysqlBind.exec(mysqlFrida,
              'CREATE TABLE game_event (' +
              'event_id varchar(30) NOT NULL, event_info mediumtext NULL,' +
              'PRIMARY KEY (event_id)' +
              ') ENGINE=InnoDB DEFAULT CHARSET=utf8;'
            );

            // 保存数据库句柄集合
            ctx.db = {
              taiwanCain: mysqlTaiwanCain,
              taiwanCain2nd: mysqlTaiwanCain2nd,
              taiwanBilling: mysqlTaiwanBilling,
              frida: mysqlFrida,
            };

            // 创建绑定 frida 句柄的便捷 DB 对象
            // 为什么需要这个东西：
            //   mysqlBind 的 exec/getNRows/fetch/getStr 等函数第一个参数是 mysql 句柄
            //   业务模块不直接操作 mysql 句柄，通过 fridaDb 简化调用
            ctx.fridaDb = createBoundMysqlDb(mysqlBind, mysqlFrida);

            dbInitialized = true;
          } else {
            console.log('[database] frida 数据库连接失败');
          }
        }
      }
      helpers.logModuleDone('database');
    } catch (err) {
      helpers.logModuleFailed('database', err);
    }
  }

  // ---- 第 7 步：基础修复类模块 ----
  // tod_fix: 绝望之塔修复
  if (cfg.features.tod_fix) {
    helpers.logModuleStart('tod_fix');
    try { globalThis.startTodFixFeature(ctx); helpers.logModuleDone('tod_fix'); }
    catch (err) { helpers.logModuleFailed('tod_fix', err); }
  }

  // emblem_fix: 时装徽章镶嵌修复
  if (cfg.features.emblem_fix) {
    helpers.logModuleStart('emblem_fix');
    try { globalThis.startEmblemFixFeature(ctx); helpers.logModuleDone('emblem_fix'); }
    catch (err) { helpers.logModuleFailed('emblem_fix', err); }
  }

  // hidden_option: 时装潜能
  if (cfg.features.hidden_option) {
    helpers.logModuleStart('hidden_option');
    try { globalThis.startHiddenOptionFeature(ctx); helpers.logModuleDone('hidden_option'); }
    catch (err) { helpers.logModuleFailed('hidden_option', err); }
  }

  // return_user: 勇士归来
  if (cfg.features.return_user) {
    helpers.logModuleStart('return_user');
    try { globalThis.startReturnUserFeature(ctx); helpers.logModuleDone('return_user'); }
    catch (err) { helpers.logModuleFailed('return_user', err); }
  }

  // ---- 第 8 步：事件/排行榜类模块 ----
  // ranking: 战力排行
  if (cfg.features.ranking) {
    helpers.logModuleStart('ranking');
    try {
      // 如果数据库未初始化，排行榜无法持久化，但仍然可以启动
      // 启动时输出中文日志说明
      if (!dbInitialized) {
        console.log('[ranking] 数据库未初始化，排行榜将无法持久化');
      }
      globalThis.startRankingFeature(ctx);
      // 保存排行榜的 save 回调，供 dispose 时使用
      ctx._rankingSaveToDb = function () {
        if (globalThis.ranking_saveToDb && ctx.fridaDb) {
          globalThis.ranking_saveToDb(ctx.fridaDb);
        }
      };
      helpers.logModuleDone('ranking');
    }
    catch (err) { helpers.logModuleFailed('ranking', err); }
  }

  // user_inout: 玩家上下线处理
  if (cfg.features.user_inout) {
    helpers.logModuleStart('user_inout');
    try {
      // 设置事件回调（解耦 user_inout 和 ranking/village_attack）
      ctx.onUserEnter = function (curUser) {
        // 排行榜下发
        if (globalThis.ranking_onUserEnter) {
          globalThis.ranking_onUserEnter(ctx, curUser);
        }
      };

      ctx.onUserLeave = function (curUser) {
        // 排行榜更新
        if (globalThis.ranking_onUserLeave) {
          globalThis.ranking_onUserLeave(ctx, curUser);
        }
      };

      ctx.onUserEnterVillageAttack = function (curUser) {
        // 怪物攻城进度通知（village_attack 模块会设置 ctx.va_notify）
        if (ctx.va_notify) {
          ctx.va_notify.notifyPlayerScore(curUser);
          ctx.va_notify.broadcastPhase();
        }
      };

      globalThis.startUserInoutFeature(ctx);
      helpers.logModuleDone('user_inout');
    }
    catch (err) { helpers.logModuleFailed('user_inout', err); }
  }

  // ---- 第 9 步：大型活动模块 ----
  // village_attack: 怪物攻城
  if (cfg.features.village_attack) {
    helpers.logModuleStart('village_attack');
    try {
      if (!dbInitialized) {
        console.log('[village_attack] 数据库未初始化，活动数据将无法持久化');
      }
      globalThis.startVillageAttackFeature(ctx);
      // 保存数据库保存回调供 dispose 使用
      ctx._villageAttackSaveToDb = function () {
        if (ctx.va_db) {
          ctx.va_db.save(globalThis.village_attack_state.getInfo());
        }
      };
      helpers.logModuleDone('village_attack');
    }
    catch (err) { helpers.logModuleFailed('village_attack', err); }
  }

  // ---- 第 10 步：可选模块 ----
  // online_reward: 在线奖励（默认关闭，高风险）
  if (cfg.features.online_reward) {
    helpers.logModuleStart('online_reward');
    try { globalThis.startOnlineRewardFeature(ctx); helpers.logModuleDone('online_reward'); }
    catch (err) { helpers.logModuleFailed('online_reward', err); }
  }

  // 保存 ctx 到 globalThis 供 dispose 使用
  globalThis._runtimeCtx = ctx;

  g_runtime_modules_started = true;
  console.log('==================== frida runtime started ====================');
  return true;
}

// ---- 辅助函数：创建绑定 MySQL 句柄的便捷 DB 对象 ----
// mysqlBind: createMysqlBinding 返回的 binding 对象
// mysqlHandle: MySQL 连接的原始指针（由 mysqlBind.open 返回）
//
// 为什么需要这个函数：
//   mysqlBind 的 exec/getNRows/fetch/getStr 等函数第一个参数是 mysql 句柄
//   业务模块不应该直接持有和传递句柄，通过此对象统一管理
function createBoundMysqlDb(mysqlBind, mysqlHandle) {
  // 为什么需要这里统一 exec() 的布尔语义：
  //   底层 MySQLExec 在游戏引擎中的返回值约定为「非零成功，零失败」，
  //   业务模块不应直接依赖底层 raw 返回码。
  //   exec() 返回布尔值：true=执行成功，false=执行失败。
  //   execRaw() 返回底层原始值，供需要检查底层返回码时使用。
  return {
    // 业务层通用接口：返回布尔值，true 表示 SQL 执行成功
    exec: function (sql) {
      // 底层非零=成功，零=失败
      return mysqlBind.exec(mysqlHandle, sql) != 0;
    },
    // 底层原始接口：返回游戏引擎的原始返回码（非零=成功，零=失败）
    execRaw: function (sql) {
      return mysqlBind.exec(mysqlHandle, sql);
    },
    getNRows: function () {
      return mysqlBind.getNRows(mysqlHandle);
    },
    fetch: function () {
      return mysqlBind.fetch(mysqlHandle);
    },
    getInt: function (index) {
      return mysqlBind.getInt(mysqlHandle, index);
    },
    getStr: function (index) {
      return mysqlBind.getStr(mysqlHandle, index);
    },
    getBinary: function (index) {
      return mysqlBind.getBinary(mysqlHandle, index);
    },
    // 原始句柄引用（仅在需要创建第二个 bound db 时使用）
    raw: mysqlHandle,
  };
}

// 模块卸载清理
function disposeRuntimeModules() {
  console.log('-------------------- frida dispose --------------------');

  const ctx = globalThis._runtimeCtx;
  if (!ctx) {
    return;
  }

  try {
    // 保存排行数据
    if (ctx._rankingSaveToDb) {
      ctx._rankingSaveToDb();
    }

    // 保存怪物攻城数据
    if (ctx._villageAttackSaveToDb) {
      ctx._villageAttackSaveToDb();
    }

    // 关闭数据库连接（使用 ctx.mysql binding 的 close 函数）
    if (ctx.db && ctx.mysql) {
      const db = ctx.db;
      if (db.frida) {
        ctx.mysql.close(db.frida);
      }
      if (db.taiwanCain) {
        ctx.mysql.close(db.taiwanCain);
      }
      if (db.taiwanCain2nd) {
        ctx.mysql.close(db.taiwanCain2nd);
      }
      if (db.taiwanBilling) {
        ctx.mysql.close(db.taiwanBilling);
      }
    }
  } catch (err) {
    console.log('[dispose] error: ' + err);
  }

  console.log('-------------------- frida dispose done --------------------');
}

if (typeof globalThis !== 'undefined') {
  globalThis.startRuntimeModules = startRuntimeModules;
  globalThis.disposeRuntimeModules = disposeRuntimeModules;
  globalThis.createBoundMysqlDb = createBoundMysqlDb;
}
// clean runtime project JS entry
// 默认部署文件：df_game_r.js
// 该文件通过 dp_load 动态加载 script/js 模块，不直接写业务逻辑。
//
// 职责：
// - early 阶段：通过 dp_load 加载启动模块后，等待服务器初始化延迟启动
// - 非 early 阶段（热重载）：直接启动
// - dispose 阶段：调用统一清理函数
//
// 真实业务逻辑全部在 script/js/ 目录下的模块中。
// 不要在此文件中出现真实地址、NativeFunction、业务函数。
//
// 所有 hook（包括本文件的 early hook）都通过 attachOnce 注册，
// 防止热重载时重复 attach。
//
// 部署说明：
//   默认部署 df_game_r.js，通过 dp_load 动态加载 script/js 模块。
//   dist/df_game_r.bundle.js 仅作为无 dp_load 环境的 fallback / 静态检查产物。

var g_entry_started = false;

function entryLog(msg) {
  console.log('[entry] ' + msg);
}

// 使用 dp_load 加载模块
function loadEntryModule(name) {
  if (typeof dp_load !== 'function') {
    entryLog('dp_load 不存在，无法加载模块: ' + name);
    return false;
  }

  try {
    var ok = dp_load(name);
    if (ok !== true) {
      entryLog('dp_load 返回失败: ' + name);
      return false;
    }
    return true;
  } catch (e) {
    entryLog('dp_load 异常: ' + name + ', error=' + e);
    return false;
  }
}

// 加载启动所需的最小依赖
// 顺序不能乱：addresses/config -> hook_guard -> startup_helpers -> startup_modules
function loadRuntimeBootstrapModules() {
  var ok = true;

  // 第 1 步：地址表和配置（所有模块依赖它们）
  ok = loadEntryModule('runtime_addresses') && ok;
  ok = loadEntryModule('runtime_config') && ok;

  // 第 2 步：hook guard（early hook 需要 attachOnce）
  ok = loadEntryModule('core/hook_guard') && ok;

  // 第 3 步：启动辅助和调度（负责加载后续所有模块）
  ok = loadEntryModule('startup_helpers') && ok;
  ok = loadEntryModule('startup_modules') && ok;

  return ok;
}

rpc.exports = {
  init: function (stage, parameters) {
    if (stage == 'early') {
      // 首次加载插件：等待服务器初始化后再加载
      // 为什么需要等待：服务器初始化完成前不能 hook，
      // 否则可能访问未初始化的数据导致崩溃
      // 来源：从旧 frida.js awake() 迁移
      awake();
    } else {
      // 热重载：直接启动
      start();
    }
  },

  dispose: function () {
    // 统一调用模块清理函数
    if (typeof globalThis.disposeRuntimeModules === 'function') {
      globalThis.disposeRuntimeModules();
    }
    console.log('-------------------- frida dispose --------------------');
  },
};

// 延迟启动：加载引导模块，注册 check_argv hook
function awake() {
  // 先加载引导模块（addresses, config, hook_guard, helpers, modules）
  // 必须在 attachOnce 前执行，否则 attachOnce 不可用
  loadRuntimeBootstrapModules();

  var addr = globalThis.PROJECT_ADDRESSES;
  if (!addr || !addr.check_argv) {
    // 地址不可用，直接启动
    entryLog('check_argv 地址不可用，直接启动');
    start();
    return;
  }

  if (typeof globalThis.attachOnce !== 'function') {
    // attachOnce 未加载，无法注册延迟启动 hook
    entryLog('attachOnce 不存在，无法注册 check_argv 延迟启动 hook，直接启动');
    start();
    return;
  }

  // 使用 attachOnce 防重复注册
  // attachOnce 返回 false 表示注册失败（地址异常、函数不可 hook 等），
  // 此时必须兜底直接启动，否则整个 runtime 静默不启动
  var attached = globalThis.attachOnce('runtime_check_argv', addr.check_argv, {
    onEnter: function (args) {},
    onLeave: function (retval) {
      // check_argv 执行完毕=服务器初始化完成，开始加载
      start();
    }
  });

  if (!attached) {
    entryLog('check_argv hook 注册失败，直接启动');
    start();
  }
}

// 启动函数
function start() {
  if (g_entry_started) {
    entryLog('runtime already started, skip');
    return;
  }

  entryLog('frida init');

  // 加载引导模块（热重载路径可能还没加载）
  loadRuntimeBootstrapModules();

  // startRuntimeModules 在 startup_modules.js 中定义，
  // 通过 dp_load 加载后挂载到 globalThis
  if (typeof globalThis.startRuntimeModules !== 'function') {
    entryLog('startRuntimeModules 不存在，请确认 df_game_r.js 已通过 dp_load 成功加载 startup_modules');
    return;
  }

  try {
    var started = globalThis.startRuntimeModules();
    if (started === false) {
      entryLog('runtime start failed，等待下次重试');
      return;
    }

    g_entry_started = true;
    entryLog('frida started');
  } catch (e) {
    entryLog('runtime start exception: ' + e);
  }
}
