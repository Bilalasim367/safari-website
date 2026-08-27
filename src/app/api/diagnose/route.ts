import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV || '(unset)',
      DATABASE_URL: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@')
        : '(unset)',
      JWT_SECRET: process.env.JWT_SECRET ? `(set, length: ${process.env.JWT_SECRET.length})` : '(unset)',
      ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY ? '(set)' : '(unset)',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || '(unset)',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '(unset)',
    },
    tests: {},
  };

  const tests = diagnostics.tests as Record<string, unknown>;

  // 1. Test File System Logging
  try {
    const logPath = path.join(process.cwd(), 'debug-errors.log');
    fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] [diagnose:test] Health check ping\n`, 'utf8');
    tests.fileLogging = { status: 'SUCCESS', path: logPath };
  } catch (err) {
    tests.fileLogging = {
      status: 'FAILED',
      error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
    };
  }

  // 2. Test JWT (jose)
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-test-only';
    const encoder = new TextEncoder().encode(secret);
    const token = await new SignJWT({ test: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(encoder);

    const verified = await jwtVerify(token, encoder);
    tests.jwt = { status: 'SUCCESS', payload: verified.payload };
  } catch (err) {
    tests.jwt = {
      status: 'FAILED',
      error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
    };
  }

  // 3. Test Bcrypt
  try {
    const hash = await bcrypt.hash('test1234', 10);
    const match = await bcrypt.compare('test1234', hash);
    tests.bcrypt = { status: 'SUCCESS', match };
  } catch (err) {
    tests.bcrypt = {
      status: 'FAILED',
      error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
    };
  }

  // 4. Test Prisma DB Connection & Raw Query
  try {
    const dbTest = await prisma.$queryRaw`SELECT 1 as connected`;
    tests.dbConnection = { status: 'SUCCESS', result: dbTest };
  } catch (err) {
    tests.dbConnection = {
      status: 'FAILED',
      error: err instanceof Error ? { message: err.message, stack: err.stack, name: err.name } : String(err),
    };
  }

  // 5. Test Tables & Product Count
  try {
    const productCount = await prisma.product.count();
    const sampleProduct = await prisma.product.findFirst({
      select: { id: true, name: true, slug: true, price: true, isActive: true },
    });
    tests.productQuery = {
      status: 'SUCCESS',
      productCount,
      sampleProduct,
    };
  } catch (err) {
    tests.productQuery = {
      status: 'FAILED',
      error: err instanceof Error ? { message: err.message, stack: err.stack, name: err.name } : String(err),
    };
  }

  // 6. Test User Count
  try {
    const userCount = await prisma.user.count();
    tests.userQuery = {
      status: 'SUCCESS',
      userCount,
    };
  } catch (err) {
    tests.userQuery = {
      status: 'FAILED',
      error: err instanceof Error ? { message: err.message, stack: err.stack, name: err.name } : String(err),
    };
  }

  // 7. Check Recent debug-errors.log content
  try {
    const logPath = path.join(process.cwd(), 'debug-errors.log');
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf8');
      const lines = content.split('\n');
      tests.recentErrors = lines.slice(-50).join('\n');
    } else {
      tests.recentErrors = '(no log file found)';
    }
  } catch (err) {
    tests.recentErrors = `Failed to read log file: ${err}`;
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
