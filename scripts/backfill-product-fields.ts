import { createClient } from '@libsql/client'

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

function parseTags(tags: string | null): Record<string, string> {
  const result: Record<string, string> = {}
  if (!tags) return result

  for (const entry of tags.split(';')) {
    const idx = entry.indexOf(':')
    if (idx === -1) continue
    const key = entry.slice(0, idx).trim()
    const value = entry.slice(idx + 1).trim()
    if (key && value) {
      result[key] = value
    }
  }
  return result
}

async function main() {
  console.log('Backfilling product attributes from tags...')

  const rows = await turso.execute('SELECT id, tags, type FROM Product WHERE tags IS NOT NULL AND tags != \'\'')

  let updatedCount = 0

  for (const row of rows.rows) {
    const id = row.id as string
    const tags = row.tags as string | null
    const type = row.type as string | null
    const parsed = parseTags(tags)

    if (Object.keys(parsed).length === 0) continue

    const updates: string[] = []
    const values: (string | null)[] = []

    // Perfume fields
    if (parsed.concentration) {
      updates.push(`"concentration" = ?`)
      values.push(parsed.concentration)
    }
    // Note: tags use "bottle" key, column is "bottleStyle"
    if (parsed.bottle) {
      updates.push(`"bottleStyle" = ?`)
      values.push(parsed.bottle)
    }

    // Attar fields
    if (parsed.applicator) {
      updates.push(`"applicatorType" = ?`)
      values.push(parsed.applicator)
    }
    if (parsed.origin) {
      updates.push(`"origin" = ?`)
      values.push(parsed.origin)
    }
    if (parsed.ingredients) {
      updates.push(`"ingredients" = ?`)
      values.push(parsed.ingredients)
    }

    if (updates.length === 0) continue

    values.push(id)
    const sql = `UPDATE Product SET ${updates.join(', ')} WHERE id = ?`

    await turso.execute({
      sql,
      args: values,
    })

    updatedCount++
    console.log(`  Updated product ${id} (type: ${type || 'unknown'}): ${updates.join(', ')}`)
  }

  console.log(`\nDone! Updated ${updatedCount} products.`)
}

main().catch((e) => {
  console.error('Backfill failed:', e)
  process.exit(1)
})
