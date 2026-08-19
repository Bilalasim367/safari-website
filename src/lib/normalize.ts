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
