import { NextResponse } from "next/server";
import prisma from "@/lib/postgres";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const fragranceFamily = searchParams.get("fragranceFamily");
    const size = searchParams.get("size");
    const isNew = searchParams.get("isNew");
    const isBestseller = searchParams.get("isBestseller");
    const slug = searchParams.get("slug");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const where: Record<string, unknown> = {};

    if (category) {
      where.categorySlug = { in: category.split(",") };
    }
    if (fragranceFamily) {
      where.fragranceFamily = { in: fragranceFamily.split(",") };
    }
    if (size) {
      where.size = { in: size.split(",") };
    }
    if (isNew === "true") where.isNew = true;
    if (isBestseller === "true") where.isBestseller = true;
    if (slug) where.slug = slug;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      images: product.images || [],
      category: product.category ? { 
        name: product.category.name, 
        slug: product.category.slug 
      } : null,
      categoryId: product.category?.id,
      categorySlug: product.categorySlug,
      size: product.size,
      fragranceFamily: product.fragranceFamily,
      rating: product.rating,
      reviews: product.reviewCount,
      description: product.description,
      isBestseller: product.isBestseller,
      isNew: product.isNew,
      inStock: product.inStock,
      notesTop: product.notesTop,
      notesHeart: product.notesHeart,
      notesBase: product.notesBase,
    }));

    return NextResponse.json({ products: formattedProducts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const body = await request.json();

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
        size: body.size || "50ml",
        fragranceFamily: body.fragranceFamily,
        rating: body.rating || 0,
        notesTop: body.notesTop || [],
        notesHeart: body.notesHeart || [],
        notesBase: body.notesBase || [],
        inStock: body.inStock ?? true,
        isBestseller: body.isBestseller ?? false,
        isNew: body.isNew ?? false,
      },
      include: { category: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}