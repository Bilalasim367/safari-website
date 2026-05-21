import { NextResponse } from 'next/server';
import prisma from '@/lib/turso';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const auth = await getAuth();
    const { orderNumber } = await params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!auth || (auth.role !== 'admin' && order.userId !== auth.userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shippingAddress = (() => {
      try { return JSON.parse(order.shippingAddress || '{}'); } catch { return {}; }
    })();

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      shippedAt: order.shippedAt,
      estimatedDelivery: order.estimatedDelivery,
      shippingAddress,
      items: order.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.image,
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
