import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { validateLogin } from '@/lib/validation';
import { createAccessToken, createRefreshToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { debugLog } from '@/lib/debugLog';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `login:${ip}`;

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, rememberMe } = body;

    const rememberMeBool = rememberMe === true;
    const refreshExpiry = rememberMeBool ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

    const errors = validateLogin({ email, password });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    let user;
    try {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    } catch (dbError) {
      debugLog('login:prisma.user.findUnique', dbError);
      return NextResponse.json(
        { success: false, message: 'Database error. Please try again.' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, errors: { email: 'No account found with this email' } },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, errors: { email: 'This account has been suspended' } },
        { status: 403 }
      );
    }

    let isValidPassword: boolean;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      debugLog('login:bcrypt.compare', bcryptError);
      return NextResponse.json(
        { success: false, message: 'An error occurred verifying your password.' },
        { status: 500 }
      );
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, errors: { password: 'Incorrect password' } },
        { status: 401 }
      );
    }

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    } catch (updateError) {
      // Non-fatal: log but don't fail the login
      debugLog('login:prisma.user.update(lastLogin)', updateError);
    }

    let accessToken: string;
    let refreshToken: string;
    try {
      accessToken = await createAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role as 'customer' | 'admin',
      });
      refreshToken = await createRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role as 'customer' | 'admin',
      }, refreshExpiry);
    } catch (jwtError) {
      debugLog('login:createToken', jwtError);
      return NextResponse.json(
        { success: false, message: 'Failed to create session. Please try again.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      redirectTo: user.role === 'admin' ? '/admin/dashboard' : '/account',
    });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshExpiry,
      path: '/',
    });

    return response;
  } catch (error) {
    debugLog('login:unhandled', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}