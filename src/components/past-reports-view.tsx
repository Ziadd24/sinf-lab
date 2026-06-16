'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, FileText, Printer, AlertTriangle, RefreshCw, History } from 'lucide-react'

interface PastReportResult {
  catalogId: string
  testNameAr: string
  testNameEn: string
  unit: string
  refRange: string
  value: string
  status: 'normal' | 'low' | 'high' | 'unknown'
  critical: boolean
}

interface PastReport {
  id: string
  reportId: string
  createdAt: string
  doctorNotes: string | null
  results: PastReportResult[]
  customer: {
    id: string
    name: string
    phone: string
    animalType: string
    animalName: string | null
  }
}

const ANIMAL_LABELS: Record<string, { ar: string; icon: string }> = {
  Camel: { ar: 'جمل', icon: '🐫' },
  Sheep: { ar: 'خروف', icon: '🐑' },
  Goat:  { ar: 'ماعز', icon: '🐐' },
  Cat:   { ar: 'قطة', icon: '🐈' },
  Horse: { ar: 'حصان', icon: '🐎' },
}

export function PastReportsView() {
  const [reports, setReports] = useState<PastReport[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<PastReport | null>(null)

  const fetchReports = async (q?: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = q ? `/api/quick-reports?search=${encodeURIComponent(q)}` : '/api/quick-reports'
      const res = await fetch(url)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setReports(json.data || [])
    } catch (e: any) {
      setError(e.message || 'فشل تحميل سجل التقارير')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReports() }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchReports(search || undefined), 350)
    return () => clearTimeout(timer)
  }, [search])

  const handlePrint = () => window.print()

  if (selected) {
    const animal = ANIMAL_LABELS[selected.customer.animalType]
    return (
      <div className="space-y-4">
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            .print-summary, .print-summary * { visibility: visible !important; }
            .print-summary { position: absolute; inset: 0; margin: 0; padding: 24px 32px; }
            .print\\:hidden { display: none !important; }
            @page { margin: 1.5cm; size: A4; }
          }
        `}</style>

        <div className="flex justify-between print:hidden">
          <Button variant="outline" onClick={() => setSelected(null)} className="gap-2">
            رجوع لسجل التقارير
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> طباعة
          </Button>
        </div>

        <Card className="print-summary" dir="rtl">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center border-b pb-3">
              <h2 className="text-lg font-bold">تقرير نتائج التحليل</h2>
              <p className="text-sm text-muted-foreground">
                {new Date(selected.createdAt).toLocaleDateString('ar-SA')} — {new Date(selected.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-1">{selected.reportId}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">اسم العميل: </span><span className="font-medium">{selected.customer.name}</span></div>
              <div><span className="text-muted-foreground">رقم الهاتف: </span><span className="font-medium">{selected.customer.phone}</span></div>
              <div>
                <span className="text-muted-foreground">نوع الحيوان: </span>
                <span className="font-medium">{animal?.icon} {animal?.ar}{selected.customer.animalName ? ' — ' + selected.customer.animalName : ''}</span>
              </div>
              <div><span className="text-muted-foreground">عدد الفحوصات: </span><span className="font-medium">{selected.results.length}</span></div>
            </div>

            <table className="w-full text-sm border-collapse mt-2">
              <thead>
                <tr className="bg-muted text-xs uppercase text-muted-foreground">
                  <th className="text-right py-2 px-3">الفحص</th>
                  <th className="text-center py-2 px-3">النتيجة</th>
                  <th className="text-center py-2 px-3">الوحدة</th>
                  <th className="text-center py-2 px-3">المعدل الطبيعي</th>
                  <th className="text-center py-2 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {selected.results.map(r => (
                  <tr key={r.catalogId} className={`border-b ${r.critical ? 'bg-red-50' : r.status !== 'normal' && r.status !== 'unknown' ? 'bg-amber-50' : ''}`}>
                    <td className="py-2 px-3 font-medium">{r.testNameAr}</td>
                    <td className={`py-2 px-3 text-center font-mono font-bold ${r.critical ? 'text-red-700' : r.status !== 'normal' && r.status !== 'unknown' ? 'text-amber-700' : ''}`}>{r.value}</td>
                    <td className="py-2 px-3 text-center text-muted-foreground">{r.unit}</td>
                    <td className="py-2 px-3 text-center text-muted-foreground">{r.refRange}</td>
                    <td className="py-2 px-3 text-center text-xs">
                      {r.status === 'unknown' && '—'}
                      {r.status === 'normal' && <span className="text-green-700 font-medium">طبيعي</span>}
                      {r.status === 'low' && <span className={`font-semibold ${r.critical ? 'text-red-700' : 'text-amber-700'}`}>{r.critical ? 'منخفض جداً' : 'منخفض'}</span>}
                      {r.status === 'high' && <span className={`font-semibold ${r.critical ? 'text-red-700' : 'text-amber-700'}`}>{r.critical ? 'مرتفع جداً' : 'مرتفع'}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selected.results.some(r => r.critical) && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                ⚠ تحتوي هذه النتائج على قيم حرجة تستوجب المراجعة الفورية
              </div>
            )}

            {selected.doctorNotes && (
              <div className="border rounded-md p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">ملاحظات الطبيب</p>
                <p className="text-sm whitespace-pre-wrap">{selected.doctorNotes}</p>
              </div>
            )}

            <div className="border-t pt-3 text-xs text-muted-foreground flex justify-between items-center">
              <span>توقيع الطبيب: ................................</span>
              <span className="font-mono">{selected.reportId}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" /> سجل التقارير السابقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم، الهاتف، اسم الحيوان، أو رقم التقرير..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-9"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
          <AlertTriangle className="w-10 h-10 text-destructive opacity-60" />
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchReports(search || undefined)} className="gap-2">
            <RefreshCw className="w-4 h-4" /> إعادة المحاولة
          </Button>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
          <FileText className="w-10 h-10 opacity-20" />
          <p className="text-sm">{search ? 'لا توجد نتائج تطابق البحث' : 'لا توجد تقارير محفوظة بعد'}</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-start p-3 font-medium text-muted-foreground">رقم التقرير</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">العميل</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">الحيوان</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">الفحوصات</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">التاريخ</th>
                    <th className="text-start p-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => {
                    const animal = ANIMAL_LABELS[r.customer.animalType]
                    const panicCount = r.results.filter(res => res.critical).length
                    return (
                      <tr key={r.id} className={`border-t hover:bg-muted/30 transition-colors cursor-pointer ${panicCount > 0 ? 'bg-red-50/40' : ''}`} onClick={() => setSelected(r)}>
                        <td className="p-3 font-mono text-xs">
                          {r.reportId}
                          {panicCount > 0 && (
                            <span className="ml-2 inline-flex items-center gap-0.5 text-red-600 text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" />{panicCount}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {r.customer.name}
                          <span className="text-xs text-muted-foreground mr-2">{r.customer.phone}</span>
                        </td>
                        <td className="p-3">
                          <span className="flex items-center gap-1.5">
                            {animal?.icon} {r.customer.animalName || animal?.ar}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{r.results.length} فحص</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('ar-SA')}</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(r) }}>
                            <FileText className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}