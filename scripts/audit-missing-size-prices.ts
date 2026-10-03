/**
 * READ-ONLY audit: which product sizes have no online retail price?
 *
 * `resolveSizeOptions` currently falls back to the stale base `price` when a
 * declared size has no `price*mlOnline` value. This script only reports what
 * would be affected. It performs no writes.
 *
 * Run: npx tsx scripts/audit-missing-size-prices.ts
 */
import prisma from '../src/lib/prisma';

const SIZE_COLUMNS: Record<string, 'price3mlOnline' | 'price6mlOnline' | 'price12mlOnline' | 'price50mlOnline'> = {
  '3ml': 'price3mlOnline',
  '6ml': 'price6mlOnline',
  '12ml': 'price12mlOnline',
  '50ml': 'price50mlOnline',
};

const normalize = (raw: string) => raw.trim().toLowerCase().replace(/\s+/g, '');

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true, name: true, slug: true, type: true, size: true,
      sizesAvailable: true, price: true, isActive: true, inStock: true,
      price3mlOnline: true, price6mlOnline: true, price12mlOnline: true, price50mlOnline: true,
    },
    orderBy: { name: 'asc' },
  });

  console.log(`Products scanned: ${products.length}\n`);

  const missingRows: string[] = [];
  const affectedProducts: { name: string; slug: string; id: string; sizes: string[]; wouldBeUnsellable: boolean }[] = [];

  for (const p of products) {
    const declared = String(p.sizesAvailable || '')
      .split(',')
      .map(normalize)
      .filter(Boolean);
    // Mirrors resolveSizeOptions: sizesAvailable wins, else the single `size`.
    const sizes = declared.length ? declared : [normalize(p.size || '')].filter(Boolean);

    const missing: string[] = [];
    for (const size of sizes) {
      const col = SIZE_COLUMNS[size];
      const value = col ? p[col] : null;
      const positive = value !== null && value !== undefined && Number(value) > 0;
      if (!positive) missing.push(size);
    }

    if (missing.length) {
      missingRows.push(
        `  ${p.name} (${p.slug}) [${p.id}]\n` +
        `    declares: ${sizes.join(', ') || '(none)'}  base price: ${p.price}  type: ${p.type}  active: ${p.isActive}  inStock: ${p.inStock}\n` +
        `    MISSING online price for: ${missing.join(', ')}  -> currently falls back to base ${p.price}`
      );
      affectedProducts.push({
        name: p.name, slug: p.slug, id: p.id, sizes: missing,
        wouldBeUnsellable: sizes.length > 0 && missing.length === sizes.length,
      });
    }
  }

  if (missingRows.length) {
    console.log('=== SIZES WITH NO ONLINE PRICE (currently priced at stale base price) ===\n');
    console.log(missingRows.join('\n\n'));
  } else {
    console.log('=== Every declared size on every product has an online price. ===');
  }

  const totalMissing = affectedProducts.reduce((sum, a) => sum + a.sizes.length, 0);
  console.log(`\n=== SUMMARY ===`);
  console.log(`Products total:                  ${products.length}`);
  console.log(`Products affected:               ${affectedProducts.length}`);
  console.log(`Sizes with no online price:      ${totalMissing}`);
  console.log(`Products with ZERO priced sizes: ${affectedProducts.filter((a) => a.wouldBeUnsellable).length}`);
  for (const a of affectedProducts.filter((x) => x.wouldBeUnsellable)) {
    console.log(`  - ${a.name} (${a.slug}) — would become fully unavailable: ${a.sizes.join(', ')}`);
  }

  // Show which products currently have no sellable size at all under the
  // proposed rule (every declared size unpriced), including those not listed
  // above because they have no declared sizes whatsoever.
  const noPricedSizes = products.filter((p) => {
    const declared = String(p.sizesAvailable || '').split(',').map(normalize).filter(Boolean);
    const sizes = declared.length ? declared : [normalize(p.size || '')].filter(Boolean);
    if (!sizes.length) return true;
    return sizes.every((s) => {
      const col = SIZE_COLUMNS[s];
      const v = col ? p[col] : null;
      return v === null || v === undefined || Number(v) <= 0;
    });
  });
  console.log(`\nProducts with no priced size at all (incl. undeclared): ${noPricedSizes.length}`);
  for (const p of noPricedSizes) {
    console.log(`  - ${p.name} (${p.slug}) sizesAvailable="${p.sizesAvailable}" size="${p.size}" base=${p.price}`);
  }
}

main()
  .catch((e) => { console.error('[error]', e instanceof Error ? e.message : e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
