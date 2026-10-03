/**
 * Removes temporary QA-only fixture products created by scripts/test-local-pricing.ts.
 *
 * This is a maintenance utility for the LOCAL database only. It refuses to run
 * against a non-local host and requires an explicit opt-in flag, because it
 * performs destructive deletes.
 *
 *   TEST_LOCAL_PRICING=1 npx tsx --env-file=.env scripts/cleanup-qa-fixtures.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FIXTURE_SLUGS = ['__qa-unpriced__', '__qa-gap__'];

function assertLocalDb(): void {
  if (process.env.TEST_LOCAL_PRICING !== '1') {
    throw new Error('Refusing to run: set TEST_LOCAL_PRICING=1 to confirm this is intended.');
  }
  const url = process.env.DATABASE_URL || '';
  let host = '';
  try {
    host = new URL(url.replace(/^mysql:\/\//, 'http://')).hostname;
  } catch {
    throw new Error('Refusing to run: DATABASE_URL is not parseable.');
  }
  const localHosts = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
  if (!localHosts.includes(host)) {
    throw new Error(`Refusing to run: DATABASE_URL host "${host}" is not local.`);
  }
  console.log(`[guard] local DB confirmed (host=${host})`);
}

async function main() {
  assertLocalDb();

  const targets = await prisma.product.findMany({
    where: { slug: { in: FIXTURE_SLUGS } },
    select: { id: true, slug: true, name: true },
  });

  if (targets.length === 0) {
    console.log('[cleanup] no QA fixture products found; nothing to do.');
    return;
  }

  const ids = targets.map((t) => t.id);
  for (const t of targets) {
    console.log(`[cleanup] removing fixture ${t.slug} (${t.id})`);
  }

  // Delete dependent rows explicitly. Only `review` has ON DELETE CASCADE, and
  // `bundleitem` holds a restrictive FK, so both must be handled before Product.
  const bundleItems = await prisma.bundleItem.deleteMany({ where: { productId: { in: ids } } });
  const reviews = await prisma.review.deleteMany({ where: { productId: { in: ids } } });
  const cartItems = await prisma.cartItem.deleteMany({ where: { productId: { in: ids } } });
  const wishlist = await prisma.wishlistItem.deleteMany({ where: { productId: { in: ids } } });
  const orderItems = await prisma.orderItem.deleteMany({ where: { productId: { in: ids } } });
  const priceLogs = await prisma.priceUpdateLog.deleteMany({ where: { productId: { in: ids } } });
  const products = await prisma.product.deleteMany({ where: { id: { in: ids } } });

  console.log(
    `[cleanup] deleted products=${products.count} reviews=${reviews.count} bundleItems=${bundleItems.count} ` +
      `cartItems=${cartItems.count} wishlist=${wishlist.count} orderItems=${orderItems.count} priceLogs=${priceLogs.count}`
  );
}

main()
  .catch((err) => {
    console.error('[cleanup] failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
