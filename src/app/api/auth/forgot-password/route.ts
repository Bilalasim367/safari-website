import { NextResponse } from 'next/server';
import prisma from '@/lib/turso';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendPasswordResetEmail } from '@/lib/email';

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

    const crypto = await import('crypto');
    const resetCodeStr = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode: resetCodeStr,
        resetCodeExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    sendPasswordResetEmail(user.email, user.name, resetCodeStr)
      .then((result) => {
        if (!result.sent) console.warn('Reset email not delivered:', result.reason);
      })
      .catch((e) => console.error('Reset email failed:', e));

    // Dev convenience: echo the code locally, never in production
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a reset code has been sent',
        devResetCode: resetCodeStr,
      });
    }

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