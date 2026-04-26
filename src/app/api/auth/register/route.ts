import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/postgres';
import { validateRegistration } from '@/lib/validation';
import { createAccessToken } from '@/lib/auth';

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'safari-admin-key';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword, firstName, lastName, phone, adminKey } = body;

    const isAdminRequest = adminKey && adminKey === ADMIN_SECRET_KEY;

    if (isAdminRequest) {
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

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (existingUser) {
      return NextResponse.json(
        { success: false, errors: { email: 'This email is already registered' } },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: `${firstName} ${lastName}`.trim(),
        phone: phone || null,
        role: 'customer',
        status: 'active',
      },
    });

    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

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

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}