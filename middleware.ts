import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/_next',
  '/favicon.ico',
  '/api/auth',
  '/api/auth/login',
  '/api/auth/me',
  '/api/auth/logout',
  '/public',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));
  const isApiAuth = pathname.startsWith('/api/auth');

  // Permite acesso a rotas públicas e APIs de auth
  if (isPublic || isApiAuth) {
    return NextResponse.next();
  }

  // Checa cookie de sessão (ajuste conforme sua estratégia de auth)
  const token =
    request.cookies.get('auth_token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('session')?.value;
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api/auth|public).*)'],
};
