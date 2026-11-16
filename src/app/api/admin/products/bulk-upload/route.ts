import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { parseCsv, transformRow } from '@/lib/csv-parser';
import { resolveOnlinePrices } from '@/lib/size-pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * A stable product id for rows that do not carry one.
 *
 * Upserts need a unique key. Deriving it from the slug (falling back to the
 * name) makes a repeated upload update the same products instead of creating
 * duplicates — and stops rows without `product_id` from being dropped silently.
 */
function deriveProductId(name: string, slug: string): string {
  const base = (slug || name)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base ? `AUTO-${base}` : '';
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const auth = await verifyToken(token);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
    }
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a .csv' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const text = await file.text();
    const { rows, errors: parseErrors } = parseCsv(text);

    const maxRows = 1000;
    if (rows.length > maxRows) {
      return NextResponse.json({ error: `Too many rows. Maximum is ${maxRows}.` }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        total: 0,
        created: 0,
        updated: 0,
        skipped: parseErrors.length,
        errors: parseErrors,
      });
    }

    const existing = await prisma.product.findMany({
      where: { productId: { not: null } },
      select: { slug: true, productId: true },
    });
    const existingSlugs = new Set(existing.map((p) => p.slug));
    const existingProductIds = new Set(
      existing.map((p) => p.productId).filter((id): id is string => id !== null)
    );

    const seenProductIds = new Set<string>();
    const pendingRows: { row: (typeof rows)[number]; productId: string; rowNumber: number }[] = [];
    rows.forEach((row, index) => {
      const explicit = row.product_id?.trim();
      const productId = explicit || deriveProductId(row.name, row.slug);
      if (!productId || seenProductIds.has(productId)) return;
      seenProductIds.add(productId);
      pendingRows.push({ row, productId, rowNumber: index + 2 });
    });

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: { row: number; product_id: string; reason: string }[] = [...parseErrors];
    const warnings: { row: number; name: string; reason: string }[] = [];

    for (const { row, productId, rowNumber } of pendingRows) {
      const transformed = { ...transformRow(row, existingSlugs), productId };
      const isUpdate = existingProductIds.has(productId);
      // Only an explicit column may change visibility on an existing product:
      // a CSV without `is_active` must not silently reactivate a hidden one.
      const rowDeclaresActive = row.is_active !== undefined && row.is_active !== '';

      // Storefront pricing reads only the online columns. An explicit per-size
      // value wins; a `price` column fills the sold volume.
      const onlinePrices = resolveOnlinePrices({
        price: transformed.price,
        type: transformed.type,
        size: transformed.size,
        price3mlOnline: transformed.price3mlOnline,
        price6mlOnline: transformed.price6mlOnline,
        price12mlOnline: transformed.price12mlOnline,
        price50mlOnline: transformed.price50mlOnline,
      });
      const suppliedOnline: Record<string, number> = {};
      for (const [key, value] of Object.entries(onlinePrices)) {
        if (value !== null) suppliedOnline[key] = value;
      }
      if (Object.keys(suppliedOnline).length === 0) {
        warnings.push({
          row: rowNumber,
          name: transformed.name,
          reason:
            'No selling price in this row — the product will show as Unavailable until a price is entered.',
        });
      }

      try {
        await prisma.product.upsert({
          where: { productId },
          create: {
            ...transformed,
            originalPrice: null,
            fragranceFamily: null,
            rating: 0,
            reviewCount: 0,
            isBestseller: false,
            isNew: false,
            // Type-aware default: attar → 12ml, perfume → 50ml (historical default)
            size: transformed.size,
            categoryId: undefined,
            images: '[]',
            ...onlinePrices,
          },
          update: {
            name: transformed.name,
            // Slug is intentionally NOT updated: `transformRow` de-duplicates
            // against the DB, so re-uploading the same file would rename the
            // product (`-2`, `-3`, …) and break its live URL.
            categorySlug: transformed.categorySlug,
            gender: transformed.gender,
            type: transformed.type,
            size: transformed.size,
            season: transformed.season,
            bestTime: transformed.bestTime,
            impressionOf: transformed.impressionOf,
            notesTop: transformed.notesTop,
            notesHeart: transformed.notesHeart,
            notesBase: transformed.notesBase,
            shortDescription: transformed.shortDescription,
            longDescription: transformed.longDescription,
            tags: transformed.tags,
            sizesAvailable: transformed.sizesAvailable,
            price3mlPhysical: transformed.price3mlPhysical,
            price6mlPhysical: transformed.price6mlPhysical,
            price12mlPhysical: transformed.price12mlPhysical,
            price50mlPhysical: transformed.price50mlPhysical,
            // Only prices the file actually supplies, so an import never wipes
            // per-size prices it did not mention.
            ...suppliedOnline,
            currency: transformed.currency,
            oilPricePer100g: transformed.oilPricePer100g,
            supplier: transformed.supplier,
            isFeatured: transformed.isFeatured,
            ...(rowDeclaresActive ? { isActive: transformed.isActive } : {}),
            stockStatus: transformed.stockStatus,
            imageFolder: transformed.imageFolder,
            metaTitle: transformed.metaTitle,
            metaDescription: transformed.metaDescription,
            description: transformed.description,
            price: transformed.price,
            // `image` is not written here on purpose: the bulk file carries an
            // image *folder*, not a URL, and transformRow yields '' — writing it
            // would erase the product's existing image.
            sizePrices: transformed.sizePrices,
            inStock: transformed.inStock,
          },
        });
        if (isUpdate) updated++;
        else created++;
      } catch (e) {
        console.error('Bulk upload row failed:', productId, e);
        skipped++;
        errors.push({
          row: rowNumber,
          product_id: productId || `row ${rowNumber}`,
          reason: 'Operation failed',
        });
      }
    }

    if (created > 0 || updated > 0) {
      revalidateTag('shop-products', { expire: 0 });
      revalidatePath('/', 'page');
      revalidatePath('/shop', 'page');
      revalidatePath('/shop/[slug]', 'page');
    }

    return NextResponse.json({
      success: true,
      total: rows.length,
      created,
      updated,
      skipped: skipped + parseErrors.length,
      errors,
      warnings,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
