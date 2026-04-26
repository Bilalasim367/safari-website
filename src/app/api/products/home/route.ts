import { NextResponse } from "next/server";
import prisma from "@/lib/postgres";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "4");

    const where: Record<string, unknown> = {};
    if (type === "bestsellers") {
      where.isBestseller = true;
    } else if (type === "new") {
      where.isNew = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

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

    return NextResponse.json(formattedProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}