import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get auth token from cookie or localStorage (we'll use a custom header approach)
    const authCookie = request.cookies.get('fairshot-auth');

    // Parse auth state from cookie
    let isAuthenticated = false;
    let userRole: string | null = null;

    if (authCookie) {
        try {
            const authData = JSON.parse(authCookie.value);
            isAuthenticated = authData.state?.isAuthenticated || false;
            userRole = authData.state?.user?.role || null;

            // If cookie exists but has no valid user role, clear it
            if (!userRole && !isAuthenticated) {
                const response = NextResponse.next();
                response.cookies.delete('fairshot-auth');
                return response;
            }
        } catch (error) {
            // Invalid cookie, clear it and treat as unauthenticated
            isAuthenticated = false;
            const response = NextResponse.next();
            response.cookies.delete('fairshot-auth');
            return response;
        }
    }

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // Protected routes
    const studentRoutes = pathname.startsWith('/dashboard');
    const companyRoutes = pathname.startsWith('/company');
    const adminRoutes = pathname.startsWith('/admin');

    // If trying to access protected route without authentication
    // Note: /admin is protected client-side in its layout, so we skip it here
    if (!isAuthenticated && !isPublicRoute && !adminRoutes) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If authenticated and trying to access login/register, redirect to dashboard
    // Only redirect if we have valid user data in the cookie
    if (isAuthenticated && userRole && (pathname === '/login' || pathname === '/register')) {
        if (userRole === 'STUDENT') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else if (userRole === 'COMPANY') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else if (userRole === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    // Role-based route protection
    if (isAuthenticated) {
        // Dashboard is shared
        if (pathname.startsWith('/dashboard') && !['STUDENT', 'COMPANY'].includes(userRole || '')) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Company specific routes (excluding dashboard which is shared)
        if (companyRoutes && userRole !== 'COMPANY') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Note: Admin routes are protected client-side in the layout
        // We don't check here because cookies may not be set yet after login
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
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
