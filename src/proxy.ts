import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// ⚠️ FIXED: Export name changed from 'middleware' to 'proxy' to match Next.js requirements
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = ["/login", "/api/auth"];

  if (publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  // If no token, redirect pages to login, reject API with 401
  if (!token) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  const role = (token as any).role;

  // Admin-only routes (pages + API)
  if (path.startsWith("/admin") && role !== "ADMIN") {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return new NextResponse("Unauthorized", { status: 403 });
  }

  // Doctor-only routes (pages + API)
  if (path.startsWith("/approvals") && role !== "DOCTOR" && role !== "ADMIN") {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return new NextResponse("Unauthorized", { status: 403 });
  }

  return NextResponse.next();
}

// Fixed matcher to keep assets and files from slipping into the auth loop
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/auth|logo|manifest.json|sw.js|offline.html|robots.txt|favicon.ico|.*\\.).*)'
  ],
};