/**
 * Bulk Price CSV parser — reusable module.
 *
 * Designed for the Safari Perfumes supplier CSV:
 *
 *   Row 1+:  blank / title / blank preamble
 *   Header:  Sr. # | Perfume Oil | Price of 100 Gram Oil | … | Selling Price
 *   Data:    rows 5+
 *   Footer:  "Total" summary row (ignored)
 *
 * Architecture is intentionally generic so that this module can also power a
 * future bulk product import from the same CSV source.
 */
import Papa from 'papaparse';
import {
  normalizeProductName,
  normalizeBrandlessName,
  significantTokens,
  bestFuzzyMatch,
  bestFuzzyBrandlessMatch,
  isTokenSubsequence,
  similarity,
  similarityBrandless,
} from './text-match';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface DbProductLight {
  id: string;
  name: string;
  price: number;
  oilPricePer100g: number | null;
  productId: string | null;
}

export interface PriceCsvRow {
  rowNum: number;
  serialNo: string;
  name: string;
  rawSellingPrice: string;
  sellingPrice: number | null;
  rawOilPrice: string;
  oilPrice: number | null;
  rawAttarPrice: string;
  attarPrice: number | null;
  rawBoxPrice: string;
  rawBottlePrice: string;
  rawPrintingCost: string;
  rawFlyerCost: string;
  rawDeliveryCharges: string;
  rawTotalCost: string;
  extras: Record<string, number | null>;
  error: string | null;
  superseded: boolean;
  supersededBy: number | null;
}

/** How a CSV row was matched to a DB product. */
export type MatchType =
  | 'exact'
  | 'brandless'
  | 'fuzzy'
  | 'fuzzyBrandless'
  | 'substring'
  | 'override'
  | 'not-found';

export interface Suggestion {
  dbName: string;
  similarity: number;
}

export interface MatchEntry {
  rowNum: number;
  name: string;
  matched: boolean;
  matchedCount: number;
  dbName: string | null;
  similarity: number | null;
  oldPrice: number | null;
  newPrice: number | null;
  oldOil: number | null;
  newOil: number | null;
  superseded: boolean;
  supersededBy: number | null;
  error: string | null;
  matchType: MatchType;
}

export interface DuplicateInfo {
  keptRow: number;
  duplicateRow: number;
  name: string;
}

/* -------------------------------------------------------------------------- */
/*  Column constants                                                           */
/* -------------------------------------------------------------------------- */

interface ColDef {
  key: string;
  matcher: RegExp;
}

const PRICE_COLUMNS: ColDef[] = [
  { key: 'srNo', matcher: /^sr\.?\s*#?$/i },
  { key: 'name', matcher: /perfume\s*oil/i },
  { key: 'oil', matcher: /price\s+of\s+100\s*gram/i },
  { key: 'attar', matcher: /attar\s*price/i },
  { key: 'box', matcher: /box\s*price/i },
  { key: 'bottle', matcher: /bottle\s*price/i },
  { key: 'printing', matcher: /printing\s*cost/i },
  { key: 'flyer', matcher: /flyer\s*cost/i },
  { key: 'delivery', matcher: /delivery\s*charges/i },
  { key: 'totalCost', matcher: /total\s*cost/i },
  { key: 'selling', matcher: /^selling\s*price$/i },
];

/** Product fields that can be written by the bulk price updater. */
export type PriceUpdateFields = 'price' | 'oilPricePer100g';

export interface FieldDiff {
  field: string;
  oldValue: number | null;
  newValue: number | null;
}

export interface PriceDiff {
  updates: Partial<Record<PriceUpdateFields, number>>;
  logs: FieldDiff[];
}

/**
 * Single source of truth for CSV → Product field mapping.
 *
 * Only rows whose value actually differs from the current DB value produce an
 * update + an audit log entry.
 */
export function diffProductPrices(
  row: Pick<PriceCsvRow, 'sellingPrice' | 'oilPrice'>,
  product: DbProductLight
): PriceDiff {
  const updates: Partial<Record<PriceUpdateFields, number>> = {};
  const logs: FieldDiff[] = [];

  const oilRounded = row.oilPrice !== null ? Math.round(row.oilPrice) : null;

  if (row.sellingPrice !== null && product.price !== row.sellingPrice) {
    updates['price'] = row.sellingPrice;
    logs.push({ field: 'price', oldValue: product.price, newValue: row.sellingPrice });
  }
  if (oilRounded !== null && product.oilPricePer100g !== oilRounded) {
    updates['oilPricePer100g'] = oilRounded;
    logs.push({ field: 'oilPricePer100g', oldValue: product.oilPricePer100g, newValue: oilRounded });
  }

  return { updates, logs };
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function clean(s: unknown): string {
  return String(s ?? '').trim();
}

function parseMoney(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  let s = String(raw).trim().replace(/,/g, '');
  s = s.replace(/PKR|Rs\.?|₨|₹|\$/gi, '');
  s = s.trim();
  if (!s || /^[-–—]*$/.test(s) || /^n\/?a$/i.test(s) || /^[x×*]+$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/* -------------------------------------------------------------------------- */
/*  CSV parsing                                                                 */
/* -------------------------------------------------------------------------- */

export interface ParsedPriceFile {
  rows: PriceCsvRow[];
  headerIdx: number;
  colMap: Record<string, number>;
  rawRowCount: number;
}

/**
 * Parse a raw CSV text into typed rows.
 *
 * Uses PapaParse (handles RFC-4180 quoting, embedded commas, escaped quotes).
 * Skips preamble (title / blanks) and footer ("Total" row) automatically.
 */
export function parsePriceCsv(text: string): ParsedPriceFile {
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: false, dynamicTyping: false });
  const data = parsed.data;

  // Find header row: first row containing both "Perfume Oil" and "Selling Price"
  let headerIdx = -1;
  for (let i = 0; i < data.length; i++) {
    const cells = data[i].map((c) => clean(c).toLowerCase());
    const hasName = cells.some((c) => /perfume\s*oil/.test(c));
    const hasSell = cells.some((c) => /selling\s*price/i.test(c));
    if (hasName && hasSell) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) {
    return { rows: [], headerIdx: -1, colMap: {}, rawRowCount: data.length };
  }

  const headerCells = data[headerIdx].map((c) => clean(c));
  const colMap: Record<string, number> = {};
  for (let ci = 0; ci < headerCells.length; ci++) {
    const cell = headerCells[ci];
    for (const col of PRICE_COLUMNS) {
      if (col.matcher.test(cell) && !(col.key in colMap)) {
        colMap[col.key] = ci;
        break;
      }
    }
  }

  const nameIdx = colMap['name'];
  const sellIdx = colMap['selling'];
  if (nameIdx == null || sellIdx == null) {
    return { rows: [], headerIdx, colMap, rawRowCount: data.length };
  }

  const rows: PriceCsvRow[] = [];
  for (let ri = headerIdx + 1; ri < data.length; ri++) {
    const cells = data[ri];
    if (!Array.isArray(cells) || cells.length === 0) continue;

    const srNo = clean(cells[colMap['srNo'] ?? -1] ?? '');
    const rawName = clean(cells[nameIdx] ?? '');
    const name = rawName;

    // Skip blank rows
    if (!name && !srNo) continue;

    // Skip footer / summary rows
    const tag = ((srNo + ' ' + name) || '').trim().toLowerCase();
    if (/^total/i.test(tag) || /^grand\s*total/i.test(tag)) continue;

    if (!name || name.length < 2) {
      rows.push({
        rowNum: ri + 1,
        serialNo: srNo,
        name,
        rawSellingPrice: clean(cells[sellIdx] ?? ''),
        sellingPrice: null,
        rawOilPrice: clean(cells[colMap['oil'] ?? -1] ?? ''),
        oilPrice: null,
        rawAttarPrice: clean(cells[colMap['attar'] ?? -1] ?? ''),
        attarPrice: null,
        rawBoxPrice: clean(cells[colMap['box'] ?? -1] ?? ''),
        rawBottlePrice: clean(cells[colMap['bottle'] ?? -1] ?? ''),
        rawPrintingCost: clean(cells[colMap['printing'] ?? -1] ?? ''),
        rawFlyerCost: clean(cells[colMap['flyer'] ?? -1] ?? ''),
        rawDeliveryCharges: clean(cells[colMap['delivery'] ?? -1] ?? ''),
        rawTotalCost: clean(cells[colMap['totalCost'] ?? -1] ?? ''),
        extras: {},
        error: 'Missing product name',
        superseded: false,
        supersededBy: null,
      });
      continue;
    }

    const sellingPrice = parseMoney(cells[sellIdx]);
    const oilPrice = parseMoney(cells[colMap['oil'] ?? -1] ?? '');
    const attarPrice = parseMoney(cells[colMap['attar'] ?? -1] ?? '');

    let error: string | null = null;
    if (sellingPrice === null || sellingPrice === undefined) {
      error = 'Missing or invalid Selling Price';
    }

    rows.push({
      rowNum: ri + 1,
      serialNo: srNo,
      name,
      rawSellingPrice: clean(cells[sellIdx] ?? ''),
      sellingPrice,
      rawOilPrice: clean(cells[colMap['oil'] ?? -1] ?? ''),
      oilPrice,
      rawAttarPrice: clean(cells[colMap['attar'] ?? -1] ?? ''),
      attarPrice,
      rawBoxPrice: clean(cells[colMap['box'] ?? -1] ?? ''),
      rawBottlePrice: clean(cells[colMap['bottle'] ?? -1] ?? ''),
      rawPrintingCost: clean(cells[colMap['printing'] ?? -1] ?? ''),
      rawFlyerCost: clean(cells[colMap['flyer'] ?? -1] ?? ''),
      rawDeliveryCharges: clean(cells[colMap['delivery'] ?? -1] ?? ''),
      rawTotalCost: clean(cells[colMap['totalCost'] ?? -1] ?? ''),
      extras: {},
      error,
      superseded: false,
      supersededBy: null,
    });
  }

  return { rows, headerIdx, colMap, rawRowCount: data.length };
}

/* -------------------------------------------------------------------------- */
/*  Deduplication (last entry wins per normalized name)                         */
/* -------------------------------------------------------------------------- */

export interface DedupeResult {
  activeRows: PriceCsvRow[];
  duplicates: DuplicateInfo[];
}

/**
 * Remove duplicate rows in-file by normalized product name.
 * Last occurrence wins; earlier duplicates are flagged superseded.
 */
export function dedupeRows(rows: PriceCsvRow[]): DedupeResult {
  const byKey = new Map<string, PriceCsvRow>();
  const duplicates: DuplicateInfo[] = [];

  for (const row of rows) {
    const key = normalizeProductName(row.name);
    if (!key) continue;

    const existing = byKey.get(key);
    if (existing) {
      // Mark earlier row as superseded
      existing.superseded = true;
      existing.supersededBy = row.rowNum;
      duplicates.push({
        keptRow: row.rowNum,
        duplicateRow: existing.rowNum,
        name: row.name,
      });
    }
    byKey.set(key, row);
  }

  const activeRows = [...byKey.values()];
  activeRows.sort((a, b) => a.rowNum - b.rowNum);
  return { activeRows, duplicates };
}

/* -------------------------------------------------------------------------- */
/*  DB index + matching                                                         */
/* -------------------------------------------------------------------------- */

interface IndexedProduct {
  idx: number;
  product: DbProductLight;
  sigTokens: string[];
  sigSet: Set<string>;
  normName: string;
  normBrandless: string;
}

interface DbIndex {
  products: DbProductLight[];
  byId: Map<string, DbProductLight>;
  indexed: IndexedProduct[];
  /** normName → [indexed product] for exact matching. */
  exactMap: Map<string, IndexedProduct[]>;
  /** normBrandless → [indexed product] for brandless exact matching. */
  exactBrandlessMap: Map<string, IndexedProduct[]>;
}

export function buildDbIndex(products: DbProductLight[]): DbIndex {
  const byId = new Map(products.map((p) => [p.id, p]));
  const indexed: IndexedProduct[] = products.map((p, idx) => {
    const normName = normalizeProductName(p.name);
    const normBrandless = normalizeBrandlessName(p.name);
    const sigTokens = significantTokens(p.name);
    return { idx, product: p, sigTokens, sigSet: new Set(sigTokens), normName, normBrandless };
  });
  const exactMap = new Map<string, IndexedProduct[]>();
  const exactBrandlessMap = new Map<string, IndexedProduct[]>();
  for (const ip of indexed) {
    const arr = exactMap.get(ip.normName);
    if (arr) arr.push(ip);
    else exactMap.set(ip.normName, [ip]);

    const barr = exactBrandlessMap.get(ip.normBrandless);
    if (barr) barr.push(ip);
    else exactBrandlessMap.set(ip.normBrandless, [ip]);
  }
  return { products, byId, indexed, exactMap, exactBrandlessMap };
}

export interface MatchResult {
  entries: MatchEntry[];
  notFound: { row: number; name: string; sellingPrice: number | null; suggestions: Suggestion[] }[];
  errors: { row: number; name: string; reason: string }[];
}

/** Brand tokens extracted from the trailing "BY <brand>" segment, normalized. */
function rowBrandTokens(name: string): string[] {
  const norm = normalizeProductName(name);
  const idx = norm.lastIndexOf(' by ');
  if (idx < 0) return [];
  return norm
    .slice(idx + 4)
    .trim()
    .split(' ')
    .filter(Boolean);
}

/**
 * Disambiguate a multi-candidate brandless exact hit.
 *
 * The supplier CSV strips brands from DB names, so `white musk` can collide
 * with `White Musk` and `J. White Musk`. Preference order:
 * 1. Candidates whose full (non-stripped) normalized name contains the CSV's
 *    trailing brand tokens (e.g. "white musk by hollister" → hollister matches
 *    a "White Musk (by Hollister)" DB row if its name kept the brand).
 * 2. A single unambiguous candidate.
 * 3. Otherwise null → the row is treated as not-found (with suggestions).
 */
function pickBrandlessCandidates(
  rowBrandless: string,
  rowBrands: string[],
  candidates: IndexedProduct[]
): IndexedProduct[] | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates;

  if (rowBrands.length > 0) {
    const withBrand = candidates.filter((ip) =>
      rowBrands.every((t) => ip.normName.split(' ').includes(t))
    );
    if (withBrand.length > 0) return withBrand;
  }

  return null;
}

/**
 * Match CSV rows against DB products.
 *
 * Layered matching (each layer is a hard gate; earlier = higher confidence):
 * 1. `exact`          — exact full normalized name
 * 2. `brandless`      — exact brand-less normalized name (CSV "NAME BY BRAND"
 *                       vs DB "NAME"), disambiguated by trailing brand tokens
 * 3. `fuzzy`          — fuzzy match over the full normalized name
 * 4. `fuzzyBrandless` — fuzzy match over the brand-less normalized name
 * 5. `substring`      — ordered-token subsequence with a strict threshold
 *
 * For every matched row, all DB products sharing the same normalized name are
 * included (handles duplicates in the database). Not-found rows carry top
 * similarity suggestions for manual resolution.
 */
export function matchRows(rows: PriceCsvRow[], db: DbIndex): MatchResult {
  const entries: MatchEntry[] = [];
  const notFound: MatchResult['notFound'] = [];
  const errors: MatchResult['errors'] = [];

  for (const row of rows) {
    if (row.error) {
      errors.push({ row: row.rowNum, name: row.name, reason: row.error! });
      entries.push({
        rowNum: row.rowNum,
        name: row.name,
        matched: false,
        matchedCount: 0,
        dbName: null,
        similarity: null,
        oldPrice: null,
        newPrice: row.sellingPrice,
        oldOil: null,
        newOil: row.oilPrice,
        superseded: row.superseded,
        supersededBy: row.supersededBy,
        error: row.error,
        matchType: 'not-found',
      });
      continue;
    }

    const normKey = normalizeProductName(row.name);
    const brandlessKey = normalizeBrandlessName(row.name);
    const rowBrands = rowBrandTokens(row.name);

    let primary: IndexedProduct | null = null;
    let matchedCount = 0;
    let matchType: MatchType = 'not-found';
    let similarityScore: number | null = null;

    // 1) exact
    const exactMatch = db.exactMap.get(normKey);
    if (exactMatch && exactMatch.length > 0) {
      primary = exactMatch[0];
      matchedCount = exactMatch.length;
      matchType = 'exact';
      similarityScore = 1;
    }

    // 2) brandless exact
    if (!primary) {
      const brandlessHits = db.exactBrandlessMap.get(brandlessKey);
      const picked =
        brandlessHits && brandlessHits.length > 0
          ? pickBrandlessCandidates(brandlessKey, rowBrands, brandlessHits)
          : null;
      if (picked && picked.length > 0) {
        primary = picked[0];
        matchedCount = picked.length;
        matchType = 'brandless';
        similarityScore = 1;
      }
    }

    // 3) fuzzy full
    if (!primary) {
      const candidates = db.indexed.map((ip) => ({ name: ip.product.name }));
      const { result, runnerUpScore } = bestFuzzyMatch(row.name, candidates, 0.9);
      if (result) {
        primary = db.indexed[result.index];
        matchedCount = 1;
        matchType = 'fuzzy';
        similarityScore = Math.round(result.score * 1000) / 1000;
      } else if (runnerUpScore > 0) {
        // remember score for the not-found report
        similarityScore = Math.round(runnerUpScore * 1000) / 1000;
      }
    }

    // 4) fuzzy brandless
    if (!primary) {
      const candidates = db.indexed.map((ip) => ({ name: ip.product.name }));
      const { result } = bestFuzzyBrandlessMatch(row.name, candidates, 0.9);
      if (result) {
        primary = db.indexed[result.index];
        matchedCount = 1;
        matchType = 'fuzzyBrandless';
        similarityScore = Math.round(result.score * 1000) / 1000;
      }
    }

    // 5) guarded substring (ordered-token subsequence)
    if (!primary) {
      const rowTokensNorm = normKey.split(' ').filter(Boolean);
      const scoredSubs: { ip: IndexedProduct; sim: number; shared: string[] }[] = [];
      if (rowTokensNorm.length >= 2) {
        for (const ip of db.indexed) {
          const dbTokensNorm = ip.normName.split(' ').filter(Boolean);
          if (isTokenSubsequence(rowTokensNorm, dbTokensNorm)) {
            // A full ordered-token containment is a strong signal on its own;
            // the sim is only a coarse sanity bar (suffixes like "by brand"
            // or marketing words drag raw edit-distance down).
            const sim = similarity(row.name, ip.product.name);
            if (sim >= 0.55) scoredSubs.push({ ip, sim, shared: [] });
          }
        }
      }
      if (scoredSubs.length > 0) {
        scoredSubs.sort((a, b) => b.sim - a.sim);
        const best = scoredSubs[0];
        const runnerUp = scoredSubs.length > 1 ? scoredSubs[1].sim : 0;
        if (best.sim - runnerUp >= 0.1 || scoredSubs.length === 1) {
          primary = best.ip;
          matchedCount = 1;
          matchType = 'substring';
          similarityScore = Math.round(best.sim * 1000) / 1000;
        }
      }
    }

    if (primary) {
      entries.push({
        rowNum: row.rowNum,
        name: row.name,
        matched: true,
        matchedCount,
        dbName: primary.product.name,
        similarity: similarityScore,
        oldPrice: primary.product.price,
        newPrice: row.sellingPrice,
        oldOil: primary.product.oilPricePer100g,
        newOil: row.oilPrice,
        superseded: row.superseded,
        supersededBy: row.supersededBy,
        error: null,
        matchType,
      });
      continue;
    }

    // Not found → compute top suggestions
    const suggestions: Suggestion[] = [];
    {
      const scored: { ip: IndexedProduct; sim: number }[] = [];
      for (const ip of db.indexed) {
        const sim = Math.max(similarity(row.name, ip.product.name), similarityBrandless(row.name, ip.product.name));
        if (sim >= 0.45) scored.push({ ip, sim });
      }
      scored.sort((a, b) => b.sim - a.sim);
      for (const s of scored.slice(0, 5)) {
        suggestions.push({ dbName: s.ip.product.name, similarity: Math.round(s.sim * 1000) / 1000 });
      }
    }

    notFound.push({ row: row.rowNum, name: row.name, sellingPrice: row.sellingPrice, suggestions });
    entries.push({
      rowNum: row.rowNum,
      name: row.name,
      matched: false,
      matchedCount: 0,
      dbName: null,
      similarity: similarityScore,
      oldPrice: null,
      newPrice: row.sellingPrice,
      oldOil: null,
      newOil: row.oilPrice,
      superseded: row.superseded,
      supersededBy: row.supersededBy,
      error: null,
      matchType: 'not-found',
    });
  }

  return { entries, notFound, errors };
}

/**
 * Resolve which DB product IDs should be updated for each matched row.
 * Returns a map of row number → matched product IDs (may be >1 for DB duplicates).
 */
export function resolveMatchedIds(
  entries: MatchEntry[],
  db: DbIndex
): Map<number, string[]> {
  const rowIds = new Map<number, string[]>();
  for (const e of entries) {
    if (!e.matched || !e.dbName) continue;
    const normKey = normalizeProductName(e.name);
    const exactMatches = db.exactMap.get(normKey);
    if (exactMatches && exactMatches.length > 0) {
      rowIds.set(e.rowNum, exactMatches.map((ip) => ip.product.id));
      continue;
    }
    // Non-exact — resolve the exact DB name to its id(s)
    const byName = db.exactMap.get(normalizeProductName(e.dbName));
    if (byName && byName.length > 0) {
      rowIds.set(e.rowNum, byName.map((ip) => ip.product.id));
      continue;
    }
    const idx = db.indexed.find((ip) => ip.product.name === e.dbName);
    if (idx) rowIds.set(e.rowNum, [idx.product.id]);
  }
  return rowIds;
}