import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = ["/login", "/api/auth"];

  if (publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  const role = (token as any).role;

  // Admin-only routes
  if (path.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }
  }

  // Doctor-only routes
  if (path.startsWith("/approvals")) {
    if (role !== "DOCTOR" && role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|.*\\..*|public).*)",
  ],
};
