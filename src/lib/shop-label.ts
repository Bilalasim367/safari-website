/**
 * Shop page label derivation.
 *
 * Lives outside src/app/shop/page.tsx on purpose: Next.js validates the set of
 * exports a page module may declare, and an extra named export fails the build.
 */

export type ShopSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function getShopLabel(params: ShopSearchParams): string {
  const gender = firstValue(params.gender).toLowerCase();
  const type = firstValue(params.type).toLowerCase();
  const category = firstValue(params.category);
  const isNew = firstValue(params.isNew) === 'true';
  const isBestseller = firstValue(params.isBestseller) === 'true';

  let label = 'Shop All';

  if (category && !['men', 'women', 'unisex'].includes(category.toLowerCase())) {
    label = capitalize(category);
  } else if (type === 'attar' && gender) {
    label = `Attars for ${capitalize(gender)}`;
  } else if (type === 'perfume' && gender) {
    label = `Perfumes for ${capitalize(gender)}`;
  } else if (type === 'attar') {
    label = 'Attar Collection';
  } else if (type === 'perfume') {
    label = 'Perfume Collection';
  } else if (gender) {
    label = `${capitalize(gender)} Fragrances`;
  }

  if (isNew) label = 'New Arrivals';
  if (isBestseller) label = 'Bestsellers';

  return label;
}