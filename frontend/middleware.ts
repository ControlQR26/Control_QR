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
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/students/:path*",
    "/teachers/:path*",
    "/subjects/:path*",
    "/schedules/:path*",
    "/access-logs/:path*",
    "/notifications/:path*",
    "/scanner/:path*",
  ]
};
