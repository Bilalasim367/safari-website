import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { priceCartLine, type PriceableProduct } from '@/lib/order-pricing';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

// What the cart persists for a line, derived from the CURRENT DB row.
type CartLine = {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
};

// The fields needed to price a line. Mirrors the Product columns used by
// priceCartLine.
const PRICE_SELECT = {
  id: true,
  name: true,
  price: true,
  image: true,
  size: true,
  type: true,
  isActive: true,
  inStock: true,
  sizesAvailable: true,
  price3mlOnline: true,
  price6mlOnline: true,
  price12mlOnline: true,
  price50mlOnline: true,
} as const;

/**
 * Resolve the price and size to store for a cart line.
 *
 * Uses the same function as order creation so the bag a customer sees, the
 * cart we persist, and the order we charge can never disagree. A requested
 * size the product does not offer falls back to the product's default
 * sellable volume rather than keeping an unpriceable line.
 */
function resolveCartLine(product: PriceableProduct, requestedSize: string | undefined): CartLine | null {
  const priced = priceCartLine(product, requestedSize);
  if (priced.ok) {
    return {
      id: product.id,
      name: product.name || 'Unknown',
      price: priced.price,
      image: product.image || '',
      size: priced.size,
      quantity: 1,
    };
  }
  // Only an unpriceable product reaches here (unavailable / no sellable size).
  return null;
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
      ? await prisma.product.findMany({ where: { id: { in: ids } }, select: PRICE_SELECT })
      : [];
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Recompute price AND size from the CURRENT DB via the shared resolver, so
    // a stored snapshot can never leak a stale price or a stale volume into the
    // checkout UI. A line whose product cannot be priced (gone or deactivated)
    // is omitted rather than shown with an unverifiable figure.
    const cart = savedCart.flatMap((item) => {
      const p = productMap.get(item.productId);
      if (!p) return [];
      const resolved = resolveCartLine(p, item.size ?? undefined);
      if (!resolved) return [];
      return [{ ...resolved, quantity: item.quantity }];
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
      ? await prisma.product.findMany({ where: { id: { in: ids } }, select: PRICE_SELECT })
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

    // Resolve each line once so the persisted snapshot matches exactly what
    // order creation will later charge for the same size.
    const lines = saveableCart.flatMap((item) => {
      const p = productMap.get(item.id);
      if (!p) return [];
      const resolved = resolveCartLine(p, item.size);
      if (!resolved) return [];
      return [{
        ...resolved,
        quantity: Math.min(Math.max(Number(item.quantity) || 1, 1), 99),
      }];
    });

    if (lines.length > 0) {
      await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { userId: payload.userId } }),
        prisma.cartItem.createMany({
          data: lines.map((line) => ({
            userId: payload.userId,
            productId: line.id,
            // Fresh DB values win for every persisted field.
            name: line.name,
            price: line.price,
            image: line.image,
            size: line.size,
            quantity: line.quantity,
          })),
        }),
      ]);
    } else {
      // Nothing priceable to keep: clear the stored cart rather than leaving
      // orphaned or unpriceable rows behind.
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