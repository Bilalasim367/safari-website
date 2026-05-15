import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/turso';
import { verifyToken } from '@/lib/auth';

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.userId) return null;
  return payload.userId;
}

export async function GET() {
  try {
    const userId = await getUserFromToken();
    if (!userId) {
      return NextResponse.json({ wishlist: [] });
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { productId: true },
    });

    return NextResponse.json({ wishlist: items.map(i => i.productId) });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ wishlist: [] });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ success: false, message: 'productId required' }, { status: 400 });
    }

    const existing = await prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });

    if (!existing) {
      await prisma.wishlistItem.create({
        data: { userId, productId },
      });
    }

    return NextResponse.json({ success: true, wishlisted: true });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ success: false, message: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ success: false, message: 'productId required' }, { status: 400 });
    }

    await prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });

    return NextResponse.json({ success: true, wishlisted: false });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ success: false, message: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
