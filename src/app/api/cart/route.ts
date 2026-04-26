import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/postgres';
import { verifyToken } from '@/lib/auth';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ cart: [] });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ cart: [] });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { cart: true },
    });
    
    const cart = user?.cart.map(item => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      size: item.size,
      quantity: item.quantity,
    })) || [];
    
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ cart: [] });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Please login to save cart' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cart }: { cart: CartItem[] } = body;

    if (!cart || !Array.isArray(cart)) {
      return NextResponse.json(
        { success: false, message: 'Invalid cart data' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { userId: payload.userId } }),
    ]);

    if (cart.length > 0) {
      const cartItemsData = cart.filter(item => item?.id).map(item => ({
        userId: payload.userId,
        productId: String(item.id),
        name: item.name || 'Unknown',
        price: Number(item.price) || 0,
        image: item.image || '',
        size: item.size || '',
        quantity: Number(item.quantity) || 1,
      }));

      if (cartItemsData.length > 0) {
        await prisma.cartItem.createMany({
          data: cartItemsData,
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Cart saved' });
  } catch (error) {
    console.error('Error saving cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save cart' },
      { status: 500 }
    );
  }
}