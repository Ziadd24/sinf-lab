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
  price: z.number().optional(),
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

    // Generate an invoice for this report
    const lastInvoice = await db.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    })

    const nextNum = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber.replace(/\D/g, ''), 10) + 1
      : 1
    const invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`

    const subTotal = validated.results.reduce((sum, res: any) => sum + (parseFloat(res.price) || 0), 0)
    const vatRate = 0.15
    const vatAmount = subTotal * vatRate
    const totalAmount = subTotal + vatAmount

    const report = await db.quickReport.create({
      data: {
        reportId: validated.reportId,
        customerId: customer.id,
        resultsJson: JSON.stringify(validated.results),
        doctorNotes: validated.doctorNotes,
        invoice: {
          create: {
            invoiceNumber,
            subTotal,
            vatRate,
            vatAmount,
            totalAmount,
            paidAmount: 0,
            status: 'Unpaid',
          }
        }
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

/**
 * DELETE /api/quick-reports
 */
export async function DELETE(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Delete associated invoice if it exists, then the report
    const report = await db.quickReport.findUnique({
      where: { id },
      include: { invoice: true }
    })

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    if (report.invoice) {
      await db.invoice.delete({ where: { id: report.invoice.id } })
    }

    await db.quickReport.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
  }
}