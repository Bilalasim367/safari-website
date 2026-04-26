import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/postgres';
import { validatePassword } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, resetCode, newPassword } = body;

    if (!email || !resetCode || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({ 
      where: { 
        email: email.toLowerCase(),
        resetCode: resetCode.toUpperCase(),
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid reset code' },
        { status: 400 }
      );
    }

    if (!user.resetCodeExpiry || new Date() > user.resetCodeExpiry) {
      return NextResponse.json(
        { success: false, message: 'Reset code has expired' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}