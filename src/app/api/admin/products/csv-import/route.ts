import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_ROWS = 1000;
const MAX_BODY_BYTES = 2 * 1024 * 1024;

const HEADER_ALIASES: Record<string, string[]> = {
  name: ['name', 'product', 'product name', 'productname', 'title', 'perfume oil', 'perfumeoil', 'perfume', 'oil', 'perfume name'],
  topNotes: ['topnotes', 'top note', 'top notes', 'top_notes', 'topnote', 'notes top', 'notestop'],
  heartNotes: ['heartnotes', 'heart note', 'heart notes', 'heart_notes', 'heartnote', 'notes heart', 'notesheart'],
  baseNotes: ['basenotes', 'base notes', 'base_notes', 'basenote', 'notes base', 'notesbase'],
};

// Regex for the owner's short-code suffix (e.g. "- PRM", "- prm") — 1 to 5 letters after a dash.
const SHORT_CODE_SUFFIX = /\s*-\s*[a-z]{1,5}\s*$/i;
// Brand suffix: "BY <anything>" at the very end (never touches a mid-name "by").
const BY_BRAND_SUFFIX = /\s+by\s+.*$/i;

const MINOR_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'of', 'for', 'at', 'by', 'from', 'in', 'on', 'to', 'with', 'via',
]);

type MatchStage = 'exact' | 'normalized' | 'contains';

const STAGE_RANK: Record<MatchStage, number> = { exact: 1, normalized: 2, contains: 3 };

interface DbProduct {
  id: string;
  name: string;
  slug: string;
}

function normalizeHeader(name: string): string {
  return String(name).toLowerCase().replace(/[\s_/.-]+/g, '');
}

function canonicalField(header: string): string | null {
  const norm = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    if (norm === field || aliases.some((a) => normalizeHeader(a) === norm)) {
      return field;
    }
  }
  return null;
}

function slugify(text: string): string {
  return (
    String(text)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'product'
  );
}

function titleCaseWord(word: string, isFirst: boolean): string {
  if (/\d/.test(word)) return word;
  if (word.length > 1 && word === word.toUpperCase()) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  if (word.length > 1 && /[A-Z]/.test(word.slice(1))) return word;
  if (!isFirst && MINOR_WORDS.has(word.toLowerCase())) return word.toLowerCase();
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function titleCase(text: string): string {
  let first = true;
  return String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      const out = titleCaseWord(w, first);
      first = false;
      return out;
    })
    .join(' ');
}

function cleanName(raw: string): string {
  const trimmed = String(raw).trim();
  let s = trimmed;
  s = s.replace(SHORT_CODE_SUFFIX, '');
  s = s.replace(BY_BRAND_SUFFIX, '');
  s = s.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
  if (!s) return trimmed;
  return titleCase(s);
}

function toNoteArray(val: unknown): string {
  const items = String(val || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return JSON.stringify(items);
}

function noteDisplay(val: unknown): string[] {
  return String(val || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeForMatch(text: string): string {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/["'“”‘’]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^impression of\s+/i, '')
    .replace(/^impression\s+/i, '')
    .replace(/\s+by\s+.*$/i, '')
    .trim();
}

function matchScore(csvName: string, productName: string): MatchStage | null {
  const a = String(csvName).trim().toLowerCase();
  const b = String(productName).trim().toLowerCase();
  if (a && a === b) return 'exact';
  const na = normalizeForMatch(a);
  const nb = normalizeForMatch(b);
  if (!na || !nb) return null;
  if (na === nb) return 'normalized';
  const [shorter, longer] = na.length <= nb.length ? [na, nb] : [nb, na];
  if (shorter.length > 0 && longer.includes(shorter) && shorter.length / longer.length >= 0.6) {
    return 'contains';
  }
  return null;
}

function findBestMatch(
  csvName: string,
  products: DbProduct[]
): { product: DbProduct; stage: MatchStage; duplicate: boolean } | null {
  let best: { product: DbProduct; stage: MatchStage; rank: number } | null = null;
  let duplicate = false;

  for (const p of products) {
    const stage = matchScore(csvName, p.name);
    if (!stage) continue;
    const rank = STAGE_RANK[stage];
    if (!best || rank < best.rank) {
      best = { product: p, stage, rank };
      duplicate = false;
    } else if (rank === best.rank) {
      duplicate = true;
    }
  }

  if (!best) return null;
  return { product: best.product, stage: best.stage, duplicate };
}

function stripBom(value: string): string {
  return String(value).replace(/^\uFEFF/, '');
}

function cleanHeaderCell(value: unknown): string {
  return stripBom(String(value === undefined || value === null ? '' : value)).trim();
}

interface HeaderDetection {
  headerRowIndex: number | null;
  columnMap: Map<number, string>; // column index -> canonical field
}

// Smart header detection. The owner's Excel export has:
//   Row 1: "Final Perfumes Prices and Category List" (title)
//   Row 2: empty/merged
//   Row 3: "Sr. #" | "Perfume Oil" | "Notes Details" (merged over 3 cols)
//   Row 4: (blank) | (blank) | "Top Note" | "Heart Note" | "Base Notes"
// So we scan the first 10 rows per-COLUMN and take the first known alias found in
// each column (topmost wins). Extra/unnamed columns ("Sr. #", "Notes Details") are
// never mapped, so they are ignored. Data starts after the LAST contributing row.
function detectHeader(rows: string[][]): HeaderDetection {
  const scanLimit = Math.min(rows.length, 10);
  const columnMap = new Map<number, string>();
  const contributing = new Set<number>();

  for (let i = 0; i < scanLimit; i++) {
    const row = rows[i];
    if (!row) continue;
    row.forEach((raw, col) => {
      if (columnMap.has(col)) return;
      const cell = cleanHeaderCell(raw);
      if (!cell) return;
      const field = canonicalField(cell);
      if (field) {
        columnMap.set(col, field);
        contributing.add(i);
      }
    });
  }

  if (contributing.size === 0 || ![...columnMap.values()].includes('name')) {
    return { headerRowIndex: null, columnMap: new Map() };
  }
  return { headerRowIndex: Math.max(...contributing), columnMap };
}

// Convert a data row (array of cells) into a record keyed by canonical field name.
function rowToRecord(cells: string[], columnMap: Map<number, string>): Record<string, string> {
  const record: Record<string, string> = {};
  columnMap.forEach((field, col) => {
    if (col < cells.length) {
      record[field] = cleanHeaderCell(cells[col]);
    }
  });
  return record;
}

interface PreviewRow {
  recordIndex: number;
  row: number;
  rawName: string;
  cleanName: string;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  matched: boolean;
  matchedProductId: string | null;
  matchedProductName: string | null;
  matchMethod: MatchStage | null;
  duplicateMatch: boolean;
  error: string | null;
}

function getCell(
  record: Record<string, unknown>,
  field: string
): string {
  const v = record[field];
  return v === undefined || v === null ? '' : String(v);
}

interface ParsedRow {
  rowNumber: number;
  rawName: string;
  cleanName: string;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
}

function parseRow(
  record: unknown,
  rowNumber: number
): ParsedRow {
  const recObj: Record<string, unknown> =
    record && typeof record === 'object' ? (record as Record<string, unknown>) : {};
  const rawName = getCell(recObj, 'name').trim();
  return {
    rowNumber,
    rawName,
    cleanName: rawName ? cleanName(rawName) : '',
    topNotes: getCell(recObj, 'topNotes').trim(),
    heartNotes: getCell(recObj, 'heartNotes').trim(),
    baseNotes: getCell(recObj, 'baseNotes').trim(),
  };
}

function previewResponse(
  products: DbProduct[],
  records: unknown[],
  rowNumbers: number[]
) {
  const rows: PreviewRow[] = [];
  const matchedIds = new Set<string>();

  for (let i = 0; i < records.length; i++) {
    const p = parseRow(records[i], rowNumbers[i] ?? i + 1);

    let matchedProduct: DbProduct | null = null;
    let stage: MatchStage | null = null;
    let duplicate = false;
    let error: string | null = null;

    if (!p.rawName) {
      error = 'Missing name';
    } else {
      const best = findBestMatch(p.cleanName, products);
      if (best) {
        matchedProduct = best.product;
        stage = best.stage;
        duplicate = best.duplicate;
        matchedIds.add(best.product.id);
      }
    }

    rows.push({
      recordIndex: i,
      row: p.rowNumber,
      rawName: p.rawName,
      cleanName: p.cleanName,
      topNotes: p.topNotes,
      heartNotes: p.heartNotes,
      baseNotes: p.baseNotes,
      matched: !!matchedProduct,
      matchedProductId: matchedProduct?.id ?? null,
      matchedProductName: matchedProduct?.name ?? null,
      matchMethod: stage,
      duplicateMatch: duplicate,
      error,
    });
  }

  const matchedCount = rows.filter((r) => r.matched).length;
  const notFoundCount = rows.filter((r) => !r.error && !r.matched).length;
  const invalidCount = rows.filter((r) => r.error).length;
  const containsCount = rows.filter((r) => r.matchMethod === 'contains').length;
  const unmatchedDb = products
    .filter((p) => !matchedIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name }));

  return NextResponse.json({
    success: true,
    action: 'preview',
    total: rows.length,
    matchedCount,
    notFoundCount,
    invalidCount,
    containsCount,
    unmatchedDbCount: unmatchedDb.length,
    rows,
    unmatchedDb,
  });
}

async function applyResponse(
  products: DbProduct[],
  records: unknown[],
  rowNumbers: number[]
) {
  const batchSlugs = new Set<string>();

  const uniqueSlug = (name: string, selfId: string): string => {
    const base = slugify(name);
    let candidate = base;
    let n = 2;
    const taken = (s: string): boolean => {
      if (batchSlugs.has(s)) return true;
      return products.some((p) => p.id !== selfId && p.slug.toLowerCase() === s.toLowerCase());
    };
    while (taken(candidate)) {
      candidate = `${base}-${n++}`;
    }
    batchSlugs.add(candidate);
    return candidate;
  };

  const updated: {
    oldName: string;
    newName: string;
    slug: string;
    notesTop: string[];
    notesHeart: string[];
    notesBase: string[];
  }[] = [];
  const errors: { row: number; name: string; reason: string }[] = [];
  let matched = 0;

  for (let i = 0; i < records.length; i++) {
    const p = parseRow(records[i], rowNumbers[i] ?? i + 1);

    if (!p.rawName) {
      errors.push({ row: p.rowNumber, name: '', reason: 'Missing name' });
      continue;
    }

    const best = findBestMatch(p.cleanName, products);
    if (!best) continue;
    matched++;

    try {
      const slug = uniqueSlug(p.cleanName, best.product.id);
      const notesTop = toNoteArray(p.topNotes);
      const notesHeart = toNoteArray(p.heartNotes);
      const notesBase = toNoteArray(p.baseNotes);

      await prisma.product.update({
        where: { id: best.product.id },
        data: { name: p.cleanName, slug, notesTop, notesHeart, notesBase },
      });

      updated.push({
        oldName: best.product.name,
        newName: p.cleanName,
        slug,
        notesTop: noteDisplay(p.topNotes),
        notesHeart: noteDisplay(p.heartNotes),
        notesBase: noteDisplay(p.baseNotes),
      });
    } catch (e) {
      errors.push({ row: p.rowNumber, name: p.cleanName, reason: (e as Error).message || 'Unknown error' });
    }
  }

  const proof = {
    impression: updated.filter((u) => /impression/i.test(u.newName)).length,
    by: updated.filter((u) => /\sby\s/i.test(u.newName)).length,
  };

  return NextResponse.json({
    success: true,
    action: 'apply',
    submitted: records.length,
    matched,
    applied: updated.length,
    failed: errors.length,
    errors,
    updated,
    proof,
    sample: updated.slice(0, 5),
  });
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

    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: `Payload too large. Maximum is ${MAX_BODY_BYTES / (1024 * 1024)}MB.` },
        { status: 413 }
      );
    }

    let body: { action?: unknown; headers?: unknown; records?: unknown; rows?: unknown; matchedIndices?: unknown };
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const action = body.action;
    if (action !== 'preview' && action !== 'apply') {
      return NextResponse.json({ error: 'Invalid action. Use "preview" or "apply".' }, { status: 400 });
    }

    // Raw rows are sent as arrays of cell strings (header:false parsing client-side),
    // so the server can handle the owner's Excel title/header rows.
    if (!Array.isArray(body.rows) || body.rows.length === 0) {
      return NextResponse.json({ error: 'Expected a non-empty "rows" array in the body.' }, { status: 400 });
    }
    const rawRows: string[][] = (body.rows as unknown[]).map((r) =>
      Array.isArray(r) ? r.map((c) => String(c === undefined || c === null ? '' : c)) : []
    );
    const totalData = rawRows.length - 1;
    if (totalData > MAX_ROWS) {
      return NextResponse.json({ error: `Too many rows. Maximum is ${MAX_ROWS}.` }, { status: 400 });
    }

    const detection = detectHeader(rawRows);
    if (detection.headerRowIndex === null) {
      const previewContent = rawRows
        .slice(0, Math.min(rawRows.length, 10))
        .map((r, i) => `Row ${i + 1}: ${r.map(cleanHeaderCell).filter(Boolean).join(' | ') || '(empty)'}`)
        .join('\n');
      return NextResponse.json(
        {
          error:
            'Pehli 10 rows me koi known header nahi mila (jaise "Perfume Oil", "name", "top note", "heart note", "base note"). Pehli 10 rows:\n' +
            previewContent +
            '\nNote: Merged "Notes Details" wali column ko ignore kar diya — use "Top Note / Heart Note / Base Notes" ke saath.',
        },
        { status: 400 }
      );
    }

    const records: Record<string, string>[] = [];
    const rowNumbers: number[] = [];
    for (let i = detection.headerRowIndex + 1; i < rawRows.length; i++) {
      const cells = rawRows[i].map(cleanHeaderCell);
      // skip fully-empty rows
      if (cells.every((c) => !c)) continue;
      records.push(rowToRecord(cells, detection.columnMap));
      rowNumbers.push(i + 1);
    }

    const products: DbProduct[] = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, slug: true },
    });

    if (action === 'preview') {
      return previewResponse(products, records, rowNumbers);
    }

    // Apply: only touch the data rows whose preview indices were confirmed matched.
    let applyRecords = records;
    let applyRowNumbers = rowNumbers;
    if (Array.isArray(body.matchedIndices)) {
      const wanted = new Set<number>(
        (body.matchedIndices as unknown[]).map((n) => Number(n)).filter((n) => Number.isInteger(n))
      );
      applyRecords = records.filter((_, i) => wanted.has(i));
      applyRowNumbers = rowNumbers.filter((_, i) => wanted.has(i));
    }
    return applyResponse(products, applyRecords, applyRowNumbers);
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}