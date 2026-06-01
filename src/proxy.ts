import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith('/dashboard')) {
      const role = token?.role as string;
      
      // Enforce role-based access checks
      if (path.startsWith('/dashboard/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      if (path.startsWith('/dashboard/teacher') && role !== 'TEACHER') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      if (path.startsWith('/dashboard/student') && role !== 'STUDENT') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*'],
};
