import { z } from 'zod'

const VariantEntry = z.object({
  size: z.string(),
  price: z.number().min(0, 'Price must be at least 0'),
  sku: z.string().optional(),
  stock: z.number().int().min(0).default(0),
})

const NotesArray = z.array(z.string()).default([])

export const AttarUploadSchema = z.object({
  name: z.string().min(1, 'Product title is required'),
  description: z.string().min(1, 'Description is required'),
  ingredients: z.string().optional(),
  origin: z.string().min(1, 'Sourcing origin is required'),
  variants: z.array(VariantEntry).length(3),
  applicatorType: z.enum(['roll-on', 'stick', 'premium-box']),
  categorySlug: z.enum(['men', 'women', 'unisex']),
  gender: z.enum(['Men', 'Women', 'Unisex']),
  image: z.string().optional(),

  // New fields for PDP sync
  notesTop: NotesArray,
  notesHeart: NotesArray,
  notesBase: NotesArray,
  fragranceFamily: z.string().optional(),
  season: z.string().optional(),
  impressionOf: z.string().optional(),
  longDescription: z.string().optional(),
  images: z.array(z.string()).default([]),
  tags: z.string().optional(),

  originalPrice: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),

  inStock: z.boolean(),
  isActive: z.boolean(),
})

export const PerfumeUploadSchema = z.object({
  name: z.string().min(1, 'Product title is required'),
  description: z.string().min(1, 'Description is required'),
  fragranceFamily: z.string().min(1, 'Fragrance family is required'),
  concentration: z.enum(['EDP', 'Parfum', 'EDT']),
  variants: z.array(VariantEntry).length(3),
  bottleStyle: z.string().min(1, 'Bottle style is required'),
  categorySlug: z.enum(['men', 'women', 'unisex']),
  gender: z.enum(['Men', 'Women', 'Unisex']),
  image: z.string().optional(),

  // New fields for PDP sync
  notesTop: NotesArray,
  notesHeart: NotesArray,
  notesBase: NotesArray,
  season: z.string().optional(),
  impressionOf: z.string().optional(),
  longDescription: z.string().optional(),
  images: z.array(z.string()).default([]),
  tags: z.string().optional(),
  longevity: z.string().optional(),
  sillage: z.string().optional(),

  originalPrice: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),

  inStock: z.boolean(),
  isActive: z.boolean(),
})

export type AttarFormValues = z.input<typeof AttarUploadSchema>
export type PerfumeFormValues = z.input<typeof PerfumeUploadSchema>
