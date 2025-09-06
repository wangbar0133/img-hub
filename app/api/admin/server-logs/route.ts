import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminWithLogging, getLogs } from '@/lib/logging'

export async function GET(request: NextRequest) {
  try {
    verifyAdminWithLogging()
    
    const { searchParams } = new URL(request.url)
    const lines = parseInt(searchParams.get('lines') || '100')
    
    // 使用内存日志系统而不是文件日志
    const allLogs = getLogs()
    
    // 过滤并格式化日志，添加 [SERVER] 标识
    const serverLogs = allLogs.slice(0, lines).map((log, index) => ({
      id: `server-${Date.now()}-${index}`,
      timestamp: log.timestamp,
      level: log.level,
      message: log.message.startsWith('[SERVER]') ? log.message : `[SERVER] ${log.message}`,
      details: log.details,
      source: 'memory-logs'
    }))
    
    return NextResponse.json({
      success: true,
      logs: serverLogs,
      total: serverLogs.length,
      logSource: 'memory',
      note: 'Using in-memory logging system. For real-time logs, use /api/admin/logs'
    })
    
  } catch (error) {
    console.error('Server logs API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 401 }
    )
  }
}