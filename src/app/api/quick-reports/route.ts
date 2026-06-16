import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { z } from 'zod'

const resultItemSchema = z.object({
  catalogId: z.string(),
  testNameAr: z.string(),
  testNameEn: z.string(),
  unit: z.string(),
  refRange: z.string(),
  value: z.string(),
  status: z.enum(['normal', 'low', 'high', 'unknown']),
  critical: z.boolean(),
})

const saveReportSchema = z.object({
  reportId: z.string().min(1),
  customerName: z.string().min(1),
  phone: z.string().min(1),
  animalType: z.string().min(1),
  animalName: z.string().optional(),
  results: z.array(resultItemSchema).min(1),
  doctorNotes: z.string().optional(),
})

/**
 * GET /api/quick-reports?search=...&page=&limit=
 * List/search past quick reports for the History screen.
 * Search matches customer name, phone, or report ID.
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const where = search
      ? {
          OR: [
            { reportId: { contains: search } },
            { customer: { name: { contains: search } } },
            { customer: { phone: { contains: search } } },
            { customer: { animalName: { contains: search } } },
          ],
        }
      : {}

    const [reports, total] = await Promise.all([
      db.quickReport.findMany({
        where,
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.quickReport.count({ where }),
    ])

    const data = reports.map((r) => ({
      id: r.id,
      reportId: r.reportId,
      createdAt: r.createdAt,
      doctorNotes: r.doctorNotes,
      results: JSON.parse(r.resultsJson),
      customer: {
        id: r.customer.id,
        name: r.customer.name,
        phone: r.customer.phone,
        animalType: r.customer.animalType,
        animalName: r.customer.animalName,
      },
    }))

    return NextResponse.json({ data, total, page, limit })
  } catch (error) {
    console.error('Error fetching quick reports:', error)
    return NextResponse.json({ error: 'فشل تحميل سجل التقارير' }, { status: 500 })
  }
}

/**
 * POST /api/quick-reports
 * Save a completed wizard report. Reuses an existing customer (matched by
 * phone) if found, otherwise creates a new one — this is what powers
 * "repeat customer" autofill and per-animal history lookups.
 */
export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = saveReportSchema.parse(body)

    let customer = await db.quickCustomer.findFirst({
      where: { phone: validated.phone },
    })

    if (customer) {
      customer = await db.quickCustomer.update({
        where: { id: customer.id },
        data: {
          name: validated.customerName,
          animalType: validated.animalType,
          animalName: validated.animalName ?? customer.animalName,
        },
      })
    } else {
      customer = await db.quickCustomer.create({
        data: {
          name: validated.customerName,
          phone: validated.phone,
          animalType: validated.animalType,
          animalName: validated.animalName,
        },
      })
    }

    const report = await db.quickReport.create({
      data: {
        reportId: validated.reportId,
        customerId: customer.id,
        resultsJson: JSON.stringify(validated.results),
        doctorNotes: validated.doctorNotes,
      },
    })

    return NextResponse.json({ id: report.id, reportId: report.reportId }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'بيانات غير صحيحة', details: error.errors }, { status: 400 })
    }
    console.error('Error saving quick report:', error)
    return NextResponse.json({ error: 'فشل حفظ التقرير' }, { status: 500 })
  }
}