/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require('child_process')

const port = process.env.NODE_PORT || process.env.PORT || 3000

const child = spawn(
  'node',
  ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '0.0.0.0'],
  { stdio: 'inherit', env: { ...process.env } }
)

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code)
})

child.on('error', (err) => {
  console.error('Failed to start Next.js server:', err)
  process.exit(1)
})

process.on('SIGTERM', () => child.kill('SIGTERM'))
process.on('SIGINT', () => child.kill('SIGINT'))
