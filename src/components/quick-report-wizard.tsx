'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Printer, ArrowRight, ArrowLeft, Share2, Copy, Check, Search, History, Loader2 } from 'lucide-react'

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
  price: number
}

// Static test catalog — no database needed for Step 1
const TEST_CATALOG: TestCatalogItem[] = [
  { id: 'CBC',     testCode: 'CBC',     testNameEn: 'Complete Blood Count',          testNameAr: 'تعداد دم كامل',              category: 'Hematology',     categoryAr: 'أمراض الدم',      minNormal: null, maxNormal: null, unit: null,     price: 80 },
  { id: 'HGB',     testCode: 'HGB',     testNameEn: 'Hemoglobin',                     testNameAr: 'هيموغلوبين',                 category: 'Hematology',     categoryAr: 'أمراض الدم',      minNormal: 9,    maxNormal: 18,   unit: 'g/dL',   price: 35 },
  { id: 'WBC',     testCode: 'WBC',     testNameEn: 'White Blood Cell Count',         testNameAr: 'عدد كريات الدم البيضاء',     category: 'Hematology',     categoryAr: 'أمراض الدم',      minNormal: 5.5,  maxNormal: 19.5, unit: '10³/µL', price: 40 },
  { id: 'PCV',     testCode: 'PCV',     testNameEn: 'Packed Cell Volume',             testNameAr: 'حجم الخلايا المضغوط',        category: 'Hematology',     categoryAr: 'أمراض الدم',      minNormal: 24,   maxNormal: 38,   unit: '%',      price: 30 },
  { id: 'RBC',     testCode: 'RBC',     testNameEn: 'RBC Count',                      testNameAr: 'عدد كريات الدم الحمراء',     category: 'Hematology',     categoryAr: 'أمراض الدم',      minNormal: 5.0,  maxNormal: 10.5, unit: '10⁶/µL', price: 35 },
  { id: 'BIO-01',  testCode: 'BIO-01',  testNameEn: 'Liver Panel (ALT, AST, ALP)',    testNameAr: 'فحص الكبد (ALT, AST, ALP)',  category: 'Biochemistry',   categoryAr: 'الكيمياء الحيوية', minNormal: null, maxNormal: null, unit: null,     price: 120 },
  { id: 'BUN',     testCode: 'BUN',     testNameEn: 'BUN (Urea)',                     testNameAr: 'يوريا الدم',                 category: 'Biochemistry',   categoryAr: 'الكيمياء الحيوية', minNormal: 7,    maxNormal: 36,   unit: 'mg/dL',  price: 45 },
  { id: 'CREAT',   testCode: 'CREAT',   testNameEn: 'Creatinine',                     testNameAr: 'كرياتينين',                  category: 'Biochemistry',   categoryAr: 'الكيمياء الحيوية', minNormal: 1.0,  maxNormal: 2.5,  unit: 'mg/dL',  price: 45 },
  { id: 'GLU',     testCode: 'GLU',     testNameEn: 'Glucose',                        testNameAr: 'جلوكوز',                     category: 'Biochemistry',   categoryAr: 'الكيمياء الحيوية', minNormal: 60,   maxNormal: 120,  unit: 'mg/dL',  price: 30 },
  { id: 'TP',      testCode: 'TP',      testNameEn: 'Total Protein',                  testNameAr: 'بروتين كلي',                 category: 'Biochemistry',   categoryAr: 'الكيمياء الحيوية', minNormal: 5.5,  maxNormal: 7.5,  unit: 'g/dL',   price: 35 },
  { id: 'MIC-01',  testCode: 'MIC-01',  testNameEn: 'Bacterial Culture & Sensitivity',testNameAr: 'زراعة بكتيرية وحساسية',     category: 'Microbiology',   categoryAr: 'الأحياء الدقيقة', minNormal: null, maxNormal: null, unit: null,     price: 150 },
  { id: 'MIC-02',  testCode: 'MIC-02',  testNameEn: 'Fungal Culture',                 testNameAr: 'زراعة فطرية',                category: 'Microbiology',   categoryAr: 'الأحياء الدقيقة', minNormal: null, maxNormal: null, unit: null,     price: 130 },
  { id: 'PAR-01',  testCode: 'PAR-01',  testNameEn: 'Fecal Examination',              testNameAr: 'فحص براز',                   category: 'Parasitology',   categoryAr: 'طفيليات',         minNormal: null, maxNormal: null, unit: null,     price: 50 },
  { id: 'HORM-01', testCode: 'HORM-01', testNameEn: 'Thyroid Panel (T4, T3)',         testNameAr: 'فحص الغدة الدرقية (T4, T3)', category: 'Endocrinology',  categoryAr: 'الغدد الصماء',    minNormal: 1.0,  maxNormal: 4.0,  unit: 'µg/dL',  price: 90 },
  { id: 'PREP-EQ', testCode: 'PREP-EQ', testNameEn: 'Pre-Purchase Exam (Equine)',     testNameAr: 'فحص ما قبل الشراء (خيول)',   category: 'Biochemistry',   categoryAr: 'الكيمياء الحيوية', minNormal: null, maxNormal: null, unit: null,     price: 200 },
]

// Quick-pick bundles — common test combinations ordered together
const BUNDLES: { id: string; nameAr: string; testCodes: string[] }[] = [
  { id: 'routine',  nameAr: 'فحص دوري شامل',      testCodes: ['CBC', 'GLU', 'BIO-01', 'BUN', 'CREAT'] },
  { id: 'hema',     nameAr: 'باقة أمراض الدم',     testCodes: ['CBC', 'HGB', 'WBC', 'PCV', 'RBC'] },
  { id: 'kidney',   nameAr: 'باقة وظائف الكلى',    testCodes: ['BUN', 'CREAT', 'TP'] },
  { id: 'prepurchase', nameAr: 'فحص ما قبل الشراء', testCodes: ['PREP-EQ', 'CBC', 'BIO-01'] },
]

interface ResultRow {
  catalogId: string
  testNameAr: string
  testNameEn: string
  unit: string
  refRange: string
  minNormal: number | null
  maxNormal: number | null
  price: number
  value: string
}

interface CustomerMatch {
  id: string
  name: string
  phone: string
  animalType: string
  animalName: string | null
  lastReportAt: string | null
}

interface PastReportResult {
  catalogId: string
  testNameAr: string
  value: string
}

interface WizardData {
  customerName: string
  phone: string
  animalType: string
  animalName: string
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
  const [catalog, setCatalog] = useState<TestCatalogItem[]>(TEST_CATALOG)
  const [catalogSource, setCatalogSource] = useState<'loading' | 'db' | 'fallback'>('loading')
  const [reportId] = useState(generateReportId)
  const [reportTimestamp] = useState(() => new Date())

  // Load the live test catalog from the database (editable via "دليل الفحوصات").
  // Falls back to the built-in list if the fetch fails, so the wizard keeps
  // working even if the database is briefly unavailable.
  useEffect(() => {
    fetch('/api/tests?limit=200')
      .then(r => r.json())
      .then(json => {
        const list = Array.isArray(json) ? json : json.data
        if (Array.isArray(list) && list.length > 0) {
          setCatalog(list)
          setCatalogSource('db')
        } else {
          setCatalogSource('fallback')
        }
      })
      .catch(() => setCatalogSource('fallback'))
  }, [])

  const [data, setData] = useState<WizardData>({
    customerName: '',
    phone: '',
    animalType: '',
    animalName: '',
    selectedTestIds: [],
    results: [],
    doctorNotes: '',
  })

  // ── Customer search / autofill ────────────────────────────────────────────
  const [customerMatches, setCustomerMatches] = useState<CustomerMatch[]>([])
  const [searchingCustomers, setSearchingCustomers] = useState(false)
  const [showMatches, setShowMatches] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    const query = data.customerName || data.phone
    if (!query || query.length < 2) {
      setCustomerMatches([])
      return
    }
    searchTimer.current = setTimeout(async () => {
      setSearchingCustomers(true)
      try {
        const res = await fetch(`/api/quick-customers?search=${encodeURIComponent(query)}`)
        const json = await res.json()
        setCustomerMatches(json.data || [])
      } catch {
        setCustomerMatches([])
      } finally {
        setSearchingCustomers(false)
      }
    }, 350)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [data.customerName, data.phone])

  const selectCustomer = (c: CustomerMatch) => {
    update('customerName', c.name)
    update('phone', c.phone)
    update('animalType', c.animalType)
    update('animalName', c.animalName || '')
    setShowMatches(false)
  }

  // ── Previous results for comparison ───────────────────────────────────────
  const [previousResults, setPreviousResults] = useState<Record<string, string>>({})

  const loadPreviousResults = async (phone: string) => {
    try {
      const res = await fetch(`/api/quick-reports?search=${encodeURIComponent(phone)}&limit=1`)
      const json = await res.json()
      const lastReport = json.data?.[0]
      if (!lastReport) return
      const map: Record<string, string> = {}
      ;(lastReport.results as PastReportResult[]).forEach(r => { map[r.catalogId] = r.value })
      setPreviousResults(map)
    } catch {
      // silent — comparison is a nice-to-have, not critical
    }
  }

  useEffect(() => {
    if (data.phone.length >= 7) loadPreviousResults(data.phone)
  }, [data.phone])

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
            price: test.price,
            value: '',
          },
        ],
      }
    })
  }

  const applyBundle = (bundle: typeof BUNDLES[0]) => {
    const bundleTests = bundle.testCodes
      .map(code => catalog.find(t => t.testCode === code || t.testCode.startsWith(code + '-')))
      .filter((t): t is TestCatalogItem => !!t)

    const allSelected = bundleTests.length > 0 && bundleTests.every(t => data.selectedTestIds.includes(t.id))

    if (allSelected) {
      // Bundle is fully active — clicking again removes exactly these tests
      setData(prev => ({
        ...prev,
        selectedTestIds: prev.selectedTestIds.filter(id => !bundleTests.some(t => t.id === id)),
        results: prev.results.filter(r => !bundleTests.some(t => t.id === r.catalogId)),
      }))
    } else {
      // Add whichever bundle tests aren't already selected
      const testsToAdd = bundleTests.filter(t => !data.selectedTestIds.includes(t.id))
      testsToAdd.forEach(test => toggleTest(test))
    }
  }

  const isBundleActive = (bundle: typeof BUNDLES[0]) => {
    const bundleTests = bundle.testCodes
      .map(code => catalog.find(t => t.testCode === code || t.testCode.startsWith(code + '-')))
      .filter((t): t is TestCatalogItem => !!t)
    return bundleTests.length > 0 && bundleTests.every(t => data.selectedTestIds.includes(t.id))
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

  const totalPrice = data.results.reduce((sum, r) => sum + r.price, 0)

  const canGoStep2 = data.customerName && data.phone && data.animalType && data.selectedTestIds.length > 0
  const canGoStep3 = data.results.some(r => r.value.trim() !== '')

  // ── Save to history ───────────────────────────────────────────────────────
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const saveToHistory = async () => {
    setSaveState('saving')
    try {
      const res = await fetch('/api/quick-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          customerName: data.customerName,
          phone: data.phone,
          animalType: data.animalType,
          animalName: data.animalName || undefined,
          results: data.results.filter(r => r.value).map(r => {
            const { status, critical } = evaluateResult(r.value, r.minNormal, r.maxNormal)
            return {
              catalogId: r.catalogId,
              testNameAr: r.testNameAr,
              testNameEn: r.testNameEn,
              unit: r.unit,
              refRange: r.refRange,
              value: r.value,
              status,
              critical,
            }
          }),
          doctorNotes: data.doctorNotes || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  // Auto-save once when entering Step 3
  useEffect(() => {
    if (step === 3 && saveState === 'idle') saveToHistory()
  }, [step])

  // ── Share as text (WhatsApp-ready) ────────────────────────────────────────
  const [copied, setCopied] = useState(false)

  const buildShareText = () => {
    const animal = ANIMALS.find(a => a.value === data.animalType)
    const lines = [
      `تقرير نتائج التحليل — ${reportId}`,
      `${reportTimestamp.toLocaleDateString('ar-SA')}`,
      ``,
      `العميل: ${data.customerName}`,
      `الحيوان: ${animal?.icon || ''} ${animal?.labelAr || ''}${data.animalName ? ' — ' + data.animalName : ''}`,
      ``,
      `النتائج:`,
    ]
    data.results.filter(r => r.value).forEach(r => {
      const { status, critical } = evaluateResult(r.value, r.minNormal, r.maxNormal)
      const flag = critical ? ' ⚠️ حرج' : status === 'low' ? ' (منخفض)' : status === 'high' ? ' (مرتفع)' : ''
      lines.push(`• ${r.testNameAr}: ${r.value} ${r.unit !== '—' ? r.unit : ''}${flag}`)
    })
    if (data.doctorNotes) {
      lines.push(``, `ملاحظات الطبيب:`, data.doctorNotes)
    }
    return lines.join('\n')
  }

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard may be unavailable — silent fail is fine here
    }
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(buildShareText())
    const phoneDigits = data.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${phoneDigits}?text=${text}`, '_blank')
  }

  const handlePrint = () => window.print()

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
              <div className="relative">
                <label className="text-sm font-medium mb-1 block">اسم العميل</label>
                <div className="relative">
                  <Input
                    value={data.customerName}
                    onChange={e => { update('customerName', e.target.value); setShowMatches(true) }}
                    onFocus={() => setShowMatches(true)}
                    placeholder="أدخل اسم العميل"
                  />
                  {searchingCustomers && (
                    <Loader2 className="w-4 h-4 animate-spin absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  )}
                </div>
                {showMatches && customerMatches.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-md max-h-56 overflow-y-auto">
                    {customerMatches.map(c => (
                      <button
                        key={c.id}
                        onClick={() => selectCustomer(c)}
                        className="w-full text-right px-3 py-2 text-sm hover:bg-muted/50 flex items-center justify-between border-b last:border-0"
                      >
                        <span>
                          <span className="font-medium">{c.name}</span>
                          <span className="text-muted-foreground text-xs mr-2">{c.phone}</span>
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <History className="w-3 h-3" />
                          {ANIMALS.find(a => a.value === c.animalType)?.icon} {c.animalName || ANIMALS.find(a => a.value === c.animalType)?.labelAr}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">رقم الهاتف</label>
                <Input
                  value={data.phone}
                  onChange={e => { update('phone', e.target.value); setShowMatches(true) }}
                  onFocus={() => setShowMatches(true)}
                  placeholder="05XXXXXXXX"
                />
              </div>
              <div>
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
              <div>
                <label className="text-sm font-medium mb-1 block">اسم الحيوان (اختياري)</label>
                <Input
                  value={data.animalName}
                  onChange={e => update('animalName', e.target.value)}
                  placeholder="مثال: نجمة"
                />
              </div>
            </div>

            {/* Quick-pick bundles */}
            <div>
              <label className="text-sm font-medium mb-2 block">باقات سريعة</label>
              <div className="flex flex-wrap gap-2">
                {BUNDLES.map(b => {
                  const active = isBundleActive(b)
                  return (
                    <Button
                      key={b.id}
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => applyBundle(b)}
                      className="text-xs"
                    >
                      {active && '✓ '}{b.nameAr} ({b.testCodes.length})
                    </Button>
                  )
                })}
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
              {catalogSource === 'fallback' && (
                <p className="text-xs text-amber-600 mb-2">
                  تعذر الاتصال بدليل الفحوصات المحدّث — يتم عرض القائمة الأساسية مؤقتاً
                </p>
              )}

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
                        <span className="text-xs font-medium text-primary w-14 text-left">{test.price} ر.س</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Running price total */}
            {data.results.length > 0 && (
              <div className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 text-sm">
                <span className="text-muted-foreground">إجمالي التكلفة ({data.results.length} فحص)</span>
                <span className="font-bold text-base">{totalPrice} ر.س</span>
              </div>
            )}

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
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2 flex justify-between">
              <span>{data.customerName} · {ANIMALS.find(a => a.value === data.animalType)?.labelAr} · {data.results.length} فحص</span>
              <span className="font-medium">{totalPrice} ر.س</span>
            </div>

            {Object.keys(previousResults).length > 0 && (
              <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                <History className="w-3.5 h-3.5" />
                تم العثور على نتائج سابقة لهذا العميل — تظهر بجانب كل فحص للمقارنة
              </div>
            )}

            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-xs uppercase text-muted-foreground">
                    <th className="text-right py-2 px-3">الفحص</th>
                    <th className="text-center py-2 px-3 w-28">النتيجة</th>
                    <th className="text-center py-2 px-3 w-24">السابقة</th>
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
                    const prev = previousResults[r.catalogId]
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
                        <td className="py-2 px-3 text-center text-xs text-muted-foreground font-mono">
                          {prev ?? '—'}
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
              .print-summary { position: absolute; inset: 0; margin: 0; }
              .print\\:hidden { display: none !important; }
              @page { margin: 0; size: A4; }
            }
          `}</style>

          <div className="flex flex-wrap justify-between gap-2 print:hidden">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowRight className="w-4 h-4" /> السابق
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleCopyShare} className="gap-2">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'تم النسخ' : 'نسخ كنص'}
              </Button>
              <Button variant="outline" onClick={handleWhatsAppShare} className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                <Share2 className="w-4 h-4" /> واتساب
              </Button>
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" /> طباعة
              </Button>
            </div>
          </div>

          {saveState === 'saving' && (
            <p className="text-xs text-muted-foreground print:hidden flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> جاري حفظ التقرير في السجل...
            </p>
          )}
          {saveState === 'saved' && (
            <p className="text-xs text-green-700 print:hidden flex items-center gap-1.5">
              <Check className="w-3 h-3" /> تم حفظ التقرير في السجل بنجاح
            </p>
          )}
          {saveState === 'error' && (
            <div className="flex items-center justify-between text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 print:hidden">
              <span>تعذر حفظ التقرير في السجل — سيظل بإمكانك طباعته الآن</span>
              <Button variant="outline" size="sm" onClick={saveToHistory} className="h-6 text-xs">إعادة المحاولة</Button>
            </div>
          )}

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
              <span className="font-mono text-gray-600">{reportId}</span>
              <span className="text-gray-600">
                {reportTimestamp.toLocaleDateString('ar-SA')} — {reportTimestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="px-10 py-6 space-y-5">
              {/* ── Patient / customer info card ─────────────────────── */}
              <div className="grid grid-cols-2 gap-3 text-sm rounded-lg border border-gray-200 p-4" style={{ backgroundColor: '#FAFAFA' }}>
                <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">العميل</span><span className="font-semibold">{data.customerName}</span></div>
                <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">الهاتف</span><span className="font-semibold font-mono">{data.phone}</span></div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-20 shrink-0">الحيوان</span>
                  <span className="font-semibold">
                    {ANIMALS.find(a => a.value === data.animalType)?.icon} {ANIMALS.find(a => a.value === data.animalType)?.labelAr}
                    {data.animalName ? ` — ${data.animalName}` : ''}
                  </span>
                </div>
                <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">عدد الفحوصات</span><span className="font-semibold">{data.results.filter(r => r.value).length}</span></div>
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
                  {data.results.filter(r => r.value).map((r, i) => {
                    const { status, critical } = evaluateResult(r.value, r.minNormal, r.maxNormal)
                    const flagged = critical || (status !== 'normal' && status !== 'unknown')
                    return (
                      <tr
                        key={r.catalogId}
                        className="border-b border-gray-100"
                        style={{ backgroundColor: critical ? '#FEF2F2' : status === 'low' || status === 'high' ? '#FFFBEB' : i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}
                      >
                        <td className="py-2.5 px-3 font-medium">{r.testNameAr}</td>
                        <td className={`py-2.5 px-3 text-center font-mono font-bold ${critical ? 'text-red-700' : flagged ? 'text-amber-700' : 'text-gray-800'}`}>{r.value}</td>
                        <td className="py-2.5 px-3 text-center text-gray-500">{r.unit}</td>
                        <td className="py-2.5 px-3 text-center text-gray-500">{r.refRange}</td>
                        <td className="py-2.5 px-3 text-center text-xs">
                          {status === 'unknown' && <span className="text-gray-400">—</span>}
                          {status === 'normal' && <span className="text-green-700 font-medium">طبيعي</span>}
                          {status === 'low' && <span className={`font-semibold ${critical ? 'text-red-700' : 'text-amber-700'}`}>{critical ? 'منخفض جداً' : 'منخفض'}</span>}
                          {status === 'high' && <span className={`font-semibold ${critical ? 'text-red-700' : 'text-amber-700'}`}>{critical ? 'مرتفع جداً' : 'مرتفع'}</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {data.doctorNotes && (
                <div className="rounded-lg p-4 border" style={{ backgroundColor: '#FBF6E8', borderColor: '#EADFB8' }}>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: '#9C7A1A' }}>رأي الطبيب والتوصيات</p>
                  <p className="text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">{data.doctorNotes}</p>
                </div>
              )}
            </div>

            {/* ── Footer / signature ───────────────────────────────────── */}
            <div className="flex items-end justify-between px-10 py-5 border-t" style={{ borderColor: '#E5E0D8' }}>
              <div className="text-xs text-gray-500">
                <p className="font-mono">{reportId}</p>
                <p className="mt-0.5">مؤسسة صنف البيطرية — تقرير سري ومخصص للاستخدام الطبي فقط</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-6">توقيع الطبيب المسؤول</p>
                <div className="w-40 border-t border-gray-300" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}