import { NextResponse } from "next/server";
import prisma from "@/lib/turso";
import { normalizeGender } from "@/lib/normalize";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const gender = searchParams.get("gender");
    const type = searchParams.get("type");

    if (!query) {
      return NextResponse.json([]);
    }

    const where: Record<string, unknown> = {
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { fragranceFamily: { contains: query } },
        { categorySlug: { contains: query } },
        { tags: { contains: query } },
        { productId: { contains: query } },
        { type: { contains: query } },
        { gender: { contains: query } },
      ],
      isActive: true,
      inStock: true,
    };

    if (gender) {
      const genders = gender.split(",").map(g => normalizeGender(g));
      where.gender = { in: genders };
    }
    if (type) {
      const types = type.split(",").map(t => {
        const lower = t.toLowerCase();
        if (lower === "attar") return "Attar";
        if (lower === "perfume") return "Perfume";
        return t;
      });
      where.type = { in: types };
    }

    const products = await prisma.product.findMany({
      where,
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        image: true,
        categorySlug: true,
        gender: true,
        type: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json([]);
  }
}