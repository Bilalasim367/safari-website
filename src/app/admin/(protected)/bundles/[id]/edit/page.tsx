'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getBundleById } from '@/app/admin/(protected)/actions'
import BundleForm from '@/components/admin/BundleForm'

export default function EditBundlePage() {
  const params = useParams()
  const id = params?.id as string

  const [initialData, setInitialData] = useState<{
    name: string
    slug: string
    description: string
    price: number
    originalPrice: number | null
    image: string
    save: string
    size: string
    inStock: boolean
    isActive: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      const result = await getBundleById(id)
      if (result.error || !result.bundle) {
        setError(result.error || 'Bundle not found')
      } else {
        const b = result.bundle
        setInitialData({
          name: b.name,
          slug: b.slug,
          description: b.description || '',
          price: b.price,
          originalPrice: b.originalPrice,
          image: b.image || '',
          save: b.save || '',
          size: b.size || '',
          inStock: b.inStock,
          isActive: b.isActive,
        })
      }
      setLoading(false)
    })()
  }, [id])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="text-destructive font-semibold">Error</h3>
          <p className="text-destructive/80 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return <BundleForm initialData={initialData!} mode="edit" bundleId={id} />
}
