import { NextRequest, NextResponse } from 'next/server'
import { readFile, access } from 'fs/promises'
import { constants } from 'fs'
import { verifyAdminWithLogging } from '@/lib/logging'

export async function GET(request: NextRequest) {
  try {
    verifyAdminWithLogging()
    
    const { searchParams } = new URL(request.url)
    const lines = parseInt(searchParams.get('lines') || '100')
    
    const logFilePath = '/app/logs/server.log'
    
    try {
      // 检查文件是否存在
      await access(logFilePath, constants.F_OK)
      
      // 读取日志文件
      const logContent = await readFile(logFilePath, 'utf-8')
      
      // 按行分割并取最后N行
      const logLines = logContent.split('\n').filter(line => line.trim() !== '')
      const recentLines = logLines.slice(-lines)
      
      // 解析日志行并格式化
      const formattedLogs = recentLines.map((line, index) => {
        // 尝试解析时间戳和日志级别
        const timestampMatch = line.match(/^\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]/)
        const levelMatch = line.match(/\] (INFO|WARN|ERROR|DEBUG):/i)
        
        return {
          id: `server-${Date.now()}-${index}`,
          timestamp: timestampMatch ? timestampMatch[1] : new Date().toISOString(),
          level: levelMatch ? levelMatch[1].toUpperCase() : 'INFO',
          message: `[SERVER] ${line}`,
          source: 'server-console'
        }
      })
      
      return NextResponse.json({
        success: true,
        logs: formattedLogs,
        total: formattedLogs.length,
        logFilePath
      })
      
    } catch (fileError) {
      // 文件不存在或读取错误
      return NextResponse.json({
        success: true,
        logs: [{
          id: `server-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'WARN',
          message: '[SERVER] Log file not found or empty',
          source: 'server-console'
        }],
        total: 1,
        error: 'Log file not accessible'
      })
    }
    
  } catch (error) {
    console.error('Server logs API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 401 }
    )
  }
}