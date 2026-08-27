import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, createAccessToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { debugLog } from '@/lib/debugLog';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await verifyToken(refreshToken);
    } catch (jwtError) {
      debugLog('refresh:verifyToken', jwtError);
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
    } catch (dbError) {
      debugLog('refresh:prisma.user.findUnique', dbError);
      return NextResponse.json({ error: 'Database error during token refresh' }, { status: 500 });
    }

    if (!user || user.status !== 'active') {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }

    let newAccessToken: string;
    try {
      newAccessToken = await createAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (jwtError) {
      debugLog('refresh:createAccessToken', jwtError);
      return NextResponse.json({ error: 'Failed to create access token' }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    debugLog('refresh:unhandled', error);
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 });
  }
}