import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalReports,
      reportsToday,
      reportsThisWeek,
      reportsThisMonth,
      totalCustomers,
      totalTests,
      recentReports,
      allReports,
      allInvoices,
    ] = await Promise.all([
      db.quickReport.count(),
      db.quickReport.count({ where: { createdAt: { gte: startOfToday } } }),
      db.quickReport.count({ where: { createdAt: { gte: startOfWeek } } }),
      db.quickReport.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.quickCustomer.count(),
      db.testCatalog.count({ where: { active: true } }),
      db.quickReport.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      db.quickReport.findMany({
        select: { resultsJson: true, createdAt: true },
      }),
      db.invoice.findMany({
        select: { paidAmount: true, createdAt: true },
      }),
    ])

    // Animal type breakdown
    const customers = await db.quickCustomer.findMany({ select: { animalType: true } })
    const animalMap: Record<string, number> = {}
    customers.forEach(c => { animalMap[c.animalType] = (animalMap[c.animalType] || 0) + 1 })

    const ANIMAL_LABELS: Record<string, { ar: string; icon: string; color: string }> = {
      Camel: { ar: 'جمل', icon: '🐫', color: '#3B2063' },
      Sheep: { ar: 'خروف', icon: '🐑', color: '#5C3D9E' },
      Goat:  { ar: 'ماعز', icon: '🐐', color: '#C9971F' },
      Cat:   { ar: 'قطة', icon: '🐈', color: '#8B5CF6' },
      Horse: { ar: 'حصان', icon: '🐎', color: '#EAB308' },
    }

    const animalBreakdown = Object.entries(animalMap)
      .map(([type, count]) => ({
        type,
        count,
        ar: ANIMAL_LABELS[type]?.ar || type,
        icon: ANIMAL_LABELS[type]?.icon || '🐾',
        color: ANIMAL_LABELS[type]?.color || '#999',
      }))
      .sort((a, b) => b.count - a.count)

    // Panic count from all reports
    let panicCount = 0
    for (const r of allReports) {
      try {
        const results = JSON.parse(r.resultsJson)
        for (const res of results) {
          if (res.critical) panicCount++
        }
      } catch {}
    }

    // Revenue from paid invoices
    let revenueThisMonth = 0
    let totalRevenue = 0
    for (const inv of allInvoices) {
      totalRevenue += inv.paidAmount || 0
      if (inv.createdAt >= startOfMonth) {
        revenueThisMonth += inv.paidAmount || 0
      }
    }

    // Monthly report volume (last 6 months)
    const monthlyData: { month: string; reports: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const count = await db.quickReport.count({
        where: { createdAt: { gte: mStart, lte: mEnd } },
      })
      monthlyData.push({
        month: mStart.toLocaleDateString('ar-SA', { month: 'short' }),
        reports: count,
      })
    }

    return NextResponse.json({
      totalReports,
      reportsToday,
      reportsThisWeek,
      reportsThisMonth,
      totalCustomers,
      totalTests,
      panicCount,
      totalRevenue,
      revenueThisMonth,
      animalBreakdown,
      monthlyData,
      recentReports: recentReports.map(r => {
        let resultsCount = 0
        let hasPanic = false
        let reportTotal = 0
        try {
          const parsed = JSON.parse(r.resultsJson)
          resultsCount = parsed.length
          hasPanic = parsed.some((x: any) => x.critical)
          reportTotal = parsed.reduce((sum: number, x: any) => {
            const p = typeof x.price === 'number' ? x.price : parseFloat(x.price) || 0
            return sum + p
          }, 0)
        } catch {}
        return {
          id: r.id,
          reportId: r.reportId,
          createdAt: r.createdAt,
          customer: r.customer,
          resultsCount,
          hasPanic,
          reportTotal,
        }
      }),
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}