'use client'

import React from 'react'
import ProductTypeSelector, { type ProductType } from '@/components/admin/ProductTypeSelector'
import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  const [productType, setProductType] = React.useState<ProductType | null>(null)
  const [step, setStep] = React.useState<'select' | 'form'>('select')

  if (step === 'select') {
    return (
      <div className="p-6">
        <ProductTypeSelector
          selected={productType}
          onSelect={setProductType}
          onContinue={() => setStep('form')}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <ProductForm mode="create" productType={productType || 'perfume'} />
    </div>
  )
}
