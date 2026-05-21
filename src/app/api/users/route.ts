import { NextResponse } from "next/server";
import prisma from "@/lib/turso";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    const auth = token ? await verifyToken(token) : null;
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { role: "customer" };
    if (status) where.status = status;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const result = await Promise.all(
      users.map(async (user) => {
        const orderCount = await prisma.order.count({ where: { userId: user.id } });
        return {
          ...user,
          orders: orderCount,
          totalSpent: 0,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}