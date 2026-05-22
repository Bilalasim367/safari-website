import { NextResponse } from 'next/server';
import prisma from '@/lib/turso';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { parseCsv, transformRow } from '@/lib/csv-parser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const dedupedRows = rows.filter((row) => {
      const pid = row.product_id?.trim();
      if (!pid || seenProductIds.has(pid)) return false;
      seenProductIds.add(pid);
      return true;
    });

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: { row: number; product_id: string; reason: string }[] = [...parseErrors];

    const batchSize = 50;
    for (let i = 0; i < dedupedRows.length; i += batchSize) {
      const batch = dedupedRows.slice(i, i + batchSize);
      const operations = batch.map(async (row) => {
        const transformed = transformRow(row, existingSlugs);
        const isUpdate = existingProductIds.has(transformed.productId);

        try {
          await prisma.product.upsert({
            where: { productId: transformed.productId },
            create: {
              ...transformed,
              originalPrice: null,
              fragranceFamily: null,
              rating: 0,
              reviewCount: 0,
              isBestseller: false,
              isNew: false,
              size: '50ml',
              categoryId: undefined,
              images: '[]',
            },
            update: {
              name: transformed.name,
              slug: transformed.slug,
              categorySlug: transformed.categorySlug,
              gender: transformed.gender,
              type: transformed.type,
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
              price3mlOnline: transformed.price3mlOnline,
              price6mlOnline: transformed.price6mlOnline,
              price12mlOnline: transformed.price12mlOnline,
              price50mlOnline: transformed.price50mlOnline,
              currency: transformed.currency,
              oilPricePer100g: transformed.oilPricePer100g,
              supplier: transformed.supplier,
              isFeatured: transformed.isFeatured,
              isActive: transformed.isActive,
              stockStatus: transformed.stockStatus,
              imageFolder: transformed.imageFolder,
              metaTitle: transformed.metaTitle,
              metaDescription: transformed.metaDescription,
              description: transformed.description,
              price: transformed.price,
              image: transformed.image,
              sizePrices: transformed.sizePrices,
              inStock: transformed.inStock,
            },
          });
          if (isUpdate) updated++;
          else created++;
        } catch {
          skipped++;
          errors.push({
            row: i + batch.indexOf(row) + 2,
            product_id: transformed.productId || `row ${i + batch.indexOf(row) + 2}`,
            reason: 'Operation failed',
          });
        }
      });

      await prisma.$transaction(operations as any);
    }

    return NextResponse.json({
      success: true,
      total: rows.length,
      created,
      updated,
      skipped: skipped + parseErrors.length,
      errors,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
