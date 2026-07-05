'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct, type ProductFormData } from '@/app/admin/(protected)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, Plus, X, Trash2, Upload } from 'lucide-react'

const defaultFormState: ProductFormData = {
  name: '',
  slug: '',
  price: 0,
  originalPrice: null,
  description: '',
  image: '',
  images: [],
  categorySlug: 'men',
  size: '50ml',
  sizePrices: [
    { size: '30ml', price: 0, originalPrice: null },
    { size: '50ml', price: 0, originalPrice: null },
    { size: '100ml', price: 0, originalPrice: null },
  ],
  fragranceFamily: '',
  rating: 0,
  reviewCount: 0,
  notesTop: [],
  notesHeart: [],
  notesBase: [],
  inStock: true,
  isBestseller: false,
  isNew: false,
  productId: null,
  gender: 'Unisex',
  type: 'Attar & Spray',
  season: null,
  bestTime: null,
  impressionOf: null,
  shortDescription: null,
  longDescription: null,
  tags: null,
  sizesAvailable: '3ml,6ml,12ml,50ml',
  price3mlPhysical: null,
  price6mlPhysical: null,
  price12mlPhysical: null,
  price50mlPhysical: null,
  price3mlOnline: null,
  price6mlOnline: null,
  price12mlOnline: null,
  price50mlOnline: null,
  currency: 'PKR',
  oilPricePer100g: null,
  supplier: null,
  isFeatured: false,
  isActive: true,
  stockStatus: 'in_stock',
  imageFolder: null,
  metaTitle: null,
  metaDescription: null,
}

const tabs = [
  { key: 'pricing', label: 'Pricing & Sizes' },
  { key: 'media', label: 'Media' },
  { key: 'description', label: 'Description' },
  { key: 'notes', label: 'Fragrance Notes' },
  { key: 'status', label: 'Status & Flags' },
  { key: 'seo', label: 'SEO' },
]

interface TagInputProps {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

function TagInput({ label, tags, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          placeholder={placeholder || `Add ${label.toLowerCase()}...`}
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface GalleryUploadProps {
  images: string[]
  onChange: (images: string[]) => void
}

function GalleryUpload({ images, onChange }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setUploading(true)
    const uploaded: string[] = []

    for (const file of files) {
      const body = new FormData()
      body.append('file', file)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body })
        const data = await res.json()
        if (data.url) uploaded.push(data.url)
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    onChange([...images, ...uploaded])
    setUploading(false)
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return
    const updated = [...images]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <Label>Gallery Images</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((url, i) => (
          <div key={`${url}-${i}`} className="relative group aspect-[3/4] rounded-md border bg-muted overflow-hidden">
            <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <Button type="button" variant="ghost" size="icon-sm" className="text-white h-6 w-6" onClick={() => moveImage(i, i - 1)} disabled={i === 0}>
                ←
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" className="text-white h-6 w-6" onClick={() => removeImage(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" className="text-white h-6 w-6" onClick={() => moveImage(i, i + 1)} disabled={i === images.length - 1}>
                →
              </Button>
            </div>
          </div>
        ))}
        <label className="aspect-[3/4] rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-gold/50 transition-colors">
          <div className="text-center p-2">
            {uploading ? (
              <span className="text-xs text-muted-foreground">Uploading...</span>
            ) : (
              <>
                <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add</span>
              </>
            )}
          </div>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
    </div>
  )
}

interface ProductFormProps {
  initialData?: ProductFormData
  mode: 'create' | 'edit'
  productId?: string
}

export default function ProductForm({ initialData, mode, productId }: ProductFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<ProductFormData>(initialData || { ...defaultFormState })
  const [activeTab, setActiveTab] = useState('pricing')
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const set = useCallback(<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const autoSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: mode === 'create' ? autoSlug(name) : prev.slug,
    }))
  }

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(URL.createObjectURL(file))

    const body = new FormData()
    body.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (data.url) {
        set('image', data.url)
      }
    } catch {
      setImagePreview(null)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        rating: Number(form.rating),
        reviewCount: Number(form.reviewCount),
        price3mlPhysical: form.price3mlPhysical ? Number(form.price3mlPhysical) : null,
        price6mlPhysical: form.price6mlPhysical ? Number(form.price6mlPhysical) : null,
        price12mlPhysical: form.price12mlPhysical ? Number(form.price12mlPhysical) : null,
        price50mlPhysical: form.price50mlPhysical ? Number(form.price50mlPhysical) : null,
        price3mlOnline: form.price3mlOnline ? Number(form.price3mlOnline) : null,
        price6mlOnline: form.price6mlOnline ? Number(form.price6mlOnline) : null,
        price12mlOnline: form.price12mlOnline ? Number(form.price12mlOnline) : null,
        price50mlOnline: form.price50mlOnline ? Number(form.price50mlOnline) : null,
        oilPricePer100g: form.oilPricePer100g ? Number(form.oilPricePer100g) : null,
        sizePrices: form.sizePrices?.map((sp) => ({
          size: sp.size,
          price: Number(sp.price),
          originalPrice: sp.originalPrice ? Number(sp.originalPrice) : null,
        })),
      }

      let result
      if (mode === 'edit' && productId) {
        result = await updateProduct(productId, payload)
      } else {
        result = await createProduct(payload)
      }

      if (result.success) {
        toast.success(mode === 'edit' ? 'Product updated' : 'Product created')
        router.push('/admin/products')
      } else {
        toast.error(result.error || 'Failed to save product')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ─── Page Header ─── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <button type="button" onClick={() => router.push('/admin/products')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
            <ArrowLeft className="h-3 w-3" /> Back to Products
          </button>
          <h1 className="text-3xl font-serif font-bold">
            {mode === 'edit' ? 'Edit Product' : 'Create New Product'}
          </h1>
          {mode === 'edit' && form.name ? (
            <p className="text-sm text-muted-foreground mt-1">Editing: {form.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">Fill in the details below</p>
          )}
        </div>
        <div className="flex gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/products')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : mode === 'edit' ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </div>

      <Separator />

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        {/* ── Left Column: Tabs + Tab Content ── */}
        <div className="lg:col-span-2 space-y-0">
          <div className="border-b border-border">
            <nav className="flex gap-0 -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={
                    'whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ' +
                    (activeTab === tab.key
                      ? 'border-b-2 border-primary text-foreground'
                      : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30')
                  }
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white rounded-b-lg border border-t-0 border-border p-6 min-h-[400px]">
            {/* ── Pricing & Sizes Tab ── */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Base Pricing</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="price">Base Price *</Label>
                        <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => set('price', Number(e.target.value))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Original Price (was)</Label>
                        <Input id="originalPrice" type="number" min="0" step="0.01" value={form.originalPrice ?? ''} onChange={(e) => set('originalPrice', e.target.value ? Number(e.target.value) : null)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Input id="currency" value={form.currency || 'PKR'} onChange={(e) => set('currency', e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Size Prices (30ml / 50ml / 100ml)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {form.sizePrices?.map((sp, i) => (
                        <div key={sp.size} className="space-y-2 p-4 border rounded-md">
                          <Label className="text-sm font-medium">{sp.size}</Label>
                          <Input type="number" min="0" step="0.01" placeholder="Price" value={sp.price} onChange={(e) => {
                            const updated = [...(form.sizePrices || [])]
                            updated[i] = { ...updated[i], price: Number(e.target.value) }
                            set('sizePrices', updated)
                          }} />
                          <Input type="number" min="0" step="0.01" placeholder="Original Price" value={sp.originalPrice ?? ''} onChange={(e) => {
                            const updated = [...(form.sizePrices || [])]
                            updated[i] = { ...updated[i], originalPrice: e.target.value ? Number(e.target.value) : null }
                            set('sizePrices', updated)
                          }} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Attar / Oil Pricing</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">For attar/oil products with different SKU-based pricing</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      {['3ml', '6ml', '12ml', '50ml'].map((size) => {
                        const physKey = `price${size}Physical` as keyof ProductFormData
                        const onlineKey = `price${size}Online` as keyof ProductFormData
                        return (
                          <div key={size} className="space-y-2 p-3 border rounded-md">
                            <Label className="text-xs font-medium">{size}</Label>
                            <Input type="number" min="0" placeholder="Physical" value={(form[physKey] as number | null) ?? ''} onChange={(e) => set(physKey, e.target.value ? Number(e.target.value) : null)} />
                            <Input type="number" min="0" placeholder="Online" value={(form[onlineKey] as number | null) ?? ''} onChange={(e) => set(onlineKey, e.target.value ? Number(e.target.value) : null)} />
                          </div>
                        )
                      })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="oilPricePer100g">Oil Price per 100g</Label>
                        <Input id="oilPricePer100g" type="number" min="0" value={form.oilPricePer100g ?? ''} onChange={(e) => set('oilPricePer100g', e.target.value ? Number(e.target.value) : null)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sizesAvailable">Available Sizes</Label>
                        <Input id="sizesAvailable" value={form.sizesAvailable || ''} onChange={(e) => set('sizesAvailable', e.target.value)} placeholder="3ml,6ml,12ml,50ml" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Size Configuration</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="defaultSize">Default Size</Label>
                        <Select value={form.size || '50ml'} onValueChange={(v) => v !== null && set('size', v)}>
                          <SelectTrigger id="defaultSize"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30ml">30ml</SelectItem>
                            <SelectItem value="50ml">50ml</SelectItem>
                            <SelectItem value="100ml">100ml</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── Media Tab ── */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Main Image</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="h-24 w-24 rounded-md border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : form.image ? (
                          <img src={form.image} alt="Current" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-muted-foreground">No image</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button type="button" variant="outline" size="sm" disabled={uploadingImage} onClick={() => document.getElementById('main-image-upload')?.click()}>
                          {uploadingImage ? 'Uploading...' : 'Choose Image'}
                        </Button>
                        <input id="main-image-upload" type="file" accept="image/*" className="hidden" onChange={handleMainImageUpload} />
                        {form.image && (
                          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => { set('image', ''); setImagePreview(null) }}>
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Gallery Images</CardTitle></CardHeader>
                  <CardContent>
                    <GalleryUpload images={form.images || []} onChange={(images) => set('images', images)} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Image Folder</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="imageFolder">Image Folder</Label>
                      <Input id="imageFolder" value={form.imageFolder || ''} onChange={(e) => set('imageFolder', e.target.value || null)} placeholder="e.g. products/rose-wood" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── Description Tab ── */}
            {activeTab === 'description' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Short Description</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" rows={3} value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="A brief product summary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Long Description</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="longDescription">Full Description</Label>
                      <p className="text-xs text-muted-foreground">Supports **bold** text. Use blank lines for paragraphs.</p>
                      <Textarea id="longDescription" rows={10} value={form.longDescription || ''} onChange={(e) => set('longDescription', e.target.value || null)} placeholder="Detailed product description..." />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input id="tags" value={form.tags || ''} onChange={(e) => set('tags', e.target.value)} placeholder="men,oud,summer,impression" />
                      <p className="text-xs text-muted-foreground">Used for filtering on the shop page.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── Fragrance Notes Tab ── */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Fragrance Notes</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <TagInput label="Top Notes" tags={form.notesTop || []} onChange={(tags) => set('notesTop', tags)} placeholder="e.g. Bergamot, Saffron" />
                      <TagInput label="Heart Notes" tags={form.notesHeart || []} onChange={(tags) => set('notesHeart', tags)} placeholder="e.g. Rose, Jasmine" />
                      <TagInput label="Base Notes" tags={form.notesBase || []} onChange={(tags) => set('notesBase', tags)} placeholder="e.g. Musk, Amber" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── Status & Flags Tab ── */}
            {activeTab === 'status' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Flags</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                      <Label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <Checkbox checked={form.isActive ?? true} onCheckedChange={(c) => set('isActive', c as boolean)} />
                        Active
                      </Label>
                      <Label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <Checkbox checked={form.inStock ?? true} onCheckedChange={(c) => set('inStock', c as boolean)} />
                        In Stock
                      </Label>
                      <Label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <Checkbox checked={form.isFeatured ?? false} onCheckedChange={(c) => set('isFeatured', c as boolean)} />
                        Featured
                      </Label>
                      <Label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <Checkbox checked={form.isBestseller ?? false} onCheckedChange={(c) => set('isBestseller', c as boolean)} />
                        Bestseller
                      </Label>
                      <Label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <Checkbox checked={form.isNew ?? false} onCheckedChange={(c) => set('isNew', c as boolean)} />
                        New Arrival
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Stock & Metrics</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="stockStatus">Stock Status</Label>
                        <Select value={form.stockStatus || 'in_stock'} onValueChange={(v) => v !== null && set('stockStatus', v)}>
                          <SelectTrigger id="stockStatus"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in_stock">In Stock</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            <SelectItem value="pre_order">Pre-Order</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rating">Rating (0-5)</Label>
                        <Input id="rating" type="number" min="0" max="5" step="0.1" value={form.rating ?? 0} onChange={(e) => set('rating', Number(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reviewCount">Review Count</Label>
                        <Input id="reviewCount" type="number" min="0" step="1" value={form.reviewCount ?? 0} onChange={(e) => set('reviewCount', Number(e.target.value))} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── SEO Tab ── */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Search Engine Optimization</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="metaTitle">Meta Title</Label>
                        <Input id="metaTitle" value={form.metaTitle || ''} onChange={(e) => set('metaTitle', e.target.value || null)} placeholder="e.g. Safari Midnight | Premium Luxury Fragrance" />
                        <p className="text-xs text-muted-foreground">If empty, product name will be used.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <Textarea id="metaDescription" rows={4} value={form.metaDescription || ''} onChange={(e) => set('metaDescription', e.target.value || null)} placeholder="A compelling description for search engine results..." />
                        <p className="text-xs text-muted-foreground">Ideally 150-160 characters for optimal SERP display.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Sidebar (always visible) ── */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
                <p className="text-xs text-muted-foreground">Auto-generated from name for new products</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productId">Product ID (SKU)</Label>
                <Input id="productId" value={form.productId || ''} onChange={(e) => set('productId', e.target.value || null)} placeholder="e.g. PRD0001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier" value={form.supplier || ''} onChange={(e) => set('supplier', e.target.value || null)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={form.categorySlug || 'men'} onValueChange={(v) => v !== null && set('categorySlug', v)}>
                  <SelectTrigger id="category" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={form.gender || 'Unisex'} onValueChange={(v) => v !== null && set('gender', v)}>
                  <SelectTrigger id="gender" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Men">Men</SelectItem>
                    <SelectItem value="Women">Women</SelectItem>
                    <SelectItem value="Unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input id="type" value={form.type || ''} onChange={(e) => set('type', e.target.value)} placeholder="e.g. Attar & Spray" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fragranceFamily">Fragrance Family</Label>
                <Select value={form.fragranceFamily || ''} onValueChange={(v) => v !== null && set('fragranceFamily', v)}>
                  <SelectTrigger id="fragranceFamily" className="w-full"><SelectValue placeholder="Select family" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Floral">Floral</SelectItem>
                    <SelectItem value="Woody">Woody</SelectItem>
                    <SelectItem value="Oriental">Oriental</SelectItem>
                    <SelectItem value="Fresh">Fresh</SelectItem>
                    <SelectItem value="Citrus">Citrus</SelectItem>
                    <SelectItem value="Gourmand">Gourmand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Select value={form.season || ''} onValueChange={(v) => set('season', v || null)}>
                  <SelectTrigger id="season" className="w-full"><SelectValue placeholder="Select season" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Summer">Summer</SelectItem>
                    <SelectItem value="Winter">Winter</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="All Season">All Season</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bestTime">Best Time</Label>
                <Input id="bestTime" value={form.bestTime || ''} onChange={(e) => set('bestTime', e.target.value || null)} placeholder="e.g. Evening, Day" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="impressionOf">Impression Of</Label>
                <Input id="impressionOf" value={form.impressionOf || ''} onChange={(e) => set('impressionOf', e.target.value || null)} placeholder="e.g. Creed Aventus" />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* ─── Bottom Actions ─── */}
      <Separator className="mt-6" />
      <div className="flex justify-end gap-3 pt-6">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : mode === 'edit' ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
