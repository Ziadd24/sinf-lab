import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { sampleCreateSchema, sampleUpdateSchema, paginationSchema } from '@/lib/validators'
import { logAudit } from '@/lib/audit'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, search } = paginationSchema.parse(
      Object.fromEntries(searchParams.entries())
    )

    // Additional filter params
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: any = {}
    if (search) {
      where.OR = [
        { barcode: { contains: search } },
        { pet: { name: { contains: search } } },
        { pet: { nameAr: { contains: search } } },
        { clinic: { clinicName: { contains: search } } },
      ]
    }
    if (status) where.status = status
    if (priority) where.priority = priority

    const [samples, total] = await Promise.all([
      db.labSample.findMany({
        where,
        orderBy: { collectedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          pet: { include: { species: true, clinic: true } },
          clinic: true,
          invoice: true,
          results: { include: { catalog: true } },
        },
      }),
      db.labSample.count({ where }),
    ])

    return NextResponse.json({ data: samples, total, page, limit })
  } catch (error) {
    console.error('Error fetching samples:', error)
    return NextResponse.json({ error: 'Failed to fetch samples' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = sampleCreateSchema.parse(body)

    // Server-side barcode generation to prevent race conditions
    const lastSample = await db.labSample.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { barcode: true },
    })

    const nextNum = lastSample
      ? parseInt(lastSample.barcode.replace(/\D/g, ''), 10) + 1
      : 1
    const barcode = `SMP-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`

    const sample = await db.labSample.create({
      data: {
        ...validated,
        barcode,
        testIds: validated.testIds, // Stored as String[] array in MongoDB
      },
    })

    await logAudit({
      userId: auth.userId,
      action: 'create',
      tableName: 'LabSample',
      recordId: sample.id,
      description: `Created sample: ${barcode}`,
      newValue: validated,
    })

    return NextResponse.json(sample, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error creating sample:', error)
    return NextResponse.json({ error: 'Failed to create sample' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = sampleUpdateSchema.parse(body)
    const { id, ...data } = validated

    const oldSample = await db.labSample.findUnique({ where: { id } })
    if (!oldSample) {
      return NextResponse.json({ error: 'Sample not found' }, { status: 404 })
    }

    const sample = await db.labSample.update({ where: { id }, data })

    await logAudit({
      userId: auth.userId,
      action: 'update',
      tableName: 'LabSample',
      recordId: id,
      oldValue: oldSample,
      newValue: data,
    })

    return NextResponse.json(sample)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error updating sample:', error)
    return NextResponse.json({ error: 'Failed to update sample' }, { status: 500 })
  }
}
