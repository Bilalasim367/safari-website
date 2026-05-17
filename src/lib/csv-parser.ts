import Papa from 'papaparse';

export interface CsvRow {
  product_id: string;
  name: string;
  slug: string;
  category: string;
  gender: string;
  type: string;
  season: string;
  best_time: string;
  impression_of: string;
  top_notes: string;
  heart_notes: string;
  base_notes: string;
  short_description: string;
  long_description: string;
  tags: string;
  sizes_available: string;
  price_3ml_physical: string;
  price_6ml_physical: string;
  price_12ml_physical: string;
  price_50ml_physical: string;
  price_3ml_online: string;
  price_6ml_online: string;
  price_12ml_online: string;
  price_50ml_online: string;
  currency: string;
  oil_price_per_100g: string;
  supplier: string;
  is_featured: string;
  is_active: string;
  stock_status: string;
  image_folder: string;
  meta_title: string;
  meta_description: string;
}

export interface ValidationError {
  row: number;
  product_id: string;
  reason: string;
}

export interface TransformedProduct {
  productId: string;
  name: string;
  slug: string;
  categorySlug: string;
  gender: string;
  type: string;
  season: string | null;
  bestTime: string | null;
  impressionOf: string | null;
  notesTop: string;
  notesHeart: string;
  notesBase: string;
  shortDescription: string | null;
  longDescription: string | null;
  tags: string | null;
  sizesAvailable: string;
  price3mlPhysical: number | null;
  price6mlPhysical: number | null;
  price12mlPhysical: number | null;
  price50mlPhysical: number | null;
  price3mlOnline: number | null;
  price6mlOnline: number | null;
  price12mlOnline: number | null;
  price50mlOnline: number | null;
  currency: string;
  oilPricePer100g: number | null;
  supplier: string | null;
  isFeatured: boolean;
  isActive: boolean;
  stockStatus: string;
  imageFolder: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  description: string;
  price: number;
  image: string;
  sizePrices: string;
  inStock: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'product';
}

function trimAll(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[key] = typeof obj[key] === 'string' ? (obj[key] as string).trim() : obj[key];
  }
  return result;
}

function hasValidPrice(row: CsvRow): boolean {
  const priceFields = [
    'price_3ml_physical', 'price_6ml_physical', 'price_12ml_physical', 'price_50ml_physical',
    'price_3ml_online', 'price_6ml_online', 'price_12ml_online', 'price_50ml_online',
  ];
  return priceFields.some((field) => {
    const val = (row as unknown as Record<string, string>)[field];
    return val !== undefined && val !== '' && !isNaN(Number(val)) && Number(val) > 0;
  });
}

function toInt(val: string | undefined | null): number | null {
  if (!val || val.trim() === '') return null;
  const n = parseInt(val.trim(), 10);
  return isNaN(n) ? null : n;
}

export function parseCsv(text: string): { rows: CsvRow[]; errors: ValidationError[] } {
  const result = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const errors: ValidationError[] = [];
  const rows: CsvRow[] = [];

  for (let i = 0; i < result.data.length; i++) {
    const raw = result.data[i];
    const row = trimAll(raw as unknown as Record<string, unknown>) as unknown as CsvRow;
    const rowNum = i + 2;

    if (!row.name || row.name.trim() === '') {
      errors.push({ row: rowNum, product_id: row.product_id || `row ${rowNum}`, reason: 'Missing product name' });
      continue;
    }
    if (!hasValidPrice(row)) {
      errors.push({ row: rowNum, product_id: row.product_id || `row ${rowNum}`, reason: 'No valid price field' });
      continue;
    }
    if (row.gender && !['Men', 'Women', 'Unisex'].includes(row.gender)) {
      errors.push({ row: rowNum, product_id: row.product_id || `row ${rowNum}`, reason: `Invalid gender "${row.gender}"` });
      continue;
    }
    if (row.is_featured && !['true', 'false'].includes(row.is_featured.toLowerCase())) {
      errors.push({ row: rowNum, product_id: row.product_id || `row ${rowNum}`, reason: `is_featured must be "true" or "false"` });
      continue;
    }
    if (row.is_active && !['true', 'false'].includes(row.is_active.toLowerCase())) {
      errors.push({ row: rowNum, product_id: row.product_id || `row ${rowNum}`, reason: `is_active must be "true" or "false"` });
      continue;
    }

    rows.push(row);
  }

  return { rows, errors };
}

export function transformRow(row: CsvRow, existingSlugs: Set<string>): TransformedProduct {
  let slug = row.slug?.trim() || slugify(row.name);
  if (existingSlugs.has(slug)) {
    let counter = 2;
    while (existingSlugs.has(`${slug}-${counter}`)) {
      counter++;
    }
    slug = `${slug}-${counter}`;
  }
  existingSlugs.add(slug);

  const gender = ['Men', 'Women', 'Unisex'].includes(row.gender) ? row.gender : 'Unisex';
  const sizesAvailable = row.sizes_available?.trim() || '3ml,6ml,12ml,50ml';

  const p3p = toInt(row.price_3ml_physical);
  const p6p = toInt(row.price_6ml_physical);
  const p12p = toInt(row.price_12ml_physical);
  const p50p = toInt(row.price_50ml_physical);
  const p3o = toInt(row.price_3ml_online);
  const p6o = toInt(row.price_6ml_online);
  const p12o = toInt(row.price_12ml_online);
  const p50o = toInt(row.price_50ml_online);

  const allPrices = [p3p, p6p, p12p, p50p, p3o, p6o, p12o, p50o].filter((p): p is number => p !== null);
  const lowestPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;

  const sizePricesArr: { size: string; price: number }[] = [];
  if (p3p !== null) sizePricesArr.push({ size: '3ml', price: p3p });
  if (p6p !== null) sizePricesArr.push({ size: '6ml', price: p6p });
  if (p12p !== null) sizePricesArr.push({ size: '12ml', price: p12p });
  if (p50p !== null) sizePricesArr.push({ size: '50ml', price: p50p });

  return {
    productId: row.product_id?.trim() || '',
    name: row.name.trim(),
    slug,
    categorySlug: (row.category?.trim().toLowerCase() || 'unisex'),
    gender,
    type: row.type?.trim() || 'Attar & Spray',
    season: row.season?.trim() || null,
    bestTime: row.best_time?.trim() || null,
    impressionOf: row.impression_of?.trim() || null,
    notesTop: JSON.stringify((row.top_notes || '').split(',').map((s: string) => s.trim()).filter(Boolean)),
    notesHeart: JSON.stringify((row.heart_notes || '').split(',').map((s: string) => s.trim()).filter(Boolean)),
    notesBase: JSON.stringify((row.base_notes || '').split(',').map((s: string) => s.trim()).filter(Boolean)),
    shortDescription: row.short_description?.trim() || null,
    longDescription: row.long_description?.trim() || null,
    tags: row.tags?.trim() || null,
    sizesAvailable,
    price3mlPhysical: p3p,
    price6mlPhysical: p6p,
    price12mlPhysical: p12p,
    price50mlPhysical: p50p,
    price3mlOnline: p3o,
    price6mlOnline: p6o,
    price12mlOnline: p12o,
    price50mlOnline: p50o,
    currency: row.currency?.trim() || 'PKR',
    oilPricePer100g: toInt(row.oil_price_per_100g),
    supplier: row.supplier?.trim() || null,
    isFeatured: row.is_featured?.toLowerCase() === 'true',
    isActive: row.is_active?.toLowerCase() === 'true',
    stockStatus: ['in_stock', 'out_of_stock', 'pre_order'].includes(row.stock_status?.trim()) ? row.stock_status.trim() : 'in_stock',
    imageFolder: row.image_folder?.trim() || null,
    metaTitle: row.meta_title?.trim() || null,
    metaDescription: row.meta_description?.trim() || null,
    description: row.short_description?.trim() || `${row.name.trim()} - Premium fragrance`,
    price: lowestPrice,
    image: '',
    sizePrices: JSON.stringify(sizePricesArr),
    inStock: true,
  };
}
