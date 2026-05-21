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
        price50mlPhysical: true,
        price50mlOnline: true,
      },
    });
    return { success: true, products };
  } catch {
    return { error: 'Failed to fetch products', products: [] };
  }
}

export async function createProduct(data: {
  name: string;
  slug: string;
  price: number;
  image?: string;
  categorySlug?: string;
  size?: string;
  sizePrices?: { size: string; price: number; originalPrice: number | null }[];
  inStock?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
}) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized' };
  }
  
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        price: data.price,
        image: data.image || '',
        images: JSON.stringify(data.image ? [data.image] : []),
        categorySlug: data.categorySlug?.toLowerCase() || 'men',
        size: data.size || '50ml',
        sizePrices: JSON.stringify(data.sizePrices || []),
        inStock: data.inStock ?? true,
        isBestseller: data.isBestseller ?? false,
        isNew: data.isNew ?? false,
        description: `${data.name} - Luxury fragrance`,
        notesTop: '[]',
        notesHeart: '[]',
        notesBase: '[]',
      },
    });
    return { success: true, product };
  } catch {
    return { error: 'Failed to delete bundle' };
  }
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return { error: 'Unauthorized' };
  }
  
  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...data,
        sizePrices: data.sizePrices && typeof data.sizePrices !== 'string' ? JSON.stringify(data.sizePrices) : undefined,
        images: data.images && typeof data.images !== 'string' ? JSON.stringify(data.images) : undefined,
        notesTop: data.notesTop && typeof data.notesTop !== 'string' ? JSON.stringify(data.notesTop) : undefined,
        notesHeart: data.notesHeart && typeof data.notesHeart !== 'string' ? JSON.stringify(data.notesHeart) : undefined,
        notesBase: data.notesBase && typeof data.notesBase !== 'string' ? JSON.stringify(data.notesBase) : undefined,
      },
    });
    return { success: true };
  } catch {
    return { error: 'Failed to update product' };
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