'use server'

import prisma from '@/lib/postgres';
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
        inStock: true,
        isBestseller: true,
        isNew: true,
      },
    });
    return { success: true, products };
  } catch (e) {
    return { error: String(e), products: [] };
  }
}

export async function createProduct(data: {
  name: string;
  slug: string;
  price: number;
  image?: string;
  categorySlug?: string;
  size?: string;
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
        categorySlug: data.categorySlug?.toLowerCase() || 'men',
        size: data.size || '50ml',
        inStock: data.inStock ?? true,
        isBestseller: data.isBestseller ?? false,
        isNew: data.isNew ?? false,
        description: `${data.name} - Luxury fragrance`,
      },
    });
    return { success: true, product };
  } catch (e) {
    return { error: String(e) };
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
      data,
    });
    return { success: true };
  } catch (e) {
    return { error: String(e) };
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
  } catch (e) {
    return { error: String(e) };
  }
}