import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { paginationSchema } from '@/lib/validators'

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
            { nameEn: { contains: search } },
            { nameAr: { contains: search } },
          ],
        }
      : {}

    const [species, total] = await Promise.all([
      db.species.findMany({
        where,
        orderBy: { nameEn: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.species.count({ where }),
    ])

    return NextResponse.json({ data: species, total, page, limit })
  } catch (error) {
    console.error('Error fetching species:', error)
    return NextResponse.json({ error: 'Failed to fetch species' }, { status: 500 })
  }
}
