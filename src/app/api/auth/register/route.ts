import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { validateRegistration } from '@/lib/validation';
import { createAccessToken, createRefreshToken, setAuthCookies } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { debugLog } from '@/lib/debugLog';

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `register:${ip}`;

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, confirmPassword, firstName, lastName, phone, adminKey } = body;

    if (adminKey) {
      if (!ADMIN_SECRET_KEY) {
        return NextResponse.json(
          { success: false, message: 'Server configuration error' },
          { status: 500 }
        );
      }
      if (adminKey !== ADMIN_SECRET_KEY) {
        return NextResponse.json(
          { success: false, errors: { adminKey: 'Invalid admin key' } },
          { status: 403 }
        );
      }
    }

    const validationErrors = validateRegistration({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
    });

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        { success: false, errors: validationErrors },
        { status: 400 }
      );
    }

    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    } catch (dbError) {
      debugLog('register:prisma.user.findUnique', dbError);
      return NextResponse.json(
        { success: false, message: 'Database error. Please try again.' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, errors: { email: 'This email is already registered' } },
        { status: 400 }
      );
    }

    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (bcryptError) {
      debugLog('register:bcrypt.hash', bcryptError);
      return NextResponse.json(
        { success: false, message: 'An error occurred processing your request.' },
        { status: 500 }
      );
    }

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: `${firstName} ${lastName}`.trim(),
          phone: phone || null,
          role: 'customer',
          status: 'active',
        },
      });
    } catch (createError) {
      debugLog('register:prisma.user.create', createError);
      return NextResponse.json(
        { success: false, message: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    let accessToken: string;
    let refreshToken: string;
    try {
      accessToken = await createAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      refreshToken = await createRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (jwtError) {
      debugLog('register:createToken', jwtError);
      return NextResponse.json(
        { success: false, message: 'Account created but failed to create session.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    const authCookies = setAuthCookies(accessToken, refreshToken, false);
    response.cookies.set(authCookies.access_token);
    response.cookies.set(authCookies.refresh_token);

    return response;
  } catch (error) {
    debugLog('register:unhandled', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}