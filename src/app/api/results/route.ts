import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { resultCreateSchema, resultUpdateSchema, paginationSchema } from '@/lib/validators'
import { validateResultValue } from '@/lib/validation'
import { logAudit } from '@/lib/audit'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const sampleId = searchParams.get('sampleId')
    const { page, limit } = paginationSchema.parse(
      Object.fromEntries(searchParams.entries())
    )

    if (sampleId) {
      const results = await db.sampleResult.findMany({
        where: { sampleId },
        include: { catalog: true },
        orderBy: { enteredAt: 'desc' },
      })
      return NextResponse.json(results)
    }

    const [results, total] = await Promise.all([
      db.sampleResult.findMany({
        orderBy: { enteredAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          catalog: true,
          sample: { include: { pet: { include: { species: true } } } },
        },
      }),
      db.sampleResult.count(),
    ])

    return NextResponse.json({ data: results, total, page, limit })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = resultCreateSchema.parse(body)
    const { catalogId, resultValue, sampleId, labComments } = validated

    // Validate result value
    const validation = await validateResultValue(catalogId, resultValue, sampleId)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, warning: validation.warning },
        { status: 400 }
      )
    }

    // Auto-panic flagging
    let isPanic = validation.isPanic || false
    const catalog = await db.testCatalog.findUnique({ where: { id: catalogId } })
    if (catalog && catalog.minNormal !== null && catalog.maxNormal !== null) {
      const val = parseFloat(resultValue)
      if (!isNaN(val) && (val < catalog.minNormal || val > catalog.maxNormal)) {
        isPanic = true
      }
    }

    const result = await db.sampleResult.create({
      data: {
        catalogId,
        resultValue,
        sampleId,
        labComments,
        isPanic,
        enteredBy: auth.userId,
      },
      include: { catalog: true },
    })

    await logAudit({
      userId: auth.userId,
      action: 'create',
      tableName: 'SampleResult',
      recordId: result.id,
      description: `Entered result for test ${catalog?.testNameAr || catalog?.testNameEn}`,
      newValue: { resultValue, labComments, isPanic },
    })

    return NextResponse.json({
      ...result,
      warning: validation.warning,
    }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error creating result:', error)
    return NextResponse.json({ error: 'Failed to create result' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const validated = resultUpdateSchema.parse(body)
    const { id, resultValue, labComments } = validated
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    // Get old values for audit
    const oldResult = await db.sampleResult.findUnique({ where: { id } })
    if (!oldResult) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    // Validate result value if changed
    let isPanic = oldResult.isPanic
    if (resultValue !== undefined) {
      const catalogId = oldResult.catalogId
      const sampleId = oldResult.sampleId

      const validation = await validateResultValue(catalogId, resultValue, sampleId)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error, warning: validation.warning },
          { status: 400 }
        )
      }
      isPanic = validation.isPanic || false

      const catalog = await db.testCatalog.findUnique({ where: { id: catalogId } })
      if (catalog && catalog.minNormal !== null && catalog.maxNormal !== null) {
        const val = parseFloat(resultValue)
        isPanic = !isNaN(val) && (val < catalog.minNormal || val > catalog.maxNormal)
      }
    }

    // Only DOCTOR or ADMIN can approve
    const isApproval = body.approvedBy !== undefined
    if (isApproval && auth.role !== 'DOCTOR' && auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only doctors can approve results' }, { status: 403 })
    }

    const updateData: any = {}
    if (resultValue !== undefined) updateData.resultValue = resultValue
    if (labComments !== undefined) updateData.labComments = labComments
    updateData.isPanic = isPanic
    if (isApproval) {
      updateData.approvedBy = auth.userId
      updateData.approvedAt = new Date()
    }

    const result = await db.sampleResult.update({
      where: { id },
      data: updateData,
      include: { catalog: true },
    })

    await logAudit({
      userId: auth.userId,
      action: isApproval ? 'approve' : 'update',
      tableName: 'SampleResult',
      recordId: id,
      description: isApproval ? 'Approved sample result' : 'Updated sample result',
      oldValue: oldResult ? { resultValue: oldResult.resultValue, labComments: oldResult.labComments } : undefined,
      newValue: updateData,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error updating result:', error)
    return NextResponse.json({ error: 'Failed to update result' }, { status: 500 })
  }
}
