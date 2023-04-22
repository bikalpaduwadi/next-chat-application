import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const pathname = req.nextUrl.pathname;

    //Manage route protection
    const isAuthenticated = await getToken({ req });
    const isLoginPage = pathname.startsWith('/login');

    const sensitiveRoutes = ['/dashboard'];
    const isAccessingSensitiveRoute = sensitiveRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isLoginPage) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      return NextResponse.next();
    }

    if (!isAuthenticated && isAccessingSensitiveRoute) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  },
  {
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matchter: ['/', '/login', '/dashboard/:path*'],
};
