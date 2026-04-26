import { NextResponse } from 'next/server';
import prisma from '@/lib/postgres';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `forgot:${ip}`;

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a reset code has been sent',
      });
    }

    const resetCodeStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode: resetCodeStr,
        resetCodeExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset code has been sent',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}