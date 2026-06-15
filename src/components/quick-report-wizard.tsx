'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Printer, ArrowRight, ArrowLeft } from 'lucide-react'

const ANIMALS = [
  { value: 'Camel', labelAr: 'جمل', icon: '🐫' },
  { value: 'Sheep', labelAr: 'خروف', icon: '🐑' },
  { value: 'Goat', labelAr: 'ماعز', icon: '🐐' },
  { value: 'Cat', labelAr: 'قطة', icon: '🐈' },
  { value: 'Horse', labelAr: 'حصان', icon: '🐎' },
]

interface TestCatalogItem {
  id: string
  testCode: string
  testNameEn: string
  testNameAr: string
  category: string | null
  categoryAr: string | null
  minNormal: number | null
  maxNormal: number | null
  unit: string | null
}

// Static test catalog — no database needed for Step 1
const TEST_CATALOG: TestCatalogItem[] = [
  { id: 'CBC',     testCode: 'CBC',     testNameEn: 'Complete Blood Count',          testNameAr: 'تعداد دم كامل',              category: 'Hematology',     categoryAr: 'أمراض الدم',      minNormal: null, maxNormal: null, unit: null },
  { id: 'HGB',     testCode: 'HGB',     testNameEn: 'Hemoglobin',                     testNameAr: 'هيموغلوبين',                 category: 'Hematology',     categoryAr: 'أمراض الدم',      minNormal: 9,    maxNormal: 18,   unit: 'g/dL' },
  { id: 'WBC',     testCode: 'WBC',     testNameEn: 'White Blood Cell Count',         testNameAr: 'عدد كريات الدم البيضاء',     category: 'Hematology',     categoryAr: 'أمراض الدم',      minNormal: 5.5,  maxNormal: 19.5, unit: '10³/µL' },
  { id: 'PCV',     testCode: 'PCV',     testNameEn: 'Packed Cell Volume',             testNameAr: 'حجم الخلايا المضغوط',        category: 'Hematology',     categoryAr: 'أمراض الدم',      minNormal: 24,   maxNormal: 38,   unit: '%' },
  { id: 'RBC',     testCode: 'RBC',     testNameEn: 'RBC Count',                      testNameAr: 'عدد كريات الدم الحمراء',     category: 'Hematology',     categoryAr: 'أمراض الدم',      minNormal: 5.0,  maxNormal: 10.5, unit: '10⁶/µL' },
  { id: 'BIO-01',  testCode: 'BIO-01',  testNameEn: 'Liver Panel (ALT, AST, ALP)',    testNameAr: 'فحص الكبد (ALT, AST, ALP)',  category: 'Biochemistry',   categoryAr: 'الكيمياء الحيوية', minNormal: null, maxNormal: null, unit: null },
  { id: 'BUN',     testCode: 'BUN',     testNameEn: 'BUN (Urea)',                     testNameAr: 'يوريا الدم',                 category: 'Biochemistry',   categoryAr: 'الكيمياء الحيوية', minNormal: 7,    maxNormal: 36,   unit: 'mg/dL' },
  { id: 'CREAT',   testCode: 'CREAT',   testNameEn: 'Creatinine',                     testNameAr: 'كرياتينين',                  category: 'Biochemistry',   categoryAr: 'الكيمياء الحيوية', minNormal: 1.0,  maxNormal: 2.5,  unit: 'mg/dL' },
  { id: 'GLU',     testCode: 'GLU',     testNameEn: 'Glucose',                        testNameAr: 'جلوكوز',                     category: 'Biochemistry',   categoryAr: 'الكيمياء الحيوية', minNormal: 60,   maxNormal: 120,  unit: 'mg/dL' },
  { id: 'TP',      testCode: 'TP',      testNameEn: 'Total Protein',                  testNameAr: 'بروتين كلي',                 category: 'Biochemistry',   categoryAr: 'الكيمياء الحيوية', minNormal: 5.5,  maxNormal: 7.5,  unit: 'g/dL' },
  { id: 'MIC-01',  testCode: 'MIC-01',  testNameEn: 'Bacterial Culture & Sensitivity',testNameAr: 'زراعة بكتيرية وحساسية',     category: 'Microbiology',   categoryAr: 'الأحياء الدقيقة', minNormal: null, maxNormal: null, unit: null },
  { id: 'MIC-02',  testCode: 'MIC-02',  testNameEn: 'Fungal Culture',                 testNameAr: 'زراعة فطرية',                category: 'Microbiology',   categoryAr: 'الأحياء الدقيقة', minNormal: null, maxNormal: null, unit: null },
  { id: 'PAR-01',  testCode: 'PAR-01',  testNameEn: 'Fecal Examination',              testNameAr: 'فحص براز',                   category: 'Parasitology',   categoryAr: 'طفيليات',         minNormal: null, maxNormal: null, unit: null },
  { id: 'HORM-01', testCode: 'HORM-01', testNameEn: 'Thyroid Panel (T4, T3)',         testNameAr: 'فحص الغدة الدرقية (T4, T3)', category: 'Endocrinology',  categoryAr: 'الغدد الصماء',    minNormal: 1.0,  maxNormal: 4.0,  unit: 'µg/dL' },
  { id: 'PREP-EQ', testCode: 'PREP-EQ', testNameEn: 'Pre-Purchase Exam (Equine)',     testNameAr: 'فحص ما قبل الشراء (خيول)',   category: 'Biochemistry',   categoryAr: 'الكيمياء الحيوية', minNormal: null, maxNormal: null, unit: null },
]

interface ResultRow {
  catalogId: string
  testNameAr: string
  testNameEn: string
  unit: string
  refRange: string
  minNormal: number | null
  maxNormal: number | null
  value: string
}

interface WizardData {
  customerName: string
  phone: string
  animalType: string
  selectedTestIds: string[]
  results: ResultRow[]
  doctorNotes: string
}

const refRangeOf = (t: TestCatalogItem) =>
  t.minNormal !== null && t.maxNormal !== null ? `${t.minNormal} – ${t.maxNormal}` : '—'

type ResultStatus = 'normal' | 'low' | 'high' | 'unknown'

/** Evaluate a result value against the normal range. Anything 20%+ beyond
 *  the range is treated as critical (panic) for stronger highlighting. */
const evaluateResult = (
  value: string,
  minNormal: number | null,
  maxNormal: number | null
): { status: ResultStatus; critical: boolean } => {
  const num = parseFloat(value)
  if (value.trim() === '' || isNaN(num) || minNormal === null || maxNormal === null) {
    return { status: 'unknown', critical: false }
  }
  if (num < minNormal) {
    const critical = num < minNormal * 0.8
    return { status: 'low', critical }
  }
  if (num > maxNormal) {
    const critical = num > maxNormal * 1.2
    return { status: 'high', critical }
  }
  return { status: 'normal', critical: false }
}

/** Generate a unique report ID, e.g. RPT-20260615-4F2A */
const generateReportId = () => {
  const date = new Date()
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const randomPart = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `RPT-${datePart}-${randomPart}`
}

export function QuickReportWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const catalog = TEST_CATALOG
  const [reportId] = useState(generateReportId)
  const [reportTimestamp] = useState(() => new Date())

  const [data, setData] = useState<WizardData>({
    customerName: '',
    phone: '',
    animalType: '',
    selectedTestIds: [],
    results: [],
    doctorNotes: '',
  })

  const update = <K extends keyof WizardData>(key: K, value: WizardData[K]) =>
    setData(prev => ({ ...prev, [key]: value }))

  const toggleTest = (test: TestCatalogItem) => {
    setData(prev => {
      const isSelected = prev.selectedTestIds.includes(test.id)
      if (isSelected) {
        return {
          ...prev,
          selectedTestIds: prev.selectedTestIds.filter(id => id !== test.id),
          results: prev.results.filter(r => r.catalogId !== test.id),
        }
      }
      return {
        ...prev,
        selectedTestIds: [...prev.selectedTestIds, test.id],
        results: [
          ...prev.results,
          {
            catalogId: test.id,
            testNameAr: test.testNameAr,
            testNameEn: test.testNameEn,
            unit: test.unit || '—',
            refRange: refRangeOf(test),
            minNormal: test.minNormal,
            maxNormal: test.maxNormal,
            value: '',
          },
        ],
      }
    })
  }

  const updateResultValue = (catalogId: string, value: string) =>
    setData(prev => ({
      ...prev,
      results: prev.results.map(r => (r.catalogId === catalogId ? { ...r, value } : r)),
    }))

  // Group catalog by category for easier picking
  const groupedCatalog = catalog.reduce<Record<string, TestCatalogItem[]>>((acc, t) => {
    const key = t.categoryAr || t.category || 'عام'
    ;(acc[key] = acc[key] || []).push(t)
    return acc
  }, {})

  const canGoStep2 = data.customerName && data.phone && data.animalType && data.selectedTestIds.length > 0
  const canGoStep3 = data.results.some(r => r.value.trim() !== '')

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2 print:hidden">
        {[1, 2, 3].map(n => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0
                ${step === n ? 'bg-primary text-primary-foreground' : step > n ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}
            >
              {n}
            </div>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {n === 1 ? 'الاستلام' : n === 2 ? 'التحاليل' : 'النتيجة'}
            </span>
            {n < 3 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* STEP 1: INTAKE + ANALYSIS PACKAGE SELECTION */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">استلام العميل</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">اسم العميل</label>
                <Input
                  value={data.customerName}
                  onChange={e => update('customerName', e.target.value)}
                  placeholder="أدخل اسم العميل"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">رقم الهاتف</label>
                <Input
                  value={data.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="05XXXXXXXX"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1 block">نوع الحيوان</label>
                <Select value={data.animalType} onValueChange={v => update('animalType', v)}>
                  <SelectTrigger><SelectValue placeholder="اختر نوع الحيوان" /></SelectTrigger>
                  <SelectContent>
                    {ANIMALS.map(a => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.icon} {a.labelAr} — {a.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Analysis package picker */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                التحاليل المطلوبة
                {data.selectedTestIds.length > 0 && (
                  <span className="text-muted-foreground font-normal"> — تم اختيار {data.selectedTestIds.length}</span>
                )}
              </label>

              {catalog.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">لا توجد فحوصات متاحة في الدليل</p>
              ) : (
                <div className="border rounded-md max-h-80 overflow-y-auto divide-y">
                  {Object.entries(groupedCatalog).map(([category, tests]) => (
                    <div key={category}>
                      <div className="bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground sticky top-0">
                        {category}
                      </div>
                      {tests.map(test => (
                        <label
                          key={test.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30 cursor-pointer text-sm"
                        >
                          <Checkbox
                            checked={data.selectedTestIds.includes(test.id)}
                            onCheckedChange={() => toggleTest(test)}
                          />
                          <div className="flex-1">
                            <span className="font-medium">{test.testNameAr}</span>
                            <span className="text-muted-foreground text-xs"> ({test.testNameEn})</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {test.unit || '—'} · {refRangeOf(test)}
                          </span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!canGoStep2} className="gap-2">
                التالي <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: ENTER RESULT VALUES (test/unit/range pre-filled) */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-base">إدخال نتائج التحاليل</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
              {data.customerName} · {ANIMALS.find(a => a.value === data.animalType)?.labelAr} · {data.results.length} فحص
            </div>

            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-xs uppercase text-muted-foreground">
                    <th className="text-right py-2 px-3">الفحص</th>
                    <th className="text-center py-2 px-3 w-28">النتيجة</th>
                    <th className="text-center py-2 px-3 w-20">الوحدة</th>
                    <th className="text-center py-2 px-3 w-28">المعدل الطبيعي</th>
                    <th className="text-center py-2 px-3 w-24">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map(r => {
                    const { status, critical } = evaluateResult(r.value, r.minNormal, r.maxNormal)
                    const rowBg =
                      critical ? 'bg-red-50' :
                      status === 'low' || status === 'high' ? 'bg-amber-50' :
                      ''
                    return (
                      <tr key={r.catalogId} className={`border-t ${rowBg}`}>
                        <td className="py-2 px-3">
                          <span className="font-medium">{r.testNameAr}</span>
                          <span className="text-muted-foreground text-xs"> ({r.testNameEn})</span>
                        </td>
                        <td className="py-2 px-3">
                          <Input
                            value={r.value}
                            onChange={e => updateResultValue(r.catalogId, e.target.value)}
                            placeholder="القيمة"
                            className={`text-center h-8 ${
                              critical ? 'border-red-400 text-red-700 font-bold focus-visible:ring-red-400' :
                              status === 'low' || status === 'high' ? 'border-amber-400 text-amber-700 focus-visible:ring-amber-400' :
                              ''
                            }`}
                            autoFocus={data.results[0]?.catalogId === r.catalogId}
                          />
                        </td>
                        <td className="py-2 px-3 text-center text-muted-foreground">{r.unit}</td>
                        <td className="py-2 px-3 text-center text-muted-foreground">{r.refRange}</td>
                        <td className="py-2 px-3 text-center">
                          {status === 'unknown' && <span className="text-xs text-muted-foreground">—</span>}
                          {status === 'normal' && <span className="text-xs text-green-700 font-medium">طبيعي</span>}
                          {status === 'low' && (
                            <span className={`text-xs font-semibold ${critical ? 'text-red-700' : 'text-amber-700'}`}>
                              {critical ? 'منخفض جداً ⚠' : 'منخفض'}
                            </span>
                          )}
                          {status === 'high' && (
                            <span className={`text-xs font-semibold ${critical ? 'text-red-700' : 'text-amber-700'}`}>
                              {critical ? 'مرتفع جداً ⚠' : 'مرتفع'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {data.results.some(r => evaluateResult(r.value, r.minNormal, r.maxNormal).critical) && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <span className="font-semibold">⚠ تنبيه:</span>
                <span>توجد قيم حرجة خارج النطاق الطبيعي بشكل كبير — يرجى مراجعتها بعناية</span>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">ملاحظات الطبيب</label>
              <Textarea
                rows={3}
                value={data.doctorNotes}
                onChange={e => update('doctorNotes', e.target.value)}
                placeholder="التفسير الطبي والتوصيات..."
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowRight className="w-4 h-4" /> السابق
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canGoStep3} className="gap-2">
                التالي <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: RESULT SUMMARY */}
      {step === 3 && (
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
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowRight className="w-4 h-4" /> السابق
            </Button>
            <Button onClick={() => window.print()} className="gap-2">
              <Printer className="w-4 h-4" /> طباعة
            </Button>
          </div>

          <Card className="print-summary" dir="rtl">
            <CardContent className="pt-6 space-y-4">
              <div className="text-center border-b pb-3">
                <h2 className="text-lg font-bold">تقرير نتائج التحليل</h2>
                <p className="text-sm text-muted-foreground">
                  {reportTimestamp.toLocaleDateString('ar-SA')} — {reportTimestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">{reportId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">اسم العميل: </span><span className="font-medium">{data.customerName}</span></div>
                <div><span className="text-muted-foreground">رقم الهاتف: </span><span className="font-medium">{data.phone}</span></div>
                <div><span className="text-muted-foreground">نوع الحيوان: </span><span className="font-medium">{ANIMALS.find(a => a.value === data.animalType)?.icon} {ANIMALS.find(a => a.value === data.animalType)?.labelAr}</span></div>
                <div><span className="text-muted-foreground">عدد الفحوصات: </span><span className="font-medium">{data.results.filter(r => r.value).length}</span></div>
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
                  {data.results.filter(r => r.value).map(r => {
                    const { status, critical } = evaluateResult(r.value, r.minNormal, r.maxNormal)
                    return (
                      <tr key={r.catalogId} className={`border-b ${critical ? 'bg-red-50' : status !== 'normal' && status !== 'unknown' ? 'bg-amber-50' : ''}`}>
                        <td className="py-2 px-3 font-medium">{r.testNameAr}</td>
                        <td className={`py-2 px-3 text-center font-mono font-bold ${critical ? 'text-red-700' : status !== 'normal' && status !== 'unknown' ? 'text-amber-700' : ''}`}>{r.value}</td>
                        <td className="py-2 px-3 text-center text-muted-foreground">{r.unit}</td>
                        <td className="py-2 px-3 text-center text-muted-foreground">{r.refRange}</td>
                        <td className="py-2 px-3 text-center text-xs">
                          {status === 'unknown' && '—'}
                          {status === 'normal' && <span className="text-green-700 font-medium">طبيعي</span>}
                          {status === 'low' && <span className={`font-semibold ${critical ? 'text-red-700' : 'text-amber-700'}`}>{critical ? 'منخفض جداً' : 'منخفض'}</span>}
                          {status === 'high' && <span className={`font-semibold ${critical ? 'text-red-700' : 'text-amber-700'}`}>{critical ? 'مرتفع جداً' : 'مرتفع'}</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {data.results.some(r => evaluateResult(r.value, r.minNormal, r.maxNormal).critical) && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  ⚠ تحتوي هذه النتائج على قيم حرجة تستوجب المراجعة الفورية
                </div>
              )}

              {data.doctorNotes && (
                <div className="border rounded-md p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">ملاحظات الطبيب</p>
                  <p className="text-sm whitespace-pre-wrap">{data.doctorNotes}</p>
                </div>
              )}

              <div className="border-t pt-3 text-xs text-muted-foreground flex justify-between items-center">
                <span>توقيع الطبيب: ................................</span>
                <span className="font-mono">{reportId}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}