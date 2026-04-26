import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/postgres';
import { validateEmail, validatePassword } from '@/lib/validation';

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'safari-admin-setup-key-2024';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, adminKey } = body;

    if (adminKey !== ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin key' },
        { status: 403 }
      );
    }

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json(
        { success: false, message: emailError },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json(
        { success: false, message: passwordError },
        { status: 400 }
      );
    }

    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin already exists. Only one admin is allowed.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: `${firstName} ${lastName}`.trim(),
        role: 'admin',
        status: 'active',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}