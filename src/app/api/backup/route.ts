import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { z } from 'zod'

const BACKUP_VERSION = 1

/**
 * GET /api/backup
 * Exports all data the single-operator workflow depends on as one JSON
 * file: the test catalog, every customer, and every saved report. This is
 * the file a person downloads and keeps safe (USB drive, email to self,
 * cloud folder) in case the local database file is ever lost.
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const [tests, customers, reports] = await Promise.all([
      db.testCatalog.findMany(),
      db.quickCustomer.findMany(),
      db.quickReport.findMany(),
    ])

    const backup = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      counts: {
        tests: tests.length,
        customers: customers.length,
        reports: reports.length,
      },
      data: { tests, customers, reports },
    }

    const filename = `sinf-vet-backup-${new Date().toISOString().slice(0, 10)}.json`

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting backup:', error)
    return NextResponse.json({ error: 'فشل إنشاء النسخة الاحتياطية' }, { status: 500 })
  }
}

// ─── Restore ────────────────────────────────────────────────────────────────

const backupSchema = z.object({
  version: z.number(),
  data: z.object({
    tests: z.array(z.any()),
    customers: z.array(z.any()),
    reports: z.array(z.any()),
  }),
})

/**
 * POST /api/backup
 * Restores from a previously exported backup file. Existing records are
 * matched by their original ID and upserted — safe to run multiple times,
 * and safe to run on top of a database that already has some data (e.g.
 * after reinstalling on a new machine).
 */
export async function POST(request: Request) {
  const auth = await requireAuth(request, ['ADMIN'])
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const parsed = backupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'ملف النسخة الاحتياطية غير صالح' }, { status: 400 })
    }

    const { tests, customers, reports } = parsed.data.data
    let restoredTests = 0, restoredCustomers = 0, restoredReports = 0

    const toDates = (obj: any, fields: string[]) => {
      const copy = { ...obj }
      fields.forEach((f) => { if (copy[f]) copy[f] = new Date(copy[f]) })
      return copy
    }

    // Tests first (no dependencies)
    for (const raw of tests) {
      const t = toDates(raw, ['createdAt', 'updatedAt'])
      await db.testCatalog.upsert({
        where: { id: t.id },
        create: t,
        update: t,
      })
      restoredTests++
    }

    // Customers next (reports depend on them)
    for (const raw of customers) {
      const c = toDates(raw, ['createdAt', 'updatedAt'])
      await db.quickCustomer.upsert({
        where: { id: c.id },
        create: c,
        update: c,
      })
      restoredCustomers++
    }

    // Reports last
    for (const raw of reports) {
      const r = toDates(raw, ['createdAt'])
      await db.quickReport.upsert({
        where: { id: r.id },
        create: r,
        update: r,
      })
      restoredReports++
    }

    return NextResponse.json({
      restored: { tests: restoredTests, customers: restoredCustomers, reports: restoredReports },
    })
  } catch (error) {
    console.error('Error restoring backup:', error)
    return NextResponse.json({ error: 'فشل استرجاع النسخة الاحتياطية' }, { status: 500 })
  }
}