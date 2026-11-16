/**
 * Backfill online (retail) prices for products that have none.
 *
 * The storefront reads ONLY `price3mlOnline`/`price6mlOnline`/`price12mlOnline`/
 * `price50mlOnline`. A product with a base `price` but all four of those empty
 * renders "Unavailable" on every card and on its product page — which is what
 * the old admin form and the old CSV importers produced.
 *
 * This script repairs those rows using the same rule every write path now uses
 * (`resolveOnlinePrices`): the base price fills the sold volume's column
 * (Attar 12ml, Perfume 50ml, or the product's own `size`). It never touches a
 * product that already has any online price, and it never invents a number.
 *
 * Run on the server that holds DATABASE_URL:
 *   npx tsx scripts/backfill-online-prices.ts            # dry run (no writes)
 *   npx tsx scripts/backfill-online-prices.ts --apply    # write the repairs
 */
import prisma from '../src/lib/prisma';
import { resolveOnlinePrices } from '../src/lib/size-pricing';

const APPLY = process.argv.includes('--apply');

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      size: true,
      price: true,
      isActive: true,
      price3mlOnline: true,
      price6mlOnline: true,
      price12mlOnline: true,
      price50mlOnline: true,
    },
    orderBy: { name: 'asc' },
  });

  const broken = products.filter(
    (p) =>
      p.price3mlOnline === null &&
      p.price6mlOnline === null &&
      p.price12mlOnline === null &&
      p.price50mlOnline === null
  );

  const repairable: { id: string; name: string; column: string; value: number }[] = [];
  const unrepairable: typeof broken = [];

  for (const p of broken) {
    const resolved = resolveOnlinePrices({
      price: p.price,
      type: p.type,
      size: p.size,
    });
    const entry = Object.entries(resolved).find(([, value]) => value !== null);
    if (!entry) {
      unrepairable.push(p);
      continue;
    }
    repairable.push({ id: p.id, name: p.name, column: entry[0], value: entry[1] as number });
  }

  console.log(`Products total:            ${products.length}`);
  console.log(`No online price at all:    ${broken.length}`);
  console.log(`Repairable from base:      ${repairable.length}`);
  console.log(`No base price (manual fix):${unrepairable.length}`);

  if (repairable.length) {
    console.log('\nWill be repaired:');
    for (const r of repairable.slice(0, 50)) {
      console.log(`  ${r.name} -> ${r.column} = ${r.value}`);
    }
    if (repairable.length > 50) console.log(`  … and ${repairable.length - 50} more`);
  }

  if (unrepairable.length) {
    console.log('\nCannot be repaired (enter a price manually):');
    for (const p of unrepairable.slice(0, 50)) {
      console.log(`  ${p.name} (${p.slug}) — base price ${p.price}, active: ${p.isActive}`);
    }
    if (unrepairable.length > 50) console.log(`  … and ${unrepairable.length - 50} more`);
  }

  if (!APPLY) {
    console.log('\nDry run — nothing written. Re-run with --apply to save these prices.');
    return;
  }

  let saved = 0;
  for (const r of repairable) {
    await prisma.product.update({
      where: { id: r.id },
      data: { [r.column]: r.value },
    });
    saved++;
  }
  console.log(`\nApplied: ${saved} product(s) updated.`);
}

main()
  .catch((e) => {
    console.error('[error]', e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
