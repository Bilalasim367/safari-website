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
  if (lower === 'tester' || lower === 'testerbox' || lower === 'tester box' || lower === 'tester-box') return 'Tester';
  return 'Attar';
}

export function normalizeTypeLoose(t: string | null | undefined): string {
  const lower = (t || '').toLowerCase().trim();
  if (lower.includes('perfume') || lower.includes('edp') || lower.includes('eau de')) return 'Perfume';
  if (lower.includes('tester')) return 'Tester';
  return 'Attar';
}

// Single source of truth for the storefront's default size label.
// Attar = 12ml, Perfume = 50ml, Tester = 5ml; unknown falls back to 50ml.
// Default SUGGESTION only (form pre-fill) — never a hard constraint:
// a saved product size always wins over this fallback (p.size || defaultSizeForType(p.type)).
export function defaultSizeForType(t: string | null | undefined): '12ml' | '50ml' | '5ml' {
  const lower = (t || '').toLowerCase().trim();
  if (lower === 'attar') return '12ml';
  if (lower === 'perfume') return '50ml';
  if (lower === 'tester' || lower === 'testerbox' || lower === 'tester box' || lower === 'tester-box') return '5ml';
  return '50ml';
}
