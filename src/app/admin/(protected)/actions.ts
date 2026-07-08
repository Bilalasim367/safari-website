'use server'

import prisma from '@/lib/turso';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

async function getAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function getAdminProducts() {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized', products: [] };
  }
  
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        image: true,
        categorySlug: true,
        size: true,
        sizePrices: true,
        inStock: true,
        isBestseller: true,
        isNew: true,
        productId: true,
        gender: true,
        season: true,
        stockStatus: true,
        isActive: true,
        isFeatured: true,
        type: true,
        price50mlPhysical: true,
        price50mlOnline: true,
      },
    });
    return { success: true, products };
  } catch {
    return { error: 'Failed to fetch products', products: [] };
  }
}

export async function getProductById(id: string) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized', product: null };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return { error: 'Product not found', product: null };
    }

    const parseJson = (val: string | string[]) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val; }
      }
      return val;
    };

    return {
      success: true,
      product: {
        ...product,
        images: parseJson(product.images),
        sizePrices: parseJson(product.sizePrices),
        notesTop: parseJson(product.notesTop),
        notesHeart: parseJson(product.notesHeart),
        notesBase: parseJson(product.notesBase),
      },
    };
  } catch {
    return { error: 'Failed to fetch product', product: null };
  }
}

export interface ProductFormData {
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  description?: string | null;
  image: string;
  images?: string[];
  categorySlug?: string | null;
  size?: string;
  sizePrices?: { size: string; price: number; originalPrice?: number | null }[];
  fragranceFamily?: string | null;
  rating?: number;
  reviewCount?: number;
  notesTop?: string[];
  notesHeart?: string[];
  notesBase?: string[];
  inStock?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  productId?: string | null;
  gender?: string | null;
  type?: string | null;
  season?: string | null;
  bestTime?: string | null;
  impressionOf?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  tags?: string | null;
  sizesAvailable?: string | null;
  price3mlPhysical?: number | null;
  price6mlPhysical?: number | null;
  price12mlPhysical?: number | null;
  price50mlPhysical?: number | null;
  price3mlOnline?: number | null;
  price6mlOnline?: number | null;
  price12mlOnline?: number | null;
  price50mlOnline?: number | null;
  currency?: string;
  oilPricePer100g?: number | null;
  supplier?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  stockStatus?: string;
  imageFolder?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  // Perfume-specific
  concentration?: string | null;
  bottleStyle?: string | null;
  longevity?: string | null;
  sillage?: string | null;
  // Attar-specific
  applicatorType?: string | null;
  origin?: string | null;
  ingredients?: string | null;
}

function makeProductId(id: string | null | undefined, index: number): string | null {
  if (!id) return null;
  return index > 0 ? `${id}-${index}` : id;
}

export async function createProduct(data: ProductFormData) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized' };
  }
  
  let productId = data.productId || null;
  let slug = data.slug;

  // Ensure unique productId
  if (productId) {
    let attempt = 0;
    while (await prisma.product.findUnique({ where: { productId: productId } })) {
      attempt++;
      productId = makeProductId(data.productId!, attempt);
    }
  }

  // Ensure unique slug
  let attempt = 0;
  const baseSlug = slug;
  while (await prisma.product.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description || `${data.name} - Luxury fragrance`,
        price: data.price,
        originalPrice: data.originalPrice ?? null,
        image: data.image || '',
        images: JSON.stringify(data.images || (data.image ? [data.image] : [])),
        categorySlug: data.categorySlug?.toLowerCase() || 'men',
        size: data.size || '50ml',
        sizePrices: JSON.stringify(data.sizePrices || []),
        fragranceFamily: data.fragranceFamily || null,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        notesTop: JSON.stringify(data.notesTop || []),
        notesHeart: JSON.stringify(data.notesHeart || []),
        notesBase: JSON.stringify(data.notesBase || []),
        inStock: data.inStock ?? true,
        isBestseller: data.isBestseller ?? false,
        isNew: data.isNew ?? false,
        productId,
        gender: data.gender || 'Unisex',
        type: data.type || 'Attar & Spray',
        season: data.season || null,
        bestTime: data.bestTime || null,
        impressionOf: data.impressionOf || null,
        shortDescription: data.shortDescription || null,
        longDescription: data.longDescription || null,
        tags: data.tags || null,
        sizesAvailable: data.sizesAvailable || '3ml,6ml,12ml,50ml',
        price3mlPhysical: data.price3mlPhysical ?? null,
        price6mlPhysical: data.price6mlPhysical ?? null,
        price12mlPhysical: data.price12mlPhysical ?? null,
        price50mlPhysical: data.price50mlPhysical ?? null,
        price3mlOnline: data.price3mlOnline ?? null,
        price6mlOnline: data.price6mlOnline ?? null,
        price12mlOnline: data.price12mlOnline ?? null,
        price50mlOnline: data.price50mlOnline ?? null,
        currency: data.currency || 'PKR',
        oilPricePer100g: data.oilPricePer100g ?? null,
        supplier: data.supplier || null,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
        stockStatus: data.stockStatus || 'in_stock',
        imageFolder: data.imageFolder || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        // Perfume-specific
        concentration: data.concentration || null,
        bottleStyle: data.bottleStyle || null,
        longevity: data.longevity || null,
        sillage: data.sillage || null,
        // Attar-specific
        applicatorType: data.applicatorType || null,
        origin: data.origin || null,
        ingredients: data.ingredients || null,
      },
    });
    return { success: true, product };
  } catch (e) {
    return { error: 'Failed to create product', detail: String(e) };
  }
}

export async function updateProduct(id: string, data: ProductFormData) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized' };
  }
  
  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice ?? null,
        image: data.image || '',
        images: JSON.stringify(data.images || (data.image ? [data.image] : [])),
        categorySlug: data.categorySlug?.toLowerCase() || 'men',
        size: data.size || '50ml',
        sizePrices: JSON.stringify(data.sizePrices || []),
        fragranceFamily: data.fragranceFamily || null,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        notesTop: JSON.stringify(data.notesTop || []),
        notesHeart: JSON.stringify(data.notesHeart || []),
        notesBase: JSON.stringify(data.notesBase || []),
        inStock: data.inStock ?? true,
        isBestseller: data.isBestseller ?? false,
        isNew: data.isNew ?? false,
        productId: data.productId || null,
        gender: data.gender || 'Unisex',
        type: data.type || 'Attar & Spray',
        season: data.season || null,
        bestTime: data.bestTime || null,
        impressionOf: data.impressionOf || null,
        shortDescription: data.shortDescription || null,
        longDescription: data.longDescription || null,
        tags: data.tags || null,
        sizesAvailable: data.sizesAvailable || '3ml,6ml,12ml,50ml',
        price3mlPhysical: data.price3mlPhysical ?? null,
        price6mlPhysical: data.price6mlPhysical ?? null,
        price12mlPhysical: data.price12mlPhysical ?? null,
        price50mlPhysical: data.price50mlPhysical ?? null,
        price3mlOnline: data.price3mlOnline ?? null,
        price6mlOnline: data.price6mlOnline ?? null,
        price12mlOnline: data.price12mlOnline ?? null,
        price50mlOnline: data.price50mlOnline ?? null,
        currency: data.currency || 'PKR',
        oilPricePer100g: data.oilPricePer100g ?? null,
        supplier: data.supplier || null,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
        stockStatus: data.stockStatus || 'in_stock',
        imageFolder: data.imageFolder || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        // Perfume-specific
        concentration: data.concentration || null,
        bottleStyle: data.bottleStyle || null,
        longevity: data.longevity || null,
        sillage: data.sillage || null,
        // Attar-specific
        applicatorType: data.applicatorType || null,
        origin: data.origin || null,
        ingredients: data.ingredients || null,
      },
    });
    return { success: true };
  } catch (e) {
    return { error: 'Failed to update product', detail: String(e) };
  }
}

export async function deleteProduct(id: string) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized' };
  }
  
  try {
    await prisma.product.delete({ where: { id } });
    return { success: true };
  } catch {
    return { error: 'Failed to delete product' };
  }
}

export async function updateProductPartial(id: string, data: Record<string, unknown>) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  try {
    await prisma.product.update({
      where: { id },
      data,
    });
    return { success: true };
  } catch {
    return { error: 'Failed to update product' };
  }
}

// ─── Bundle Actions ───────────────────────────────────────────────

export async function getAdminBundles() {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized', bundles: [] };
  }

  try {
    const bundles = await prisma.bundle.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        image: true,
        save: true,
        size: true,
        inStock: true,
        isActive: true,
      },
    });
    return { success: true, bundles };
  } catch {
    return { error: 'Failed to fetch bundles', bundles: [] };
  }
}

export async function getBundleById(id: string) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized', bundle: null };
  }

  try {
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!bundle) {
      return { error: 'Bundle not found', bundle: null };
    }

    return { success: true, bundle };
  } catch {
    return { error: 'Failed to fetch bundle', bundle: null };
  }
}

export async function createBundle(data: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  save?: string;
  size?: string;
  inStock?: boolean;
  isActive?: boolean;
}) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  try {
    const bundle = await prisma.bundle.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        price: data.price,
        originalPrice: data.originalPrice ?? null,
        image: data.image || null,
        save: data.save || null,
        size: data.size || null,
        inStock: data.inStock ?? true,
        isActive: data.isActive ?? true,
      },
    });
    return { success: true, bundle };
  } catch {
    return { error: 'Failed to create bundle' };
  }
}

export async function updateBundle(id: string, data: Record<string, unknown>) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  try {
    await prisma.bundle.update({
      where: { id },
      data,
    });
    return { success: true };
  } catch {
    return { error: 'Failed to update bundle' };
  }
}

export async function deleteBundle(id: string) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  try {
    await prisma.bundle.delete({ where: { id } });
    return { success: true };
  } catch {
    return { error: 'Failed to delete bundle' };
  }
}
