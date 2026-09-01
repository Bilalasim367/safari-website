import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Applying Bundle migration...')

  // For MySQL, we'll use Prisma migrations instead of raw SQL
  // This script is kept for reference but migrations should be run via `prisma migrate deploy`
  
  // Add sizePrices column to Product (idempotent)
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE Product ADD COLUMN sizePrices TEXT NOT NULL DEFAULT '[]';`)
  } catch {
    // Column already exists - ignore
  }

  // Add tracking columns to Order (idempotent)
  const orderColumns = [
    `ALTER TABLE \`Order\` ADD COLUMN trackingNumber TEXT;`,
    `ALTER TABLE \`Order\` ADD COLUMN shippedAt DATETIME;`,
    `ALTER TABLE \`Order\` ADD COLUMN estimatedDelivery DATETIME;`,
    `ALTER TABLE \`Order\` ADD COLUMN customerPhone TEXT;`,
    `ALTER TABLE \`Order\` ADD COLUMN discount REAL NOT NULL DEFAULT 0;`,
    `ALTER TABLE \`Order\` ADD COLUMN paymentMethod TEXT NOT NULL DEFAULT 'cod';`,
    `ALTER TABLE \`Order\` ADD COLUMN billingAddress TEXT;`,
    `ALTER TABLE \`Order\` ADD COLUMN notes TEXT;`,
  ]
  for (const colSql of orderColumns) {
    try { await prisma.$executeRawUnsafe(colSql) } catch { /* column exists */ }
  }

  // Add bulk upload columns to Product (idempotent)
  const bulkColumns = [
    `ALTER TABLE Product ADD COLUMN productId TEXT;`,
    `ALTER TABLE Product ADD COLUMN gender TEXT NOT NULL DEFAULT 'Unisex';`,
    `ALTER TABLE Product ADD COLUMN type TEXT NOT NULL DEFAULT 'Attar';`,
    `ALTER TABLE Product ADD COLUMN season TEXT;`,
    `ALTER TABLE Product ADD COLUMN bestTime TEXT;`,
    `ALTER TABLE Product ADD COLUMN impressionOf TEXT;`,
    `ALTER TABLE Product ADD COLUMN shortDescription TEXT;`,
    `ALTER TABLE Product ADD COLUMN longDescription TEXT;`,
    `ALTER TABLE Product ADD COLUMN tags TEXT;`,
    `ALTER TABLE Product ADD COLUMN sizesAvailable TEXT NOT NULL DEFAULT '3ml,6ml,12ml,50ml';`,
    `ALTER TABLE Product ADD COLUMN price3mlPhysical INTEGER;`,
    `ALTER TABLE Product ADD COLUMN price6mlPhysical INTEGER;`,
    `ALTER TABLE Product ADD COLUMN price12mlPhysical INTEGER;`,
    `ALTER TABLE Product ADD COLUMN price50mlPhysical INTEGER;`,
    `ALTER TABLE Product ADD COLUMN price3mlOnline INTEGER;`,
    `ALTER TABLE Product ADD COLUMN price6mlOnline INTEGER;`,
    `ALTER TABLE Product ADD COLUMN price12mlOnline INTEGER;`,
    `ALTER TABLE Product ADD COLUMN price50mlOnline INTEGER;`,
    `ALTER TABLE Product ADD COLUMN currency TEXT NOT NULL DEFAULT 'PKR';`,
    `ALTER TABLE Product ADD COLUMN oilPricePer100g INTEGER;`,
    `ALTER TABLE Product ADD COLUMN supplier TEXT;`,
    `ALTER TABLE Product ADD COLUMN isFeatured INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE Product ADD COLUMN isActive INTEGER NOT NULL DEFAULT 1;`,
    `ALTER TABLE Product ADD COLUMN stockStatus TEXT NOT NULL DEFAULT 'in_stock';`,
    `ALTER TABLE Product ADD COLUMN imageFolder TEXT;`,
    `ALTER TABLE Product ADD COLUMN metaTitle TEXT;`,
    `ALTER TABLE Product ADD COLUMN metaDescription TEXT;`,
    `ALTER TABLE Product ADD COLUMN isHotSelling INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE Product ADD COLUMN isTrending INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE Product ADD COLUMN concentration TEXT;`,
    `ALTER TABLE Product ADD COLUMN bottleStyle TEXT;`,
    `ALTER TABLE Product ADD COLUMN longevity TEXT;`,
    `ALTER TABLE Product ADD COLUMN sillage TEXT;`,
    `ALTER TABLE Product ADD COLUMN applicatorType TEXT;`,
    `ALTER TABLE Product ADD COLUMN origin TEXT;`,
    `ALTER TABLE Product ADD COLUMN ingredients TEXT;`,
  ]
  for (const colSql of bulkColumns) {
    try { await prisma.$executeRawUnsafe(colSql) } catch { /* column exists */ }
  }

  // Unique index for productId (idempotent)
  try {
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS Product_productId_key ON Product(productId);`)
  } catch { /* index exists */ }

  // Index for categorySlug + isActive filtering
  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS Product_categorySlug_isActive_idx ON Product(categorySlug, isActive);`)
  } catch { /* index exists */ }

  // Schema-parity indexes
  const schemaIndexes = [
    `CREATE INDEX IF NOT EXISTS Product_gender_isActive_idx ON Product(gender, isActive);`,
    `CREATE INDEX IF NOT EXISTS Product_type_isActive_idx ON Product(type, isActive);`,
    `CREATE INDEX IF NOT EXISTS Product_isBestseller_isActive_idx ON Product(isBestseller, isActive);`,
    `CREATE INDEX IF NOT EXISTS Product_isNew_isActive_idx ON Product(isNew, isActive);`,
    `CREATE INDEX IF NOT EXISTS Product_isHotSelling_isActive_idx ON Product(isHotSelling, isActive);`,
    `CREATE INDEX IF NOT EXISTS Product_isTrending_isActive_idx ON Product(isTrending, isActive);`,
    `CREATE INDEX IF NOT EXISTS Product_isFeatured_isActive_idx ON Product(isFeatured, isActive);`,
    `CREATE INDEX IF NOT EXISTS Product_isActive_idx ON Product(isActive);`,
    `CREATE INDEX IF NOT EXISTS Product_createdAt_idx ON Product(createdAt);`,
    `CREATE INDEX IF NOT EXISTS OrderItem_orderId_idx ON OrderItem(orderId);`,
    `CREATE INDEX IF NOT EXISTS CartItem_userId_idx ON CartItem(userId);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS WishlistItem_userId_productId_key ON WishlistItem(userId, productId);`,
    `CREATE INDEX IF NOT EXISTS WishlistItem_userId_idx ON WishlistItem(userId);`,
    `CREATE INDEX IF NOT EXISTS Notification_userId_read_idx ON Notification(userId, read);`,
  ]
  for (const idxSql of schemaIndexes) {
    try { await prisma.$executeRawUnsafe(idxSql) } catch (e) { console.error('Index statement failed:', idxSql, e) }
  }

  // Data normalization (idempotent)
  console.log('Normalizing legacy product values...')
  const normalizeSql = [
    `UPDATE Product SET type = 'Perfume' WHERE LOWER(type) LIKE '%perfume%' OR LOWER(type) LIKE '%edp%' OR LOWER(type) LIKE '%eau%';`,
    `UPDATE Product SET type = 'Attar' WHERE type NOT IN ('Attar', 'Perfume');`,
    `UPDATE Product SET gender = 'Men' WHERE LOWER(gender) = 'men';`,
    `UPDATE Product SET gender = 'Women' WHERE LOWER(gender) = 'women';`,
    `UPDATE Product SET gender = 'Unisex' WHERE gender IS NULL OR gender = '' OR LOWER(gender) = 'unisex';`,
    `UPDATE Product SET categorySlug = 'men' WHERE gender = 'Men';`,
    `UPDATE Product SET categorySlug = 'women' WHERE gender = 'Women';`,
    `UPDATE Product SET categorySlug = 'unisex' WHERE gender = 'Unisex';`,
  ]
  for (const sql of normalizeSql) {
    try { await prisma.$executeRawUnsafe(sql) } catch (e) { console.error('Normalization statement failed:', sql, e) }
  }

  // Ensure a Settings row exists
  try {
    await prisma.$executeRawUnsafe(`
      INSERT IGNORE INTO Settings (id, storeName, currency, timezone, taxRate, shippingFee, freeShippingThreshold, emailNotifications, orderEmails, marketingEmails, updatedAt)
      VALUES ('settings-default', 'Safari Perfumes', 'PKR', 'Asia/Karachi', 0, 0, 0, 1, 1, 0, NOW());
    `)
    console.log('Settings row ensured (default).')
  } catch (e) {
    console.error('Failed to ensure Settings row:', e)
  }

  console.log('Migration applied successfully!')
}

main().catch((e) => {
  console.error('Migration failed:', e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
  await pool.end()
})