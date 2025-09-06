import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'img-hub-admin-secret-key-2024'

// 中央化日志系统
interface LogEntry {
  timestamp: string
  level: string
  message: string
  details?: any
}

// 内存日志存储
let logs: LogEntry[] = []

// 保存原始console方法避免无限递归
const originalConsoleLog = console.log
const originalConsoleError = console.error

// 日志添加函数
export function addLog(level: string, message: string, details?: any) {
  const log: LogEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    details
  }
  
  logs.unshift(log)
  if (logs.length > 1000) {
    logs = logs.slice(0, 1000)
  }
  
  // 输出到console（避免递归）
  originalConsoleLog(`[${log.timestamp}] ${log.level}: ${log.message}`, details || '')
}

// 获取日志
export function getLogs(): LogEntry[] {
  return logs
}

// 清空日志
export function clearLogs(): void {
  logs = []
  addLog('INFO', 'Logs cleared')
}

// 验证管理员权限
export function verifyAdmin() {
  const cookieStore = cookies()
  const token = cookieStore.get('admin-token')?.value
  
  if (!token) {
    throw new Error('未登录')
  }
  
  try {
    const decoded = verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') {
      throw new Error('权限不足')
    }
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    throw new Error('无效的登录状态: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// 带日志的管理员验证
export function verifyAdminWithLogging() {
  try {
    const decoded = verifyAdmin()
    addLog('info', 'Admin authentication successful', { admin: decoded.username })
    return decoded
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    addLog('warn', 'Admin authentication failed', { error: errorMessage })
    throw error
  }
}

// 拦截console输出（避免无限递归）
let isLogging = false

function interceptConsole() {
  console.log = (...args) => {
    if (!isLogging) {
      isLogging = true
      addLog('INFO', args.join(' '))
      isLogging = false
    }
    originalConsoleLog(...args)
  }

  console.error = (...args) => {
    if (!isLogging) {
      isLogging = true
      const errorMessage = args.join(' ')
      addLog('ERROR', `${errorMessage}`)
      isLogging = false
    }
    originalConsoleError(...args)
  }
}

// 启动时进行console拦截
interceptConsole()

// 初始化日志
addLog('INFO', 'Application started')