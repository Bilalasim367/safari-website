import { NextResponse } from "next/server";
import prisma from "@/lib/turso";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  const auth = await verifyToken(token);
  if (!auth || auth.role !== "admin") return null;
  return auth;
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });

    const result = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await prisma.product.count({ where: { categorySlug: cat.slug } });
        return {
          ...cat,
          productCount,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}