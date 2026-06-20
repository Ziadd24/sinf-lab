import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { animalCreateSchema, animalUpdateSchema, paginationSchema } from '@/lib/validators'
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
        { nameEn: { contains: search } },
        { nameAr: { contains: search } },
      ]
    }

    const [animals, total] = await Promise.all([
      db.animal.findMany({
        where,
        orderBy: { nameEn: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.animal.count({ where }),
    ])

    return NextResponse.json({ data: animals, total, page, limit })
  } catch (error) {
    console.error('Error fetching animals:', error)
    return NextResponse.json({ error: 'Failed to fetch animals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = animalCreateSchema.parse(body)

    const animal = await db.animal.create({ data: validated })

    await logAudit({
      userId: auth.userId,
      action: 'create',
      tableName: 'Animal',
      recordId: animal.id,
      description: `Created animal: ${animal.nameEn}`,
      newValue: validated,
    })

    return NextResponse.json(animal, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error creating animal:', error)
    return NextResponse.json({ error: 'Failed to create animal' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = animalUpdateSchema.parse(body)
    const { id, ...data } = validated

    const oldAnimal = await db.animal.findUnique({ where: { id } })
    if (!oldAnimal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 })
    }

    const animal = await db.animal.update({ where: { id }, data })

    await logAudit({
      userId: auth.userId,
      action: 'update',
      tableName: 'Animal',
      recordId: id,
      oldValue: oldAnimal,
      newValue: data,
    })

    return NextResponse.json(animal)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error updating animal:', error)
    return NextResponse.json({ error: 'Failed to update animal' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const animal = await db.animal.update({ where: { id }, data: { active: false } })

    await logAudit({
      userId: auth.userId,
      action: 'delete',
      tableName: 'Animal',
      recordId: id,
      description: `Soft-deleted animal: ${animal.nameEn}`,
    })

    return NextResponse.json(animal)
  } catch (error) {
    console.error('Error deleting animal:', error)
    return NextResponse.json({ error: 'Failed to delete animal' }, { status: 500 })
  }
}
