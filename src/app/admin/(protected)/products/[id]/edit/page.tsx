'use client'

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProductById } from '@/app/admin/(protected)/actions'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const result = await getProductById(id)
      if (result.error || !result.product) {
        router.push('/admin/products')
        return
      }
      const type = (result.product.type || '').toLowerCase().includes('perfume') ? 'perfume' : 'attar'
      router.replace(`/admin/products/${type}/${id}/edit`)
    })()
  }, [id, router])

  return (
    <div className="p-8 animate-pulse space-y-6">
      <div className="h-8 bg-muted rounded w-1/4"></div>
      <div className="h-64 bg-muted rounded-xl"></div>
    </div>
  )
}
