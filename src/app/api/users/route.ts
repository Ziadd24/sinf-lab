import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        fullNameAr: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(users);
  } catch (error) {
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, fullName, fullNameAr, role } = body;

    if (!email || !password || !fullName || !role) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        fullNameAr,
        role,
        active: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        fullNameAr: true,
        role: true,
        active: true,
      },
    });

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: "create",
      tableName: "User",
      recordId: user.id,
      description: `Created user: ${email}`,
      newValue: { email, fullName, role },
    });

    return Response.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
