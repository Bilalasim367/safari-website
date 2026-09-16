import mysql from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2'
import fs from 'fs'
import path from 'path'
import { parsePriceCsv, dedupeRows, buildDbIndex, matchRows, resolveMatchedIds } from '../src/lib/bulk-price'
import type { MatchType } from '../src/lib/bulk-price'

interface DbRow {
  id: string
  name: string
  price: number
  oilPricePer100g: number | null
  productId: string | null
}

async function main() {
  const pass = process.env.MYSQL_PASS || 'Hassan224266'
  const c = await mysql.createConnection({ host: 'localhost', user: 'root', password: pass, database: 'perfume_db' })
  const [prodRows] = await c.query<RowDataPacket[] & DbRow[]>('SELECT id, name, price, oilPricePer100g, productId FROM product')
  await c.end()

  const products: DbRow[] = prodRows.map((p) => ({
    id: String(p.id),
    name: p.name,
    price: p.price == null ? 0 : Number(p.price),
    oilPricePer100g: p.oilPricePer100g == null ? null : Number(p.oilPricePer100g),
    productId: p.productId ?? null,
  }))

  const text = fs.readFileSync(path.join(process.cwd(), 'perfume.csv'), 'utf-8')
  const parsed = parsePriceCsv(text)
  const { activeRows, duplicates } = dedupeRows(parsed.rows)

  const db = buildDbIndex(products)
  const { entries, notFound, errors } = matchRows(activeRows, db)
  const rowIds = resolveMatchedIds(entries, db)

  const byType = new Map<MatchType, number>()
  for (const e of entries) {
    if (!e.matched) continue
    byType.set(e.matchType, (byType.get(e.matchType) ?? 0) + 1)
  }

  const matched = entries.filter((e) => e.matched && !e.superseded && !e.error)
  const mismapped = entries.filter((e) => {
    const ids = rowIds.get(e.rowNum) ?? []
    return ids.length === 0
  })

  console.log('\n=== MATCH SUMMARY ===')
  console.log(`Active CSV rows : ${activeRows.length}`)
  console.log(`DB products     : ${products.length}`)
  console.log(`Matched rows    : ${matched.length}/${activeRows.length}`)
  console.log(`Not found       : ${notFound.length}`)
  console.log(`"Matched" but no resolvable id (bug?) : ${mismapped.length}`)

  console.log('\n=== BY MATCH TYPE ===')
  for (const [t, n] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(t).padEnd(16)} ${n}`)
  }

  console.log('\n=== NOT FOUND (with suggestions) ===')
  for (const nf of notFound) {
    const sug = nf.suggestions.slice(0, 3).map((s) => `${s.dbName} (${s.similarity.toFixed(2)})`).join(' | ')
    console.log(`  [r${nf.row}] ${nf.name}\n    → ${sug || '(none)'}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })