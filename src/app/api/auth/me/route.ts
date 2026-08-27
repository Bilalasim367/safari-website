import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { debugLog } from '@/lib/debugLog';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, user: null },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = await verifyToken(accessToken);
    } catch (jwtError) {
      debugLog('me:verifyToken', jwtError);
      return NextResponse.json(
        { success: false, user: null },
        { status: 401 }
      );
    }

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, user: null },
        { status: 401 }
      );
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { name: true, email: true, role: true, avatar: true },
      });
    } catch (dbError) {
      debugLog('me:prisma.user.findUnique', dbError);
      return NextResponse.json(
        { success: false, user: null, message: 'Database error' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: payload.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    debugLog('me:unhandled', error);
    return NextResponse.json(
      { success: false, user: null, message: 'An error occurred' },
      { status: 500 }
    );
  }
}