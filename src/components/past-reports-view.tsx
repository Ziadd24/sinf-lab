'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
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
    const reportTimestamp = new Date(selected.createdAt)
    return (
      <div className="space-y-4">
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            .print-summary, .print-summary * { visibility: visible !important; }
            .print-summary { position: absolute; inset: 0; margin: 0; }
            .print\\:hidden { display: none !important; }
            @page { margin: 0; size: A4; }
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

        <div className="print-summary bg-white text-gray-900 mx-auto max-w-[210mm] shadow-sm print:shadow-none border border-gray-200 print:border-0" dir="rtl">
          {/* ── Letterhead ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-10 py-6 border-b-[3px]" style={{ borderColor: '#3B2063' }}>
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 shrink-0">
                <Image src="/logo.png" alt="Sanaf Veterinary" fill className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#3B2063' }}>مؤسسة صنف البيطرية</h1>
                <p className="text-xs text-gray-500 tracking-wide">Sanaf Veterinary Establishment</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#C9971F' }}>تقرير نتائج التحليل</p>
              <p className="text-[11px] text-gray-400">Laboratory Test Report</p>
            </div>
          </div>

          {/* ── Report meta strip ───────────────────────────────────── */}
          <div className="flex items-center justify-between px-10 py-2.5 text-[11px]" style={{ backgroundColor: '#FBF6E8' }}>
            <span className="font-mono text-gray-600">{selected.reportId}</span>
            <span className="text-gray-600">
              {reportTimestamp.toLocaleDateString('ar-SA')} — {reportTimestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="px-10 py-6 space-y-5">
            {/* ── Customer info card ───────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 text-sm rounded-lg border border-gray-200 p-4" style={{ backgroundColor: '#FAFAFA' }}>
              <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">العميل</span><span className="font-semibold">{selected.customer.name}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">الهاتف</span><span className="font-semibold font-mono">{selected.customer.phone}</span></div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-20 shrink-0">الحيوان</span>
                <span className="font-semibold">{animal?.icon} {animal?.ar}{selected.customer.animalName ? ` — ${selected.customer.animalName}` : ''}</span>
              </div>
              <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">عدد الفحوصات</span><span className="font-semibold">{selected.results.length}</span></div>
            </div>

            {/* ── Results table ─────────────────────────────────────── */}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#3B2063' }}>
                  <th className="text-right py-2.5 px-3 font-medium text-white text-xs rounded-tr-md">الفحص</th>
                  <th className="text-center py-2.5 px-3 font-medium text-white text-xs">النتيجة</th>
                  <th className="text-center py-2.5 px-3 font-medium text-white text-xs">الوحدة</th>
                  <th className="text-center py-2.5 px-3 font-medium text-white text-xs">المعدل الطبيعي</th>
                  <th className="text-center py-2.5 px-3 font-medium text-white text-xs rounded-tl-md">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {selected.results.map((r, i) => {
                  const flagged = r.critical || (r.status !== 'normal' && r.status !== 'unknown')
                  return (
                    <tr
                      key={r.catalogId}
                      className="border-b border-gray-100"
                      style={{ backgroundColor: r.critical ? '#FEF2F2' : r.status === 'low' || r.status === 'high' ? '#FFFBEB' : i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}
                    >
                      <td className="py-2.5 px-3 font-medium">{r.testNameAr}</td>
                      <td className={`py-2.5 px-3 text-center font-mono font-bold ${r.critical ? 'text-red-700' : flagged ? 'text-amber-700' : 'text-gray-800'}`}>{r.value}</td>
                      <td className="py-2.5 px-3 text-center text-gray-500">{r.unit}</td>
                      <td className="py-2.5 px-3 text-center text-gray-500">{r.refRange}</td>
                      <td className="py-2.5 px-3 text-center text-xs">
                        {r.status === 'unknown' && <span className="text-gray-400">—</span>}
                        {r.status === 'normal' && <span className="text-green-700 font-medium">طبيعي</span>}
                        {r.status === 'low' && <span className={`font-semibold ${r.critical ? 'text-red-700' : 'text-amber-700'}`}>{r.critical ? 'منخفض جداً' : 'منخفض'}</span>}
                        {r.status === 'high' && <span className={`font-semibold ${r.critical ? 'text-red-700' : 'text-amber-700'}`}>{r.critical ? 'مرتفع جداً' : 'مرتفع'}</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {selected.doctorNotes && (
              <div className="rounded-lg p-4 border" style={{ backgroundColor: '#FBF6E8', borderColor: '#EADFB8' }}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: '#9C7A1A' }}>رأي الطبيب والتوصيات</p>
                <p className="text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">{selected.doctorNotes}</p>
              </div>
            )}
          </div>

          {/* ── Footer / signature ───────────────────────────────────── */}
          <div className="flex items-end justify-between px-10 py-5 border-t" style={{ borderColor: '#E5E0D8' }}>
            <div className="text-xs text-gray-500">
              <p className="font-mono">{selected.reportId}</p>
              <p className="mt-0.5">مؤسسة صنف البيطرية — تقرير سري ومخصص للاستخدام الطبي فقط</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-6">توقيع الطبيب المسؤول</p>
              <div className="w-40 border-t border-gray-300" />
            </div>
          </div>
        </div>
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