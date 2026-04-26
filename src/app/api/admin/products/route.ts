import { NextResponse } from 'next/server';
import prisma from '@/lib/postgres';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function GET() {
  console.log('GET /api/admin/products - Starting');
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      console.log('GET /api/admin/products - No token');
      return NextResponse.json({ success: false, products: [] }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      console.log('GET /api/admin/products - Not admin');
      return NextResponse.json({ success: false, products: [] }, { status: 403 });
    }

    // Optimized: Only select needed fields to avoid payload too large
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        originalPrice: true,
        image: true,
        categorySlug: true,
        size: true,
        fragranceFamily: true,
        inStock: true,
        isBestseller: true,
        isNew: true,
        createdAt: true,
      },
    });

    console.log('GET /api/admin/products - Found:', products.length);

    return NextResponse.json({
      success: true,
      products: products,
    });
  } catch (error) {
    console.error('GET /api/admin/products - Error:', error);
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('POST /api/admin/products - Starting');
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      console.log('POST /api/admin/products - No token');
      return NextResponse.json({ success: false, message: 'Unauthorized - Please login' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      console.log('POST /api/admin/products - Not admin');
      return NextResponse.json({ success: false, message: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    console.log('POST /api/admin/products - Body received:', { name: body.name, slug: body.slug, price: body.price });

    if (!body.name || !body.slug || !body.price) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: name, slug, price' },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { slug: body.slug }
    });

    if (existingProduct) {
      body.slug = `${body.slug}-${Date.now()}`;
    }

    let categoryId: string | null = null;
    if (body.categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: body.categorySlug.toLowerCase() }
      });
      categoryId = category?.id || null;
    }

    const price = typeof body.price === 'number' ? body.price : parseFloat(body.price);
    const originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null;

    if (isNaN(price)) {
      return NextResponse.json(
        { success: false, message: 'Invalid price value' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || `${body.name} - A luxury fragrance from Safari`,
        price: price,
        originalPrice: originalPrice,
        image: body.image || '',
        images: body.images || [body.image].filter(Boolean),
        categoryId,
        categorySlug: body.categorySlug?.toLowerCase() || 'men',
        size: body.size || '50ml',
        fragranceFamily: body.fragranceFamily || 'Floral',
        rating: body.rating || 0,
        reviewCount: 0,
        notesTop: body.notesTop || [],
        notesHeart: body.notesHeart || [],
        notesBase: body.notesBase || [],
        inStock: body.inStock ?? true,
        isBestseller: body.isBestseller ?? false,
        isNew: body.isNew ?? false,
      },
    });

    console.log('POST /api/admin/products - Created:', product.id);

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
    console.error('POST /api/admin/products - Error:', error);
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  console.log('PUT /api/admin/products - Starting');
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      console.log('PUT /api/admin/products - No token');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      console.log('PUT /api/admin/products - Not admin');
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    console.log('PUT /api/admin/products - ID:', id);

    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    let categoryId = data.categoryId;
    if (data.categorySlug && !categoryId) {
      const category = await prisma.category.findUnique({
        where: { slug: data.categorySlug.toLowerCase() }
      });
      categoryId = category?.id || null;
    }

    const price = data.price ? parseFloat(data.price) : existingProduct.price;
    const originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : existingProduct.originalPrice;

    const updateData: Record<string, unknown> = {
      name: data.name || existingProduct.name,
      slug: data.slug || existingProduct.slug,
      description: data.description || existingProduct.description,
      price: isNaN(price) ? existingProduct.price : price,
      originalPrice: originalPrice && !isNaN(originalPrice) ? originalPrice : existingProduct.originalPrice,
      image: data.image || existingProduct.image,
      images: data.images || existingProduct.images,
      categoryId: categoryId || existingProduct.categoryId,
      categorySlug: data.categorySlug?.toLowerCase() || existingProduct.categorySlug,
      size: data.size || existingProduct.size,
      fragranceFamily: data.fragranceFamily || existingProduct.fragranceFamily,
      rating: data.rating || existingProduct.rating,
      inStock: data.inStock !== undefined ? data.inStock : existingProduct.inStock,
      isBestseller: data.isBestseller !== undefined ? data.isBestseller : existingProduct.isBestseller,
      isNew: data.isNew !== undefined ? data.isNew : existingProduct.isNew,
    };

    console.log('PUT /api/admin/products - Updating:', updateData);

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    console.log('PUT /api/admin/products - Updated:', product.id);

    return NextResponse.json({
      success: true,
      message: 'Product updated',
    });
  } catch (error) {
    console.error('PUT /api/admin/products - Error:', error);
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  console.log('DELETE /api/admin/products - Starting');
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

    console.log('DELETE /api/admin/products - Deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    console.error('DELETE /api/admin/products - Error:', error);
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}