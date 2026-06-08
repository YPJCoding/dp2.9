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

var PROJECT_ADDRESSES = {

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

  // ---- 字符串长度函数 ----

  // strlen (libc)
  // 来源：从旧 frida.js strlen 迁移
  // 用途：计算字符串长度
  strlen: ptr('0x0807E3B0'),
};

if (typeof globalThis !== 'undefined') {
  globalThis.PROJECT_ADDRESSES = PROJECT_ADDRESSES;
}
