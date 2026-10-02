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
          select: { id: true, name: true, price: true, image: true, size: true },
        })
      : [];
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Recompute from the CURRENT DB so stored snapshot price/name/image/size
    // never leak stale values to the cart (checkout) UI.
    const cart = savedCart.map((item) => {
      const p = productMap.get(item.productId);
      return {
        id: item.productId,
        name: p?.name || item.name,
        price: p ? resolvePrice(p) : item.price,
        image: p?.image || item.image,
        size: (p?.size && p.size.trim()) || item.size,
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

    // Never persist a line whose product does not exist. This endpoint accepts
    // a client-supplied id list, so without this guard a tampered or stale
    // payload (the old cart upsells wrote numeric placeholder ids straight from
    // localStorage) would create unfulfillable CartItem rows that no amount of
    // client-side cleanup would clear. Unknown ids are reported back so the
    // client can drop them; known products are still saved.
    const unknownIds = ids.filter((id) => !productMap.has(id));
    const saveableCart = cart.filter((item) => item?.id && productMap.has(item.id));

    if (saveableCart.length > 0) {
      await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { userId: payload.userId } }),
        prisma.cartItem.createMany({
          data: saveableCart.map((item) => {
            const p = productMap.get(item.id)!;
            return {
              userId: payload.userId,
              productId: p.id,
              // Fresh DB values win for every persisted field.
              name: p.name || 'Unknown',
              price: resolvePrice(p),
              image: p.image || '',
              size: (p.size && p.size.trim()) || item.size || '',
              quantity: Math.min(Math.max(Number(item.quantity) || 1, 1), 99),
            };
          }),
        }),
      ]);
    } else {
      // Whole payload was unknown ids: clear the stored cart rather than
      // leaving orphaned rows behind.
      await prisma.cartItem.deleteMany({ where: { userId: payload.userId } });
    }

    return NextResponse.json({
      success: true,
      message: 'Cart saved',
      ...(unknownIds.length > 0 ? { removedIds: unknownIds } : {}),
    });
  } catch (error) {
    console.error('Error saving cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save cart' },
      { status: 500 }
    );
  }
}