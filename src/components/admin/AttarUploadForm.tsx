'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AttarUploadSchema, type AttarFormValues } from '@/lib/validations/product'
import { createProduct } from '@/app/admin/(protected)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Plus, X, Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_VARIANTS = [
  { size: '3ml', price: 0, sku: '', stock: 0 },
  { size: '4ml', price: 0, sku: '', stock: 0 },
  { size: '6ml', price: 0, sku: '', stock: 0 },
]

const defaultValues: AttarFormValues = {
  name: '',
  description: '',
  ingredients: '',
  origin: '',
  variants: DEFAULT_VARIANTS,
  applicatorType: 'roll-on',
  categorySlug: 'unisex',
  gender: 'Unisex',
  image: '',
  notesTop: [],
  notesHeart: [],
  notesBase: [],
  fragranceFamily: '',
  season: '',
  impressionOf: '',
  longDescription: '',
  images: [],
  tags: '',
  originalPrice: undefined,
  rating: undefined,
  reviewCount: undefined,
  inStock: true,
  isActive: true,
}

function autoSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function NotesInput({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = React.useState('')

  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="ml-1 hover:text-destructive">
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

function GalleryUpload({
  images,
  onChange,
}: {
  images: string[]
  onChange: (images: string[]) => void
}) {
  const [uploading, setUploading] = React.useState(false)

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

  return (
    <div className="space-y-3">
      <Label>Gallery Images</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((url, i) => (
          <div key={`${url}-${i}`} className="relative group aspect-[3/4] rounded-md border bg-muted overflow-hidden">
            <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <Button type="button" variant="ghost" size="icon-sm" className="text-white h-6 w-6" onClick={() => onChange(images.filter((_, j) => j !== i))}>
                <Trash2 className="h-3 w-3" />
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

export default function AttarUploadForm() {
  const router = useRouter()

  const form = useForm<AttarFormValues>({
    resolver: zodResolver(AttarUploadSchema),
    defaultValues,
  })

  const notesTop = form.watch('notesTop')
  const notesHeart = form.watch('notesHeart')
  const notesBase = form.watch('notesBase')
  const galleryImages = form.watch('images')

  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

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
        form.setValue('image', data.url)
      }
    } catch {
      setImagePreview(null)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  async function onSubmit(data: AttarFormValues) {
    setSaving(true)
    try {
      const result = await createProduct({
        name: data.name,
        slug: autoSlug(data.name),
        price: data.variants[0]?.price || 0,
        description: data.description,
        image: data.image || '',
        images: data.images,
        categorySlug: data.categorySlug,
        gender: data.gender,
        type: 'Attar',
        sizesAvailable: '3ml,4ml,6ml',
        sizePrices: data.variants.map((v) => ({
          size: v.size,
          price: v.price,
        })),
        notesTop: data.notesTop,
        notesHeart: data.notesHeart,
        notesBase: data.notesBase,
        fragranceFamily: data.fragranceFamily || null,
        season: data.season || null,
        impressionOf: data.impressionOf || null,
        longDescription: data.longDescription || null,
        tags: data.tags || null,
        originalPrice: data.originalPrice ?? null,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        inStock: data.inStock,
        isActive: data.isActive,
        applicatorType: data.applicatorType,
        origin: data.origin,
        ingredients: data.ingredients || null,
      })

      if (result.success) {
        toast.success('Attar product created')
        router.push('/admin/products')
      } else {
        toast.error(result.error || 'Failed to create product')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <button type="button" onClick={() => router.push('/admin/products')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
              <ArrowLeft className="h-3 w-3" /> Back to Products
            </button>
            <h1 className="text-3xl font-serif font-bold">Create Attar Product</h1>
            <p className="text-sm text-muted-foreground mt-1">Fill in the attar details below</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/products')} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create Attar'}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Title *</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Rose Wood Attar" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl><Textarea {...field} rows={4} placeholder="Rich, concentrated oil-based fragrance..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ingredients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingredients</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Oud, Rose, Sandalwood" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sourcing Origin *</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Assam, India" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fragranceFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fragrance Family</FormLabel>
                        <FormControl>
                          <Select value={field.value || ''} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select family" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Floral">Floral</SelectItem>
                              <SelectItem value="Woody">Woody</SelectItem>
                              <SelectItem value="Oriental">Oriental</SelectItem>
                              <SelectItem value="Fresh">Fresh</SelectItem>
                              <SelectItem value="Citrus">Citrus</SelectItem>
                              <SelectItem value="Gourmand">Gourmand</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="season"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Season</FormLabel>
                        <FormControl>
                          <Select value={field.value || ''} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select season" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Summer">Summer</SelectItem>
                              <SelectItem value="Winter">Winter</SelectItem>
                              <SelectItem value="Spring">Spring</SelectItem>
                              <SelectItem value="Fall">Fall</SelectItem>
                              <SelectItem value="All Season">All Season</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Fragrance Notes</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <NotesInput
                    label="Top Notes"
                    tags={notesTop ?? []}
                    onChange={(tags) => form.setValue('notesTop', tags)}
                    placeholder="e.g. Bergamot, Saffron"
                  />
                  <NotesInput
                    label="Heart Notes"
                    tags={notesHeart ?? []}
                    onChange={(tags) => form.setValue('notesHeart', tags)}
                    placeholder="e.g. Rose, Jasmine"
                  />
                  <NotesInput
                    label="Base Notes"
                    tags={notesBase ?? []}
                    onChange={(tags) => form.setValue('notesBase', tags)}
                    placeholder="e.g. Musk, Amber"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Long Description</CardTitle></CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="longDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <p className="text-xs text-muted-foreground">Supports **bold** text. Use blank lines for paragraphs.</p>
                      <FormControl><Textarea {...field} rows={8} placeholder="Detailed product description..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Impression</CardTitle></CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="impressionOf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impression Of</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Creed Aventus" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Variant Pricing</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">Default attar sizes — 3ml, 4ml, and 6ml</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="space-y-3 p-4 border rounded-md">
                      <p className="text-sm font-medium">{DEFAULT_VARIANTS[index].size}</p>
                      <FormField
                        control={form.control}
                        name={`variants.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                placeholder="0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.sku`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. ATT-3ML-001" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.stock`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                placeholder="0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compare-at Price</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 2999" />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Shows as strikethrough original price</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating (0-5)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="5" step="0.1" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 4.5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reviewCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Count</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 124" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Packaging</CardTitle></CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="applicatorType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicator Type *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="roll-on">Roll-on</SelectItem>
                            <SelectItem value="stick">Stick</SelectItem>
                            <SelectItem value="premium-box">Premium Box</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle>Images</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Image</FormLabel>
                      <FormControl>
                        <div className="flex items-start gap-4">
                          <div className="h-20 w-20 rounded-md border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {imagePreview ? (
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : field.value ? (
                              <img src={field.value} alt="Current" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-muted-foreground">No image</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button type="button" variant="outline" size="sm" disabled={uploadingImage} onClick={() => document.getElementById('attar-main-image-upload')?.click()}>
                              {uploadingImage ? 'Uploading...' : 'Choose Image'}
                            </Button>
                            <input id="attar-main-image-upload" type="file" accept="image/*" className="hidden" onChange={handleMainImageUpload} />
                            {field.value && (
                              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => { form.setValue('image', ''); setImagePreview(null) }}>
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <GalleryUpload
                  images={galleryImages ?? []}
                  onChange={(images) => form.setValue('images', images)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl><Input {...field} placeholder="men,oud,summer,impression" /></FormControl>
                      <p className="text-xs text-muted-foreground mt-1">Used for filtering on the shop page.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Classification</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="categorySlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="men">Men</SelectItem>
                            <SelectItem value="women">Women</SelectItem>
                            <SelectItem value="unisex">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Men">Men</SelectItem>
                            <SelectItem value="Women">Women</SelectItem>
                            <SelectItem value="Unisex">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Status</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c as boolean)} />
                        </FormControl>
                        Active
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inStock"
                  render={({ field }) => (
                    <FormItem>
                      <label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c as boolean)} />
                        </FormControl>
                        In Stock
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
            {saving ? 'Saving...' : 'Create Attar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
