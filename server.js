const { createServer } = require('http')
const next = require('next')
const fs = require('fs')
const path = require('path')

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
