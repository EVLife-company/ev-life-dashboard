import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'evlife-super-secret-jwt-key-2026'
);

export type UserRole = 'admin' | 'servicecentre';

export interface AuthUser {
  uid: string;
  id: string;
  email: string;
  role: UserRole;
  centreName?: string;
  centreId?: string;
}

export async function signToken(payload: AuthUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('evlife_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function apiResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
