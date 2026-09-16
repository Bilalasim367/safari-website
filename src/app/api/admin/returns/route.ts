import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendReturnRequestEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];

function parseDate(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  return new Date(d).toISOString();
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, requests: [] }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, requests: [] }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    const where = status !== 'all' && VALID_STATUSES.includes(status) ? { status } : {};
    const [requests, counts] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 200,
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
          adminNote: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.returnRequest.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    const countMap: Record<string, number> = {};
    for (const c of counts) {
      countMap[c.status] = c._count._all;
    }

    return NextResponse.json({
      success: true,
      requests: requests.map((r) => ({
        ...r,
        createdAt: parseDate(r.createdAt),
        updatedAt: parseDate(r.updatedAt),
      })),
      counts: {
        all: requests.reduce((acc) => acc + 1, 0) + 0,
        pending: countMap['pending'] || 0,
        approved: countMap['approved'] || 0,
        rejected: countMap['rejected'] || 0,
        completed: countMap['completed'] || 0,
        cancelled: countMap['cancelled'] || 0,
      },
    });
  } catch (error) {
    console.error('Admin returns GET error:', error);
    return NextResponse.json({ success: false, requests: [] }, { status: 500 });
  }
}

interface PatchBody {
  id?: string;
  status?: string;
  adminNote?: string;
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const body: PatchBody = await request.json().catch(() => ({}));
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Missing request id' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
      }
      data.status = body.status;
    }
    if (body.adminNote !== undefined) {
      data.adminNote = body.adminNote.trim() || null;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 });
    }

    const updated = await prisma.returnRequest.update({
      where: { id: body.id },
      data,
      select: {
        id: true,
        requestId: true,
        type: true,
        orderNumber: true,
        customerName: true,
        email: true,
        productName: true,
        status: true,
        adminNote: true,
        updatedAt: true,
      },
    });

    if (body.status && (body.status === 'approved' || body.status === 'rejected' || body.status === 'completed')) {
      try {
        await sendReturnRequestEmail(
          updated.email,
          updated.customerName,
          updated.requestId,
          updated.type,
          updated.productName,
          updated.orderNumber
        );
      } catch (e) {
        console.error('Status update email throw:', e);
      }
    }

    return NextResponse.json({
      success: true,
      request: { ...updated, updatedAt: parseDate(updated.updatedAt) },
    });
  } catch (error) {
    console.error('Admin returns PATCH error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}