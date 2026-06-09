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

RuntimeUtils.exposeGlobal('createTimerDispatcherBinding', createTimerDispatcherBinding);
