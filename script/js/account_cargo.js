// 存放所有用户的账号金库数据
var accountCargfo = {};
function setMaxCAccountCargoSolt(maxSolt) {
	console.log(1);
	GetMoney(maxSolt);
	CAccountCargo(maxSolt);
	GetCapacity(maxSolt);
	SetDBData(maxSolt);
	Clear(maxSolt);
	InsertItem(maxSolt);
	DeleteItem(maxSolt);
	MoveItem(maxSolt);
	DepositMoney(maxSolt);
	WithdrawMoney(maxSolt);
	CheckMoneyLimit(maxSolt);
	CheckValidSlot(maxSolt);
	GetEmptySlot(maxSolt);
	GetSpecificItemSlot(maxSolt);
	AddMoney(maxSolt);
	SubMoney(maxSolt);
	GetItemCount(maxSolt);
	SendNotifyMoney(maxSolt);
	SendItemList(maxSolt);
	IsAlter(maxSolt);
	SetCapacity(maxSolt);
	SetStable(maxSolt);
	DB_SaveAccountCargo_makeRequest(maxSolt);
	GetAccountCargo(accountCargfo);
	MakeItemPacket(maxSolt);
	CheckStackLimit(maxSolt);
	CheckSlotEmpty(maxSolt);
	//CheckInsertCondition(maxSolt);
	GetSlotRef(maxSolt);
	GetSlot(maxSolt);
	ResetSlot(maxSolt);
	DB_LoadAccountCargo_dispatch(maxSolt);
	DB_SaveAccountCargo_dispatch(maxSolt);
	IsExistAccountCargo();
	//userLogout();
	//console.log(2);
}

function IsExistAccountCargo() {
	Interceptor.attach(ptr(0x0822fc30),
		{

			onEnter: function (args) {
				console.log('[' + get_timestamp() + '] [frida] [info] IsExistAccountCargo start:' + args[0])
			},
			onLeave: function (retval) {
				console.log('[' + get_timestamp() + '] [frida] [info] IsExistAccountCargo end:' + retval)
			}
		});
}

function DB_SaveAccountCargo_dispatch(maxSolt) {
	Interceptor.replace(ptr(0x0843b7c2), new NativeCallback(function (dbcargoRef, a2, a3, a4) {
		console.log("DB_SaveAccountCargo_dispatch -------------:")
		var v14 = Memory.alloc(4);
		v14.writeU32(0);
		Stream_operator_p(a4, v14.toInt32());
		var v4 = NumberToString(v14.readU32(), 0);
		console.log("mid:" + ptr(v4).readUtf8String(-1));

		var out = Stream_GetOutBuffer_SIG_ACCOUNT_CARGO_DATA(a4);
		var outPtr = ptr(out);
		var v17Addr = Memory.alloc(4);
		v17Addr.writeInt(61 * maxSolt);
		var readBuff = Memory.alloc(61 * maxSolt);
		if (compress_zip(readBuff, v17Addr, outPtr.add(8), 61 * maxSolt) != 1) {
			return 0;
		}
		var dbHandelAddr = DBMgr_GetDBHandle(ptr(ptr(0x0940BDAC).readU32()), 2, 0);
		var dbHandel = ptr(dbHandelAddr);
		var blobPtr = MySQL_blob_to_str(dbHandel, 0, readBuff, v17Addr.readU32());
		console.log('blob: ' + blobPtr + ' ' + outPtr.readU32() + ' ' + outPtr.add(4).readU32() + '  ');
		MySQL_set_query_6(dbHandel, Memory.allocUtf8String("upDate account_cargo set capacity=%u, money=%u, cargo='%s' where m_id = %s")
			, outPtr.readU32(), outPtr.add(4).readU32(), blobPtr.toInt32(), ptr(v4).toInt32());
		return MySQL_exec(dbHandel, 1) == 1 ? 1 : 0;
	}, 'int', ['pointer', 'int', 'int', 'pointer']));
}

function DB_LoadAccountCargo_dispatch(maxSolt) {
	Interceptor.replace(ptr(0x0843b3b6), new NativeCallback(function (dbcargoRef, a2, a3, a4) {
		console.log('DB_LoadAccountCargo_dispatch:::' + dbcargoRef + ',' + a2 + ',' + a3 + ',' + a4);

		var v19 = Memory.alloc(4);
		v19.writeU32(0);
		Stream_operator_p(a4, v19.toInt32());
		var v4 = NumberToString(v19.readU32(), 0);
		console.log("mid:" + ptr(v4).readUtf8String(-1))

		var dbHandelAddr = DBMgr_GetDBHandle(ptr(ptr(0x0940BDAC).readU32()), 2, 0);
		var dbHandel = ptr(dbHandelAddr);
		console.log('dbHandel:' + dbHandel);

		MySQL_set_query_3(dbHandel, Memory.allocUtf8String('seLect capacity, money, cargo from account_cargo where m_id = %s'), ptr(v4));
		if (MySQL_exec(dbHandel, 1) != 1) {
			console.log("exec fail :")
			return 0;
		}
		if (MySQL_get_n_rows(dbHandel) == 0) {
			console.log("get rows  = 0 ")
			return 1;
		}
		if (MySQL_fetch(dbHandel) != 1) {
			console.log("fetch fial  = 0 ")
			return 0;
		}
		var v18 = Memory.alloc(8);
		var v6 = StreamPool_Acquire(ptr(ptr(0x0940BD6C).readU32()), Memory.allocUtf8String('DBThread.cpp'), 35923);
		CStreamGuard_CStreamGuard(v18, v6, 1);
		var v7 = CStreamGuard_operator(v18.toInt32());
		CStreamGuard_operator_int(ptr(v7), a2);
		var v8 = CStreamGuard_operator(v18.toInt32());
		CStreamGuard_operator_int(ptr(v8), a3);
		var v9 = CStreamGuard_operator_p(v18.toInt32());
		var v21 = CStreamGuard_GetInBuffer_SIG_ACCOUNT_CARGO_DATA(ptr(v9));
		v21.writeU32(0);
		v21.add(4).writeU32(0);
		var cargoRefAdd = v21.add(8);
		for (var i = 0; i < maxSolt; i++) {
			cargoRefAdd.writeU32(0);
			cargoRefAdd = cargoRefAdd.add(61);
		}
		v21.add(8 + 61 * maxSolt).writeU32(0);
		v21.add(8 + 61 * maxSolt).writeU32(0);
		var res = 0;
		if (MySQL_get_uint(dbHandel, 0, v21) != 1) {
			console.log('uint capacity get error')
			res = 0;
		} else if (MySQL_get_uint(dbHandel, 1, v21.add(4)) != 1) {
			console.log('uint money get error')
			res = 0;
		} else {
			var v10 = Memory.alloc(61 * maxSolt * 4);
			for (var i = 0; i < 61 * maxSolt; i++) {
				v10.add(i * 4).writeU32(0);
			}
			var binaryLength = MySQL_get_binary_length(dbHandel, 2);
			if (MySQL_get_binary(dbHandel, 2, v10, binaryLength) != 1) {
				console.log('read val length 0');
				// 解决创建账号金库后什么也不操作 然后保存字节为0 导致创建的打不开
				for (var i = 0; i < maxSolt; i++) {
					v21.add(8 + i * 61).writeU32(0);
				}
				var msgName = ptr(ptr(0x0940BD68).readU32());
				MsgQueueMgr_put(msgName.toInt32(), 1, v18);
				res = 1;
			} else {
				binaryLength = MySQL_get_binary_length(dbHandel, 2);
				var v17Addr = Memory.alloc(4);
				v17Addr.writeInt(61 * maxSolt)
				if (uncompress_zip(v21.add(8), v17Addr, v10, binaryLength) != 1) {
					console.log("uncompress_zip error  !!!")
					res = 0;
				} else if (v17Addr.readU32() != 0 && v17Addr.readU32() % (61 * maxSolt) != 0) {
					res = 0;
				} else {
					var msgName = ptr(ptr(0x0940BD68).readU32());
					MsgQueueMgr_put(msgName.toInt32(), 1, v18);
					res = 1;

				}
				console.log("v17 length:" + v17Addr.readU32());
			}
		}
		console.log('money or capacity:' + v21.readU32() + ',' + v21.add(4).readU32() + ',' + v21.add(8).readU32() + ' ,' + res)
		Destroy_CStreamGuard_CStreamGuard(v18);
		return res;
	}, 'int', ['pointer', 'int', 'int', 'pointer']));
}

function userLogout() {
	//选择角色处理函数 Hook GameWorld::reach_game_world
	Interceptor.attach(ptr(0x86C4E50),
		{
			//函数入口, 拿到函数参数args
			onEnter: function (args) {
				//保存函数参数
				this.user = args[1];

				console.log('[GameWorld::reach_game_world] this.user=' + this.user);
			}
		});
	Interceptor.attach(ptr(0x08658910),
		{

			onEnter: function (args) {
				var user = args[0];
				console.log('[GameWorld::leave_game_world] user,accid' + user + ',' + CUser_get_acc_id(user));
				var accId = CUser_get_acc_id(user);
				// todo 清除账号仓库 释放空间
				if (accountCargfo[accId]) {
					delete accountCargfo[accId];
					console.log('clean accountCargfo accId:' + accId)
				}
			},
			onLeave: function (retval) {
			}
		});
}

function ResetSlot(maxSolt) {
	Interceptor.replace(ptr(0x082898C0), new NativeCallback(function (cargoRef, solt) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('ResetSlot------------------------------------' + cargoRef)
		if (CAccountCargo_CheckValidSlot(cargoRef, solt) == 0) {
			return 0;
		}
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		return Inven_Item_reset(cargoRef.add(61 * solt + 4));
	}, 'int', ['pointer', 'int']));
}

function GetSlot(maxSolt) {
	Interceptor.replace(ptr(0x082898F8), new NativeCallback(function (buff, cargo, solt) {
		var cargoRef = ptr(cargo);
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return buff;
		}
		console.log('GetSlot------------------------------------' + cargoRef)
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		if (CAccountCargo_CheckValidSlot(cargoRef, solt) == 0) {
			buff.writeU32(cargoRef.add(61 * solt + 4).readU32());
			buff.add(4).writeU32(0);
			buff.add(2 * 4).writeU32(0);
			buff.add(3 * 4).writeU32(0);
			buff.add(4 * 4).writeU32(0);
			buff.add(5 * 4).writeU32(0);
			buff.add(6 * 4).writeU32(0);
			buff.add(7 * 4).writeU32(0);
			buff.add(8 * 4).writeU32(0);
			buff.add(9 * 4).writeU32(0);
			buff.add(10 * 4).writeU32(0);
			buff.add(11 * 4).writeU32(0);
			buff.add(12 * 4).writeU32(0);
			buff.add(13 * 4).writeU32(0);
			buff.add(14 * 4).writeU32(0);
			buff.add(60).writeU8(0);
		} else {
			buff.writeU32(cargoRef.add(61 * solt + 4).readU32());
			buff.add(4).writeU32(cargoRef.add(61 * solt + 8).readU32());
			buff.add(2 * 4).writeU32(cargoRef.add(61 * solt + 12).readU32());
			buff.add(3 * 4).writeU32(cargoRef.add(61 * solt + 16).readU32());
			buff.add(4 * 4).writeU32(cargoRef.add(61 * solt + 20).readU32());
			buff.add(5 * 4).writeU32(cargoRef.add(61 * solt + 24).readU32());
			buff.add(6 * 4).writeU32(cargoRef.add(61 * solt + 28).readU32());
			buff.add(7 * 4).writeU32(cargoRef.add(61 * solt + 32).readU32());
			buff.add(8 * 4).writeU32(cargoRef.add(61 * solt + 36).readU32());
			buff.add(9 * 4).writeU32(cargoRef.add(61 * solt + 40).readU32());
			buff.add(10 * 4).writeU32(cargoRef.add(61 * solt + 44).readU32());
			buff.add(11 * 4).writeU32(cargoRef.add(61 * solt + 48).readU32());
			buff.add(12 * 4).writeU32(cargoRef.add(61 * solt + 52).readU32());
			buff.add(13 * 4).writeU32(cargoRef.add(61 * solt + 56).readU32());
			buff.add(14 * 4).writeU32(cargoRef.add(61 * solt + 60).readU32());
			buff.add(60).writeU8(cargoRef.add(61 * solt + 64).readU8());
		}
		return buff;
	}, 'pointer', ['pointer', 'int', 'int']));
}

function GetSlotRef(maxSolt) {
	Interceptor.replace(ptr(0x08289A0C), new NativeCallback(function (cargoRef, solt) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log("GetSlotRef ------------------------" + cargoRef)
		if (CAccountCargo_CheckValidSlot(cargoRef, solt) == 0) {
			return 0;
		}
		cargoRef.add(12 + 61 * 56).writeU8(1); // 标志
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		cargoRef.add(12 + 61 * maxSolt).writeU8(1); // 标志
		return cargoRef.add(61 * solt + 4);
	}, 'pointer', ['pointer', 'int']));
}

// todo 没有写替换
function CheckInsertCondition(maxSolt) {
	Interceptor.replace(ptr(0x08289A4A), new NativeCallback(function (cargoRef, itemInven) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('CheckInsertCondition------------------------------------' + cargoRef)
		var itemId = itemInven.add(2).readU32();
		var item = CDataManager_find_item(G_CDataManager(), itemId);
		if (item == 0) {
			return 0;
		}
		if (CItem_isPackagable(item) != 1) {
			return 0;
		}
		var lock = stAmplifyOption_t_GetLock(itemInven.add(17));
		if (lock != 0) {
			var characExpandDataR = CUser_GetCharacExpandDataR(cargoRef.readU32(), 2);
			if (item_lock_CItemLock_CheckItemLock(characExpandDataR, lock) != 0) {
				return 0;
			}
		}
		var typeVal = itemInven.add(1).readU8();
		if (typeVal == 4 || typeVal == 5 || typeVal == 6 || typeVal == 7 || typeVal == 8) {
			return 0;
		}
		if (itemId > 0x1963 && itemId <= 0x1B57) {
			return 0;
		}
		var attachType = CItem_GetAttachType(item);
		if (attachType == 1 || attachType == 2) {
			return 0;
		}
		if (attachType == 3 && itemInven.readU8() != 1) {
			return 0;
		}
		if (UpgradeSeparateInfo_IsTradeRestriction(itemInven.add(51)) != 0) {
			return 0;
		}
		var tempMethod = new NativeFunction(ptr(item.add(16 * 4).readU32()), 'int', ['pointer'], { "abi": "sysv" });
		// ||tempMethod(item)==1
		var isGMUser = CUser_isGMUser(ptr(cargoRef.readU32()));
		if (isGMUser == 1) {
			return 1;
		}
		if (CItem_getUsablePeriod(item) == 0 && CItem_getExpirationDate(item) == 0) {
			return 1;
		}
		if (CItem_getUsablePeriod(item) == 0 && CItem_getExpirationDate(item) == 0) {
			return 0;
		}
		var expDate = 86400 * itemInven.add(11).readU16() + 1151683200;
		return expDate > CSystemTime_getCurSec(ptr(0x0941F714)) ? 1 : 0;
	}, 'int', ['pointer', 'pointer']));
}

function CheckSlotEmpty(maxSolt) {
	Interceptor.replace(ptr(0x0828A5D4), new NativeCallback(function (cargoRef, solt) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('CheckSlotEmpty------------------------------------' + cargoRef)
		var buffCargoRef = cargoRef;
		if (accountCargfo[accId]) {
			buffCargoRef = accountCargfo[accId];
		}
		console.log("CheckSlotEmpty accId:" + accId)
		return (CAccountCargo_CheckValidSlot(cargoRef, solt) != 0 && buffCargoRef.add(61 * solt + 6).readU32() != 0) ? 1 : 0;
	}, 'int', ['pointer', 'int']));
}

function CheckStackLimit(maxSolt) {
	Interceptor.replace(ptr(0x0828A670), new NativeCallback(function (cargoRef, solt, itemId, size) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('CheckStackLimit------------------------------------' + cargoRef)
		if (CAccountCargo_CheckValidSlot(cargoRef, solt) == 0) {
			return 0;
		}
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		if (cargoRef.add(61 * solt + 6).readU32() != itemId) {
			return 0;
		}
		var item = CDataManager_find_item(G_CDataManager(), itemId);
		if (item == 0) {
			return 0;
		}
		if (CItem_is_stackable(item) != 1) {
			return 0;
		}
		var allSize = size + cargoRef.add(61 * solt + 11).readU32();
		var limit = CStackableItem_getStackableLimit(item);
		return limit < allSize || allSize < 0 ? 0 : 1;
	}, 'int', ['pointer', 'int', 'int', 'int']));
}

function MakeItemPacket(maxSolt) {
	Interceptor.replace(ptr(0x0828AB1C), new NativeCallback(function (cargoRef, buff, solt) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('MakeItemPacket------------------------------------' + cargoRef)
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		console.log("MakeItemPacket accId:" + accId)
		InterfacePacketBuf_put_short(buff, solt);
		if (cargoRef.add(61 * solt + 6).readU32() != 0) {
			InterfacePacketBuf_put_int(buff, cargoRef.add(61 * solt + 6).readU32());
			InterfacePacketBuf_put_int(buff, cargoRef.add(61 * solt + 11).readU32());
			var integratedPvPItemAttr = GetIntegratedPvPItemAttr(cargoRef.add(61 * solt + 4));
			InterfacePacketBuf_put_byte(buff, integratedPvPItemAttr);
			InterfacePacketBuf_put_short(buff, cargoRef.add(61 * solt + 15).readU16());
			InterfacePacketBuf_put_byte(buff, cargoRef.add(61 * solt + 4).readU8());
			if (GameWorld_IsEnchantRevisionChannel(G_GameWorld()) != 0) {
				InterfacePacketBuf_put_int(buff, 0);
			} else {
				InterfacePacketBuf_put_int(buff, cargoRef.add(61 * solt + 17).readU32());
			}
			var abilityType = stAmplifyOption_t_getAbilityType(cargoRef.add(61 * solt + 21));
			InterfacePacketBuf_put_byte(buff, abilityType);
			var abilityValue = stAmplifyOption_t_getAbilityValue(cargoRef.add(61 * solt + 21));
			InterfacePacketBuf_put_short(buff, abilityValue);
			InterfacePacketBuf_put_byte(buff, 0);
			return InterfacePacketBuf_put_packet(buff, cargoRef.add(61 * solt + 4));
		} else {
			InterfacePacketBuf_put_int(buff, -1);
			InterfacePacketBuf_put_int(buff, 0);
			InterfacePacketBuf_put_byte(buff, 0);
			InterfacePacketBuf_put_short(buff, 0);
			InterfacePacketBuf_put_byte(buff, 0);
			InterfacePacketBuf_put_int(buff, 0);
			InterfacePacketBuf_put_byte(buff, 0);
			InterfacePacketBuf_put_short(buff, 0);
			InterfacePacketBuf_put_byte(buff, 0);
			return InterfacePacketBuf_put_packet(buff, ptr(0x0943DDC0).readPointer());
		}
	}, 'int', ['pointer', 'pointer', 'int']));
}

function GetAccountCargo() {
	Interceptor.replace(ptr(0x0822fc22), new NativeCallback(function (cargoRef) {
		// var accId =  CUser_get_acc_id(cargoRef);
		// if(accId == -1){
		//     return 0;
		// }
		// console.log('GetAccountCargo------------------------------------'+cargoRef)
		// if(accountCargfo[accId]){
		//     return  accountCargfo[accId];
		// }
		// 返回原来的地址
		return cargoRef.add(454652);
	}, 'pointer', ['pointer']));
}

function DB_SaveAccountCargo_makeRequest(maxSolt) {
	Interceptor.replace(ptr(0x0843B946), new NativeCallback(function (a1, a2, cargo) {
		console.log("makeRequest---------" + ptr(cargo) + ',' + a1 + ',,,' + a2);
		var cargoRef = ptr(cargo);
		var accId = getUserAccId(cargoRef);
		console.log('makeRequest------accId-----' + accId);
		if (accountCargfo[accId]) {
			console.log('makeRequest get buff')
			cargoRef = accountCargfo[accId];
		}
		var v8 = Memory.alloc(61 * maxSolt + 9);
		var v3 = StreamPool_Acquire(ptr(ptr(0x0940BD6C).readU32()), Memory.allocUtf8String('DBThread.cpp'), 35999);
		CStreamGuard_CStreamGuard(v8, v3, 1);
		var v4 = CStreamGuard_operator(v8.toInt32());
		CStreamGuard_operator_int(ptr(v4), 497);
		var v5 = CStreamGuard_operator(v8.toInt32());
		CStreamGuard_operator_int(ptr(v5), a1.toInt32());
		var v6 = CStreamGuard_operator(v8.toInt32());
		CStreamGuard_operator_int(ptr(v6), a2);
		var v7 = CStreamGuard_operator_p(v8.toInt32());
		var v9 = CStreamGuard_GetInBuffer_SIG_ACCOUNT_CARGO_DATA(ptr(v7));
		v9.writeU32(0);
		var cargoRefAdd = v9.add(4);
		for (var i = 0; i < maxSolt; i++) {
			cargoRefAdd.writeU32(0);
			cargoRefAdd = cargoRefAdd.add(61);
		}
		var money = cargoRef.add(4 + 61 * maxSolt).readU32();
		var capacity = cargoRef.add(8 + 61 * maxSolt).readU32();
		console.log('money or capacity:' + money + ',' + capacity)
		v9.writeU32(capacity); // 钱
		v9.add(4).writeU32(money); // 容量
		Memory.copy(v9.add(8), cargoRef.add(4), maxSolt * 61);
		MsgQueueMgr_put(ptr(ptr(0x0940BD68).readU32()).toInt32(), 2, v8);
		CAccountCargo_SetStable(cargoRef);
		Destroy_CStreamGuard_CStreamGuard(v8);
		console.log("makeRequest success")
	}, 'void', ['pointer', 'int', 'uint']));
}

function SetStable(maxSolt) {
	Interceptor.replace(ptr(0x0844DC16), new NativeCallback(function (cargoRef) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log("SetStable ---------------------" + cargoRef)
		var buffCargoRef = cargoRef;
		if (accountCargfo[accId]) {
			buffCargoRef = accountCargfo[accId];
		}
		buffCargoRef.add(12 + 61 * maxSolt).writeU8(0); // 标志
		return cargoRef;
	}, 'pointer', ['pointer']));
}

function SetCapacity(maxSolt) {
	Interceptor.replace(ptr(0x084EBE46), new NativeCallback(function (cargoRef, capacity) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log("SetCapacity--------------------" + cargoRef)
		var buffCargoRef = cargoRef;
		if (accountCargfo[accId]) {
			buffCargoRef = accountCargfo[accId];
		}
		buffCargoRef.add(8 + 61 * maxSolt).writeU32(capacity); // 容量
		return cargoRef;
	}, 'pointer', ['pointer', 'uint']));
}

function IsAlter(maxSolt) {
	Interceptor.replace(ptr(0x08695A0C), new NativeCallback(function (cargoRef) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('IsAlter------------------------------------' + cargoRef)
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		return cargoRef.add(12 + 61 * maxSolt).readU8(); // 标志
	}, 'int', ['pointer']));
}

function SendItemList(maxSolt) {
	Interceptor.replace(ptr(0x0828A88A), new NativeCallback(function (cargoRef) {
		console.log("SendItemList-------------" + cargoRef)
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		var buffCargoRef = cargoRef;
		if (accountCargfo[accId]) {
			buffCargoRef = accountCargfo[accId];
		}
		var buff = Memory.alloc(61 * maxSolt + 9);
		PacketGuard_PacketGuard(buff);
		InterfacePacketBuf_put_header(buff, 0, 13);
		InterfacePacketBuf_put_byte(buff, 12);
		InterfacePacketBuf_put_short(buff, buffCargoRef.add(8 + 61 * maxSolt).readU32());
		InterfacePacketBuf_put_int(buff, buffCargoRef.add(4 + 61 * maxSolt).readU32());
		var itemCount = CAccountCargo_GetItemCount(cargoRef);
		InterfacePacketBuf_put_short(buff, itemCount);
		for (var i = 0; buffCargoRef.add(8 + 61 * maxSolt).readU32() > i; ++i) {
			if (buffCargoRef.add(61 * i + 6).readU32() != 0) {
				InterfacePacketBuf_put_short(buff, i);
				InterfacePacketBuf_put_int(buff, buffCargoRef.add(61 * i + 6).readU32());
				InterfacePacketBuf_put_int(buff, buffCargoRef.add(61 * i + 11).readU32());
				var integratedPvPItemAttr = GetIntegratedPvPItemAttr(buffCargoRef.add(61 * i + 4));
				InterfacePacketBuf_put_byte(buff, integratedPvPItemAttr);
				InterfacePacketBuf_put_short(buff, buffCargoRef.add(61 * i + 15).readU16());
				InterfacePacketBuf_put_byte(buff, buffCargoRef.add(61 * i + 4).readU8());
				if (GameWorld_IsEnchantRevisionChannel(G_GameWorld()) != 0) {
					InterfacePacketBuf_put_int(buff, 0);
				} else {
					InterfacePacketBuf_put_int(buff, buffCargoRef.add(61 * i + 17).readU32());
				}
				var abilityType = stAmplifyOption_t_getAbilityType(buffCargoRef.add(61 * i + 21));
				InterfacePacketBuf_put_byte(buff, abilityType);
				var abilityValue = stAmplifyOption_t_getAbilityValue(buffCargoRef.add(61 * i + 21));
				InterfacePacketBuf_put_short(buff, abilityValue);
				InterfacePacketBuf_put_byte(buff, 0);
				InterfacePacketBuf_put_packet(buff, buffCargoRef.add(61 * i + 4));
			}
		}
		InterfacePacketBuf_finalize(buff, 1);
		var v6 = CUser_Send(ptr(cargoRef.readU32()), buff);
		Destroy_PacketGuard_PacketGuard(buff);
		return v6;
	}, 'int', ['pointer']));
}

function SendNotifyMoney(maxSolt) {
	Interceptor.replace(ptr(0x0828A7DC), new NativeCallback(function (cargo, a2) {
		console.log("SendNotifyMoney------------" + ptr(cargo))
		var cargoRef = ptr(cargo);
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return;
		}
		var buffCargoRef = cargoRef;
		if (accountCargfo[accId]) {
			buffCargoRef = accountCargfo[accId];
		}
		var buff = Memory.alloc(20);
		PacketGuard_PacketGuard(buff);
		InterfacePacketBuf_put_header(buff, 1, a2);
		InterfacePacketBuf_put_byte(buff, 1);
		InterfacePacketBuf_put_int(buff, buffCargoRef.add(4 + 61 * maxSolt).readU32());
		InterfacePacketBuf_finalize(buff, 1);
		CUser_Send(ptr(cargoRef.readU32()), buff);
		Destroy_PacketGuard_PacketGuard(buff);
	}, 'void', ['int', 'int']));
}

function GetItemCount(maxSolt) {
	Interceptor.replace(ptr(0x0828A794), new NativeCallback(function (cargoRef) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('GetItemCount------------------------------------' + cargoRef)
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		var cap = cargoRef.add(8 + 61 * maxSolt).readU32();
		var index = 0;
		for (var i = 0; i < cap; i++) {
			if (cargoRef.add(61 * i + 6).readU32() != 0) {
				index++;
			}
		}
		console.log("GetItemCount  val:" + index)
		return index;
	}, 'int', ['pointer']));
}

function SubMoney(maxSolt) {
	Interceptor.replace(ptr(0x0828A764), new NativeCallback(function (cargoRef, money) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('SubMoney------------------------------------')
		var buffCargoRef = cargoRef;
		if (accountCargfo[accId]) {
			buffCargoRef = accountCargfo[accId];
		}
		var res;
		if (money != 0) {
			res = cargoRef;
			var add = buffCargoRef.add(4 + 61 * maxSolt).readU32();
			if (add >= money) {
				buffCargoRef.add(4 + 61 * maxSolt).writeU32(add - money);
			}
		}
		return res;
	}, 'pointer', ['pointer', 'uint']));
}

function AddMoney(maxSolt) {
	Interceptor.replace(ptr(0x0828A742), new NativeCallback(function (cargoRef, money) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('AddMoney------------------------------------')
		var buffCargoRef = cargoRef;
		if (accountCargfo[accId]) {
			buffCargoRef = accountCargfo[accId];
		}
		var res;
		if (money != 0) {
			res = cargoRef;
			var add = buffCargoRef.add(4 + 61 * maxSolt).readU32();
			buffCargoRef.add(4 + 61 * maxSolt).writeU32(add + money);
		}
		return res;
	}, 'pointer', ['pointer', 'uint']));
}

function GetSpecificItemSlot(maxSolt) {
	Interceptor.replace(ptr(0x0828A61A), new NativeCallback(function (cargoRef, itemId) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('GetSpecificItemSlot------------------------------------' + cargoRef)
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		var cap = cargoRef.add(8 + 61 * maxSolt).readU32();
		if (cap > maxSolt) {
			cap = maxSolt;
		}
		for (var i = 0; i < cap; i++) {
			if (cargoRef.add(61 * i + 6).readU32() == itemId) {
				return i;
			}
		}
		return -1;
	}, 'int', ['pointer', 'int']));
}

function GetEmptySlot(maxSolt) {
	Interceptor.replace(ptr(0x0828A580), new NativeCallback(function (cargoRef) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('GetEmptySlot------------------------------------' + cargoRef)
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		console.log("GetEmptySlot accId:" + accId)
		var cap = cargoRef.add(8 + 61 * maxSolt).readU32();
		if (cap > maxSolt) {
			cap = maxSolt;
		}
		for (var i = 0; i < cap; i++) {
			if (cargoRef.add(61 * i + 6).readU32() == 0) {
				return i;
			}
		}
		return -1;
	}, 'int', ['pointer']));
}

function CheckValidSlot(maxSolt) {
	Interceptor.replace(ptr(0x0828A554), new NativeCallback(function (cargoRef, solt) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('CheckValidSlot------------------------------------' + cargoRef)
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		var cap = cargoRef.add(8 + 61 * maxSolt).readU32();
		return (solt >= 0 && solt <= maxSolt && cap > solt) ? 1 : 0;
	}, 'int', ['pointer', 'int']));
}

function CheckMoneyLimit(maxSolt) {
	Interceptor.replace(ptr(0x0828A4CA), new NativeCallback(function (cargoRef, money) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('CheckMoneyLimit------------------------------------' + cargoRef)
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		var cap = cargoRef.add(8 + 61 * maxSolt).readU32();
		var nowMoney = cargoRef.add(4 + 61 * maxSolt).readU32()
		var manager = G_CDataManager();
		var currUpfradeIfo = AccountCargoScript_GetCurrUpgradeInfo(manager.add(42976), cap);
		return (currUpfradeIfo != 0 && ptr(currUpfradeIfo).add(4).readU32() >= (money + nowMoney)) ? 1 : 0;
	}, 'int', ['pointer', 'uint32']));
}

function WithdrawMoney(maxSolt) {
	Interceptor.replace(ptr(0x0828A2F6), new NativeCallback(function (cargoRef, money) {
		console.log("WithdrawMoney------------" + cargoRef)
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		var buffCargoRef = cargoRef;
		if (accountCargfo[accId]) {
			buffCargoRef = accountCargfo[accId];
		}
		var manage = ARAD_Singleton_ServiceRestrictManager_Get();
		var isRestricted = ServiceRestrictManager_isRestricted(manage.toInt32(), cargoRef, 1, 26);
		if (isRestricted != 0) {
			CUser_SendCmdErrorPacket(cargoRef, 309, 0xD1);
			return 0;
		}
		var check = CSecu_ProtectionField_Check(ptr(ptr(0x0941F7CC).readU32()), cargoRef, 3);
		if (check != 0) {
			CUser_SendCmdErrorPacket(cargoRef, 309, check);
			return 0;
		}
		console.log("WithdrawMoney now money:" + money)
		if (money > CAccountCargo_GetMoney(cargoRef) || (money & 0x80000000) != 0) {
			CUser_SendCmdErrorPacket(cargoRef, 309, 0xA);
			return 0;
		}
		if (CUser_CheckMoney(ptr(cargoRef.readU32()), money) == 0) {
			console.log('CUser_CheckMoney ---')
			CUser_SendCmdErrorPacket(cargoRef, 308, 0x5e);
			return 0;
		} else {
			CAccountCargo_SubMoney(cargoRef, money);
			var curCharacInvenW = CUserCharacInfo_getCurCharacInvenW(ptr(cargoRef.readU32()));
			if (CInventory_gain_money(curCharacInvenW, money, 27, 1, 0) == 0) {
				CUser_SendCmdErrorPacket(cargoRef, 309, 0xA);
				return 0;
			}
		}
		CAccountCargo_SendNotifyMoney(cargoRef.toInt32(), 309);
		buffCargoRef.add(12 + 61 * maxSolt).writeU8(1);
		cargoRef.add(12 + 61 * 56).writeU8(1);
		console.log("WithdrawMoney success")
		return 1;
	}, 'int', ['pointer', 'uint32']));
}


function DepositMoney(maxSolt) {
	Interceptor.replace(ptr(0x0828A12A), new NativeCallback(function (cargoRef, money) {
		console.log("DepositMoney------------" + cargoRef)
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		var buffCargoRef = cargoRef;
		if (accountCargfo[accId]) {
			buffCargoRef = accountCargfo[accId];
		}
		var manage = ARAD_Singleton_ServiceRestrictManager_Get();
		var isRestricted = ServiceRestrictManager_isRestricted(manage.toInt32(), cargoRef, 1, 26);
		if (isRestricted != 0) {
			CUser_SendCmdErrorPacket(cargoRef, 308, 0xD1);
			return 0;
		}
		var check = CSecu_ProtectionField_Check(ptr(ptr(0x0941F7CC).readU32()), cargoRef, 2);
		if (check != 0) {
			CUser_SendCmdErrorPacket(cargoRef, 308, check);
			return 0;
		}
		console.log("DepositMoney now money:" + money + ',' + CUserCharacInfo_getCurCharacMoney(ptr(cargoRef.readU32())) + ',' + ((money & 0x80000000) != 0))
		if (money > CUserCharacInfo_getCurCharacMoney(ptr(cargoRef.readU32())) || (money & 0x80000000) != 0) {
			CUser_SendCmdErrorPacket(cargoRef, 308, 0xA);
			return 0;
		}
		console.log("DepositMoney 2 now money:" + money)
		if (CAccountCargo_CheckMoneyLimit(cargoRef, money) == 0) {
			console.log('CAccountCargo_CheckMoneyLimit error')
			CUser_SendCmdErrorPacket(cargoRef, 308, 0x5f);
			return 0;
		} else {
			console.log("DepositMoney 3 now money:" + money)
			var curCharacInvenW = CUserCharacInfo_getCurCharacInvenW(ptr(cargoRef.readU32()));
			if (CInventory_use_money(curCharacInvenW, money, 40, 1) != 1) {
				CUser_SendCmdErrorPacket(cargoRef, 308, 0xA);
				return 0;
			}
		}
		console.log("DepositMoney 4 now money:" + money)
		// 有addMoney方法修改 改这里不重要
		CAccountCargo_AddMoney(cargoRef, money);
		CAccountCargo_SendNotifyMoney(cargoRef.toInt32(), 308);
		buffCargoRef.add(12 + 61 * maxSolt).writeU8(1);
		cargoRef.add(12 + 61 * 56).writeU8(1);
		console.log("DepositMoney success")
		return 1;
	}, 'int', ['pointer', 'uint32']));
}

function MoveItem(maxSolt) {
	Interceptor.replace(ptr(0x08289F26), new NativeCallback(function (cargoRef, slot1, slot2) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('MoveItem------------------------------------' + cargoRef)

		if (CAccountCargo_CheckValidSlot(cargoRef, slot1) == 0 || CAccountCargo_CheckValidSlot(cargoRef, slot2) == 0 || slot1 == slot2) {
			return 0;
		}
		cargoRef.add(12 + 61 * 56).writeU8(1);
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		var temp = Memory.alloc(61);
		Memory.copy(temp, cargoRef.add(61 * slot1 + 4), 61 - 4);
		Memory.copy(cargoRef.add(61 * slot1 + 4), cargoRef.add(61 * slot2 + 4), 61 - 4);
		Memory.copy(cargoRef.add(61 * slot2 + 4), temp, 61 - 4);
		cargoRef.add(12 + 61 * maxSolt).writeU8(1);
		return 1;
	}, 'int', ['pointer', 'int', 'int']));
}

function DeleteItem(maxSolt) {
	Interceptor.replace(ptr(0x08289E3C), new NativeCallback(function (cargoRef, slot, number) {
		console.log('DeleteItem---' + cargoRef)
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		var buffCargoRef = cargoRef;
		if (accountCargfo[accId]) {
			buffCargoRef = accountCargfo[accId];
		}
		if (CAccountCargo_CheckValidSlot(cargoRef, slot) == 0) {
			return 0;
		}
		if (buffCargoRef.add(61 * slot + 6).readU32() == 0 || number <= 0) {
			return 0;
		}
		if (Inven_Item_isEquipableItemType(cargoRef.add(61 * slot + 4)) != 0) {
			CAccountCargo_ResetSlot(cargoRef, slot);
			buffCargoRef.add(12 + 61 * maxSolt).writeU8(1);
			cargoRef.add(12 + 61 * 56).writeU8(1);
			return 1;
		}
		if (buffCargoRef.add(61 * slot + 11).readU32() < number) {
			return 0;
		}
		if (buffCargoRef.add(61 * slot + 11).readU32() <= number) {
			CAccountCargo_ResetSlot(cargoRef, slot);
		} else {
			var num = buffCargoRef.add(61 * slot + 11).readU32();
			buffCargoRef.add(61 * slot + 11).writeU32(num - number);
		}
		buffCargoRef.add(12 + 61 * maxSolt).writeU8(1);
		cargoRef.add(12 + 61 * 56).writeU8(1);
		return 1;
	}, 'int', ['pointer', 'int', 'int']));
}

function InsertItem(maxSolt) {
	Interceptor.replace(ptr(0x08289C82), new NativeCallback(function (cargoRef, item, slot) {
		console.log('InsertItem-------------------' + cargoRef + ' ' + slot)
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		var buffCargoRef = cargoRef;
		if (accountCargfo[accId]) {
			buffCargoRef = accountCargfo[accId];
		}
		if (CAccountCargo_CheckValidSlot(cargoRef, slot) == 0) {
			console.log("slot error")
			return -1;
		}
		console.log("slot success!!!")
		var res = -1;
		if (Inven_Item_isEquipableItemType(item) != 0) {
			console.log("Inven_Item_isEquipableItemType  success：" + cargoRef.add(61 * slot + 6).readU32())
			if (buffCargoRef.add(61 * slot + 6).readU32() == 0) {
				var v4 = 61 * slot;
				buffCargoRef.add(v4 + 4).writeU32(item.readU32());
				buffCargoRef.add(v4 + 8).writeU32(item.add(4).readU32());
				buffCargoRef.add(v4 + 12).writeU32(item.add(2 * 4).readU32());
				buffCargoRef.add(v4 + 16).writeU32(item.add(3 * 4).readU32());
				buffCargoRef.add(v4 + 20).writeU32(item.add(4 * 4).readU32());
				buffCargoRef.add(v4 + 24).writeU32(item.add(5 * 4).readU32());
				buffCargoRef.add(v4 + 28).writeU32(item.add(6 * 4).readU32());
				buffCargoRef.add(v4 + 32).writeU32(item.add(7 * 4).readU32());
				buffCargoRef.add(v4 + 36).writeU32(item.add(8 * 4).readU32());
				buffCargoRef.add(v4 + 40).writeU32(item.add(9 * 4).readU32());
				buffCargoRef.add(v4 + 44).writeU32(item.add(10 * 4).readU32());
				buffCargoRef.add(v4 + 48).writeU32(item.add(11 * 4).readU32());
				buffCargoRef.add(v4 + 52).writeU32(item.add(12 * 4).readU32());
				buffCargoRef.add(v4 + 56).writeU32(item.add(13 * 4).readU32());
				buffCargoRef.add(v4 + 60).writeU32(item.add(14 * 4).readU32());
				buffCargoRef.add(v4 + 64).writeU8(item.add(60).readU8());
				res = slot;
			}
		} else {
			if (item.add(2).readU32() == buffCargoRef.add(61 * slot + 6).readU32()) {
				var size = buffCargoRef.add(61 * slot + 11).readU32();
				buffCargoRef.add(61 * slot + 11).writeU32(size + item.add(7).readU32());
			} else {
				var v4 = 61 * slot;
				buffCargoRef.add(v4 + 4).writeU32(item.readU32());
				buffCargoRef.add(v4 + 8).writeU32(item.add(4).readU32());
				buffCargoRef.add(v4 + 12).writeU32(item.add(2 * 4).readU32());
				buffCargoRef.add(v4 + 16).writeU32(item.add(3 * 4).readU32());
				buffCargoRef.add(v4 + 20).writeU32(item.add(4 * 4).readU32());
				buffCargoRef.add(v4 + 24).writeU32(item.add(5 * 4).readU32());
				buffCargoRef.add(v4 + 28).writeU32(item.add(6 * 4).readU32());
				buffCargoRef.add(v4 + 32).writeU32(item.add(7 * 4).readU32());
				buffCargoRef.add(v4 + 36).writeU32(item.add(8 * 4).readU32());
				buffCargoRef.add(v4 + 40).writeU32(item.add(9 * 4).readU32());
				buffCargoRef.add(v4 + 44).writeU32(item.add(10 * 4).readU32());
				buffCargoRef.add(v4 + 48).writeU32(item.add(11 * 4).readU32());
				buffCargoRef.add(v4 + 52).writeU32(item.add(12 * 4).readU32());
				buffCargoRef.add(v4 + 56).writeU32(item.add(13 * 4).readU32());
				buffCargoRef.add(v4 + 60).writeU32(item.add(14 * 4).readU32());
				buffCargoRef.add(v4 + 64).writeU8(item.add(60).readU8());
			}
			res = slot;
		}
		buffCargoRef.add(12 + 61 * maxSolt).writeU8(1);
		cargoRef.add(12 + 61 * 56).writeU8(1);
		console.log("InsertItem:" + res);
		return res;
	}, 'int', ['pointer', 'pointer', 'int']));
}
function Clear(maxSolt) {
	Interceptor.replace(ptr(0x0828986C), new NativeCallback(function (cargoRef) {
		// console.log('Clear:'+cargoRef)
		// 离线是清零
		cargoRef.writeU32(0);
		var cargoRefAdd = cargoRef.add(4);
		for (var i = 0; i < maxSolt; i++) {
			Inven_Item_Inven_Item(cargoRefAdd);
			cargoRefAdd.writeU32(0);
			cargoRefAdd = cargoRefAdd.add(61);
		}
		cargoRef.add(4 + 61 * maxSolt).writeU32(0); // 钱
		cargoRef.add(8 + 61 * maxSolt).writeU32(0); // 容量
		cargoRef.add(12 + 61 * maxSolt).writeU8(0); // 标志
		return cargoRef;
	}, 'pointer', ['pointer']));
}

function SetDBData(maxSolt) {
	Interceptor.replace(ptr(0x08289816), new NativeCallback(function (cargoRef, user, item, money, copacity) {
		console.log('SetDBData-------------------' + cargoRef + ' ' + user + ' ,' + item + ',' + money + '  ' + copacity)
		var accId = CUser_get_acc_id(user);
		// 再设置是 将 重新申请账号金库空间

		accountCargfo[accId] = Memory.alloc(61 * maxSolt + 9 + 100);
		var buffCargoRef = cargoRef;
		if (accountCargfo[accId]) {
			cargoRef.writePointer(user);
			cargoRef.add(4 + 61 * maxSolt).writeU32(money);
			cargoRef.add(8 + 61 * maxSolt).writeU32(copacity);
			cargoRef.add(12 + 61 * 56).writeU8(0);
			buffCargoRef = accountCargfo[accId];
			// 初始化数据
			for (var i = 0; i < maxSolt; i++) {
				buffCargoRef.add(4 + i * 61).writeU32(0);
			}
		}
		buffCargoRef.writePointer(user);
		buffCargoRef.add(4 + 61 * maxSolt).writeU32(money);
		buffCargoRef.add(8 + 61 * maxSolt).writeU32(copacity);
		buffCargoRef.add(12 + 61 * maxSolt).writeU8(0);
		if (item != 0) {
			Memory.copy(cargoRef.add(4), item, 56 * 61);
			Memory.copy(buffCargoRef.add(4), item, maxSolt * 61);
		}
		return cargoRef;
	}, 'pointer', ['pointer', 'pointer', 'pointer', 'uint32', 'uint32']));
}

function CAccountCargo(maxSolt) {
	Interceptor.replace(ptr(0x08289794), new NativeCallback(function (cargoRef) {
		cargoRef.writeU32(0);
		var cargoRefAdd = cargoRef.add(4);
		for (var i = 0; i < maxSolt; i++) {
			Inven_Item_Inven_Item(cargoRefAdd);
			cargoRefAdd.writeU32(0);
			cargoRefAdd = cargoRefAdd.add(61);
		}
		cargoRef.add(4 + 61 * maxSolt).writeU32(0); // 钱
		cargoRef.add(8 + 61 * maxSolt).writeU32(0); // 容量
		cargoRef.add(12 + 61 * maxSolt).writeU8(0); // 标志
	}, 'void', ['pointer']));
}

function GetMoney(maxSolt) {
	Interceptor.replace(ptr(0x0822F020), new NativeCallback(function (cargoRef) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('GetMoney------------------------------------' + cargoRef)
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		console.log("GetMoney accId:" + accId)
		return cargoRef.add(4 + 61 * maxSolt).readU32();
	}, 'int', ['pointer']));
}

function GetCapacity(maxSolt) {
	Interceptor.replace(ptr(0x0822F012), new NativeCallback(function (cargoRef) {
		var accId = getUserAccId(cargoRef);
		if (accId == -1) {
			return 0;
		}
		console.log('GetCapacity------------------------------------' + cargoRef)
		if (accountCargfo[accId]) {
			cargoRef = accountCargfo[accId];
		}
		return cargoRef.add(8 + 61 * maxSolt).readU32();
	}, 'int', ['pointer']));
}

function getUserAccId(cargoRef) {
	if (cargoRef == 0) {
		return -1;
	}
	var userAddr = ptr(cargoRef.readU32());
	if (userAddr == 0) {
		return -1;
	}
	return CUser_get_acc_id(userAddr);
}

//在线奖励
function enable_online_reward() {
	//在线每5min发一次奖, 在线时间越长, 奖励越高
	//CUser::WorkPerFiveMin
	Interceptor.attach(ptr(0x8652F0C),
		{
			onEnter: function (args) {
				var user = args[0];
				//当前系统时间
				var cur_time = api_CSystemTime_getCurSec();
				//本次登录时间
				var login_tick = CUserCharacInfo_GetLoginTick(user);
				if (login_tick > 0) {
					//在线时长(分钟)
					var diff_time = Math.floor((cur_time - login_tick) / 60);
					//在线10min后开始计算
					if (diff_time < 10)
						return;
					//在线奖励最多发送1天
					if (diff_time > 24 * 60)
						return;
					//奖励: 每分钟0.1点券
					var REWARD_CASH_CERA_PER_MIN = 0.1;
					//计算奖励
					var reward_cash_cera = Math.floor(diff_time * REWARD_CASH_CERA_PER_MIN);
					//发点券
					api_recharge_cash_cera(user, reward_cash_cera);
					//发消息通知客户端奖励已发送
					api_CUser_SendNotiPacketMessage(user, '[' + get_timestamp() + '] 在线奖励已发送(当前阶段点券奖励:' + reward_cash_cera + ')', 6);
				}
			},
			onLeave: function (retval) {
			}
		});
}
