// 服务器启动包装器，用于拦截console输出到日志系统
const { addLog } = require('./app/api/admin/logs/route');

// 拦截console输出
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  // 添加到日志系统
  try {
    addLog('info', `[SERVER] ${message}`);
  } catch (e) {
    // 忽略日志错误，避免循环
  }
  
  // 保持原始输出
  originalConsoleLog.apply(console, args);
};

console.error = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  try {
    addLog('error', `[SERVER] ${message}`);
  } catch (e) {
    // 忽略日志错误
  }
  
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  try {
    addLog('warn', `[SERVER] ${message}`);
  } catch (e) {
    // 忽略日志错误
  }
  
  originalConsoleWarn.apply(console, args);
};

// 捕获未处理的异常
process.on('uncaughtException', (error) => {
  try {
    addLog('error', `[SERVER] Uncaught Exception: ${error.message}`, { stack: error.stack });
  } catch (e) {
    // 忽略日志错误
  }
  originalConsoleError('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  try {
    addLog('error', `[SERVER] Unhandled Rejection: ${reason}`, { promise });
  } catch (e) {
    // 忽略日志错误
  }
  originalConsoleError('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 启动时记录
try {
  addLog('info', '[SERVER] Starting Next.js server...');
} catch (e) {
  // 忽略日志错误
}

// 启动实际的服务器
require('./server.js');