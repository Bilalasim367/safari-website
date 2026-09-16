import mysql from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2'
import fs from 'fs'
import path from 'path'
import { parsePriceCsv, dedupeRows, buildDbIndex, matchRows, type DbProductLight } from '../src/lib/bulk-price'
import { normalizeBrandlessName } from '../src/lib/text-match'

async function main() {
  const c = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'Hassan224266', database: 'perfume_db' })
  const [prodRows] = await c.query<RowDataPacket[] & DbProductLight[]>('SELECT id, name, price, oilPricePer100g, productId FROM product')
  await c.end()
  const products: DbProductLight[] = prodRows.map((p) => ({ id: String(p.id), name: p.name, price: Number(p.price) || 0, oilPricePer100g: p.oilPricePer100g == null ? null : Number(p.oilPricePer100g), productId: p.productId ?? null }))
  const text = fs.readFileSync(path.join(process.cwd(), 'perfume.csv'), 'utf-8')
  const parsed = parsePriceCsv(text)
  const { activeRows } = dedupeRows(parsed.rows)
  const db = buildDbIndex(products)
  const { entries } = matchRows(activeRows, db)

  // DB products that share a brandless name with another DB product (ambiguity zones)
  const collisions = new Map<string, string[]>()
  for (const p of products) {
    const bl = normalizeBrandlessName(p.name)
    if (!bl) continue
    if (!collisions.has(bl)) collisions.set(bl, [])
    collisions.get(bl)!.push(p.name)
  }
  const ambiguousKeys = [...collisions.entries()].filter(([, v]) => v.length > 1)

  console.log('=== AMBIGUOUS BRANDLESS DB KEYS (multi-product) ===')
  for (const [k, v] of ambiguousKeys) console.log(`  [${k}] -> ${v.join(' || ')}`)

  console.log('\n=== HOW EACH AMBIGUOUS KEY WAS MATCHED FROM CSV ===')
  for (const [k, v] of ambiguousKeys) {
    const csvRows = entries.filter((e) => normalizeBrandlessName(e.name) === k && e.matched)
    if (csvRows.length === 0) {
      console.log(`  [${k}] no CSV row matched`)
      continue
    }
    for (const e of csvRows) {
      const correct = v.includes(e.dbName!)
      console.log(`  [${k}] "${e.name}" -> "${e.dbName}" (${e.matchType}, ${e.similarity}) ${correct ? 'OK' : '!!!! WRONG'}`)
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1) })