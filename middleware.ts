import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/config';

export async function middleware(request: NextRequest) {
  const isAuthPath =
    request.nextUrl.pathname === '/sign-in' ||
    request.nextUrl.pathname === '/sign-up';

  if (!isAuthPath) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    
    // If no session cookie, redirect to sign-in
    if (!sessionId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    // Basic session format validation (Edge Runtime compatible)
    if (!sessionId || sessionId.length < 10 || sessionId.length > 100) {
      // Invalid session format, clear cookie and redirect
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    // 🎯 Advanced validation happens server-side in actions/pages
    // This middleware just ensures basic format validation
    // Real database validation occurs in the application layer
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
