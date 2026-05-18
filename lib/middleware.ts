import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'evlife-super-secret-jwt-key-2026'
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('evlife_token')?.value;

  const { pathname } = req.nextUrl;

  if (!token) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/servicecentre')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    const role = payload.role;

    // BLOCK WRONG ACCESS
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/servicecentre', req.url));
    }

    if (pathname.startsWith('/servicecentre') && role !== 'service_centre') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/servicecentre/:path*'],
};