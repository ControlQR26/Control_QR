import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Si intentan entrar a scanner o logs de acceso y no son administradores (opcional)
    if ((path.startsWith("/scanner") || path.startsWith("/access-logs")) && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET || 'supersecretnextauthkey12345'
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - login
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!login|api|_next/static|_next/image|favicon.ico).*)"
  ]
};
