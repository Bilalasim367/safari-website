import { NextResponse } from 'next/server';
import prisma from '@/lib/turso';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;
  const auth = await verifyToken(token);
  if (!auth || auth.role !== 'admin') return null;
  return auth;
}

export async function GET() {
  try {
    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        image: true,
        categorySlug: true,
        inStock: true,
        isBestseller: true,
        isNew: true,
      },
    });

    return NextResponse.json({ products }, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, price, image, categorySlug, size, description, inStock, isBestseller, isNew } = body;

    if (!name || !slug || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || `${name} - Luxury fragrance`,
        price: parseFloat(price),
        image: image || '',
        images: JSON.stringify(image ? [image] : []),
        categorySlug: categorySlug?.toLowerCase() || 'men',
        size: size || '50ml',
        inStock: inStock ?? true,
        isBestseller: isBestseller ?? false,
        isNew: isNew ?? false,
        notesTop: '[]',
        notesHeart: '[]',
        notesBase: '[]',
      },
    });

    return NextResponse.json({ success: true, product: { id: product.id, name: product.name } });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.slug) updateData.slug = data.slug;
    if (data.price) updateData.price = parseFloat(data.price);
    if (data.image) updateData.image = data.image;
    if (data.description) updateData.description = data.description;
    if (data.categorySlug) updateData.categorySlug = data.categorySlug.toLowerCase();
    if (data.inStock !== undefined) updateData.inStock = data.inStock;
    if (data.isBestseller !== undefined) updateData.isBestseller = data.isBestseller;
    if (data.isNew !== undefined) updateData.isNew = data.isNew;

    await prisma.product.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}