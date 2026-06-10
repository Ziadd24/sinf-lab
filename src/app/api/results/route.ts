import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateResultValue } from '@/lib/validation'
import { logAudit } from '@/lib/audit'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sampleId = searchParams.get('sampleId')
    
    if (sampleId) {
      const results = await db.sampleResult.findMany({
        where: { sampleId },
        include: { catalog: true },
        orderBy: { enteredAt: 'desc' },
      })
      return NextResponse.json(results)
    }

    const results = await db.sampleResult.findMany({
      orderBy: { enteredAt: 'desc' },
      include: { catalog: true, sample: { include: { pet: { include: { species: true } } } } },
    })
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { catalogId, resultValue, sampleId, labComments, ...data } = body

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
        enteredBy: session.user.id,
        ...data,
      },
      include: { catalog: true },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
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
  } catch (error) {
    console.error('Error creating result:', error)
    return NextResponse.json({ error: 'Failed to create result' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, catalogId, resultValue, labComments, approvedBy, approvedAt, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    // Get old values for audit
    const oldResult = await db.sampleResult.findUnique({ where: { id } })

    // Validate result value if changed
    let isPanic = data.isPanic
    if (resultValue !== undefined && catalogId) {
      const validation = await validateResultValue(catalogId, resultValue, oldResult?.sampleId || '')
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

    const result = await db.sampleResult.update({
      where: { id },
      data: {
        resultValue,
        labComments,
        isPanic,
        approvedBy: approvedBy || undefined,
        approvedAt: approvedAt || undefined,
        ...data,
      },
      include: { catalog: true },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: approvedBy ? 'approve' : 'update',
      tableName: 'SampleResult',
      recordId: id,
      description: approvedBy ? 'Approved sample result' : 'Updated sample result',
      oldValue: oldResult ? { resultValue: oldResult.resultValue, labComments: oldResult.labComments } : undefined,
      newValue: { resultValue, labComments, isPanic, approvedBy },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating result:', error)
    return NextResponse.json({ error: 'Failed to update result' }, { status: 500 })
  }
}
