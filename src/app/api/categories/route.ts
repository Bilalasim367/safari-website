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
    const [categories, counts] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" }
      }),
      prisma.product.groupBy({
        by: ["categorySlug"],
        _count: true,
      }),
    ]);

    const countMap = new Map(counts.map((c) => [c.categorySlug, c._count]));

    const result = categories.map((cat) => ({
      ...cat,
      productCount: countMap.get(cat.slug) ?? 0,
    }));

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

    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const slug = String(body.slug).toLowerCase().trim();
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Category slug already exists" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description || null,
        image: body.image || null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.id || !body.name || !body.slug) {
      return NextResponse.json({ error: "ID, name and slug are required" }, { status: 400 });
    }

    const slug = String(body.slug).toLowerCase().trim();
    const existing = await prisma.category.findFirst({
      where: { slug, NOT: { id: body.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Category slug already exists" }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id: body.id },
      data: {
        name: body.name,
        slug,
        description: body.description || null,
        image: body.image || null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}