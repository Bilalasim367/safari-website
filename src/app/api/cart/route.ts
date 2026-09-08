import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

// Effective price for a cart line = the CURRENT DB base price. This is the ONLY
// price the storefront shows (PDP, product cards); there is no size selector and
// no storefront UI uses sizePrices. Server-side only — never trust the
// client-supplied snapshot price.
function resolvePrice(product: { price: number }): number {
  return product.price;
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

    const savedCart = user?.cart || [];
    const ids = [...new Set(savedCart.map((i) => i.productId).filter(Boolean))];
    const products = ids.length
      ? await prisma.product.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true, price: true, image: true },
        })
      : [];
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Recompute from the CURRENT DB so stored snapshot price/name/images never
    // leak stale values to the cart (checkout) UI.
    const cart = savedCart.map((item) => {
      const p = productMap.get(item.productId);
      return {
        id: item.productId,
        name: p?.name || item.name,
        price: p ? resolvePrice(p) : item.price,
        image: p?.image || item.image,
        size: item.size,
        quantity: item.quantity,
      };
    });

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

    const ids = [...new Set(cart.map((i) => i?.id).filter(Boolean))];
    const products = ids.length
      ? await prisma.product.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true, price: true, image: true, size: true },
        })
      : [];
    const productMap = new Map(products.map((p) => [p.id, p]));

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { userId: payload.userId } }),
      ...(cart.length > 0
        ? [prisma.cartItem.createMany({
            data: cart.filter(item => item?.id).map(item => {
              const p = productMap.get(item.id);
              return {
                userId: payload.userId,
                productId: item.id,
                // Fresh DB values win; fall back to the snapshot only when the
                // product no longer exists (so the line is not silently dropped).
                name: p?.name || item.name || 'Unknown',
                price: p ? resolvePrice(p) : Number(item.price) || 0,
                image: p?.image || item.image || '',
                size: item.size || p?.size || '',
                quantity: Math.min(Math.max(Number(item.quantity) || 1, 1), 99),
              };
            }),
          })]
        : []),
    ]);

    return NextResponse.json({ success: true, message: 'Cart saved' });
  } catch (error) {
    console.error('Error saving cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save cart' },
      { status: 500 }
    );
  }
}