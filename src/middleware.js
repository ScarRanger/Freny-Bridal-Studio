import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don&apos;t require authentication
  const publicRoutes = ['/login'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For all other routes, we'll let the client-side handle authentication
  // This prevents server-side rendering issues with Firebase Auth
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 