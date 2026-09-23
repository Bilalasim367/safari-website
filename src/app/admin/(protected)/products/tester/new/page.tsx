'use client'

import React from 'react'
import ProductForm from '@/components/admin/ProductForm'

export default function NewTesterPage() {
  return (
    <div className="p-6">
      <ProductForm mode="create" productType="tester" />
    </div>
  )
}