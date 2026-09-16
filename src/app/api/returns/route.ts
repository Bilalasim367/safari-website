import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendReturnRequestEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ReturnBody {
  type?: string;
  orderNumber?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  productName?: string;
  sku?: string;
  size?: string;
  reason?: string;
  details?: string;
}

const REASONS = ['wrong-item', 'defective', 'not-as-described', 'changed-mind', 'too-large', 'too-small', 'other'];

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateRequestId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SFR-${y}${m}${day}-${rand}`;
}

export async function POST(request: Request) {
  try {
    const body: ReturnBody = await request.json().catch(() => ({}));

    const type = body.type === 'exchange' ? 'exchange' : 'return';
    const customerName = (body.customerName || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const phone = (body.phone || '').trim() || null;
    const orderNumber = (body.orderNumber || '').trim() || null;
    const productName = (body.productName || '').trim();
    const sku = (body.sku || '').trim() || null;
    const size = (body.size || '').trim() || null;
    const reason = (body.reason || '').trim();
    const details = (body.details || '').trim() || null;

    if (!customerName || customerName.length < 2) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!productName || productName.length < 2) {
      return NextResponse.json({ error: 'Please enter the product name.' }, { status: 400 });
    }
    if (!reason || !REASONS.includes(reason)) {
      return NextResponse.json({ error: 'Please select a valid reason.' }, { status: 400 });
    }

    if (!checkRateLimit(`returns:${email}`, 3, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes and try again.' },
        { status: 429 }
      );
    }

    if (orderNumber) {
      const order = await prisma.order.findFirst({
        where: { orderNumber },
        select: { id: true },
      });
      if (!order) {
        return NextResponse.json(
          { error: `No order found with number "${orderNumber}". Please check and try again (or leave it blank).` },
          { status: 400 }
        );
      }
    }

    const requestId = generateRequestId();
    const created = await prisma.returnRequest.create({
      data: {
        requestId,
        type,
        orderNumber,
        customerName,
        email,
        phone,
        productName,
        sku,
        size,
        reason,
        details,
      },
      select: {
        id: true,
        requestId: true,
        type: true,
        orderNumber: true,
        customerName: true,
        email: true,
        phone: true,
        productName: true,
        sku: true,
        size: true,
        reason: true,
        details: true,
        status: true,
        createdAt: true,
      },
    });

    try {
      const sent = await sendReturnRequestEmail(email, customerName, requestId, type, productName, orderNumber);
      console.log('Return request email result:', sent);
    } catch (e) {
      console.error('Return request email throw:', e);
    }

    return NextResponse.json({ success: true, request: created }, { status: 201 });
  } catch (error) {
    console.error('Return request create error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}