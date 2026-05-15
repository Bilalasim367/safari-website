import { NextResponse } from "next/server";
import prisma from "@/lib/turso";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { fragranceFamily: { contains: query } },
          { categorySlug: { contains: query } },
        ],
      },
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        image: true,
        categorySlug: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json([]);
  }
}