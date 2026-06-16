import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'

/**
 * GET /api/quick-customers?search=...
 * Search existing customers by name or phone for autofill in Step 1.
 * Returns up to 10 matches with their most recent animal type/name.
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()

    if (!search || search.length < 2) {
      return NextResponse.json({ data: [] })
    }

    const customers = await db.quickCustomer.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    const data = customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      animalType: c.animalType,
      animalName: c.animalName,
      lastReportAt: c.reports[0]?.createdAt ?? null,
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error searching customers:', error)
    return NextResponse.json({ error: 'فشل البحث عن العملاء' }, { status: 500 })
  }
}