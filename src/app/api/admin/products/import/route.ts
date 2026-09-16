import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import Papa from 'papaparse';
import { normalizeGender, normalizeTypeLoose, defaultSizeForType } from '@/lib/normalize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'product'
  );
}

function parsePrice(value: string): number | null {
  const clean = value.trim().replace(/[,\s]/g, '');
  if (!clean) return null;
  const n = Number(clean);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

interface ImportRow {
  rowNum: number;
  name: string;
  sku: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  stock: string;
  category: string;
  images: string[];
  gender: string;
  type: string;
  error: string | null;
}

function parseImages(value: string): string[] {
  if (!value.trim()) return [];
  return value
    .split(/[|,]/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith('http') || s.startsWith('/'));
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const auth = await verifyToken(token);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const modeRaw = String(formData.get('mode') || 'preview');
    const duplicateMode = String(formData.get('duplicateMode') || 'skip') as 'skip' | 'update';
    const mode = modeRaw as 'preview' | 'import';

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
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    const fields = (parsed.meta.fields || []).map((f: string) => f.trim().toLowerCase());
    if (!fields.includes('name')) {
      return NextResponse.json(
        { error: 'Missing "name" column. Columns: name, sku, description, price, sale_price, stock, category, images.' },
        { status: 400 }
      );
    }
    if (!fields.includes('sku')) {
      return NextResponse.json(
        { error: 'Missing "sku" column. Columns: name, sku, description, price, sale_price, stock, category, images.' },
        { status: 400 }
      );
    }
    if (parsed.data.length > 1000) {
      return NextResponse.json({ error: 'Too many rows. Maximum is 1000.' }, { status: 400 });
    }

    const seenSkus = new Set<string>();
    const rows: ImportRow[] = [];
    for (let i = 0; i < parsed.data.length; i++) {
      const raw = parsed.data[i];
      const rowNum = i + 2;
      const name = (raw['name'] || '').trim();
      const sku = (raw['sku'] || raw['product_id'] || '').trim().toUpperCase();
      const description = (raw['description'] || '').trim();
      const price = parsePrice((raw['price'] ?? '').toString());
      const originalPrice = parsePrice((raw['sale_price'] ?? raw['regular_price'] ?? '').toString());
      const stockRaw = (raw['stock'] || '').trim().toLowerCase();
      const category = (raw['category'] || '').trim();
      const images = parseImages((raw['images'] || '').toString());
      const gender = (raw['gender'] || '').trim();
      const type = (raw['type'] || '').trim();

      let error: string | null = null;
      if (!name) error = 'Missing product name';
      else if (!sku) error = 'Missing sku';
      else if (seenSkus.has(sku)) error = 'Duplicate sku in file';
      else if (price === null || price <= 0) error = `Invalid price "${raw['price'] ?? ''}"`;
      else if (gender && !['men', 'women', 'unisex'].includes(gender.toLowerCase())) {
        error = `Invalid gender "${gender}"`;
      }

      if (!error) seenSkus.add(sku);

      rows.push({
        rowNum,
        name,
        sku,
        description,
        price,
        originalPrice: originalPrice !== null && originalPrice > 0 ? originalPrice : null,
        stock: ['in_stock', 'out_of_stock', 'pre_order'].includes(stockRaw) ? stockRaw : 'in_stock',
        category,
        images,
        gender: gender ? normalizeGender(gender) : '',
        type: type ? normalizeTypeLoose(type) : '',
        error,
      });
    }

    const validRows = rows.filter((r) => !r.error);
    const validSkus = validRows.map((r) => r.sku);

    const existing = await prisma.product.findMany({
      where: { OR: [{ productId: { in: validSkus } }] },
      select: { productId: true, name: true },
    });
    const existingMap = new Map(existing.map((p) => [p.productId, p]));

    const newSkus = validRows.filter((r) => !existingMap.has(r.sku));
    const duplicateSkus = validRows.filter((r) => existingMap.has(r.sku));

    const existingSlugs = await prisma.product.findMany({
      where: { slug: { in: newSkus.map((r) => slugify(r.name)) } },
      select: { slug: true },
    });
    const usedSlugs = new Set(existingSlugs.map((s) => s.slug));

    const slugFor = (n: string): string => {
      let slug = slugify(n);
      let counter = 2;
      const base = slug;
      while (usedSlugs.has(slug)) {
        slug = `${base}-${counter}`;
        counter++;
      }
      usedSlugs.add(slug);
      return slug;
    };

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = rows.filter((r) => r.error).map((r) => ({ row: r.rowNum, sku: r.sku, name: r.name, reason: r.error }));

    if (mode === 'import' && validRows.length > 0) {
      for (const r of validRows) {
        const isExisting = existingMap.has(r.sku);
        if (isExisting && duplicateMode === 'skip') {
          skipped++;
          continue;
        }

        const baseData = {
          name: r.name,
          description: r.description || r.name,
          shortDescription: r.description || null,
          price: r.price as number,
          originalPrice: r.originalPrice,
          inStock: r.stock !== 'out_of_stock',
          stockStatus: r.stock,
          categorySlug: (r.category || r.gender || 'unisex').toLowerCase(),
          gender: r.gender || (['men', 'women', 'unisex'].includes(r.category.toLowerCase()) ? normalizeGender(r.category) : 'Unisex'),
          type: r.type || 'Attar',
          size: defaultSizeForType((r.type || 'Attar') as 'Attar' | 'Perfume'),
          images: JSON.stringify(r.images),
          sizePrices: JSON.stringify([{ size: defaultSizeForType((r.type || 'Attar') as 'Attar' | 'Perfume'), price: r.price, originalPrice: r.originalPrice }]),
          notesTop: '[]',
          notesHeart: '[]',
          notesBase: '[]',
          rating: 0,
          reviewCount: 0,
        };

        try {
          if (isExisting) {
            const data: Record<string, unknown> = {
              name: r.name,
              price: r.price as number,
              ...(r.originalPrice !== null ? { originalPrice: r.originalPrice } : {}),
              description: r.description || r.name,
              shortDescription: r.description || null,
              inStock: r.stock !== 'out_of_stock',
              stockStatus: r.stock,
              size: defaultSizeForType((r.type || 'Attar') as 'Attar' | 'Perfume'),
              sizePrices: JSON.stringify([{ size: defaultSizeForType((r.type || 'Attar') as 'Attar' | 'Perfume'), price: r.price, originalPrice: r.originalPrice }]),
            };
            if (r.images.length > 0) {
              data.image = r.images[0];
              data.images = JSON.stringify(r.images);
            }
            if (r.category) data.categorySlug = r.category.toLowerCase();
            if (r.gender) data.gender = r.gender;
            if (r.type) data.type = r.type;
            await prisma.product.update({ where: { productId: r.sku }, data });
            updated++;
          } else {
            await prisma.product.create({
              data: {
                ...baseData,
                productId: r.sku,
                slug: slugFor(r.name),
                image: r.images[0] || '',
                categoryId: undefined,
                sizePrices: JSON.stringify([{ size: defaultSizeForType((r.type || 'Attar') as 'Attar' | 'Perfume'), price: r.price, originalPrice: r.originalPrice }]),
              },
            });
            created++;
          }
        } catch (e) {
          console.error('Import row failed:', r.sku, e);
          errors.push({ row: r.rowNum, sku: r.sku, name: r.name, reason: 'Operation failed' });
        }
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      duplicateMode,
      total: rows.length,
      created,
      updated,
      skipped,
      toCreate: newSkus.length,
      toUpdate: duplicateSkus.length,
      errorCount: errors.length,
      errors,
      newRows: newSkus.map((r) => ({ row: r.rowNum, sku: r.sku, name: r.name, price: r.price, stock: r.stock })),
      duplicateRows: duplicateSkus.map((r) => ({
        row: r.rowNum,
        sku: r.sku,
        name: r.name,
        price: r.price,
        dbName: existingMap.get(r.sku)?.name ?? null,
      })),
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}