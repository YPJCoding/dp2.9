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
