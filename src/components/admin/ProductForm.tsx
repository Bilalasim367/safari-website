'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProduct, updateProduct, type ProductFormData } from '@/app/admin/(protected)/actions'
import { AdminProductSchema, type AdminProductFormValues } from '@/lib/validations/product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, Plus, X, Trash2, Upload } from 'lucide-react'

const defaultFormState: AdminProductFormValues = {
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
  fragranceFamily: null,
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
  type: null,
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
  concentration: null,
  bottleStyle: null,
  longevity: null,
  sillage: null,
  applicatorType: null,
  origin: null,
  ingredients: null,
}

const tabs = [
  { key: 'pricing', label: 'Pricing' },
  { key: 'media', label: 'Media' },
  { key: 'description', label: 'Description' },
  { key: 'details', label: 'Details' },
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
        if (!res.ok) {
          throw new Error(data.error || 'Upload failed')
        }
        if (data.url) uploaded.push(data.url)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Failed to upload ${file.name}`)
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
  initialData?: AdminProductFormValues
  mode: 'create' | 'edit'
  productId?: string
  productType: 'perfume' | 'attar'
}

export default function ProductForm({ initialData, mode, productId, productType }: ProductFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('pricing')
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const form = useForm<AdminProductFormValues>({
    resolver: zodResolver(AdminProductSchema),
    defaultValues: initialData || {
      ...defaultFormState,
      type: productType === 'perfume' ? 'Perfume' : 'Attar',
    },
  })

  const autoSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setValue('name', name)
    if (mode === 'create') {
      form.setValue('slug', autoSlug(name))
    }
  }

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    const objectUrl = URL.createObjectURL(file)
    setImagePreview(objectUrl)

    const body = new FormData()
    body.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }
      if (data.url) {
        form.setValue('image', data.url)
        setImagePreview(data.url)
        URL.revokeObjectURL(objectUrl)
      }
    } catch (err) {
      setImagePreview(null)
      toast.error(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  async function onSubmit(data: AdminProductFormValues) {
    setSaving(true)
    try {
      const payload: ProductFormData = {
        ...data,
        image: data.image || '',
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        rating: Number(data.rating),
        reviewCount: Number(data.reviewCount),
        price3mlPhysical: data.price3mlPhysical ? Number(data.price3mlPhysical) : null,
        price6mlPhysical: data.price6mlPhysical ? Number(data.price6mlPhysical) : null,
        price12mlPhysical: data.price12mlPhysical ? Number(data.price12mlPhysical) : null,
        price50mlPhysical: data.price50mlPhysical ? Number(data.price50mlPhysical) : null,
        price3mlOnline: data.price3mlOnline ? Number(data.price3mlOnline) : null,
        price6mlOnline: data.price6mlOnline ? Number(data.price6mlOnline) : null,
        price12mlOnline: data.price12mlOnline ? Number(data.price12mlOnline) : null,
        price50mlOnline: data.price50mlOnline ? Number(data.price50mlOnline) : null,
        oilPricePer100g: data.oilPricePer100g ? Number(data.oilPricePer100g) : null,
        sizePrices: data.sizePrices?.map((sp) => ({
          size: sp.size,
          price: Number(sp.price),
          originalPrice: sp.originalPrice ? Number(sp.originalPrice) : null,
        })),
        type: productType === 'perfume' ? 'Perfume' : data.type || 'Attar',
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

  const imageValue = form.watch('image')
  const notesTop = form.watch('notesTop')
  const notesHeart = form.watch('notesHeart')
  const notesBase = form.watch('notesBase')
  const galleryImages = form.watch('images')
  const sizePrices = form.watch('sizePrices')

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <button type="button" onClick={() => router.push('/admin/products')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
            <ArrowLeft className="h-3 w-3" /> Back to Products
          </button>
          <h1 className="text-3xl font-serif font-bold">
            {mode === 'edit' ? 'Edit Product' : `Create ${productType === 'perfume' ? 'Perfume' : 'Attar'} Product`}
          </h1>
          {mode === 'edit' && form.watch('name') ? (
            <p className="text-sm text-muted-foreground mt-1">Editing: {form.watch('name')}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

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
                        <Input id="price" type="number" min="0" step="0.01"
                          value={form.watch('price')}
                          onChange={(e) => form.setValue('price', Number(e.target.value))}
                          required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Original Price (was)</Label>
                        <Input id="originalPrice" type="number" min="0" step="0.01"
                          value={form.watch('originalPrice') ?? ''}
                          onChange={(e) => form.setValue('originalPrice', e.target.value ? Number(e.target.value) : null)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Input id="currency"
                          value={form.watch('currency') || 'PKR'}
                          onChange={(e) => form.setValue('currency', e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {productType === 'perfume' && (
                  <Card>
                    <CardHeader><CardTitle>Size Prices</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {sizePrices?.map((sp, i) => (
                          <div key={sp.size} className="space-y-2 p-4 border rounded-md">
                            <Label className="text-sm font-medium">{sp.size}</Label>
                            <Input type="number" min="0" step="0.01" placeholder="Price"
                              value={sp.price}
                              onChange={(e) => {
                                const updated = [...(sizePrices || [])]
                                updated[i] = { ...updated[i], price: Number(e.target.value) }
                                form.setValue('sizePrices', updated)
                              }} />
                            <Input type="number" min="0" step="0.01" placeholder="Original Price"
                              value={sp.originalPrice ?? ''}
                              onChange={(e) => {
                                const updated = [...(sizePrices || [])]
                                updated[i] = { ...updated[i], originalPrice: e.target.value ? Number(e.target.value) : null }
                                form.setValue('sizePrices', updated)
                              }} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {productType === 'attar' && (
                  <Card>
                    <CardHeader><CardTitle>Attar / Oil Pricing</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-4">For attar/oil products with different SKU-based pricing</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {['3ml', '6ml', '12ml', '50ml'].map((size) => {
                          const physKey = `price${size}Physical` as keyof AdminProductFormValues
                          const onlineKey = `price${size}Online` as keyof AdminProductFormValues
                          return (
                            <div key={size} className="space-y-2 p-3 border rounded-md">
                              <Label className="text-xs font-medium">{size}</Label>
                              <Input type="number" min="0" placeholder="Physical"
                                value={(form.watch(physKey) as number | null) ?? ''}
                                onChange={(e) => form.setValue(physKey, (e.target.value ? Number(e.target.value) : null) as number | null)} />
                              <Input type="number" min="0" placeholder="Online"
                                value={(form.watch(onlineKey) as number | null) ?? ''}
                                onChange={(e) => form.setValue(onlineKey, (e.target.value ? Number(e.target.value) : null) as number | null)} />
                            </div>
                          )
                        })}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="oilPricePer100g">Oil Price per 100g</Label>
                          <Input id="oilPricePer100g" type="number" min="0"
                            value={form.watch('oilPricePer100g') ?? ''}
                            onChange={(e) => form.setValue('oilPricePer100g', e.target.value ? Number(e.target.value) : null)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sizesAvailable">Available Sizes</Label>
                          <Input id="sizesAvailable"
                            value={form.watch('sizesAvailable') || ''}
                            onChange={(e) => form.setValue('sizesAvailable', e.target.value)}
                            placeholder="3ml,6ml,12ml,50ml" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader><CardTitle>Size Configuration</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="defaultSize">Default Size</Label>
                        <select
                          id="defaultSize"
                          value={form.watch('size') || '50ml'}
                          onChange={(e) => form.setValue('size', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="30ml">30ml</option>
                          <option value="50ml">50ml</option>
                          <option value="100ml">100ml</option>
                        </select>
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
                        ) : imageValue ? (
                          <img src={imageValue} alt="Current" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-muted-foreground">No image</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button type="button" variant="outline" size="sm" disabled={uploadingImage} onClick={() => document.getElementById('main-image-upload')?.click()}>
                          {uploadingImage ? 'Uploading...' : 'Choose Image'}
                        </Button>
                        <input id="main-image-upload" type="file" accept="image/*" className="hidden" onChange={handleMainImageUpload} />
                        {imageValue && (
                          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => { form.setValue('image', ''); setImagePreview(null) }}>
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
                    <GalleryUpload images={galleryImages || []} onChange={(images) => form.setValue('images', images)} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Image Folder</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="imageFolder">Image Folder</Label>
                      <Input id="imageFolder"
                        value={form.watch('imageFolder') || ''}
                        onChange={(e) => form.setValue('imageFolder', e.target.value || null)}
                        placeholder="e.g. products/rose-wood" />
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
                      <Textarea id="description" rows={3}
                        value={form.watch('description') || ''}
                        onChange={(e) => form.setValue('description', e.target.value)}
                        placeholder="A brief product summary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Long Description</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="longDescription">Full Description</Label>
                      <p className="text-xs text-muted-foreground">Supports **bold** text. Use blank lines for paragraphs.</p>
                      <Textarea id="longDescription" rows={10}
                        value={form.watch('longDescription') || ''}
                        onChange={(e) => form.setValue('longDescription', e.target.value || null)}
                        placeholder="Detailed product description..." />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input id="tags"
                        value={form.watch('tags') || ''}
                        onChange={(e) => form.setValue('tags', e.target.value)}
                        placeholder="men,oud,summer,impression" />
                      <p className="text-xs text-muted-foreground">Used for filtering on the shop page.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── Details Tab ── */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {productType === 'perfume' ? (
                  <>
                    <Card>
                      <CardHeader><CardTitle>Fragrance Profile</CardTitle></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="concentration">Concentration *</Label>
                            <select
                              id="concentration"
                              value={form.watch('concentration') || ''}
                              onChange={(e) => form.setValue('concentration', e.target.value || null)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select concentration</option>
                              <option value="EDP">EDP — Eau de Parfum</option>
                              <option value="Parfum">Parfum</option>
                              <option value="EDT">EDT — Eau de Toilette</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bottleStyle">Bottle / Spray Type *</Label>
                            <select
                              id="bottleStyle"
                              value={form.watch('bottleStyle') || ''}
                              onChange={(e) => form.setValue('bottleStyle', e.target.value || null)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select bottle style</option>
                              <option value="Spray">Spray</option>
                              <option value="Atomizer">Atomizer</option>
                              <option value="Splash">Splash</option>
                              <option value="Decant">Decant</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="longevity">Longevity</Label>
                            <select
                              id="longevity"
                              value={form.watch('longevity') || ''}
                              onChange={(e) => form.setValue('longevity', e.target.value || null)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select longevity</option>
                              <option value="Very Long Lasting">Very Long Lasting</option>
                              <option value="Long Lasting">Long Lasting</option>
                              <option value="Moderate">Moderate</option>
                              <option value="Light">Light</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sillage">Sillage</Label>
                            <select
                              id="sillage"
                              value={form.watch('sillage') || ''}
                              onChange={(e) => form.setValue('sillage', e.target.value || null)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select sillage</option>
                              <option value="Heavy">Heavy</option>
                              <option value="Moderate">Moderate</option>
                              <option value="Soft">Soft</option>
                              <option value="Intimate">Intimate</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    <Card>
                      <CardHeader><CardTitle>Attar Details</CardTitle></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="origin">Sourcing Origin *</Label>
                            <Input id="origin"
                              value={form.watch('origin') || ''}
                              onChange={(e) => form.setValue('origin', e.target.value || null)}
                              placeholder="e.g. Assam, India" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="applicatorType">Applicator Type *</Label>
                            <select
                              id="applicatorType"
                              value={form.watch('applicatorType') || ''}
                              onChange={(e) => form.setValue('applicatorType', e.target.value || null)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select applicator</option>
                              <option value="roll-on">Roll-on</option>
                              <option value="stick">Stick</option>
                              <option value="premium-box">Premium Box</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="ingredients">Ingredients</Label>
                          <Input id="ingredients"
                            value={form.watch('ingredients') || ''}
                            onChange={(e) => form.setValue('ingredients', e.target.value || null)}
                            placeholder="e.g. Oud, Rose, Sandalwood" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}

            {/* ── Fragrance Notes Tab ── */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Fragrance Notes</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <TagInput label="Top Notes" tags={notesTop || []} onChange={(tags) => form.setValue('notesTop', tags)} placeholder="e.g. Bergamot, Saffron" />
                      <TagInput label="Heart Notes" tags={notesHeart || []} onChange={(tags) => form.setValue('notesHeart', tags)} placeholder="e.g. Rose, Jasmine" />
                      <TagInput label="Base Notes" tags={notesBase || []} onChange={(tags) => form.setValue('notesBase', tags)} placeholder="e.g. Musk, Amber" />
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
                        <Checkbox checked={form.watch('isActive') ?? true} onCheckedChange={(c) => form.setValue('isActive', c as boolean)} />
                        Active
                      </Label>
                      <Label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <Checkbox checked={form.watch('inStock') ?? true} onCheckedChange={(c) => form.setValue('inStock', c as boolean)} />
                        In Stock
                      </Label>
                      <Label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <Checkbox checked={form.watch('isFeatured') ?? false} onCheckedChange={(c) => form.setValue('isFeatured', c as boolean)} />
                        Featured
                      </Label>
                      <Label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <Checkbox checked={form.watch('isBestseller') ?? false} onCheckedChange={(c) => form.setValue('isBestseller', c as boolean)} />
                        Bestseller
                      </Label>
                      <Label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <Checkbox checked={form.watch('isNew') ?? false} onCheckedChange={(c) => form.setValue('isNew', c as boolean)} />
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
                        <select
                          id="stockStatus"
                          value={form.watch('stockStatus') || 'in_stock'}
                          onChange={(e) => form.setValue('stockStatus', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="in_stock">In Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                          <option value="pre_order">Pre-Order</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rating">Rating (0-5)</Label>
                        <Input id="rating" type="number" min="0" max="5" step="0.1"
                          value={form.watch('rating') ?? 0}
                          onChange={(e) => form.setValue('rating', Number(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reviewCount">Review Count</Label>
                        <Input id="reviewCount" type="number" min="0" step="1"
                          value={form.watch('reviewCount') ?? 0}
                          onChange={(e) => form.setValue('reviewCount', Number(e.target.value))} />
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
                        <Input id="metaTitle"
                          value={form.watch('metaTitle') || ''}
                          onChange={(e) => form.setValue('metaTitle', e.target.value || null)}
                          placeholder="e.g. Safari Midnight | Premium Luxury Fragrance" />
                        <p className="text-xs text-muted-foreground">If empty, product name will be used.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <Textarea id="metaDescription" rows={4}
                          value={form.watch('metaDescription') || ''}
                          onChange={(e) => form.setValue('metaDescription', e.target.value || null)}
                          placeholder="A compelling description for search engine results..." />
                        <p className="text-xs text-muted-foreground">Ideally 150-160 characters for optimal SERP display.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Sidebar ── */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name"
                  value={form.watch('name')}
                  onChange={handleNameChange}
                  required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug"
                  value={form.watch('slug')}
                  onChange={(e) => form.setValue('slug', e.target.value)}
                  required />
                <p className="text-xs text-muted-foreground">Auto-generated from name for new products</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productId">Product ID (SKU)</Label>
                <Input id="productId"
                  value={form.watch('productId') || ''}
                  onChange={(e) => form.setValue('productId', e.target.value || null)}
                  placeholder="e.g. PRD0001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier"
                  value={form.watch('supplier') || ''}
                  onChange={(e) => form.setValue('supplier', e.target.value || null)} />
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
                <select
                  id="category"
                  value={form.watch('categorySlug') || 'men'}
                  onChange={(e) => form.setValue('categorySlug', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={form.watch('gender') || 'Unisex'}
                  onChange={(e) => form.setValue('gender', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input id="type"
                  value={form.watch('type') || (productType === 'perfume' ? 'Perfume' : 'Attar')}
                  onChange={(e) => form.setValue('type', e.target.value)}
                  placeholder="e.g. Attar & Spray" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fragranceFamily">Fragrance Family</Label>
                <select
                  id="fragranceFamily"
                  value={form.watch('fragranceFamily') || ''}
                  onChange={(e) => form.setValue('fragranceFamily', e.target.value || null)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select family</option>
                  <option value="Floral">Floral</option>
                  <option value="Woody">Woody</option>
                  <option value="Oriental">Oriental</option>
                  <option value="Fresh">Fresh</option>
                  <option value="Citrus">Citrus</option>
                  <option value="Gourmand">Gourmand</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <select
                  id="season"
                  value={form.watch('season') || ''}
                  onChange={(e) => form.setValue('season', e.target.value || null)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select season</option>
                  <option value="Summer">Summer</option>
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Fall">Fall</option>
                  <option value="All Season">All Season</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bestTime">Best Time</Label>
                <Input id="bestTime"
                  value={form.watch('bestTime') || ''}
                  onChange={(e) => form.setValue('bestTime', e.target.value || null)}
                  placeholder="e.g. Evening, Day" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="impressionOf">Impression Of</Label>
                <Input id="impressionOf"
                  value={form.watch('impressionOf') || ''}
                  onChange={(e) => form.setValue('impressionOf', e.target.value || null)}
                  placeholder="e.g. Creed Aventus" />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

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
