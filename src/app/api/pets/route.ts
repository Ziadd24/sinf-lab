import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { petCreateSchema, petUpdateSchema, paginationSchema } from '@/lib/validators'
import { logAudit } from '@/lib/audit'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, search } = paginationSchema.parse(
      Object.fromEntries(searchParams.entries())
    )

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { nameAr: { contains: search } },
            { chipNumber: { contains: search } },
            { ownerName: { contains: search } },
            { ownerPhone: { contains: search } },
          ],
        }
      : {}

    const [pets, total] = await Promise.all([
      db.pet.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          species: true,
          clinic: true,
          _count: { select: { samples: true } },
        },
      }),
      db.pet.count({ where }),
    ])

    return NextResponse.json({ data: pets, total, page, limit })
  } catch (error) {
    console.error('Error fetching pets:', error)
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = petCreateSchema.parse(body)

    const pet = await db.pet.create({ data: validated })

    await logAudit({
      userId: auth.userId,
      action: 'create',
      tableName: 'Pet',
      recordId: pet.id,
      description: `Created pet: ${pet.name}`,
      newValue: validated,
    })

    return NextResponse.json(pet, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error creating pet:', error)
    return NextResponse.json({ error: 'Failed to create pet' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = petUpdateSchema.parse(body)
    const { id, ...data } = validated

    const oldPet = await db.pet.findUnique({ where: { id } })
    if (!oldPet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    const pet = await db.pet.update({ where: { id }, data })

    await logAudit({
      userId: auth.userId,
      action: 'update',
      tableName: 'Pet',
      recordId: id,
      oldValue: oldPet,
      newValue: data,
    })

    return NextResponse.json(pet)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error updating pet:', error)
    return NextResponse.json({ error: 'Failed to update pet' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    await db.pet.delete({ where: { id } })

    await logAudit({
      userId: auth.userId,
      action: 'delete',
      tableName: 'Pet',
      recordId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pet:', error)
    return NextResponse.json({ error: 'Failed to delete pet' }, { status: 500 })
  }
}
