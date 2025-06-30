import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface AuthUser {
  userId: string;
  email: string;
}

export function verifyAuth(request: NextRequest): AuthUser | null {
  try {
    // Try to get token from Authorization header
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no auth header, try to get from cookie
    if (!token) {
      token = request.cookies.get('auth-token')?.value;
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    return null;
  }
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = verifyAuth(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: '7d' }
  );
}