import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { invoiceCreateSchema, invoiceUpdateSchema, paginationSchema } from '@/lib/validators'
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
            { invoiceNumber: { contains: search } },
            { clinic: { clinicName: { contains: search } } },
          ],
        }
      : {}

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          clinic: true,
          _count: { select: { samples: true } },
        },
      }),
      db.invoice.count({ where }),
    ])

    return NextResponse.json({ data: invoices, total, page, limit })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = invoiceCreateSchema.parse(body)

    // Server-side invoice number generation to prevent race conditions
    const lastInvoice = await db.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    })

    const nextNum = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber.replace(/\D/g, ''), 10) + 1
      : 1
    const invoiceNumber = `INV-${String(nextNum).padStart(5, '0')}`

    const invoice = await db.invoice.create({
      data: { ...validated, invoiceNumber },
    })

    await logAudit({
      userId: auth.userId,
      action: 'create',
      tableName: 'Invoice',
      recordId: invoice.id,
      description: `Created invoice: ${invoiceNumber}`,
      newValue: validated,
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = invoiceUpdateSchema.parse(body)
    const { id, ...data } = validated

    const oldInvoice = await db.invoice.findUnique({ where: { id } })
    if (!oldInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const invoice = await db.invoice.update({ where: { id }, data })

    await logAudit({
      userId: auth.userId,
      action: 'update',
      tableName: 'Invoice',
      recordId: id,
      oldValue: oldInvoice,
      newValue: data,
    })

    return NextResponse.json(invoice)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
