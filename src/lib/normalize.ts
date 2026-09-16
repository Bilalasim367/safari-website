export function normalizeGender(g: string | null | undefined): string {
  if (!g) return 'Unisex';
  const lower = g.toLowerCase().trim();
  if (lower === 'men') return 'Men';
  if (lower === 'women') return 'Women';
  if (lower === 'unisex') return 'Unisex';
  return 'Unisex';
}

export function normalizeType(t: string | null | undefined): string {
  if (!t) return 'Attar';
  const lower = t.toLowerCase().trim();
  if (lower === 'attar') return 'Attar';
  if (lower === 'perfume') return 'Perfume';
  return 'Attar';
}

export function normalizeTypeLoose(t: string | null | undefined): string {
  const lower = (t || '').toLowerCase().trim();
  if (lower.includes('perfume') || lower.includes('edp') || lower.includes('eau de')) return 'Perfume';
  return 'Attar';
}

// Single source of truth for the storefront's default size label.
// Attar = 12ml (per product spec); every other type falls back to 50ml.
export function defaultSizeForType(t: string | null | undefined): '12ml' | '50ml' {
  const lower = (t || '').toLowerCase().trim();
  return lower === 'attar' ? '12ml' : '50ml';
}
