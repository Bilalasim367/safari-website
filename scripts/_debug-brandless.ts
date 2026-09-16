import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { parsePriceCsv, dedupeRows, buildDbIndex } from '../src/lib/bulk-price'
import { normalizeProductName, similarity } from '../src/lib/text-match'

function stripBrand(norm: string): string {
  const idx = norm.lastIndexOf(' by ')
  if (idx > 0) return norm.slice(0, idx).trim()
  return norm
}

async function main() {
  const pass = process.env.MYSQL_PASS || 'Hassan224266'
  const c = await mysql.createConnection({ host: 'localhost', user: 'root', password: pass, database: 'perfume_db' })
  const [prodRows] = await c.query<any[]>('SELECT id, name FROM product')
  await c.end()

  const dbNames = prodRows.map((p: any) => p.name)

  const text = fs.readFileSync(path.join(process.cwd(), 'perfume.csv'), 'utf-8')
  const parsed = parsePriceCsv(text)
  const { activeRows } = dedupeRows(parsed.rows)

  const dbIdx = buildDbIndex(dbNames.map((name, i) => ({ id: String(i), name, price: 0, oilPricePer100g: null, productId: null })))

  // DB index of brandless names
  const brandlessMap = new Map<string, string[]>()
  for (const name of dbNames) {
    const b = stripBrand(normalizeProductName(name))
    if (!b) continue
    if (!brandlessMap.has(b)) brandlessMap.set(b, [])
    brandlessMap.get(b)!.push(name)
  }

  let reachableByBrandless = 0
  const outcomes: { csv: string; how: string; db: string }[] = []

  for (const row of activeRows) {
    const norm = normalizeProductName(row.name)
    const b = stripBrand(norm)
    const brandlessHits = brandlessMap.get(b) ?? []
    if (brandlessHits.length > 0 && brandlessHits.join('|').toLowerCase() !== row.name.toLowerCase()) {
      reachableByBrandless++
      outcomes.push({ csv: row.name, how: `BRANDLESS(exact ${brandlessHits.length})`, db: brandlessHits.join(' | ') })
    } else {
      // top fuzzy candidates
      const ranked: { name: string; sim: number }[] = []
      for (const n of dbNames) {
        const s = similarity(row.name, n)
        if (s >= 0.6) ranked.push({ name: n, sim: s })
      }
      ranked.sort((a, z) => z.sim - a.sim)
      const top = ranked.slice(0, 3).map((r) => `${r.name} (${r.sim.toFixed(2)})`).join(' | ')
      outcomes.push({ csv: row.name, how: 'FUZZY', db: top || '(none ≥0.6)' })
    }
  }

  console.log(`\n=== Brandless-reachable (would become matched): ${reachableByBrandless}/${activeRows.length} ===\n`)

  // Show potential false-positive risk: brandless names with >1 DB hit
  const multi: [string, string[]][] = [...brandlessMap.entries()].filter(([, v]) => v.length > 1)
  console.log(`\n=== Brandless names with MULTIPLE DB products (${multi.length}) — risk of ambiguous match ===`)
  for (const [k, v] of multi.slice(0, 40)) {
    console.log(`  [${k}]: ${v.join('  ||  ')}`)
  }

  console.log('\n=== ALL CSV rows: how would they match after fix ===')
  for (const o of outcomes) {
    console.log(`${o.how.padEnd(28)} ${o.csv}\n    → ${o.db}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })