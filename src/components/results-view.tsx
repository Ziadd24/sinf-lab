'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertTriangle, CheckCircle2, Save } from 'lucide-react'

interface SampleForResults {
  id: string
  barcode: string
  status: string
  pet: {
    name: string
    nameAr: string | null
    species: { nameEn: string; nameAr: string; icon: string | null }
  }
  testIds: string[]
  results: {
    id: string
    resultValue: string
    isPanic: boolean
    notes: string | null
    catalogId: string
    catalog: {
      testNameEn: string
      testNameAr: string
      minNormal: number | null
      maxNormal: number | null
      unit: string | null
    }
  }[]
}

interface TestItem {
  id: string
  testCode: string
  testNameEn: string
  testNameAr: string
  minNormal: number | null
  maxNormal: number | null
  unit: string | null
}

export function ResultsView() {
  const { t } = useLanguage()
  const [samples, setSamples] = useState<SampleForResults[]>([])
  const [allTests, setAllTests] = useState<TestItem[]>([])
  const [selectedSampleId, setSelectedSampleId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [resultInputs, setResultInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/samples').then(r => r.json()),
      fetch('/api/tests').then(r => r.json()),
    ]).then(([s, te]: [any, any]) => {
      setSamples(s.data || s)
      setAllTests(te.data || te)
      setLoading(false)
    })
  }, [])

  // Only show samples needing results entry
  const pendingSamples = samples.filter(s => s.status === 'In_Progress' || s.status === 'Collected')
  const completedSamples = samples.filter(s => s.status === 'Completed' || s.status === 'Approved')
  const selectedSample = samples.find(s => s.id === selectedSampleId)

  const testIdsForSample = selectedSample ? selectedSample.testIds : []
  const testsForSample = testIdsForSample.map(tid => allTests.find(t => t.id === tid)).filter(Boolean) as TestItem[]

  // For each test, check if there's already a result
  const getExistingResult = (catalogId: string) => {
    return selectedSample?.results.find(r => r.catalogId === catalogId)
  }

  const checkPanic = (catalogId: string, value: string) => {
    const test = allTests.find(t => t.id === catalogId)
    if (!test || test.minNormal === null || test.maxNormal === null) return false
    const num = parseFloat(value)
    if (isNaN(num)) return false
    return num < test.minNormal || num > test.maxNormal
  }

  const handleSaveResults = async () => {
    if (!selectedSample) return
    setSaving(true)

    try {
      for (const test of testsForSample) {
        const value = resultInputs[test.id]
        if (value === undefined || value === '') continue

        const existing = getExistingResult(test.id)
        if (existing) {
          await fetch('/api/results', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: existing.id,
              catalogId: test.id,
              resultValue: value,
              isPanic: checkPanic(test.id, value),
            }),
          })
        } else {
          await fetch('/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sampleId: selectedSample.id,
              catalogId: test.id,
              resultValue: value,
              isPanic: checkPanic(test.id, value),
            }),
          })
        }
      }

      // Update sample status to Completed if all results entered
      const allEntered = testsForSample.every(te => {
        const existing = getExistingResult(te.id)
        return existing || (resultInputs[te.id] && resultInputs[te.id] !== '')
      })

      if (allEntered) {
        await fetch('/api/samples', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedSample.id, status: 'Completed', completedAt: new Date().toISOString() }),
        })
      } else {
        await fetch('/api/samples', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedSample.id, status: 'In_Progress' }),
        })
      }

      // Refresh
      const fresh = await fetch('/api/samples').then(r => r.json())
      setSamples(fresh.data || fresh)
      setResultInputs({})
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
  }

  return (
    <div className="space-y-4">
      {/* Sample Selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">اختر عينة لإدخال النتائج</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSampleId} onValueChange={setSelectedSampleId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="اختر عينة..." />
            </SelectTrigger>
            <SelectContent>
              {pendingSamples.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.barcode} - {s.pet.nameAr || s.pet.name} ({s.pet.species.nameAr})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Results Entry Form */}
      {selectedSample && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                إدخال نتائج لـ {selectedSample.barcode}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {selectedSample.pet.nameAr || selectedSample.pet.name}
                {selectedSample.pet.species.icon && <span>{selectedSample.pet.species.icon}</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testsForSample.map(test => {
                const existing = getExistingResult(test.id)
                const currentValue = resultInputs[test.id] !== undefined ? resultInputs[test.id] : existing?.resultValue || ''
                const isPanic = currentValue !== '' && checkPanic(test.id, currentValue)

                return (
                  <div
                    key={test.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${isPanic ? 'border-red-300 bg-red-50' : 'border-border'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{test.testNameAr}</p>
                      <p className="text-xs text-muted-foreground">
                        {test.minNormal !== null && test.maxNormal !== null
                          ? `مرجع: ${test.minNormal} - ${test.maxNormal} ${test.unit || ''}`
                          : test.unit || '-'}
                      </p>
                    </div>
                    <div className="w-40">
                      <Input
                        type="text"
                        placeholder="القيمة"
                        value={currentValue}
                        onChange={e => setResultInputs({ ...resultInputs, [test.id]: e.target.value })}
                        className={isPanic ? 'border-red-400 focus-visible:ring-red-400' : ''}
                      />
                    </div>
                    <div className="w-20 text-xs text-muted-foreground">{test.unit || ''}</div>
                    <div className="w-16">
                      {isPanic && (
                        <Badge variant="destructive" className="text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> حرج
                        </Badge>
                      )}
                      {existing?.isPanic && !isPanic && currentValue === existing.resultValue && (
                        <Badge variant="destructive" className="text-xs">حرج</Badge>
                      )}
                      {!isPanic && currentValue && !existing?.isPanic && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex justify-start">
              <Button onClick={handleSaveResults} disabled={saving} className="bg-primary hover:bg-primary/90">
                <Save className="w-4 h-4 ml-2" />
                {saving ? 'جاري الحفظ...' : 'إرسال النتائج'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Results */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">النتائج المكتملة</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-start p-3 font-medium text-muted-foreground">الباركود</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الحيوان</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الفحص</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">النتيجة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">النطاق</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">علامة</th>
                </tr>
              </thead>
              <tbody>
                {completedSamples.flatMap(s =>
                  s.results.map(r => (
                    <tr key={r.id} className={`border-t ${r.isPanic ? 'bg-red-50' : 'hover:bg-muted/30'}`}>
                      <td className="p-3 font-mono text-xs">{s.barcode}</td>
                      <td className="p-3">{s.pet.nameAr || s.pet.name}</td>
                      <td className="p-3">{r.catalog.testNameAr}</td>
                      <td className={`p-3 font-mono font-medium ${r.isPanic ? 'text-red-600' : ''}`}>{r.resultValue}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {r.catalog.minNormal !== null && r.catalog.maxNormal !== null
                          ? `${r.catalog.minNormal}-${r.catalog.maxNormal} ${r.catalog.unit || ''}`
                          : '-'}
                      </td>
                      <td className="p-3">
                        {r.isPanic && <Badge variant="destructive" className="text-xs">حرج</Badge>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
