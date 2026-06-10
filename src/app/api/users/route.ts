import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { userCreateSchema } from '@/lib/validators'
import { hashPassword } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function GET(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        fullNameAr: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json(users)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = userCreateSchema.parse(body)
    const { email, password, fullName, fullNameAr, role } = validated

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return Response.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
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
    })

    // Log audit
    await logAudit({
      userId: auth.userId,
      action: 'create',
      tableName: 'User',
      recordId: user.id,
      description: `Created user: ${email}`,
      newValue: { email, fullName, role },
    })

    return Response.json(user, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return Response.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error creating user:', error)
    return Response.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
