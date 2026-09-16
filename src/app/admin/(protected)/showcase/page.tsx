'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Loader2, Star, Upload, X } from '@/lib/lucide-icons'
import ShowcaseCropper from '@/components/admin/ShowcaseCropper'
import { useImageUpload } from '@/hooks/useImageUpload'
import {
  DEFAULT_SHOWCASE_CONFIG,
  deriveHeading,
  firstSentence,
  formatPrice,
  parseList,
  pickDescription,
  resolveShowcaseDisplay,
  type ShowcaseConfig,
  type ShowcaseProduct,
} from '@/lib/homepage-showcase'

interface FormErrors {
  heading?: string
  price?: string
}

const GOLD_TOAST = {
  style: {
    background: '#111110',
    border: '1px solid rgba(182, 150, 93, 0.55)',
    color: '#ffffff',
  },
}

function mapProduct(item: Record<string, unknown>): ShowcaseProduct {
  return {
    slug: String(item.slug ?? ''),
    name: String(item.name ?? ''),
    price: Number(item.price ?? 0),
    originalPrice: item.originalPrice != null ? Number(item.originalPrice) : null,
    image: String(item.image ?? ''),
    rating: Number(item.rating ?? 0),
    reviews: Number(item.reviews ?? item.reviewCount ?? 0),
    gender: item.gender != null ? String(item.gender) : null,
    type: item.type != null ? String(item.type) : null,
    currency: item.currency != null ? String(item.currency) : null,
    impressionOf: item.impressionOf != null ? String(item.impressionOf) : null,
    shortDescription: item.shortDescription != null ? String(item.shortDescription) : null,
    description: item.description != null ? String(item.description) : null,
    longDescription: item.longDescription != null ? String(item.longDescription) : null,
    notesTop: parseList(item.notesTop),
    notesHeart: parseList(item.notesHeart),
    notesBase: parseList(item.notesBase),
  }
}

function buildFromProduct(p: ShowcaseProduct): ShowcaseConfig {
  return {
    visible: true,
    productSlug: p.slug,
    label: 'Signature Scent',
    heading: deriveHeading(p),
    tagline: firstSentence(p.longDescription),
    description: pickDescription(p),
    price: p.price > 0 ? p.price : null,
    originalPrice: p.originalPrice && p.originalPrice > 0 ? p.originalPrice : null,
    rating: p.rating > 0 ? p.rating : null,
    reviewsCount: p.reviews > 0 ? p.reviews : null,
    buttonText: 'Shop Now',
    buttonLink: `/shop/${p.slug}`,
    image: p.image,
  }
}

function parseNullableNumber(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export default function ShowcaseManagerPage() {
  const [config, setConfig] = useState<ShowcaseConfig>(() => ({
    ...DEFAULT_SHOWCASE_CONFIG,
  }))
  const [products, setProducts] = useState<ShowcaseProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [cropOpen, setCropOpen] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadMainImage, isUploading } = useImageUpload()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [cfgRes, prodsRes] = await Promise.all([
          fetch('/api/homepage-showcase'),
          fetch('/api/products?limit=500'),
        ])
        const cfg = (await cfgRes.json()) as Partial<ShowcaseConfig>
        const prods = (await prodsRes.json()) as { products?: Array<Record<string, unknown>> }

        if (cancelled) return

        const list = (prods.products ?? []).map(mapProduct)
        setProducts(list)

        let next: ShowcaseConfig = { ...DEFAULT_SHOWCASE_CONFIG, ...cfg }
        const product = list.find((p) => p.slug === next.productSlug) ?? null
        if (product && next.price === null) {
          next = buildFromProduct(product)
        }
        setConfig(next)
      } catch {
        if (!cancelled) toast.error('Failed to load showcase settings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const update = (patch: Partial<ShowcaseConfig>) =>
    setConfig((prev) => ({ ...prev, ...patch }))

  const selectedProduct = useMemo(
    () => products.find((p) => p.slug === config.productSlug) ?? null,
    [products, config.productSlug]
  )

  const preview = useMemo(
    () => resolveShowcaseDisplay(config, selectedProduct),
    [config, selectedProduct]
  )

  const handleProductChange = (slug: string) => {
    const next = products.find((p) => p.slug === slug)
    if (!next) return
    const built = buildFromProduct(next)
    setConfig((prev) => ({ ...built, visible: prev.visible }))
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed')
      return
    }
    try {
      const src = await readAsDataURL(file)
      setCropSrc(src)
      setCropOpen(true)
    } catch {
      toast.error('Could not read the selected image')
    }
  }

  const handleCropConfirm = async (blob: Blob) => {
    try {
      const file = new File([blob], `showcase-${Date.now()}.webp`, { type: blob.type })
      const url = await uploadMainImage(file)
      update({ image: url })
      setCropOpen(false)
      toast.success('Showcase image updated', GOLD_TOAST)
    } catch {
      throw new Error('Upload failed')
    }
  }

  const handleSave = async () => {
    const nextErrors: FormErrors = {}
    if (!config.heading.trim()) nextErrors.heading = 'Heading is required'
    if (!(config.price !== null && config.price > 0)) nextErrors.price = 'Price is required'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please fix the highlighted fields')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/homepage-showcase', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = (await res.json()) as { error?: string }
      if (res.ok && !data.error) {
        toast.success('Showcase updated ✓', GOLD_TOAST)
      } else {
        toast.error(data.error || 'Failed to save showcase')
      }
    } catch {
      toast.error('Failed to save showcase')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#B6965D]" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-[#B6965D]">Homepage Showcase Manager</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Edit the White Oud signature showcase that appears on the homepage.
        </p>
      </div>

      <div className="space-y-6">
        {/* LIVE PREVIEW */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Live Preview
          </p>
          <Card className="overflow-hidden border-[#B6965D]/30 bg-[#0a0a0a]">
            <CardContent className="relative p-5 md:p-7">
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(182, 150, 93,0.12), rgba(182, 150, 93,0) 70%)',
                }}
              />
              {!preview.visible && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]/70 backdrop-blur-[2px]">
                  <span className="rounded-full border border-[#B6965D]/50 bg-[#B6965D]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#B6965D]">
                    Showcase is hidden
                  </span>
                </div>
              )}
              <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border border-[#B6965D]/20 bg-black">
                  {preview.image ? (
                    <Image
                      src={preview.image}
                      alt={preview.name || 'Showcase image'}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Upload className="h-6 w-6 text-zinc-700" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center md:text-left">
                  <span className="inline-flex border border-[#B6965D]/60 bg-[#B6965D]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B6965D]">
                    {preview.label}
                  </span>
                  <h3 className="font-heading text-2xl font-semibold text-white md:text-3xl">
                    {preview.heading}
                  </h3>
                  {preview.tagline && (
                    <p className="font-heading text-sm italic text-[#B6965D]/85 md:text-base">
                      {preview.tagline}
                    </p>
                  )}
                  {preview.description && (
                    <p className="line-clamp-3 text-sm leading-relaxed text-[#b8b3ab]">
                      {preview.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:justify-start">
                    {preview.showRating && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-[#B6965D] text-[#B6965D]" />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-white">{preview.rating}</span>
                        <span className="text-xs text-[#b8b3ab]/80">
                          ({preview.reviewsCount} reviews)
                        </span>
                      </div>
                    )}
                    {preview.showPrice && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#B6965D]">
                          {preview.currency} {formatPrice(preview.price)}
                        </span>
                        {preview.originalPrice ? (
                          <span className="text-sm text-[#b8b3ab]/60 line-through">
                            {preview.currency} {formatPrice(preview.originalPrice)}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-[#B6965D] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black">
                      {preview.buttonText}
                    </span>
                    {preview.buttonLink && (
                      <code className="text-[11px] text-zinc-500">{preview.buttonLink}</code>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FORM */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
                <div>
                  <p className="font-medium">Featured Product</p>
                  <p className="text-sm text-zinc-500">
                    Select a product to auto-fill the fields below.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-zinc-400">
                    Select Featured Product
                  </Label>
                  <select
                    value={config.productSlug}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-[#B6965D]/60 focus:ring-1 focus:ring-[#B6965D]/40"
                  >
                    {products.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-500">
                    Selecting a product fills the content, pricing and button link. You can still
                    override any field manually.
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="font-medium">Visible on Homepage</p>
                    <p className="text-sm text-zinc-500">
                      Hide the showcase temporarily without deleting it.
                    </p>
                  </div>
                  <Switch
                    checked={config.visible}
                    onCheckedChange={(checked) => update({ visible: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-5 border-b border-border pb-3">
                <p className="font-medium">Content &amp; Pricing</p>
                <p className="text-sm text-zinc-500">
                  Fields left empty fall back to the selected product data.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-zinc-400">
                      Label text
                    </Label>
                    <Input
                      value={config.label}
                      placeholder="SIGNATURE SCENT"
                      onChange={(e) => update({ label: e.target.value })}
                    />
                    <p className="text-xs text-zinc-500">Small badge above the heading.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-zinc-400">
                      Heading *
                    </Label>
                    <Input
                      value={config.heading}
                      placeholder="White Oud"
                      onChange={(e) => update({ heading: e.target.value })}
                      aria-invalid={errors.heading ? true : undefined}
                    />
                    {errors.heading ? (
                      <p className="text-xs text-red-400">{errors.heading}</p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-zinc-400">Tagline</Label>
                  <Input
                    value={config.tagline}
                    placeholder="A signature scent for those who appreciate fine fragrance."
                    onChange={(e) => update({ tagline: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-zinc-400">
                    Description
                  </Label>
                  <Textarea
                    rows={4}
                    value={config.description}
                    placeholder="Short product description shown on the homepage…"
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-zinc-400">
                      Price (PKR) *
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={config.price === null ? '' : config.price}
                      placeholder="1799"
                      onChange={(e) => update({ price: parseNullableNumber(e.target.value) })}
                      aria-invalid={errors.price ? true : undefined}
                    />
                    {errors.price ? <p className="text-xs text-red-400">{errors.price}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-zinc-400">
                      Old Price (optional)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={config.originalPrice === null ? '' : config.originalPrice}
                      placeholder="2599"
                      onChange={(e) =>
                        update({ originalPrice: parseNullableNumber(e.target.value) })
                      }
                    />
                    <p className="text-xs text-zinc-500">Shown struck through.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-zinc-400">
                      Rating (1-5)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={config.rating === null ? '' : config.rating}
                      placeholder="4.6"
                      onChange={(e) => update({ rating: parseNullableNumber(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-zinc-400">
                      Reviews count
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={config.reviewsCount === null ? '' : config.reviewsCount}
                      placeholder="5"
                      onChange={(e) =>
                        update({ reviewsCount: parseNullableNumber(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-zinc-400">
                    Button text
                  </Label>
                  <Input
                    value={config.buttonText}
                    placeholder="Shop Now"
                    onChange={(e) => update({ buttonText: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-zinc-400">
                    Button link
                  </Label>
                  <Input
                    value={config.buttonLink}
                    placeholder="/shop/white-oud-creation"
                    onChange={(e) => update({ buttonLink: e.target.value })}
                  />
                  <p className="text-xs text-zinc-500">
                    Auto-set to the selected product&apos;s page — override with any path or URL.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* IMAGE UPLOADER */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-5 border-b border-border pb-3">
              <p className="font-medium">Showcase Image</p>
              <p className="text-sm text-zinc-500">
                Upload any photo — it will open in square crop mode with zoom so you can frame the
                bottle perfectly.
              </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-[auto,1fr]">
              <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-dashed border-zinc-600 bg-black">
                {config.image ? (
                  <>
                    <Image
                      src={config.image}
                      alt="Current showcase image"
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => update({ image: '' })}
                      aria-label="Remove showcase image"
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-red-500/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-600">
                    <Upload className="h-6 w-6" />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files?.[0]
                    if (file) void handleFile(file)
                  }}
                  className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#B6965D]/40 bg-[#B6965D]/[0.04] p-6 text-center transition-colors hover:bg-[#B6965D]/[0.08]"
                >
                  <Upload className="h-6 w-6 text-[#B6965D]" />
                  <p className="text-sm text-zinc-300">
                    Drag &amp; drop an image here, or{' '}
                    <span className="font-semibold text-[#B6965D]">click to browse</span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    Square crop (1:1) with 50%–300% zoom. JPEG, PNG or WebP.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleFile(file)
                    e.target.value = ''
                  }}
                />
                {config.image ? (
                  <p className="text-sm text-zinc-400">
                    Image saved as a square crop. It displays on the homepage in a square frame.
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SAVE */}
        <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-end">
          <p className="text-xs text-zinc-500">
            <span className="text-red-400">*</span> Required fields.
          </p>
          <Button
            onClick={handleSave}
            disabled={saving || isUploading}
            className="w-full min-h-[48px] bg-[#B6965D] font-semibold uppercase tracking-[0.15em] text-black hover:bg-[#c9a873] md:w-auto md:min-h-[44px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      <ShowcaseCropper
        open={cropOpen}
        imageSrc={cropSrc}
        onClose={() => setCropOpen(false)}
        onConfirm={handleCropConfirm}
      />
    </div>
  )
}