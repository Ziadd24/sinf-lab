import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

type Role = "DOCTOR" | "TECHNICIAN" | "ADMIN";

interface AuthResult {
  authorized: true;
  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>;
  userId: string;
  role: Role;
}

interface AuthError {
  authorized: false;
  response: NextResponse;
}

/**
 * Call at the top of any API route handler to enforce authentication
 * and optionally role-based access control.
 *
 * Usage:
 *   const auth = await requireAuth(request);
 *   if (!auth.authorized) return auth.response;
 *   // now use auth.session, auth.userId, auth.role
 *
 *   const auth = await requireAuth(request, ["ADMIN"]);
 *   if (!auth.authorized) return auth.response;
 */
export async function requireAuth(
  request?: Request,
  allowedRoles?: Role[]
): Promise<AuthResult | AuthError> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const role = (session.user as any).role as Role;
  const userId = session.user.id;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { authorized: true, session, userId, role };
}
