import { NextResponse } from 'next/server';
import prisma from '@/lib/turso';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendOrderShippedEmail } from '@/lib/email';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, orders: [] }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, orders: [] }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items.map((item) => ({
          id: item.id,
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
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        shippedAt: order.shippedAt,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
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
    const { id, status, paymentStatus, trackingNumber } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Order ID required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (status === 'shipped') updateData.shippedAt = new Date();

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (status === 'shipped' && trackingNumber) {
      const origin = request.headers.get('origin') || 'http://localhost:3000'
      const trackUrl = `${origin}/track?order=${order.orderNumber}`
      sendOrderShippedEmail(
        order.customerEmail,
        order.customerName,
        order.orderNumber,
        trackingNumber,
        trackUrl
      ).catch(e => console.error('Auto ship email failed:', e))
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated',
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
}