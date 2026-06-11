'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertTriangle, CheckCircle2, FileText, Printer, Save } from 'lucide-react'

interface ReportSample {
  id: string
  barcode: string
  status: string
  priority: string
  collectedAt: string
  completedAt: string | null
  referringDoctor: string | null
  referringDoctorAr: string | null
  notes: string | null
  pet: {
    name: string
    nameAr: string | null
    breed: string | null
    gender: string
    birthDate: string | null
    ownerName: string | null
    ownerNameAr: string | null
    ownerPhone: string | null
    species: { nameEn: string; nameAr: string; icon: string | null }
    clinic: { clinicName: string; clinicNameAr: string | null; phone: string; address: string | null } | null
  }
  clinic: { clinicName: string; clinicNameAr: string | null; phone: string; address: string | null } | null
  invoice: { invoiceNumber: string; totalAmount: number; status: string } | null
  results: {
    id: string
    resultValue: string
    isPanic: boolean
    labComments: string | null
    approvedBy: string | null
    approvedAt: string | null
    enteredAt: string
    catalog: {
      testCode: string
      testNameEn: string
      testNameAr: string
      category: string | null
      categoryAr: string | null
      minNormal: number | null
      maxNormal: number | null
      unit: string | null
    }
  }[]
}

export function ReportView() {
  const [samples, setSamples] = useState<ReportSample[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [doctorInterpretation, setDoctorInterpretation] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/samples?limit=100')
      .then(r => r.json())
      .then(d => {
        const all: ReportSample[] = d.data || d
        // Only show samples that have at least one result
        setSamples(all.filter((s: ReportSample) => s.results && s.results.length > 0))
        setLoading(false)
      })
  }, [])

  const sample = samples.find(s => s.id === selectedId)

  // Group results by category
  const grouped = sample
    ? sample.results.reduce<Record<string, ReportSample['results']>>((acc, r) => {
        const key = r.catalog.categoryAr || r.catalog.category || 'عام'
        ;(acc[key] = acc[key] || []).push(r)
        return acc
      }, {})
    : {}

  const hasPanic = sample?.results.some(r => r.isPanic)
  const allApproved = sample?.results.every(r => r.approvedAt)

  const getStatus = (r: ReportSample['results'][0]) => {
    const val = parseFloat(r.resultValue)
    if (isNaN(val) || r.catalog.minNormal === null || r.catalog.maxNormal === null) return 'text'
    if (r.isPanic) return 'panic'
    if (val < r.catalog.minNormal || val > r.catalog.maxNormal) return 'abnormal'
    return 'normal'
  }

  const handleSaveInterpretation = async () => {
    if (!sample) return
    setSaving(true)
    // Persist labComments on the first result as a proxy for doctor summary,
    // or you can extend the schema with a reportNotes field on LabSample
    await fetch('/api/samples', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sample.id, notes: doctorInterpretation }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sample selector */}
      <Card className="print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            إنشاء تقرير طبي
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-muted-foreground mb-1 block">اختر عينة</label>
            <Select
              value={selectedId}
              onValueChange={id => {
                setSelectedId(id)
                const s = samples.find(x => x.id === id)
                setDoctorInterpretation(s?.notes || '')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر عينة لإنشاء التقرير..." />
              </SelectTrigger>
              <SelectContent>
                {samples.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="font-mono text-xs ml-2">{s.barcode}</span>
                    {s.pet.nameAr || s.pet.name} —{' '}
                    {s.pet.species.nameAr}
                    {s.results.some(r => r.isPanic) && ' ⚠️'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sample && (
            <>
              <div className="flex-1 min-w-48">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">اسم الطبيب المُوقِّع</label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="د. محمد العلي"
                  value={doctorName}
                  onChange={e => setDoctorName(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveInterpretation} variant="outline" disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saved ? 'تم الحفظ ✓' : saving ? 'جاري...' : 'حفظ التفسير'}
              </Button>
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                طباعة / PDF
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Doctor interpretation (screen only) */}
      {sample && (
        <Card className="print:hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">التفسير الطبي والملاحظات</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              placeholder="أدخل تفسيرك الطبي وتوصياتك هنا... سيظهر في التقرير تحت قسم 'رأي الطبيب'"
              value={doctorInterpretation}
              onChange={e => setDoctorInterpretation(e.target.value)}
              className="resize-none"
            />
          </CardContent>
        </Card>
      )}

      {/* ─── PRINTABLE REPORT ─────────────────────────────────────────────── */}
      {sample && (
        <div ref={printRef} className="bg-white text-gray-900 print:shadow-none" dir="rtl">

          {/* Print styles injected inline */}
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              .print-report, .print-report * { visibility: visible !important; }
              .print-report { position: absolute; inset: 0; margin: 0; padding: 24px 32px; }
              .print\\:hidden { display: none !important; }
              @page { margin: 1.5cm; size: A4; }
            }
          `}</style>

          <div className="print-report border border-gray-200 rounded-xl overflow-hidden shadow-sm">

            {/* Header */}
            <div className="bg-gradient-to-l from-blue-700 to-blue-900 text-white px-8 py-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-wide">تقرير فحص مختبري بيطري</h1>
                <p className="text-blue-200 text-sm mt-0.5">Veterinary Laboratory Report</p>
              </div>
              <div className="text-left text-sm text-blue-100 space-y-0.5">
                <p className="font-mono text-base font-semibold text-white">{sample.barcode}</p>
                <p>تاريخ الجمع: {new Date(sample.collectedAt).toLocaleDateString('ar-SA')}</p>
                {sample.completedAt && (
                  <p>تاريخ الانتهاء: {new Date(sample.completedAt).toLocaleDateString('ar-SA')}</p>
                )}
                <p>
                  الأولوية:{' '}
                  <span className={sample.priority === 'STAT' ? 'text-red-300 font-bold' : sample.priority === 'Urgent' ? 'text-yellow-300' : 'text-green-300'}>
                    {sample.priority === 'Normal' ? 'عادي' : sample.priority === 'Urgent' ? 'عاجل' : 'فوري'}
                  </span>
                </p>
              </div>
            </div>

            {/* Patient + Clinic info grid */}
            <div className="grid grid-cols-2 gap-px bg-gray-200">
              {/* Patient */}
              <div className="bg-gray-50 px-6 py-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">معلومات المريض</h3>
                <table className="text-sm w-full">
                  <tbody className="space-y-1">
                    <InfoRow label="الاسم" value={`${sample.pet.nameAr || sample.pet.name} ${sample.pet.species.icon || ''}`} />
                    <InfoRow label="النوع" value={`${sample.pet.species.nameAr} / ${sample.pet.species.nameEn}`} />
                    {sample.pet.breed && <InfoRow label="السلالة" value={sample.pet.breed} />}
                    <InfoRow label="الجنس" value={sample.pet.gender === 'Male' ? 'ذكر' : sample.pet.gender === 'Female' ? 'أنثى' : 'غير محدد'} />
                    {sample.pet.birthDate && (
                      <InfoRow label="تاريخ الميلاد" value={new Date(sample.pet.birthDate).toLocaleDateString('ar-SA')} />
                    )}
                    {(sample.pet.ownerNameAr || sample.pet.ownerName) && (
                      <InfoRow label="المالك" value={sample.pet.ownerNameAr || sample.pet.ownerName!} />
                    )}
                    {sample.pet.ownerPhone && <InfoRow label="الهاتف" value={sample.pet.ownerPhone} />}
                  </tbody>
                </table>
              </div>

              {/* Clinic */}
              <div className="bg-white px-6 py-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">العيادة المُحِيلة</h3>
                <table className="text-sm w-full">
                  <tbody>
                    {(sample.clinic || sample.pet.clinic) && (
                      <>
                        <InfoRow label="العيادة" value={(sample.clinic || sample.pet.clinic)!.clinicNameAr || (sample.clinic || sample.pet.clinic)!.clinicName} />
                        <InfoRow label="الهاتف" value={(sample.clinic || sample.pet.clinic)!.phone} />
                        {(sample.clinic || sample.pet.clinic)!.address && (
                          <InfoRow label="العنوان" value={(sample.clinic || sample.pet.clinic)!.address!} />
                        )}
                      </>
                    )}
                    {(sample.referringDoctorAr || sample.referringDoctor) && (
                      <InfoRow label="الطبيب المُحِيل" value={sample.referringDoctorAr || sample.referringDoctor!} />
                    )}
                    {sample.invoice && (
                      <InfoRow label="رقم الفاتورة" value={sample.invoice.invoiceNumber} />
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Panic banner */}
            {hasPanic && (
              <div className="bg-red-50 border-y border-red-200 px-6 py-3 flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold">تحذير: تحتوي هذه النتائج على قيم حرجة تستوجب التدخل الفوري</span>
              </div>
            )}

            {/* Results tables — grouped by category */}
            <div className="px-6 pt-5 pb-2 space-y-6">
              {Object.entries(grouped).map(([category, results]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-blue-800 border-b border-blue-100 pb-1 mb-2">{category}</h3>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-500 text-xs uppercase tracking-wide">
                        <th className="text-right py-2 px-3 font-medium">الفحص</th>
                        <th className="text-center py-2 px-3 font-medium w-28">النتيجة</th>
                        <th className="text-center py-2 px-3 font-medium w-36">المرجع الطبيعي</th>
                        <th className="text-center py-2 px-3 font-medium w-16">الوحدة</th>
                        <th className="text-center py-2 px-3 font-medium w-20">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => {
                        const st = getStatus(r)
                        return (
                          <tr
                            key={r.id}
                            className={`border-b border-gray-100 ${st === 'panic' ? 'bg-red-50' : st === 'abnormal' ? 'bg-amber-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                          >
                            <td className="py-2 px-3">
                              <span className="font-medium">{r.catalog.testNameAr}</span>
                              <span className="text-gray-400 text-xs mr-2">{r.catalog.testNameEn}</span>
                              {r.labComments && (
                                <p className="text-xs text-gray-500 mt-0.5 italic">{r.labComments}</p>
                              )}
                            </td>
                            <td className={`py-2 px-3 text-center font-mono font-bold ${st === 'panic' ? 'text-red-700 text-base' : st === 'abnormal' ? 'text-amber-700' : 'text-gray-800'}`}>
                              {r.resultValue}
                            </td>
                            <td className="py-2 px-3 text-center text-xs text-gray-500">
                              {r.catalog.minNormal !== null && r.catalog.maxNormal !== null
                                ? `${r.catalog.minNormal} – ${r.catalog.maxNormal}`
                                : '—'}
                            </td>
                            <td className="py-2 px-3 text-center text-xs text-gray-500">{r.catalog.unit || '—'}</td>
                            <td className="py-2 px-3 text-center">
                              {st === 'panic' && (
                                <span className="inline-flex items-center gap-1 text-xs text-red-700 font-semibold">
                                  <AlertTriangle className="w-3 h-3" /> حرج
                                </span>
                              )}
                              {st === 'abnormal' && (
                                <span className="text-xs text-amber-700 font-medium">خارج النطاق</span>
                              )}
                              {st === 'normal' && (
                                <span className="inline-flex items-center gap-1 text-xs text-green-700">
                                  <CheckCircle2 className="w-3 h-3" /> طبيعي
                                </span>
                              )}
                              {st === 'text' && <span className="text-xs text-gray-400">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Doctor's interpretation */}
            {doctorInterpretation && (
              <div className="mx-6 mb-4 border border-blue-100 rounded-lg bg-blue-50/50 px-5 py-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">رأي الطبيب والتوصيات</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{doctorInterpretation}</p>
              </div>
            )}

            {/* Footer — signature + status */}
            <div className="grid grid-cols-2 gap-6 px-6 pb-6 mt-2">
              <div className="border border-gray-200 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400 mb-3">توقيع الطبيب المسؤول</p>
                <p className="text-sm font-semibold text-gray-800">{doctorName || '................................'}</p>
                <div className="mt-4 border-t border-dashed border-gray-300 pt-2">
                  <p className="text-xs text-gray-400">التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg px-4 py-3 flex flex-col justify-between">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">حالة العينة</span>
                    <span className="font-medium">{
                      sample.status === 'Approved' ? 'معتمدة ✓' :
                      sample.status === 'Completed' ? 'مكتملة' :
                      sample.status === 'In_Progress' ? 'قيد التنفيذ' : 'تم الجمع'
                    }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">إجمالي الفحوصات</span>
                    <span className="font-medium">{sample.results.length}</span>
                  </div>
                  {sample.results.filter(r => r.isPanic).length > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>قيم حرجة</span>
                      <span className="font-bold">{sample.results.filter(r => r.isPanic).length}</span>
                    </div>
                  )}
                  {allApproved && (
                    <div className="flex justify-between text-green-700">
                      <span>معتمد من</span>
                      <span className="font-medium">{doctorName || 'الطبيب المسؤول'}</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-300 mt-3 border-t pt-2">
                  SINF-VET Laboratory System • هذا التقرير سري ومخصص للاستخدام الطبي فقط
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {!sample && !loading && (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
          <FileText className="w-12 h-12 opacity-20" />
          <p className="text-sm">اختر عينة من القائمة أعلاه لعرض التقرير</p>
        </div>
      )}
    </div>
  )
}

// Small helper row component
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="text-gray-400 py-0.5 w-28">{label}</td>
      <td className="font-medium text-gray-800 py-0.5">{value}</td>
    </tr>
  )
}
