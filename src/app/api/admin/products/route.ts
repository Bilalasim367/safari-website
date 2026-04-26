import { NextResponse } from 'next/server';
import prisma from '@/lib/postgres';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, products: [] }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, products: [] }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image,
        images: p.images,
        categorySlug: p.categorySlug,
        size: p.size,
        fragranceFamily: p.fragranceFamily,
        rating: p.rating,
        reviewCount: p.reviewCount,
        notesTop: p.notesTop,
        notesHeart: p.notesHeart,
        notesBase: p.notesBase,
        inStock: p.inStock,
        isBestseller: p.isBestseller,
        isNew: p.isNew,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    
    console.log('POST product - Body:', JSON.stringify(body));

    const existingProduct = await prisma.product.findUnique({
      where: { slug: body.slug }
    });

    if (existingProduct) {
      body.slug = `${body.slug}-${Date.now()}`;
    }

    let categoryId: string | null = null;
    if (body.categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: body.categorySlug }
      });
      categoryId = category?.id || null;
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        originalPrice: body.originalPrice,
        image: body.image,
        images: body.images || [],
        categoryId,
        categorySlug: body.categorySlug,
        size: body.size || '50ml',
        fragranceFamily: body.fragranceFamily,
        rating: body.rating || 0,
        notesTop: body.notesTop || [],
        notesHeart: body.notesHeart || [],
        notesBase: body.notesBase || [],
        inStock: body.inStock ?? true,
        isBestseller: body.isBestseller ?? false,
        isNew: body.isNew ?? false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product created',
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    console.log('PUT product - ID:', id, 'Data:', JSON.stringify(data));

    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 });
    }

    let categoryId = data.categoryId;
    if (data.categorySlug && !categoryId) {
      const category = await prisma.category.findUnique({
        where: { slug: data.categorySlug }
      });
      categoryId = category?.id || null;
    }

    // Build explicit update data to avoid schema mismatches
    const updateData: Record<string, unknown> = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      originalPrice: data.originalPrice,
      image: data.image,
      images: data.images || [],
      categoryId: categoryId,
      categorySlug: data.categorySlug,
      size: data.size || '50ml',
      fragranceFamily: data.fragranceFamily,
      rating: data.rating || 0,
      notesTop: data.notesTop || [],
      notesHeart: data.notesHeart || [],
      notesBase: data.notesBase || [],
      inStock: data.inStock ?? true,
      isBestseller: data.isBestseller ?? false,
      isNew: data.isNew ?? false,
    };

    console.log('Updating product with data:', JSON.stringify(updateData));

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        categoryId,
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}