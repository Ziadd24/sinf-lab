import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { testCreateSchema, testUpdateSchema, paginationSchema } from '@/lib/validators'
import { logAudit } from '@/lib/audit'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, search } = paginationSchema.parse(
      Object.fromEntries(searchParams.entries())
    )

    const where: any = { active: true }
    if (search) {
      where.OR = [
        { testCode: { contains: search } },
        { testNameEn: { contains: search } },
        { testNameAr: { contains: search } },
      ]
    }

    const [tests, total] = await Promise.all([
      db.testCatalog.findMany({
        where,
        orderBy: { testCode: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { species: true },
      }),
      db.testCatalog.count({ where }),
    ])

    return NextResponse.json({ data: tests, total, page, limit })
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = testCreateSchema.parse(body)

    const test = await db.testCatalog.create({ data: validated })

    await logAudit({
      userId: auth.userId,
      action: 'create',
      tableName: 'TestCatalog',
      recordId: test.id,
      description: `Created test: ${test.testCode}`,
      newValue: validated,
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error creating test:', error)
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = testUpdateSchema.parse(body)
    const { id, ...data } = validated

    const oldTest = await db.testCatalog.findUnique({ where: { id } })
    if (!oldTest) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    const test = await db.testCatalog.update({ where: { id }, data })

    await logAudit({
      userId: auth.userId,
      action: 'update',
      tableName: 'TestCatalog',
      recordId: id,
      oldValue: oldTest,
      newValue: data,
    })

    return NextResponse.json(test)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error updating test:', error)
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const test = await db.testCatalog.update({ where: { id }, data: { active: false } })

    await logAudit({
      userId: auth.userId,
      action: 'delete',
      tableName: 'TestCatalog',
      recordId: id,
      description: `Soft-deleted test: ${test.testCode}`,
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error deleting test:', error)
    return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 })
  }
}
