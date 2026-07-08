'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import ProductTypeSelector, { type ProductType } from '@/components/admin/ProductTypeSelector'

export default function NewProductPage() {
  const router = useRouter()
  const [productType, setProductType] = React.useState<ProductType | null>(null)

  return (
    <div className="p-6">
      <ProductTypeSelector
        selected={productType}
        onSelect={setProductType}
        onContinue={() => {
          if (productType) {
            router.push(`/admin/products/${productType}/new`)
          }
        }}
      />
    </div>
  )
}
