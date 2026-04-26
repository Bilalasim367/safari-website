import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, createAccessToken } from '@/lib/auth';
import prisma from '@/lib/postgres';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }
    
    const decoded = await verifyToken(refreshToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user || user.status !== 'active') {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }
    
    const newAccessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    const response = NextResponse.json({ success: true });
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });
    
    return response;
  } catch {
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 });
  }
}