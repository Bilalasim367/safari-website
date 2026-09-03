/**
 * Safari Perfumes — Rename "Perfume" → "Attar" in product names
 *
 * Task: The site currently only sells attar (12ml). This script renames
 * existing products whose NAME contains the word "Perfume" to "Attar",
 * and strips any size mention (e.g. "50ml") from the name.
 *
 * IMPORTANT: This only touches the `name` field of existing Product rows.
 * It does NOT touch prisma/schema.prisma, server.js, next.config, or any
 * UI/global labels — future "Perfume" support remains intact in code.
 *
 * Only renames names whose TRAILING standalone word is "Perfume" (so brand
 * names like "By Perfumer's Workshop" or "Perfumes De Marly" are left alone).
 *
 * Examples:
 *   "Ajmal Amber Perfume"        -> "Ajmal Amber Attar"
 *   "Blue Oud Perfume 50ml"      -> "Blue Oud Attar"
 *
 * Run on the server where DATABASE_URL is available:
 *   node scripts/rename-to-attar.js
 *
 * Dry run (only counts + shows examples, no writes):
 *   node scripts/rename-to-attar.js --dry-run
 */

require('dotenv').config()

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const DRY_RUN = process.argv.includes('--dry-run')

// Regex to strip size mentions like "50ml", "100ml", "3.3oz", "12ml", "10 ml"
const SIZE_RE = /\b\d+(?:\.\d+)?\s*(?:ml|oz)\b/gi

// Match any case variant of the whole word "perfume" at the END of the name
// (optionally followed by a size like "50ml").
// Restricting to a TRAILING standalone "perfume" avoids corrupting brand
// names such as "By Perfumes De Marly", "By Perfumer's Workshop" etc.
const TRAILING_PERFUME_RE = /\bperfume\b$/i

function isRenameCandidate(name) {
  // Remove any trailing standalone size, then check the remaining name
  // still ends with the standalone word "perfume".
  const noSize = name.trim().replace(SIZE_RE, '').trim()
  return TRAILING_PERFUME_RE.test(noSize)
}

function cleanName(name) {
  let cleaned = name.trim()
  // 1) Remove the trailing size (e.g. "50ml")
  cleaned = cleaned.replace(SIZE_RE, '')
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim()
  // 2) Replace the trailing "Perfume" word (any case) with "Attar"
  cleaned = cleaned.replace(TRAILING_PERFUME_RE, 'Attar')
  // 3) Clean up any leftover stray separators/space
  cleaned = cleaned.replace(/\s+[-–]\s*$/g, '').trim()
  return cleaned
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('[rename-to-attar] ERROR: DATABASE_URL is not set.')
    process.exit(1)
  }

  console.log(
    `[rename-to-attar] ${DRY_RUN ? 'DRY-RUN' : 'LIVE'} — renaming trailing "Perfume" → "Attar"...`
  )
  console.log('[rename-to-attar] ----------------------------------------')

  // Fetch all products, then filter case-insensitively in JS.
  // (MySQL/Prisma doesn't support `mode: 'insensitive'`, and the default
  //  collation behavior varies — filtering in JS guarantees all case variants
  //  {"Perfume", "perfume", "PERFUME"} are caught regardless of DB collation.)
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  })

  const products = allProducts.filter((p) => isRenameCandidate(p.name))

  console.log(
    `[rename-to-attar] Scanned ${allProducts.length} products; ` +
      `${products.length} have a trailing "Perfume" to rename.`
  )

  if (products.length === 0) {
    console.log('[rename-to-attar] Nothing to rename.')
    await prisma.$disconnect()
    process.exit(0)
  }

  let renamedCount = 0
  const examples = []

  for (const product of products) {
    const newName = cleanName(product.name)
    // Only "count" as renamed if the cleaned name actually differs.
    const changed = newName !== product.name

    if (!changed) {
      console.log(`[rename-to-attar] = (no change) ${product.name}`)
      continue
    }

    if (!DRY_RUN) {
      await prisma.product.update({
        where: { id: product.id },
        data: { name: newName },
      })
    }

    renamedCount++
    if (examples.length < 10) {
      examples.push({ before: product.name, after: newName, slug: product.slug })
    }
  }

  console.log('[rename-to-attar] ----------------------------------------')
  console.log(`[rename-to-attar] ${DRY_RUN ? 'WOULD rename' : 'Renamed'} ${renamedCount} product(s).`)

  if (examples.length) {
    console.log('[rename-to-attar] First up to 10 examples:')
    examples.forEach((ex, i) => {
      console.log(`  ${i + 1}. "${ex.before}"  →  "${ex.after}"  (${ex.slug})`)
    })
  }

  await prisma.$disconnect()
  process.exit(DRY_RUN ? 0 : renamedCount >= 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('[rename-to-attar] Fatal error:', err)
  process.exit(1)
})
