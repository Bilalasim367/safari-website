'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import { getProductById } from '@/app/admin/(protected)/actions'
import type { AdminProductFormValues } from '@/lib/validations/product'

export default function ProductEditWrapper({ productType }: { productType: 'perfume' | 'attar' }) {
  const params = useParams()
  const id = params.id as string
  const [product, setProduct] = useState<AdminProductFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      const result = await getProductById(id)
      if (result.error || !result.product) {
        setError(result.error || 'Product not found')
      } else {
        const p = result.product
        setProduct({
          name: p.name,
          slug: p.slug,
          price: p.price,
          originalPrice: p.originalPrice,
          description: p.description || '',
          image: p.image || '',
          images: Array.isArray(p.images) ? p.images : [],
          categorySlug: p.categorySlug ?? undefined,
          size: p.size || '50ml',
          sizePrices: Array.isArray(p.sizePrices)
            ? p.sizePrices.map((sp: { size: string; price: number; originalPrice?: number | null }) => ({
                size: sp.size,
                price: sp.price,
                originalPrice: sp.originalPrice ?? null,
              }))
            : [{ size: '30ml', price: 0, originalPrice: null }, { size: '50ml', price: 0, originalPrice: null }, { size: '100ml', price: 0, originalPrice: null }],
          fragranceFamily: p.fragranceFamily || null,
          rating: p.rating ?? 0,
          reviewCount: p.reviewCount ?? 0,
          notesTop: Array.isArray(p.notesTop) ? p.notesTop : [],
          notesHeart: Array.isArray(p.notesHeart) ? p.notesHeart : [],
          notesBase: Array.isArray(p.notesBase) ? p.notesBase : [],
          inStock: p.inStock ?? true,
          isBestseller: p.isBestseller ?? false,
          isNew: p.isNew ?? false,
          productId: p.productId || null,
          gender: p.gender || 'Unisex',
          type: p.type || null,
          season: p.season || null,
          bestTime: p.bestTime || null,
          impressionOf: p.impressionOf || null,
          shortDescription: p.shortDescription || null,
          longDescription: p.longDescription || null,
          tags: p.tags || null,
          sizesAvailable: p.sizesAvailable || '3ml,6ml,12ml,50ml',
          price3mlPhysical: p.price3mlPhysical ?? null,
          price6mlPhysical: p.price6mlPhysical ?? null,
          price12mlPhysical: p.price12mlPhysical ?? null,
          price50mlPhysical: p.price50mlPhysical ?? null,
          price3mlOnline: p.price3mlOnline ?? null,
          price6mlOnline: p.price6mlOnline ?? null,
          price12mlOnline: p.price12mlOnline ?? null,
          price50mlOnline: p.price50mlOnline ?? null,
          currency: p.currency || 'PKR',
          oilPricePer100g: p.oilPricePer100g ?? null,
          supplier: p.supplier || null,
          isFeatured: p.isFeatured ?? false,
          isActive: p.isActive ?? true,
          stockStatus: p.stockStatus || 'in_stock',
          imageFolder: p.imageFolder || null,
          metaTitle: p.metaTitle || null,
          metaDescription: p.metaDescription || null,
          concentration: p.concentration || null,
          bottleStyle: p.bottleStyle || null,
          longevity: p.longevity || null,
          sillage: p.sillage || null,
          applicatorType: p.applicatorType || null,
          origin: p.origin || null,
          ingredients: p.ingredients || null,
        })
      }
      setLoading(false)
    })()
  }, [id])

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="text-destructive font-semibold">Error</h3>
          <p className="text-destructive/80 mt-1">{error || 'Product not found'}</p>
        </div>
      </div>
    )
  }

  return <ProductForm mode="edit" initialData={product} productId={id} productType={productType} />
}
