import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Applying Bundle migration...')

  // For MySQL, we'll use Prisma migrations instead of raw SQL
  // This script is kept for reference but migrations should be run via `prisma migrate deploy`
  
  // Add sizePrices column to product (idempotent)
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE product ADD COLUMN sizePrices TEXT NOT NULL DEFAULT '[]';`)
  } catch {
    // Column already exists - ignore
  }

  // Add tracking columns to order (idempotent)
  const orderColumns = [
    `ALTER TABLE \`order\` ADD COLUMN trackingNumber TEXT;`,
    `ALTER TABLE \`order\` ADD COLUMN shippedAt DATETIME;`,
    `ALTER TABLE \`order\` ADD COLUMN estimatedDelivery DATETIME;`,
    `ALTER TABLE \`order\` ADD COLUMN customerPhone TEXT;`,
    `ALTER TABLE \`order\` ADD COLUMN discount REAL NOT NULL DEFAULT 0;`,
    `ALTER TABLE \`order\` ADD COLUMN paymentMethod TEXT NOT NULL DEFAULT 'cod';`,
    `ALTER TABLE \`order\` ADD COLUMN billingAddress TEXT;`,
    `ALTER TABLE \`order\` ADD COLUMN notes TEXT;`,
  ]
  for (const colSql of orderColumns) {
    try { await prisma.$executeRawUnsafe(colSql) } catch { /* column exists */ }
  }

  // Add bulk upload columns to product (idempotent)
  const bulkColumns = [
    `ALTER TABLE product ADD COLUMN productId TEXT;`,
    `ALTER TABLE product ADD COLUMN gender TEXT NOT NULL DEFAULT 'Unisex';`,
    `ALTER TABLE product ADD COLUMN type TEXT NOT NULL DEFAULT 'Attar';`,
    `ALTER TABLE product ADD COLUMN season TEXT;`,
    `ALTER TABLE product ADD COLUMN bestTime TEXT;`,
    `ALTER TABLE product ADD COLUMN impressionOf TEXT;`,
    `ALTER TABLE product ADD COLUMN shortDescription TEXT;`,
    `ALTER TABLE product ADD COLUMN longDescription TEXT;`,
    `ALTER TABLE product ADD COLUMN tags TEXT;`,
    `ALTER TABLE product ADD COLUMN sizesAvailable TEXT NOT NULL DEFAULT '3ml,6ml,12ml,50ml';`,
    `ALTER TABLE product ADD COLUMN price3mlPhysical INTEGER;`,
    `ALTER TABLE product ADD COLUMN price6mlPhysical INTEGER;`,
    `ALTER TABLE product ADD COLUMN price12mlPhysical INTEGER;`,
    `ALTER TABLE product ADD COLUMN price50mlPhysical INTEGER;`,
    `ALTER TABLE product ADD COLUMN price3mlOnline INTEGER;`,
    `ALTER TABLE product ADD COLUMN price6mlOnline INTEGER;`,
    `ALTER TABLE product ADD COLUMN price12mlOnline INTEGER;`,
    `ALTER TABLE product ADD COLUMN price50mlOnline INTEGER;`,
    `ALTER TABLE product ADD COLUMN currency TEXT NOT NULL DEFAULT 'PKR';`,
    `ALTER TABLE product ADD COLUMN oilPricePer100g INTEGER;`,
    `ALTER TABLE product ADD COLUMN supplier TEXT;`,
    `ALTER TABLE product ADD COLUMN isFeatured INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE product ADD COLUMN isActive INTEGER NOT NULL DEFAULT 1;`,
    `ALTER TABLE product ADD COLUMN stockStatus TEXT NOT NULL DEFAULT 'in_stock';`,
    `ALTER TABLE product ADD COLUMN imageFolder TEXT;`,
    `ALTER TABLE product ADD COLUMN metaTitle TEXT;`,
    `ALTER TABLE product ADD COLUMN metaDescription TEXT;`,
    `ALTER TABLE product ADD COLUMN isHotSelling INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE product ADD COLUMN isTrending INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE product ADD COLUMN concentration TEXT;`,
    `ALTER TABLE product ADD COLUMN bottleStyle TEXT;`,
    `ALTER TABLE product ADD COLUMN longevity TEXT;`,
    `ALTER TABLE product ADD COLUMN sillage TEXT;`,
    `ALTER TABLE product ADD COLUMN applicatorType TEXT;`,
    `ALTER TABLE product ADD COLUMN origin TEXT;`,
    `ALTER TABLE product ADD COLUMN ingredients TEXT;`,
    `ALTER TABLE product ADD COLUMN notes TEXT;`,
  ]
  for (const colSql of bulkColumns) {
    try { await prisma.$executeRawUnsafe(colSql) } catch { /* column exists */ }
  }

  // Unique index for productId (idempotent)
  try {
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS product_productId_key ON product(productId);`)
  } catch { /* index exists */ }

  // Index for categorySlug + isActive filtering
  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS product_categorySlug_isActive_idx ON product(categorySlug, isActive);`)
  } catch { /* index exists */ }

  // Schema-parity indexes
  const schemaIndexes = [
    `CREATE INDEX IF NOT EXISTS product_gender_isActive_idx ON product(gender, isActive);`,
    `CREATE INDEX IF NOT EXISTS product_type_isActive_idx ON product(type, isActive);`,
    `CREATE INDEX IF NOT EXISTS product_isBestseller_isActive_idx ON product(isBestseller, isActive);`,
    `CREATE INDEX IF NOT EXISTS product_isNew_isActive_idx ON product(isNew, isActive);`,
    `CREATE INDEX IF NOT EXISTS product_isHotSelling_isActive_idx ON product(isHotSelling, isActive);`,
    `CREATE INDEX IF NOT EXISTS product_isTrending_isActive_idx ON product(isTrending, isActive);`,
    `CREATE INDEX IF NOT EXISTS product_isFeatured_isActive_idx ON product(isFeatured, isActive);`,
    `CREATE INDEX IF NOT EXISTS product_isActive_idx ON product(isActive);`,
    `CREATE INDEX IF NOT EXISTS product_createdAt_idx ON product(createdAt);`,
    `CREATE INDEX IF NOT EXISTS orderitem_orderId_idx ON orderitem(orderId);`,
    `CREATE INDEX IF NOT EXISTS cartitem_userId_idx ON cartitem(userId);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS wishlistitem_userId_productId_key ON wishlistitem(userId, productId);`,
    `CREATE INDEX IF NOT EXISTS wishlistitem_userId_idx ON wishlistitem(userId);`,
    `CREATE INDEX IF NOT EXISTS notification_userId_read_idx ON notification(userId, \`read\`);`,
  ]
  for (const idxSql of schemaIndexes) {
    try { await prisma.$executeRawUnsafe(idxSql) } catch (e) { console.error('Index statement failed:', idxSql, e) }
  }

  // Data normalization (idempotent)
  // NOTE: On MySQL the table name is case-insensitive, but to be safe on Linux
  // cPanel (case-sensitive fs), always use lowercase table names.
  console.log('Normalizing legacy product values...')
  const normalizeSql = [
    `UPDATE product SET type = 'Perfume' WHERE LOWER(type) LIKE '%perfume%' OR LOWER(type) LIKE '%edp%' OR LOWER(type) LIKE '%eau%';`,
    `UPDATE product SET type = 'Attar' WHERE type NOT IN ('Attar', 'Perfume');`,
    `UPDATE product SET gender = 'Men' WHERE LOWER(gender) = 'men';`,
    `UPDATE product SET gender = 'Women' WHERE LOWER(gender) = 'women';`,
    `UPDATE product SET gender = 'Unisex' WHERE gender IS NULL OR gender = '' OR LOWER(gender) = 'unisex';`,
    `UPDATE product SET categorySlug = 'men' WHERE gender = 'Men';`,
    `UPDATE product SET categorySlug = 'women' WHERE gender = 'Women';`,
    `UPDATE product SET categorySlug = 'unisex' WHERE gender = 'Unisex';`,
  ]
  for (const sql of normalizeSql) {
    try { await prisma.$executeRawUnsafe(sql) } catch (e) { console.error('Normalization statement failed:', sql, e) }
  }

  // Ensure a settings row exists
  try {
    await prisma.$executeRawUnsafe(`
      INSERT IGNORE INTO settings (id, storeName, currency, timezone, taxRate, shippingFee, freeShippingThreshold, emailNotifications, orderEmails, marketingEmails, updatedAt)
      VALUES ('settings-default', 'Safari Perfumes', 'PKR', 'Asia/Karachi', 0, 0, 0, 1, 1, 0, NOW());
    `)
    console.log('Settings row ensured (default).')
  } catch (e) {
    console.error('Failed to ensure Settings row:', e)
  }

  // ReturnRequest table (idempotent)
  console.log('Ensuring returnrequest table...')
  const returnTableSql = `
    CREATE TABLE IF NOT EXISTS returnrequest (
      id VARCHAR(191) NOT NULL,
      requestId VARCHAR(191) NOT NULL,
      type VARCHAR(191) NOT NULL DEFAULT 'return',
      orderNumber VARCHAR(191),
      customerName VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone VARCHAR(191),
      productName VARCHAR(191) NOT NULL,
      sku VARCHAR(191),
      size VARCHAR(191),
      reason VARCHAR(191) NOT NULL,
      details TEXT,
      status VARCHAR(191) NOT NULL DEFAULT 'pending',
      adminNote TEXT,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY returnrequest_requestId_key (requestId),
      KEY returnrequest_status_createdAt_idx (status, createdAt),
      KEY returnrequest_email_idx (email),
      KEY returnrequest_orderNumber_idx (orderNumber)
    );
  `
  try {
    await prisma.$executeRawUnsafe(returnTableSql)
    console.log('returnrequest table ensured.')
  } catch (e) {
    console.error('Failed to ensure returnrequest table:', e)
  }

  // PriceUpdateLog table for bulk price update audit trail (idempotent)
  console.log('Ensuring priceupdatelog table...')
  const priceLogTableSql = `
    CREATE TABLE IF NOT EXISTS priceupdatelog (
      id VARCHAR(191) NOT NULL,
      productId VARCHAR(191),
      productName TEXT,
      csvFileName VARCHAR(191),
      field VARCHAR(191) NOT NULL,
      oldValue DOUBLE,
      newValue DOUBLE,
      performedById VARCHAR(191),
      performedByEmail VARCHAR(191),
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY priceupdatelog_productId_createdAt_idx (productId, createdAt),
      KEY priceupdatelog_createdAt_idx (createdAt)
    );
  `
  try {
    await prisma.$executeRawUnsafe(priceLogTableSql)
    console.log('priceupdatelog table ensured.')
  } catch (e) {
    console.error('Failed to ensure priceupdatelog table:', e)
  }

  console.log('Migration applied successfully!')
}

main().catch((e) => {
  console.error('Migration failed:', e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})