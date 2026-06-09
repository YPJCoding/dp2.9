// 随机数模块
// 来源：从旧 frida.js 迁移
// 用途：提供统一的随机数生成函数，避免各模块重复定义 get_random_int

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

RuntimeUtils.exposeGlobal('getRandomInt', getRandomInt);
