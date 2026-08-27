import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/email';


function generateOrderNumber() {
  const prefix = 'SAF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

const VALID_PAYMENT_METHODS = ['cod', 'bank_transfer', 'card', 'jazzcash', 'easypaisa'];

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    let userId: string | null = null;

    // Guest checkout allowed: auth is optional
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.userId) {
        userId = payload.userId;
      }
    }

    const body = await request.json();
    const { items, shippingAddress, paymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { success: false, message: 'Shipping address is required' },
        { status: 400 }
      );
    }

    if (!userId && !shippingAddress.email) {
      return NextResponse.json(
        { success: false, message: 'Email address is required to place an order' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Server-side pricing: never trust client-supplied prices
    const productIds = [...new Set(items.map((item: OrderItem) => item.id).filter(Boolean))];
    const [products, settings, user] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      }),
      prisma.settings.findFirst(),
      userId ? prisma.user.findUnique({ where: { id: userId } }) : Promise.resolve(null),
    ]);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const validatedItems: OrderItem[] = [];
    for (const item of items as OrderItem[]) {
      const product = productMap.get(item.id);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Invalid item in cart: ${item.name || item.id}` },
          { status: 400 }
        );
      }
      const quantity = Math.min(Math.max(parseInt(String(item.quantity)) || 1, 1), 99);
      let price = product.price;
      if (item.size && product.sizePrices) {
        try {
          const sizePrices = JSON.parse(product.sizePrices);
          const match = Array.isArray(sizePrices)
            ? sizePrices.find((sp: { size?: string; price?: number }) => sp.size === item.size)
            : null;
          if (match && typeof match.price === 'number' && match.price > 0) price = match.price;
        } catch {
          // fall back to base price
        }
      }
      validatedItems.push({
        id: product.id,
        name: product.name,
        price,
        quantity,
        size: item.size || product.size || '',
        image: item.image || product.image || '',
      });
    }

    const taxRate = settings?.taxRate ?? 0;
    const shippingFee = settings?.shippingFee ?? 0;
    const freeShippingThreshold = settings?.freeShippingThreshold ?? 0;

    const subtotal = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold ? 0 : shippingFee;
    const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    const orderNumber = generateOrderNumber();

    let customerEmail = shippingAddress.email || 'guest@example.com';
    if (user) customerEmail = user.email;

    const customerName = shippingAddress.firstName + ' ' + shippingAddress.lastName

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName,
        customerEmail,
        subtotal,
        shipping,
        tax,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: JSON.stringify(shippingAddress),
        items: {
          create: validatedItems.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            image: item.image,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.notification.create({
      data: {
        type: 'order',
        title: 'New Order',
        message: `Order ${orderNumber} placed by ${customerName}`,
      },
    });

    if (userId) {
      await prisma.cartItem.deleteMany({ where: { userId } });
    }

    sendOrderConfirmationEmail(
      customerEmail,
      customerName,
      orderNumber,
      validatedItems,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress
    ).catch(e => console.error('Order confirmation email failed:', e))

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        subtotal,
        shipping,
        tax,
        total,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, orders: [] }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, orders: [] }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        trackingNumber: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        itemCount: order._count.items,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}