// Lightweight, dependency-free string normalization + fuzzy matching helpers.
// Used for flexible product-name matching in bulk CSV imports / price updates.

const FILLER_WORDS = new Set([
  'by',
  'for',
  'the',
  'and',
  'with',
  'de',
  'la',
  'le',
  'el',
  'del',
  'di',
  'da',
  'der',
  'den',
  'des',
  'du',
  'of',
  'to',
  'avec',
  'et',
  'pour',
  'van',
  'von',
  'aux',
  'les',
  'un',
  'una',
  'par',
  'para',
  'das',
  'l',
  'd',
]);

/**
 * Normalize a product name for matching.
 *
 * - Unicode NFKC (folds curly quotes/braces/smart dashes)
 * - lowercase
 * - `&` → "and"
 * - strip `{...}` segments (e.g. `{AJMAL}` is provenance noise)
 * - strip any standalone "PRM" catalog token anywhere (e.g. " - PRM", "-PRM")
 * - every non-alphanumeric run → single space, then collapse whitespace
 *
 * Conservative: distinguishes EDT / EDP / Parfum variants (parens content is
 * kept as tokens) so those are not merged into each other.
 */
export function normalizeProductName(name: string): string {
  let s = String(name ?? '').normalize('NFKC').toLowerCase();
  s = s.replace(/\{[^}]*\}/g, ' ');
  s = s.replace(/&/g, ' and ');
  s = s.replace(/[^a-z0-9]+/g, ' ');
  s = s.replace(/\bprm\b/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

/**
 * Brand-less view of a product name.
 *
 * The supplier CSV always writes "NAME BY BRAND" while many rows in the DB are
 * stored WITHOUT the trailing brand ("Sauvage" not "Sauvage By Dior"). This
 * strips the trailing "by <brand>" segment from the normalized name so those
 * CSV rows can be matched exactly against the brand-less DB entries.
 *
 * Only the LAST "by " segment is removed (brands can be multi-word, e.g.
 * "BY MARC ANTOINE BARROIS"), and only when a meaningful base name remains.
 */
export function normalizeBrandlessName(name: string): string {
  const norm = normalizeProductName(name);
  const idx = norm.lastIndexOf(' by ');
  if (idx >= 0) {
    const base = norm.slice(0, idx).trim();
    if (base.length >= 3 && /\w/.test(base)) return base;
  }
  return norm;
}

/** Split a normalized name into significant tokens (filler words dropped). */
export function significantTokens(name: string): string[] {
  const norm = normalizeProductName(name);
  if (!norm) return [];
  return norm
    .split(' ')
    .filter((t) => t.length >= 1 && !FILLER_WORDS.has(t));
}

function tokens(name: string): string[] {
  const norm = normalizeProductName(name);
  if (!norm) return [];
  return norm.split(' ');
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 0) {
    // Early bail for very different lengths still needs full DP, keep simple.
  }
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function diceBigrams(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bag = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const g = a.slice(i, i + 2);
    bag.set(g, (bag.get(g) ?? 0) + 1);
  }
  let overlap = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const g = b.slice(i, i + 2);
    const c = bag.get(g) ?? 0;
    if (c > 0) {
      overlap++;
      bag.set(g, c - 1);
    }
  }
  return (2 * overlap) / (a.length - 1 + (b.length - 1));
}

/**
 * Combined similarity score in [0, 1].
 * 40% bigram Dice (character level), 40% token containment (word level,
 * rewards subset/superset matches e.g. "… BY PACO RABANNE" vs "PACO RABANNE"),
 * 20% Levenshtein similarity.
 */
export function similarity(a: string, b: string): number {
  const na = normalizeProductName(a);
  const nb = normalizeProductName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;

  const ta = tokens(a);
  const tb = tokens(b);
  const sa = new Set(ta);
  let overlap = 0;
  for (const t of tb) {
    if (sa.has(t)) overlap++;
  }
  const containRatio =
    ta.length === 0 || tb.length === 0
      ? 0
      : Math.max(overlap / ta.length, overlap / tb.length);

  const dice = diceBigrams(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  const levSim = maxLen === 0 ? 0 : 1 - levenshtein(na, nb) / maxLen;

  return 0.4 * dice + 0.4 * containRatio + 0.2 * levSim;
}

export interface FuzzyResult {
  index: number;
  score: number;
  overlap: number;
}

/**
 * Find the best fuzzy match for `name` among `candidates`.
 * Candidates are prefiltered by shared significant tokens for performance.
 * Returns the best result plus margin over the runner-up.
 */
export function bestFuzzyMatch(
  name: string,
  candidates: { name: string }[],
  threshold = 0.9
): { result: FuzzyResult | null; runnerUpScore: number } {
  const sig = significantTokens(name);
  const sigSet = new Set(sig);

  const ranked: { index: number; score: number; overlap: number }[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const candSig = significantTokens(candidates[i].name);
    let overlap = 0;
    if (sigSet.size > 0) {
      for (const t of candSig) {
        if (sigSet.has(t)) overlap++;
      }
    }
    if (sig.length > 0 && overlap === 0) {
      if (sig.length === 1 && candSig.length === 1) {
        // single-token names: fall back to full comparison below
      } else {
        continue;
      }
    }
    if (overlap === 0 && sig.length !== 1) continue;

    const score = similarity(name, candidates[i].name);
    ranked.push({ index: i, score, overlap });
  }

  if (ranked.length === 0) return { result: null, runnerUpScore: 0 };

  ranked.sort((x, y) => y.score - x.score);
  const best = ranked[0];
  const runnerUpScore = ranked.length > 1 ? ranked[1].score : 0;

  if (best.score >= threshold) {
    return { result: best, runnerUpScore };
  }

  // Two-tier: allow slightly weaker matches only when unambiguous (clear gap).
  if (best.score >= 0.82 && best.overlap > 0 && best.score - runnerUpScore >= 0.12) {
    return { result: best, runnerUpScore };
  }

  return { result: null, runnerUpScore };
}

/* -------------------------------------------------------------------------- */
/*  Brand-less matching helpers                                                */
/* -------------------------------------------------------------------------- */

/**
 * Same combined similarity as `similarity()` but computed on the brand-less
 * normalized form of both names — so "SAUVAGE BY DIOR" vs "Sauvage" score
 * together with the drop-everything-after-the-brand noise removed.
 */
export function similarityBrandless(a: string, b: string): number {
  const na = normalizeBrandlessName(a);
  const nb = normalizeBrandlessName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;

  const ta = na.split(' ');
  const tb = nb.split(' ');
  const sa = new Set(ta);
  let overlap = 0;
  for (const t of tb) if (sa.has(t)) overlap++;
  const containRatio = ta.length === 0 || tb.length === 0 ? 0 : Math.max(overlap / ta.length, overlap / tb.length);

  const dice = diceBigrams(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  const levSim = maxLen === 0 ? 0 : 1 - levenshtein(na, nb) / maxLen;

  return 0.4 * dice + 0.4 * containRatio + 0.2 * levSim;
}

/** Whether `tokensA` appears inside `tokensB` as an ordered subsequence. */
export function isTokenSubsequence(tokensA: string[], tokensB: string[]): boolean {
  if (tokensA.length === 0 || tokensA.length > tokensB.length) return false;
  let i = 0;
  for (const t of tokensB) {
    if (t === tokensA[i]) i++;
    if (i === tokensA.length) return true;
  }
  return i === tokensA.length;
}

export interface BrandlessFuzzyResult {
  index: number;
  score: number;
}

/**
 * Find the best fuzzy match by *brand-less* normalized name, used as a
 * fallback layer when both the full-name and brand-less exact matches fail.
 * Candidarates must share at least one significant brand-less token.
 */
export function bestFuzzyBrandlessMatch(
  name: string,
  candidates: { name: string }[],
  threshold = 0.9
): { result: BrandlessFuzzyResult | null; runnerUpScore: number } {
  const na = normalizeBrandlessName(name);
  if (!na) return { result: null, runnerUpScore: 0 };
  const sigA = new Set(na.split(' ').filter((t) => t && !FILLER_WORDS.has(t)));

  const ranked: { index: number; score: number; overlap: number }[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const nb = normalizeBrandlessName(candidates[i].name);
    if (!nb) continue;
    const sigB = new Set(nb.split(' ').filter((t) => t && !FILLER_WORDS.has(t)));
    let overlap = 0;
    for (const t of sigB) if (sigA.has(t)) overlap++;
    if (overlap === 0) continue;

    const score = similarityBrandless(name, candidates[i].name);
    ranked.push({ index: i, score, overlap });
  }

  if (ranked.length === 0) return { result: null, runnerUpScore: 0 };
  ranked.sort((x, y) => y.score - x.score);
  const best = ranked[0];
  const runnerUpScore = ranked.length > 1 ? ranked[1].score : 0;

  if (best.score >= threshold) return { result: { index: best.index, score: best.score }, runnerUpScore };
  if (best.score >= 0.82 && best.overlap > 0 && best.score - runnerUpScore >= 0.12) {
    return { result: { index: best.index, score: best.score }, runnerUpScore };
  }
  return { result: null, runnerUpScore };
}