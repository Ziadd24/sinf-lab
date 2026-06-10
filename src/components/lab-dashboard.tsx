'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Sample {
  id: string
  barcode: string
  pet: { name: string; species: { nameAr: string } }
  status: string
  priority: string
  collectedAt: string
  results: any[]
}

interface DashboardStats {
  today: number
  inProgress: number
  pendingApproval: number
  avgTat: string
}

export function LabDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    today: 0,
    inProgress: 0,
    pendingApproval: 0,
    avgTat: '0h',
  })
  const [pendingSamples, setPendingSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/samples')
      const data = await response.json()

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todaysSamples = data.filter(
        (s: Sample) => new Date(s.collectedAt) >= today
      )
      const inProgress = data.filter((s: Sample) => s.status === 'In_Progress')
      const pending = data.filter(
        (s: Sample) => s.status === 'Completed' && !s.results.some((r: any) => r.approvedBy)
      )

      setStats({
        today: todaysSamples.length,
        inProgress: inProgress.length,
        pendingApproval: pending.length,
        avgTat: '4h',
      })

      setPendingSamples(pending.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
    return null
  }

  const isDoctor = (session.user as any).role === 'DOCTOR'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-gray-600">أهلاً بك، {session.user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">عينات اليوم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.today}</div>
            <p className="text-xs text-gray-500 mt-1">عينات تم جمعها اليوم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">قيد المعالجة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-gray-500 mt-1">عينات تحت المعالجة</p>
          </CardContent>
        </Card>

        {isDoctor && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">في انتظار الموافقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pendingApproval}</div>
              <p className="text-xs text-gray-500 mt-1">نتائج تنتظر موافقتك</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">متوسط الوقت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.avgTat}</div>
            <p className="text-xs text-gray-500 mt-1">متوسط وقت الإرجاع</p>
          </CardContent>
        </Card>
      </div>

      {isDoctor && stats.pendingApproval > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              النتائج المعلقة
            </CardTitle>
            <CardDescription>
              {stats.pendingApproval} نتيجة تنتظر موافقتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingSamples.map((sample) => (
                <div
                  key={sample.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium">{sample.pet.name}</p>
                    <p className="text-sm text-gray-600">{sample.barcode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{sample.priority}</Badge>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/samples/${sample.id}`)}
                    >
                      عرض
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            الأنشطة الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">لا توجد أنشطة حديثة</p>
        </CardContent>
      </Card>
    </div>
  )
}
