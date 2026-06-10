import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { clinicCreateSchema, clinicUpdateSchema, paginationSchema } from '@/lib/validators'
import { logAudit } from '@/lib/audit'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, search } = paginationSchema.parse(
      Object.fromEntries(searchParams.entries())
    )

    // 💡 Added constraint: Only show clinics where active is true
    const where = search
      ? {
          active: true,
          OR: [
            { clinicName: { contains: search } },
            { clinicNameAr: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : { active: true }

    const [clinics, total] = await Promise.all([
      db.clinic.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { samples: true, invoices: true, pets: true } },
        },
      }),
      db.clinic.count({ where }),
    ])

    return NextResponse.json({ data: clinics, total, page, limit })
  } catch (error) {
    console.error('Error fetching clinics:', error)
    return NextResponse.json({ error: 'Failed to fetch clinics' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = clinicCreateSchema.parse(body)

    const clinic = await db.clinic.create({ data: validated })

    await logAudit({
      userId: auth.userId,
      action: 'create',
      tableName: 'Clinic',
      recordId: clinic.id,
      description: `Created clinic: ${clinic.clinicName}`,
      newValue: validated,
    })

    return NextResponse.json(clinic, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error creating clinic:', error)
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = clinicUpdateSchema.parse(body)
    const { id, ...data } = validated

    const oldClinic = await db.clinic.findUnique({ where: { id } })
    if (!oldClinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    const clinic = await db.clinic.update({ where: { id }, data })

    await logAudit({
      userId: auth.userId,
      action: 'update',
      tableName: 'Clinic',
      recordId: id,
      oldValue: oldClinic,
      newValue: data,
    })

    return NextResponse.json(clinic)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error updating clinic:', error)
    return NextResponse.json({ error: 'Failed to update clinic' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    // 💡 Permanent Hard-Delete from database
    const oldClinic = await db.clinic.findUnique({ where: { id } })
    await db.clinic.delete({ where: { id } })

    await logAudit({
      userId: auth.userId,
      action: 'delete',
      tableName: 'Clinic',
      recordId: id,
      description: `Permanently deleted clinic: ${oldClinic?.clinicName || id}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting clinic:', error)
    return NextResponse.json({ error: 'Failed to delete clinic' }, { status: 500 })
  }
}