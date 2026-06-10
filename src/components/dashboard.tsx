'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TestTube2,
  Activity,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface DashboardData {
  totalSamples: number
  activeSamples: number
  totalClinics: number
  totalPets: number
  totalTests: number
  panicAlerts: number
  revenueThisMonth: number
  totalRevenue: number
  invoiceStats: { status: string; _count: { status: number }; _sum: { totalAmount: number | null } }[]
  monthlyData: { month: string; samples: number }[]
  samplesBySpecies: { name: string; nameAr: string; count: number; fill: string }[]
  recentSamples: {
    id: string
    barcode: string
    status: string
    priority: string
    collectedAt: string
    pet: { name: string; nameAr: string | null; species: { nameEn: string; nameAr: string; icon: string | null } }
    clinic: { clinicName: string; clinicNameAr: string | null } | null
    results: { isPanic: boolean }[]
  }[]
  topClinics: { id: string; name: string; nameAr: string | null; revenue: number; sampleCount: number }[]
}

const barChartConfig = {
  samples: { label: 'العينات', color: '#053e76' },
} satisfies ChartConfig

const pieChartConfig = {
  Camel: { label: 'إبل', color: '#053e76' },
  Falcon: { label: 'صقور', color: '#2b649c' },
  Dog: { label: 'كلاب', color: '#1a5c96' },
  Cat: { label: 'قطط', color: '#3d7ab5' },
  Horse: { label: 'خيول', color: '#0a2d5c' },
} satisfies ChartConfig

export function DashboardView() {
  const { t } = useLanguage()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!data) return null

  const kpis = [
    {
      title: t('Total Samples', 'إجمالي العينات'),
      value: data.totalSamples,
      icon: TestTube2,
      trend: '+12%',
      trendLabel: t('vs last month', 'مقارنة بالشهر الماضي'),
      color: 'text-[#053e76]',
      bg: 'bg-[#e8f0fa]',
    },
    {
      title: t('Active Samples', 'العينات النشطة'),
      value: data.activeSamples,
      icon: Activity,
      trend: `${data.activeSamples}`,
      trendLabel: t('in progress', 'قيد التنفيذ'),
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: t('Revenue This Month', 'الإيرادات هذا الشهر'),
      value: `${data.revenueThisMonth.toLocaleString()} ر.س`,
      icon: DollarSign,
      trend: '+8%',
      trendLabel: t('vs last month', 'مقارنة بالشهر الماضي'),
      color: 'text-[#053e76]',
      bg: 'bg-[#e8f0fa]',
    },
    {
      title: t('Panic Alerts', 'تنبيهات حرجة'),
      value: data.panicAlerts,
      icon: AlertTriangle,
      trend: data.panicAlerts > 0 ? t('Action needed', 'يتطلب إجراء') : t('All clear', 'كل شيء جيد'),
      trendLabel: '',
      color: data.panicAlerts > 0 ? 'text-red-600' : 'text-green-600',
      bg: data.panicAlerts > 0 ? 'bg-red-50' : 'bg-green-50',
    },
  ]

  const statusBadge: Record<string, { ar: string; className: string }> = {
    Collected: { ar: 'تم الجمع', className: 'bg-gray-100 text-gray-700' },
    In_Progress: { ar: 'قيد التنفيذ', className: 'bg-amber-100 text-amber-700' },
    Completed: { ar: 'مكتمل', className: 'bg-green-100 text-green-700' },
    Approved: { ar: 'معتمد', className: 'bg-[#d1e3f5] text-[#053e76]' },
  }

  const priorityBadge: Record<string, { ar: string; className: string }> = {
    Normal: { ar: 'عادي', className: 'bg-gray-100 text-gray-600' },
    Urgent: { ar: 'عاجل', className: 'bg-orange-100 text-orange-700' },
    STAT: { ar: 'طارئ', className: 'bg-red-100 text-red-700' },
  }

  // Invoice progress
  const totalInvoices = data.invoiceStats.reduce((s, i) => s + i._count.status, 0) || 1
  const paidCount = data.invoiceStats.find(i => i.status === 'Paid')?._count.status || 0
  const partialCount = data.invoiceStats.find(i => i.status === 'Partially_Paid')?._count.status || 0
  const unpaidCount = data.invoiceStats.find(i => i.status === 'Unpaid')?._count.status || 0

  const maxRevenue = Math.max(...data.topClinics.map(c => c.revenue), 1)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.title} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span className={kpi.color}>{kpi.trend}</span>
                    {kpi.trendLabel && <span className="text-muted-foreground">{kpi.trendLabel}</span>}
                  </div>
                </div>
                <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Volume Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('Monthly Sample Volume', 'حجم العينات الشهري')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[280px] w-full">
              <BarChart data={data.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="samples" fill="var(--color-samples)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Species Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('Samples by Species', 'العينات حسب النوع')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-[280px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={data.samplesBySpecies}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {data.samplesBySpecies.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {data.samplesBySpecies.map(s => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                  <span>{s.nameAr} ({s.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Samples */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('Recent Samples', 'آخر العينات')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-start p-3 font-medium text-muted-foreground">{t('Barcode', 'الباركود')}</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">{t('Animal', 'الحيوان')}</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">{t('Species', 'النوع')}</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">{t('Status', 'الحالة')}</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">{t('Priority', 'الأولوية')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSamples.map(sample => {
                    const sb = statusBadge[sample.status] || statusBadge.Collected
                    const pb = priorityBadge[sample.priority] || priorityBadge.Normal
                    return (
                      <tr key={sample.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-xs">{sample.barcode}</td>
                        <td className="p-3">{sample.pet.nameAr || sample.pet.name}</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1.5">
                            {sample.pet.species.icon && <span>{sample.pet.species.icon}</span>}
                            {sample.pet.species.nameAr}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sb.className}`}>
                            {sb.ar}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${pb.className}`}>
                            {pb.ar}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Invoice Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('Invoice Summary', 'ملخص الفواتير')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('Paid', 'مدفوعة')}</span>
                  <span className="font-medium text-green-600">{paidCount}/{totalInvoices}</span>
                </div>
                <Progress value={(paidCount / totalInvoices) * 100} className="h-2 bg-green-100 [&>div]:bg-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('Partially Paid', 'مدفوعة جزئياً')}</span>
                  <span className="font-medium text-amber-600">{partialCount}/{totalInvoices}</span>
                </div>
                <Progress value={(partialCount / totalInvoices) * 100} className="h-2 bg-amber-100 [&>div]:bg-amber-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('Unpaid', 'غير مدفوعة')}</span>
                  <span className="font-medium text-red-600">{unpaidCount}/{totalInvoices}</span>
                </div>
                <Progress value={(unpaidCount / totalInvoices) * 100} className="h-2 bg-red-100 [&>div]:bg-red-500" />
              </div>
            </CardContent>
          </Card>

          {/* Top Clinics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('Top Clinics', 'أفضل العيادات')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.topClinics.map((clinic, idx) => (
                <div key={clinic.id} className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{clinic.nameAr || clinic.name}</p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${(clinic.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {clinic.revenue.toLocaleString()} ر.س
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
