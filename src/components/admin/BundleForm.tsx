'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBundle, updateBundle } from '@/app/admin/(protected)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

interface BundleFormData {
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
}

const defaultFormState: BundleFormData = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  originalPrice: null,
  image: '',
  save: '',
  size: '',
  inStock: true,
  isActive: true,
}

interface BundleFormProps {
  initialData?: BundleFormData
  mode: 'create' | 'edit'
  bundleId?: string
}

export default function BundleForm({ initialData, mode, bundleId }: BundleFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<BundleFormData>(initialData || { ...defaultFormState })
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const set = useCallback(<K extends keyof BundleFormData>(key: K, value: BundleFormData[K]) => {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        image: form.image || undefined,
        save: form.save || undefined,
        size: form.size || undefined,
        inStock: form.inStock,
        isActive: form.isActive,
      }

      let result
      if (mode === 'edit' && bundleId) {
        result = await updateBundle(bundleId, payload)
      } else {
        result = await createBundle(payload)
      }

      if (result.success) {
        toast.success(mode === 'edit' ? 'Bundle updated' : 'Bundle created')
        router.push('/admin/bundles')
      } else {
        toast.error(result.error || 'Failed to save bundle')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <button type="button" onClick={() => router.push('/admin/bundles')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
            <ArrowLeft className="h-3 w-3" /> Back to Bundles
          </button>
          <h1 className="text-3xl font-serif font-bold">
            {mode === 'edit' ? 'Edit Bundle' : 'Create New Bundle'}
          </h1>
          {mode === 'edit' && form.name ? (
            <p className="text-sm text-muted-foreground mt-1">Editing: {form.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">Fill in the details below</p>
          )}
        </div>
        <div className="flex gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/bundles')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : mode === 'edit' ? 'Update Bundle' : 'Create Bundle'}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
                <p className="text-xs text-muted-foreground">Auto-generated from name for new bundles</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Bundle description..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Image</CardTitle></CardHeader>
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
                  <Button type="button" variant="outline" size="sm" disabled={uploadingImage} onClick={() => document.getElementById('bundle-image-upload')?.click()}>
                    {uploadingImage ? 'Uploading...' : 'Choose Image'}
                  </Button>
                  <input id="bundle-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
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
            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => set('price', Number(e.target.value))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (was)</Label>
                  <Input id="originalPrice" type="number" min="0" step="0.01" value={form.originalPrice ?? ''} onChange={(e) => set('originalPrice', e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="save">Save Badge</Label>
                  <Input id="save" value={form.save} onChange={(e) => set('save', e.target.value)} placeholder="e.g. 28%" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                <Checkbox checked={form.isActive} onCheckedChange={(c) => set('isActive', c as boolean)} />
                Active
              </Label>
              <Label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                <Checkbox checked={form.inStock} onCheckedChange={(c) => set('inStock', c as boolean)} />
                In Stock
              </Label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size Info</Label>
                <Input id="size" value={form.size} onChange={(e) => set('size', e.target.value)} placeholder="e.g. 3 x 30ml" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="mt-6" />
      <div className="flex justify-end gap-3 pt-6">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/bundles')} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : mode === 'edit' ? 'Update Bundle' : 'Create Bundle'}
        </Button>
      </div>
    </form>
  )
}
