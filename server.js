const { createServer } = require('http')
const next = require('next')
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

const LOG_PATH = path.join(__dirname, 'debug-errors.log')

function writeLog(context, err) {
  const timestamp = new Date().toISOString()
  const message = err instanceof Error ? err.message : String(err)
  const stack = err instanceof Error ? (err.stack || 'no stack') : 'no stack'
  
  console.error(`[${timestamp}] [${context}] ERROR: ${message}`)
  console.error(`[${timestamp}] [${context}] STACK: ${stack}`)
  
  try {
    const entry =
      `\n${'='.repeat(80)}\n` +
      `TIMESTAMP : ${timestamp}\n` +
      `CONTEXT   : ${context}\n` +
      `MESSAGE   : ${message}\n` +
      `STACK     :\n${stack}\n`
    fs.appendFileSync(LOG_PATH, entry, 'utf8')
  } catch (logErr) {
    // ignore
  }
}

process.on('uncaughtException', (err) => {
  writeLog('server:uncaughtException', err)
})

process.on('unhandledRejection', (reason) => {
  writeLog('server:unhandledRejection', reason)
})

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'
const rawPort = process.env.PORT || '3000'
const port = isNaN(Number(rawPort)) ? rawPort : parseInt(rawPort, 10)

const app = next({ dev, dir: __dirname, hostname, port: typeof port === 'number' ? port : 3000 })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    // DIRECT PURE-NODE DIAGNOSTIC ENDPOINT (Bypasses Next.js App Router completely)
    if (req.url === '/api/diagnose-raw' || req.url === '/diagnose-raw') {
      res.setHeader('Content-Type', 'application/json')
      
      const dbUrl = process.env.DATABASE_URL || ''
      const report = {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd(),
        env: {
          NODE_ENV: process.env.NODE_ENV || '(unset)',
          DATABASE_URL_PRESENT: !!process.env.DATABASE_URL,
          DATABASE_URL_MASKED: dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':****@') : '(unset)',
          JWT_SECRET_PRESENT: !!process.env.JWT_SECRET,
          ADMIN_SECRET_KEY_PRESENT: !!process.env.ADMIN_SECRET_KEY,
        },
        tests: {},
      }

      // Test 1: Direct MySQL2 Connection
      if (dbUrl) {
        try {
          // Test with given URL
          const connection = await mysql.createConnection(dbUrl)
          const [rows] = await connection.query('SELECT 1 as connected, DATABASE() as db, VERSION() as version')
          
          let productCount = 0
          let userCount = 0
          try {
            const [pRows] = await connection.query('SELECT COUNT(*) as count FROM Product')
            productCount = pRows[0].count
          } catch (pErr) {
            try {
              const [pRowsLower] = await connection.query('SELECT COUNT(*) as count FROM product')
              productCount = pRowsLower[0].count
              report.tests.tableNameNote = 'Note: table name is lowercase "product" in MySQL'
            } catch (pErr2) {
              report.tests.productTableError = pErr2.message
            }
          }

          try {
            const [uRows] = await connection.query('SELECT COUNT(*) as count FROM User')
            userCount = uRows[0].count
          } catch (uErr) {
            try {
              const [uRowsLower] = await connection.query('SELECT COUNT(*) as count FROM user')
              userCount = uRowsLower[0].count
            } catch (uErr2) {
              report.tests.userTableError = uErr2.message
            }
          }

          await connection.end()
          report.tests.directMysql = {
            status: 'SUCCESS',
            details: rows,
            productCount,
            userCount,
          }
        } catch (mysqlErr) {
          report.tests.directMysql = {
            status: 'FAILED',
            error: mysqlErr.message,
            code: mysqlErr.code,
            errno: mysqlErr.errno,
            sqlState: mysqlErr.sqlState,
          }
        }
      } else {
        report.tests.directMysql = {
          status: 'SKIPPED',
          error: 'DATABASE_URL is not set in process.env',
        }
      }

      // Test 2: File System Write Check
      try {
        fs.appendFileSync(LOG_PATH, `\n[${new Date().toISOString()}] [diagnose-raw:ping] Diagnostic endpoint hit\n`, 'utf8')
        report.tests.fileLogging = { status: 'SUCCESS', path: LOG_PATH }
      } catch (fsErr) {
        report.tests.fileLogging = { status: 'FAILED', error: fsErr.message }
      }

      // Test 3: Last 30 lines of debug log
      try {
        if (fs.existsSync(LOG_PATH)) {
          const content = fs.readFileSync(LOG_PATH, 'utf8')
          const lines = content.split('\n')
          report.tests.recentLogs = lines.slice(-40).join('\n')
        }
      } catch (readErr) {
        report.tests.recentLogs = `Failed to read log: ${readErr.message}`
      }

      res.statusCode = 200
      res.end(JSON.stringify(report, null, 2))
      return
    }

    try {
      await handle(req, res)
    } catch (err) {
      writeLog(`server:handleRequest:${req.method}:${req.url}`, err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  }).listen(port, () => {
    console.log(`> Ready on port/socket: ${port}`)
  })
}).catch((err) => {
  writeLog('server:appPrepare', err)
  process.exit(1)
})
