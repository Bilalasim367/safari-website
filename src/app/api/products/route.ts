import { NextResponse } from "next/server";
import prisma from "@/lib/turso";
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

    const where: Record<string, unknown> = {
      isActive: true,
      inStock: true,
    };

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

    const parseJsonArray = (val: string | string[]): string[] => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return []; }
      }
      return [];
    };

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      images: parseJsonArray(product.images),
      category: product.category ? {
        name: product.category.name,
        slug: product.category.slug
      } : null,
      categoryId: product.category?.id,
      categorySlug: product.categorySlug,
      size: product.size,
      sizePrices: parseJsonArray(product.sizePrices),
      fragranceFamily: product.fragranceFamily,
      rating: product.rating,
      reviews: product.reviewCount,
      description: product.description,
      isBestseller: product.isBestseller,
      isNew: product.isNew,
      inStock: product.inStock,
      notesTop: parseJsonArray(product.notesTop),
      notesHeart: parseJsonArray(product.notesHeart),
      notesBase: parseJsonArray(product.notesBase),
      type: product.type,
      gender: product.gender,
      season: product.season,
      impressionOf: product.impressionOf,
      tags: product.tags,
      sizesAvailable: product.sizesAvailable,
      price3mlPhysical: product.price3mlPhysical,
      price6mlPhysical: product.price6mlPhysical,
      price12mlPhysical: product.price12mlPhysical,
      price50mlPhysical: product.price50mlPhysical,
      price3mlOnline: product.price3mlOnline,
      price6mlOnline: product.price6mlOnline,
      price12mlOnline: product.price12mlOnline,
      price50mlOnline: product.price50mlOnline,
      currency: product.currency,
      longDescription: product.longDescription,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      stockStatus: product.stockStatus,
      concentration: product.concentration,
      bottleStyle: product.bottleStyle,
      longevity: product.longevity,
      sillage: product.sillage,
      applicatorType: product.applicatorType,
      origin: product.origin,
      ingredients: product.ingredients,
      shortDescription: product.shortDescription,
      productId: product.productId,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      oilPricePer100g: product.oilPricePer100g,
      supplier: product.supplier,
      imageFolder: product.imageFolder,
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
        images: body.images ? JSON.stringify(body.images) : '[]',
        categoryId,
        categorySlug: body.categorySlug,
        size: body.size || "50ml",
        sizePrices: body.sizePrices ? JSON.stringify(body.sizePrices) : '[]',
        fragranceFamily: body.fragranceFamily,
        rating: body.rating || 0,
        reviewCount: body.reviewCount || 0,
        notesTop: body.notesTop ? JSON.stringify(body.notesTop) : '[]',
        notesHeart: body.notesHeart ? JSON.stringify(body.notesHeart) : '[]',
        notesBase: body.notesBase ? JSON.stringify(body.notesBase) : '[]',
        inStock: body.inStock ?? true,
        isBestseller: body.isBestseller ?? false,
        isNew: body.isNew ?? false,
        concentration: body.concentration || null,
        bottleStyle: body.bottleStyle || null,
        longevity: body.longevity || null,
        sillage: body.sillage || null,
        applicatorType: body.applicatorType || null,
        origin: body.origin || null,
        ingredients: body.ingredients || null,
        productId: body.productId || null,
        gender: body.gender || 'Unisex',
        type: body.type || 'Attar & Spray',
        season: body.season || null,
        bestTime: body.bestTime || null,
        impressionOf: body.impressionOf || null,
        shortDescription: body.shortDescription || null,
        longDescription: body.longDescription || null,
        tags: body.tags || null,
        sizesAvailable: body.sizesAvailable || '3ml,6ml,12ml,50ml',
        price3mlPhysical: body.price3mlPhysical ?? null,
        price6mlPhysical: body.price6mlPhysical ?? null,
        price12mlPhysical: body.price12mlPhysical ?? null,
        price50mlPhysical: body.price50mlPhysical ?? null,
        price3mlOnline: body.price3mlOnline ?? null,
        price6mlOnline: body.price6mlOnline ?? null,
        price12mlOnline: body.price12mlOnline ?? null,
        price50mlOnline: body.price50mlOnline ?? null,
        currency: body.currency || 'PKR',
        oilPricePer100g: body.oilPricePer100g ?? null,
        supplier: body.supplier || null,
        isFeatured: body.isFeatured ?? false,
        isActive: body.isActive ?? true,
        stockStatus: body.stockStatus || 'in_stock',
        imageFolder: body.imageFolder || null,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
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