'use client'

import React from 'react'
import ProductTypeSelector, { type ProductType } from './ProductTypeSelector'
import AttarUploadForm from './AttarUploadForm'
import PerfumeUploadForm from './PerfumeUploadForm'

export default function CreateProductFlow() {
  const [step, setStep] = React.useState<'select' | 'form'>('select')
  const [productType, setProductType] = React.useState<ProductType | null>(null)

  function handleContinue() {
    if (productType) setStep('form')
  }

  if (step === 'select') {
    return (
      <ProductTypeSelector
        selected={productType}
        onSelect={setProductType}
        onContinue={handleContinue}
      />
    )
  }

  if (productType === 'attar') {
    return <AttarUploadForm />
  }

  if (productType === 'perfume') {
    return <PerfumeUploadForm />
  }

  return null
}
