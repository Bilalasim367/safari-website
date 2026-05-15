import { createClient } from '@libsql/client'

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

async function main() {
  console.log('Applying Bundle migration...')

  const sql = `
    CREATE TABLE IF NOT EXISTS "Bundle" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "price" REAL NOT NULL,
        "originalPrice" REAL,
        "image" TEXT,
        "save" TEXT,
        "size" TEXT,
        "inStock" INTEGER NOT NULL DEFAULT 1,
        "isActive" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "BundleItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bundleId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "Bundle_slug_key" ON "Bundle"("slug");
    CREATE INDEX IF NOT EXISTS "Bundle_isActive_idx" ON "Bundle"("isActive");
    CREATE UNIQUE INDEX IF NOT EXISTS "BundleItem_bundleId_productId_key" ON "BundleItem"("bundleId", "productId");
  `

  await turso.executeMultiple(sql)

  // Add sizePrices column to Product (idempotent)
  try {
    await turso.execute(`ALTER TABLE Product ADD COLUMN "sizePrices" TEXT NOT NULL DEFAULT '[]';`)
  } catch {
    // Column already exists - ignore
  }

  // Add tracking columns to Order (idempotent)
  const orderColumns = [
    `ALTER TABLE "Order" ADD COLUMN "trackingNumber" TEXT;`,
    `ALTER TABLE "Order" ADD COLUMN "shippedAt" DATETIME;`,
    `ALTER TABLE "Order" ADD COLUMN "estimatedDelivery" DATETIME;`,
  ]
  for (const colSql of orderColumns) {
    try { await turso.execute(colSql) } catch { /* column exists */ }
  }

  console.log('Migration applied successfully!')
}

main().catch((e) => {
  console.error('Migration failed:', e)
  process.exit(1)
})
