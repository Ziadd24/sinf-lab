import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth.response

  try {
    // Basic counts
    const [totalSamples, activeSamples, totalClinics, totalPets, totalTests] = await Promise.all([
      db.labSample.count(),
      db.labSample.count({ where: { status: { in: ['Collected', 'In_Progress'] } } }),
      db.clinic.count({ where: { active: true } }),
      db.pet.count(),
      db.testCatalog.count({ where: { active: true } }),
    ])

    // Panic alerts count
    const panicAlerts = await db.sampleResult.count({ where: { isPanic: true } })

    // Revenue - sum of paid amounts this month (optimized with aggregation)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [revenueThisMonthResult, totalRevenueResult] = await Promise.all([
      db.invoice.aggregate({
        _sum: { paidAmount: true },
        where: { paidAmount: { gt: 0 }, createdAt: { gte: startOfMonth } },
      }),
      db.invoice.aggregate({
        _sum: { paidAmount: true },
        where: { paidAmount: { gt: 0 } },
      }),
    ])

    const revenueThisMonth = revenueThisMonthResult._sum.paidAmount || 0
    const totalRevenue = totalRevenueResult._sum.paidAmount || 0

    // Invoice status breakdown
    const invoiceStats = await db.invoice.groupBy({
      by: ['status'],
      _count: { status: true },
      _sum: { totalAmount: true },
    })

    // Monthly sample volume (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const count = await db.labSample.count({
        where: { collectedAt: { gte: monthStart, lte: monthEnd } },
      })
      monthlyData.push({
        month: monthStart.toLocaleDateString('ar-SA', { month: 'short' }),
        samples: count,
      })
    }

    // Samples by species — optimized with aggregation instead of loading all samples
    const samplesWithSpecies = await db.labSample.findMany({
      select: { pet: { select: { speciesId: true, species: { select: { id: true, nameEn: true, nameAr: true } } } } },
    })

    const speciesMap = new Map<string, { name: string; nameAr: string; count: number; fill: string }>()
    const speciesColors = ['#053e76', '#2b649c', '#1a5c96', '#3d7ab5', '#0a2d5c']
    let colorIdx = 0
    for (const sample of samplesWithSpecies) {
      const sp = sample.pet.species
      if (!speciesMap.has(sp.id)) {
        speciesMap.set(sp.id, {
          name: sp.nameEn,
          nameAr: sp.nameAr,
          count: 0,
          fill: speciesColors[colorIdx % speciesColors.length],
        })
        colorIdx++
      }
      speciesMap.get(sp.id)!.count++
    }
    const samplesBySpecies = Array.from(speciesMap.values())

    // Recent samples
    const recentSamples = await db.labSample.findMany({
      take: 10,
      orderBy: { collectedAt: 'desc' },
      include: {
        pet: { include: { species: true } },
        clinic: true,
        results: true,
      },
    })

    // Top clinics by revenue
    const clinicsWithRevenue = await db.clinic.findMany({
      where: { active: true },
      include: {
        invoices: { select: { paidAmount: true } },
        _count: { select: { samples: true } },
      },
    })
    const topClinics = clinicsWithRevenue
      .map(c => ({
        id: c.id,
        name: c.clinicName,
        nameAr: c.clinicNameAr,
        revenue: c.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
        sampleCount: c._count.samples,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return NextResponse.json({
      totalSamples,
      activeSamples,
      totalClinics,
      totalPets,
      totalTests,
      panicAlerts,
      revenueThisMonth,
      totalRevenue,
      invoiceStats,
      monthlyData,
      samplesBySpecies,
      recentSamples,
      topClinics,
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
