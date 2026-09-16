import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { parsePriceCsv, dedupeRows, buildDbIndex, matchRows } from '../src/lib/bulk-price'
import { normalizeProductName } from '../src/lib/text-match'

async function main() {
  const user = process.env.MYSQL_USER || 'root'
  const pass = process.env.MYSQL_PASS || 'Hassan224266'
  const dbName = process.env.MYSQL_DB || 'perfume_db'
  const c = await mysql.createConnection({ host: 'localhost', user, password: pass, database: dbName })

  const [prodRows] = await c.query<any[]>('SELECT id, name, price, oilPricePer100g, productId FROM product')
  const products = prodRows.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    oilPricePer100g: p.oilPricePer100g === null ? null : Number(p.oilPricePer100g),
    productId: p.productId,
  }))
  await c.end()

  console.log(`\n=== DB products: ${products.length} ===`)

  const csvPath = path.join(process.cwd(), 'perfume.csv')
  const text = fs.readFileSync(csvPath, 'utf-8')
  const parsed = parsePriceCsv(text)
  console.log(`\n=== CSV parsed: headerIdx=${parsed.headerIdx}, rawRowCount=${parsed.rawRowCount}, dataRows=${parsed.rows.length} ===`)

  const { activeRows, duplicates } = dedupeRows(parsed.rows)
  console.log(`activeRows=${activeRows.length}, duplicates=${duplicates.length}`)

  const dbIdx = buildDbIndex(products)
  const { entries, notFound, errors } = matchRows(activeRows, dbIdx)

  const matched = entries.filter((e) => e.matched && !e.superseded && !e.error)
  const unmatched = entries.filter((e) => !e.matched || e.error)
  console.log(`\n=== MATCH RESULT: matched=${matched.length} / ${activeRows.length}, notFound=${notFound.length}, errors=${errors.length} ===`)

  console.log('\n--- MATCHED (CSV name → DB name, similarity) ---')
  for (const e of matched) {
    console.log(`${String(e.similarity).padStart(5)} ${e.name}  =>  ${e.dbName}`)
  }

  console.log('\n--- NOT FOUND (CSV name) ---')
  for (const n of notFound) {
    console.log(`   ${n.name}`)
  }

  console.log('\n--- ERRORS ---')
  for (const er of errors) {
    console.log(`   [${er.reason}] ${er.name}`)
  }

  console.log('\n=== DB name samples (first 80, normalized) ===')
  const normDbs = new Map<string, string[]>()
  for (const p of products) {
    const k = normalizeProductName(p.name)
    if (!normDbs.has(k)) normDbs.set(k, [])
    normDbs.get(k)!.push(p.name)
  }
  const uniqDbs = [...normDbs.keys()]
  for (const k of uniqDbs.slice(0, 80)) {
    const names = normDbs.get(k)!
    console.log(`  [${k}] <- ${names.length > 1 ? `(x${names.length}) ` : ''}${names[0]}`)
  }
  console.log(`... total ${uniqDbs.length} unique normalized DB names`)

  console.log('\n=== CSV normalized names (that did NOT match) ===')
  for (const e of unmatched) {
    console.log(`  [${normalizeProductName(e.name)}] <- ${e.name}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})