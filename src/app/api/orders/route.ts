import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/postgres';
import { verifyToken } from '@/lib/auth';
import { Prisma } from '@prisma/client';

function generateOrderNumber() {
  const prefix = 'SAF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email?: string;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    let userId: string | null = null;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Please login to place an order' },
        { status: 401 }
      );
    }
    
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, message: 'Please login to place an order' },
        { status: 401 }
      );
    }
    
    userId = payload.userId;
    
    const body = await request.json();
    const { items, shippingAddress, paymentMethod } = body;

    if (!items || items.length === 0) {
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

    const subtotal = items.reduce((sum: number, item: OrderItem) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 100 ? 0 : 15;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const orderNumber = generateOrderNumber();

    let customerEmail = shippingAddress.email || 'guest@example.com';
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) customerEmail = user.email;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName: shippingAddress.firstName + ' ' + shippingAddress.lastName,
        customerEmail,
        subtotal,
        shipping,
        tax,
        total,
        status: 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        shippingAddress: shippingAddress as Prisma.InputJsonValue,
        items: {
          create: items.map((item: OrderItem) => ({
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

    if (userId) {
      await prisma.cartItem.deleteMany({ where: { userId } });
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
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
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        itemCount: order.items.length,
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