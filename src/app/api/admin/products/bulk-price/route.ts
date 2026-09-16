import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import {
  parsePriceCsv,
  dedupeRows,
  buildDbIndex,
  matchRows,
  resolveMatchedIds,
  diffProductPrices,
  type DbProductLight,
  type PriceDiff,
} from '@/lib/bulk-price';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 3000;

interface Change {
  productId: string;
  productName: string;
  updates: PriceDiff['updates'];
  logs: PriceDiff['logs'];
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
    const mode =
      String(formData.get('mode') || 'preview') === 'apply'
        ? ('apply' as const)
        : ('preview' as const);
    const overridesRaw = String(formData.get('overrides') || '[]');
    const overrides: { row: number; dbName: string }[] = (() => {
      try {
        const parsed = JSON.parse(overridesRaw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only .csv files are supported. Please convert your Excel file to CSV.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const text = await file.text();
    const parsed = parsePriceCsv(text);

    if (parsed.headerIdx < 0 || parsed.rows.length === 0) {
      return NextResponse.json(
        {
          error:
            'Could not find the expected CSV structure. Expected a header row containing "Perfume Oil" and "Selling Price" columns followed by product rows.',
        },
        { status: 400 }
      );
    }
    if (parsed.rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Too many rows. Maximum is ${MAX_ROWS} product rows.` },
        { status: 400 }
      );
    }

    const { duplicates } = dedupeRows(parsed.rows);

    // Load products once, index in memory, then match every row.
    const products = (await prisma.product.findMany({
      select: { id: true, name: true, price: true, oilPricePer100g: true, productId: true },
    })) as DbProductLight[];
    const db = buildDbIndex(products);

    const { entries, notFound, errors } = matchRows(parsed.rows, db);

    // Apply manual overrides: map a not-found row to an explicitly chosen DB product.
    const overrideNames = new Map<number, string>();
    for (const o of overrides) {
      if (o && Number.isFinite(Number(o.row)) && typeof o.dbName === 'string' && o.dbName.trim()) {
        const row = Number(o.row);
        const isDbProduct = db.indexed.some((ip) => ip.product.name === o.dbName.trim());
        if (isDbProduct) overrideNames.set(row, o.dbName.trim());
      }
    }
    if (overrideNames.size > 0) {
      for (const e of entries) {
        if (e.matched) continue;
        const override = overrideNames.get(e.rowNum);
        if (!override) continue;
        const dbRow = db.indexed.find((ip) => ip.product.name === override);
        if (!dbRow) continue;
        e.matched = true;
        e.dbName = dbRow.product.name;
        e.matchType = 'override';
        e.similarity = null;
        e.oldPrice = dbRow.product.price;
        e.oldOil = dbRow.product.oilPricePer100g;
      }
    }

    const rowIds = resolveMatchedIds(entries, db);

    // Drop overridden rows from the unresolved list.
    const remainingNotFound = overrideNames.size > 0
      ? notFound.filter((nf) => !overrideNames.has(nf.row))
      : notFound;

    const updateable = entries.filter((e) => e.matched && !e.superseded && !e.error);

    // Debug: match-quality breakdown by layer.
    const analysis = (() => {
      const byType = new Map<string, number>();
      for (const e of entries) {
        if (!e.matched) continue;
        byType.set(e.matchType, (byType.get(e.matchType) ?? 0) + 1);
      }
      return {
        total: parsed.rows.length,
        matched: updateable.length,
        notFound: remainingNotFound.length,
        resolvedByOverride: overrideNames.size,
        breakdown: Object.fromEntries(byType),
      };
    })();
    console.log(
      `[bulk-price] ${mode} | file="${file.name}" | csvRows=${parsed.rows.length} | matched=${updateable.length} | notFound=${remainingNotFound.length} | overrides=${overrideNames.size} | ${JSON.stringify(analysis.breakdown)}`
    );

    const matchedProductIds = new Set<string>();
    for (const e of updateable) {
      const ids = rowIds.get(e.rowNum) ?? [];
      for (const id of ids) matchedProductIds.add(id);
    }

    // Rows whose price/oil actually differs from the DB value
    const willChange = updateable.filter((e) => {
      const ids = rowIds.get(e.rowNum) ?? [];
      return ids.some((id) => {
        const p = db.byId.get(id);
        if (!p) return false;
        return (
          (e.newPrice !== null && p.price !== e.newPrice) ||
          (e.newOil !== null && p.oilPricePer100g !== Math.round(e.newOil))
        );
      });
    });

    let applied = 0;
    let unchanged = 0;

    if (mode === 'apply') {
      // Aggregate per-product changes (a product can be matched by ≥1 file row).
      const perProduct = new Map<string, Change>();
      for (const e of updateable) {
        const ids = rowIds.get(e.rowNum) ?? [];
        for (const id of ids) {
          const p = db.byId.get(id);
          if (!p) continue;

          const diff = diffProductPrices({ sellingPrice: e.newPrice, oilPrice: e.newOil }, p);
          if (Object.keys(diff.updates).length === 0) continue;

          const change = perProduct.get(id) ?? {
            productId: id,
            productName: p.name,
            updates: {},
            logs: [],
          };
          Object.assign(change.updates, diff.updates);
          change.logs.push(...diff.logs);
          perProduct.set(id, change);
        }
      }

      const toUpdate = [...perProduct.values()];

      await prisma.$transaction(async (tx) => {
        for (const change of toUpdate) {
          if (Object.keys(change.updates).length === 0) continue;
          await tx.product.update({
            where: { id: change.productId },
            data: change.updates,
          });
          await tx.priceUpdateLog.createMany({
            data: change.logs.map((log) => ({
              productId: change.productId,
              productName: change.productName,
              csvFileName: file.name,
              field: log.field,
              oldValue: log.oldValue,
              newValue: log.newValue,
              performedById: auth.userId,
              performedByEmail: auth.email,
            })),
          });
        }
      });

      applied = toUpdate.filter((c) => Object.keys(c.updates).length > 0).length;
      unchanged = matchedProductIds.size - applied;
    }

    return NextResponse.json({
      success: true,
      mode,
      total: parsed.rows.length,
      matched: updateable.length,
      matchedProducts: matchedProductIds.size,
      willChange: willChange.length,
      applied,
      unchanged,
      notFoundCount: remainingNotFound.length,
      errorCount: errors.length,
      duplicateCount: duplicates.length,
      analysis,
      rows: entries,
      notFound: remainingNotFound,
      errors,
      duplicates,
    });
  } catch (error) {
    console.error('Bulk price update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}