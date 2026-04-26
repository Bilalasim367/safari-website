import { NextResponse } from 'next/server';
import prisma from '@/lib/postgres';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, users: [] }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, users: [] }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { role: 'customer' },
      orderBy: { createdAt: "desc" },
    });

    const userIds = users.map(u => u.id);
    const orders = await prisma.order.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, total: true },
    });

    const statsMap = new Map<string, { orderCount: number; totalSpent: number }>();
    orders.forEach(order => {
      const stats = statsMap.get(order.userId!) || { orderCount: 0, totalSpent: 0 };
      stats.orderCount++;
      stats.totalSpent += Number(order.total);
      statsMap.set(order.userId!, stats);
    });

    const usersWithStats = users.map((user) => {
      const stats = statsMap.get(user.id) || { orderCount: 0, totalSpent: 0 };
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || null,
        role: user.role,
        orders: stats.orderCount,
        totalSpent: stats.totalSpent,
        status: user.status || 'inactive',
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      };
    });

    return NextResponse.json({
      success: true,
      users: usersWithStats,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
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
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User updated',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user' },
      { status: 500 }
    );
  }
}