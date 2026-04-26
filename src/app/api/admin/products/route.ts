import { NextResponse } from 'next/server';
import prisma from '@/lib/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Simple API key check
    // In production, use environment variable
    const apiKey = process.env.ADMIN_API_KEY;
    
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

    // Return minimal JSON
    return NextResponse.json({ products }, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey !== process.env.ADMIN_API_KEY) {
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
        categorySlug: categorySlug?.toLowerCase() || 'men',
        size: size || '50ml',
        inStock: inStock ?? true,
        isBestseller: isBestseller ?? false,
        isNew: isNew ?? false,
      },
    });

    return NextResponse.json({ success: true, product: { id: product.id, name: product.name } });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey !== process.env.ADMIN_API_KEY) {
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
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey !== process.env.ADMIN_API_KEY) {
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
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}