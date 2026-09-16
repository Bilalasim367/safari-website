import mysql from 'mysql2/promise'

async function main() {
  const user = process.env.MYSQL_USER || 'root'
  const pass = process.env.MYSQL_PASS || 'Hassan224266'
  const db = process.env.MYSQL_DB || 'perfume_db'
  const c = await mysql.createConnection({ host: 'localhost', user, password: pass, database: db })
  const [dbs] = await c.query('SHOW DATABASES')
  console.log('Databases:', (dbs as any[]).map((d) => d.Database).join(', '))
  const [tables] = await c.query('SHOW TABLES')
  console.log('Tables:', (tables as any[]).map((t) => Object.values(t)[0]).join(', '))
  await c.end()
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})