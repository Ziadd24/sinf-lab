'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ClipboardList,
  Users,
  FlaskConical,
  AlertTriangle,
  Calendar,
  TrendingUp,
  RefreshCw,
  DollarSign,
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
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DashboardData {
  totalReports: number
  reportsToday: number
  reportsThisWeek: number
  reportsThisMonth: number
  totalCustomers: number
  totalTests: number
  panicCount: number
  totalRevenue: number
  revenueThisMonth: number
  animalBreakdown: { type: string; count: number; ar: string; icon: string; color: string }[]
  monthlyData: { month: string; reports: number }[]
  recentReports: {
    id: string
    reportId: string
    createdAt: string
    customer: { name: string; phone: string; animalType: string; animalName: string | null }
    resultsCount: number
    hasPanic: boolean
    reportTotal: number
  }[]
}

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = () => {
    setLoading(true)
    setError(false)
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <AlertTriangle className="w-10 h-10 text-destructive opacity-60" />
        <p className="text-sm text-destructive font-medium">فشل تحميل لوحة التحكم</p>
        <button onClick={fetchData} className="flex items-center gap-2 text-xs border rounded-md px-3 py-1.5 hover:bg-muted/30">
          <RefreshCw className="w-3 h-3" /> إعادة المحاولة
        </button>
      </div>
    )
  }

  const kpis = [
    {
      title: 'تقارير اليوم',
      value: data.reportsToday,
      sub: `${data.reportsThisWeek} هذا الأسبوع`,
      icon: Calendar,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
    },
    {
      title: 'تقارير الشهر',
      value: data.reportsThisMonth,
      sub: `${data.totalReports} إجمالي`,
      icon: ClipboardList,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      title: 'إيرادات الشهر',
      value: `${data.revenueThisMonth.toLocaleString()}`,
      sub: `${data.totalRevenue.toLocaleString()} ر.س إجمالي`,
      icon: DollarSign,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      suffix: 'ر.س',
    },
    {
      title: 'العملاء المسجلون',
      value: data.totalCustomers,
      sub: 'عميل في السجل',
      icon: Users,
      color: 'text-green-700',
      bg: 'bg-green-50',
    },
    {
      title: 'قيم حرجة',
      value: data.panicCount,
      sub: data.panicCount > 0 ? 'تستوجب المراجعة' : 'لا توجد تنبيهات',
      icon: AlertTriangle,
      color: data.panicCount > 0 ? 'text-red-700' : 'text-gray-500',
      bg: data.panicCount > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
  ]

  return (
    <div className="space-y-6" dir="rtl">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">{kpi.title}</p>
                  <p className="text-3xl font-bold">
                    {kpi.value}
                    {'suffix' in kpi && <span className="text-base font-semibold text-muted-foreground mr-1">{(kpi as any).suffix}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly volume */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> حجم التقارير الشهري
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.monthlyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => [v, 'تقارير']}
                />
                <Bar dataKey="reports" fill="#3B2063" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Animal type breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">العملاء حسب نوع الحيوان</CardTitle>
          </CardHeader>
          <CardContent>
            {data.animalBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                <FlaskConical className="w-8 h-8 opacity-20" />
                <p className="text-xs">لا توجد بيانات بعد</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={data.animalBreakdown}
                      dataKey="count"
                      nameKey="ar"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {data.animalBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      formatter={(v: any, name: any) => [v, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  {data.animalBreakdown.map(a => (
                    <span key={a.type} className="flex items-center gap-1 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: a.color }} />
                      {a.icon} {a.ar} ({a.count})
                    </span>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent reports */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">آخر التقارير</CardTitle>
        </CardHeader>
        {data.recentReports.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
            <ClipboardList className="w-10 h-10 opacity-20" />
            <p className="text-sm">لا توجد تقارير بعد — ابدأ بإنشاء تقرير سريع</p>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="max-h-72 overflow-y-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-start p-3 font-medium text-muted-foreground">رقم التقرير</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">العميل</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">الحيوان</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">الفحوصات</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">السعر</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentReports.map(r => (
                    <tr key={r.id} className={`border-t hover:bg-muted/30 transition-colors ${r.hasPanic ? 'bg-red-50/40' : ''}`}>
                      <td className="p-3 font-mono text-xs">
                        {r.reportId}
                        {r.hasPanic && <AlertTriangle className="w-3 h-3 inline mr-1.5 text-red-500" />}
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{r.customer.name}</p>
                        <p className="text-xs text-muted-foreground">{r.customer.phone}</p>
                      </td>
                      <td className="p-3 text-sm">
                        {r.customer.animalName || r.customer.animalType}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{r.resultsCount} فحص</td>
                      <td className="p-3 text-xs font-mono font-medium">
                        {r.reportTotal > 0 ? `${r.reportTotal.toLocaleString()} ر.س` : '—'}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}