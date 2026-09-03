'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { getBundlePickerProducts } from '@/app/admin/(protected)/actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Search, Package, Check } from 'lucide-react'

export interface PickerProduct {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number | null
  productId?: string | null
  type?: string | null
}

interface ProductPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  bundlePrice: number
}

export default function ProductPicker({ selectedIds, onChange, bundlePrice }: ProductPickerProps) {
  const [products, setProducts] = useState<PickerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const result = await getBundlePickerProducts()
      if (!cancelled) {
        setProducts(result.success ? result.products : [])
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedMap = useMemo(() => {
    const map = new Map<string, PickerProduct>()
    for (const id of selectedIds) {
      const p = products.find((prod) => prod.id === id)
      if (p) map.set(id, p)
    }
    return map
  }, [selectedIds, products])

  const selectedProductsList = useMemo(() => Array.from(selectedMap.values()), [selectedMap])

  const totalValue = useMemo(
    () => selectedProductsList.reduce((sum, p) => sum + p.price, 0),
    [selectedProductsList]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.productId || '').toLowerCase().includes(q) ||
            (p.slug || '').toLowerCase().includes(q)
        )
      : products
    return base.filter((p) => !selectedIds.includes(p.id)).slice(0, 30)
  }, [products, search, selectedIds])

  const toggleAdd = (p: PickerProduct) => {
    if (selectedIds.includes(p.id)) return
    onChange([...selectedIds, p.id])
    setSearch('')
  }

  const removeId = useCallback(
    (id: string) => {
      onChange(selectedIds.filter((existing) => existing !== id))
    },
    [selectedIds, onChange]
  )

  const savings = bundlePrice > 0 && totalValue > bundlePrice ? Math.round(((totalValue - bundlePrice) / totalValue) * 100) : 0

  return (
    <div className="space-y-4">
      <div>
        <Label>Select Products</Label>
        <p className="text-xs text-muted-foreground mt-1 mb-3">
          Search products by name, SKU or slug and add them to this bundle.
        </p>

        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setDropdownOpen(true)
              }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Search products to add..."
              className="pl-9"
            />
          </div>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
              <div className="absolute z-40 mt-1 w-full rounded-md border border-border bg-background shadow-lg max-h-72 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading products...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    {search ? 'No products match your search.' : 'All products added or no products available.'}
                  </div>
                ) : (
                  filtered.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleAdd(p)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {[p.type, p.productId].filter(Boolean).join(' · ') || 'Product'}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground shrink-0">PKR {p.price.toLocaleString()}</span>
                      <Check className="h-4 w-4 text-primary shrink-0 opacity-0" />
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedProductsList.length > 0 && (
        <div className="border rounded-lg divide-y divide-border">
          {selectedProductsList.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {p.productId || '—'} · {p.type || 'Product'}
                </p>
              </div>
              <span className="text-sm font-semibold text-foreground shrink-0">PKR {p.price.toLocaleString()}</span>
              <button
                type="button"
                onClick={() => removeId(p.id)}
                aria-label={`Remove ${p.name}`}
                className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-md bg-muted/50 border border-border p-3.5 space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            Bundle total (selected products)
          </span>
          <span className="font-bold text-foreground">PKR {totalValue.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Bundle price (you charge)</span>
          <span className="font-semibold text-gold">PKR {bundlePrice.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Customer saving</span>
          <span className={`font-semibold ${savings > 0 ? 'text-gold' : 'text-muted-foreground'}`}>
            {totalValue > bundlePrice ? `${savings}%` : '—'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          {totalValue > bundlePrice && bundlePrice > 0
            ? `Bundle total PKR ${totalValue.toLocaleString()} — aap bundle price PKR ${bundlePrice.toLocaleString()} laga rahe hain, customer ko ${savings}% saving (PKR ${(totalValue - bundlePrice).toLocaleString()}).`
            : 'Select products and enter a bundle price to see the saving breakdown.'}
        </p>
      </div>
    </div>
  )
}
