const ATTAR_SIZES = new Set(['3ml', '4ml', '6ml'])
const PERFUME_SIZES = new Set(['30ml', '50ml', '100ml'])

export type ProductType = 'attar' | 'perfume'

export function classifyProductType(product: {
  sizesAvailable?: string | null
  sizePrices?: string | null
  size?: string | null
}): ProductType {
  const sizes = new Set<string>()

  if (product.sizePrices) {
    try {
      const parsed = JSON.parse(product.sizePrices)
      if (Array.isArray(parsed)) {
        for (const sp of parsed) {
          if (sp.size) sizes.add(String(sp.size).toLowerCase())
        }
      }
    } catch {
    }
  }

  if (sizes.size === 0 && product.sizesAvailable) {
    for (const s of product.sizesAvailable.split(',')) {
      sizes.add(s.trim().toLowerCase())
    }
  }

  if (sizes.size === 0 && product.size) {
    sizes.add(product.size.toLowerCase())
  }

  let isAttar = false
  let isPerfume = false

  for (const s of sizes) {
    if (ATTAR_SIZES.has(s)) isAttar = true
    if (PERFUME_SIZES.has(s)) isPerfume = true
  }

  if (isAttar && !isPerfume) return 'attar'
  if (isPerfume && !isAttar) return 'perfume'

  if (isAttar && isPerfume && product.size) {
    const primary = product.size.toLowerCase()
    if (ATTAR_SIZES.has(primary)) return 'attar'
  }

  return 'perfume'
}
