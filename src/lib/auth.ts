import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { debugLog } from '@/lib/debugLog';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  const err = new Error('JWT_SECRET environment variable is not set');
  debugLog('auth:module-init', err);
  throw err;
}

const encoder = new TextEncoder().encode(JWT_SECRET);

const ACCESS_TOKEN_EXPIRY = '30d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
}

export async function createAccessToken(payload: TokenPayload): Promise<string> {
  try {
    return await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRY)
      .sign(encoder);
  } catch (error) {
    debugLog('auth:createAccessToken', error);
    throw error;
  }
}

export async function createRefreshToken(
  payload: TokenPayload,
  expiresIn: string | number = '7d'
): Promise<string> {
  try {
    return await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(encoder);
  } catch (error) {
    debugLog('auth:createRefreshToken', error);
    throw error;
  }
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encoder);
    if (!payload.userId || !payload.email) return null;
    return payload as unknown as TokenPayload;
  } catch (error) {
    // Expired/invalid tokens are not exceptional — log only unexpected errors
    if (error instanceof Error && error.message.includes('JWTExpired')) {
      return null;
    }
    debugLog('auth:verifyToken', error);
    return null;
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      ('digest' in error && (error as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE' ||
       'message' in error && typeof (error as { message?: unknown }).message === 'string' && (error as { message: string }).message.includes('Dynamic server usage'))
    ) {
      throw error;
    }
    debugLog('auth:getSession', error);
    return null;
  }
}

export function setAuthCookies(token: string, refreshToken: string, rememberMe = false) {
  const refreshExpiry = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
  return {
    access_token: {
      name: 'access_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    },
    refresh_token: {
      name: 'refresh_token',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: refreshExpiry,
    },
  };
}

export function clearAuthCookies() {
  return {
    access_token: {
      name: 'access_token',
      value: '',
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    },
    refresh_token: {
      name: 'refresh_token',
      value: '',
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    },
  };
}