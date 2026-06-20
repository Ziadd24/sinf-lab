'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Pencil, Trash2, FlaskConical, AlertTriangle, RefreshCw, Search } from 'lucide-react'

const COMMON_UNITS = ['g/dL', 'mg/dL', 'µg/dL', 'U/L', '%', '10³/µL', '10⁶/µL', 'ng/mL', '—']

interface TestItem {
  id: string
  testCode: string
  testNameEn: string
  testNameAr: string
  category: string | null
  categoryAr: string | null
  minNormal: number | null
  maxNormal: number | null
  minNormalOld: number | null
  maxNormalOld: number | null
  unit: string | null
  price: number
  turnaround: string | null
  active: boolean
  animalIds: string | null
}

interface AnimalItem {
  id: string
  nameEn: string
  nameAr: string
  icon: string | null
}

const emptyForm = {
  testCode: '',
  testNameEn: '',
  testNameAr: '',
  category: '',
  categoryAr: '',
  minNormal: '',
  maxNormal: '',
  minNormalOld: '',
  maxNormalOld: '',
  unit: '',
  price: '',
  turnaround: '',
  animalIds: [] as string[],
}

export function TestCatalogView() {
  const [tests, setTests] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [animals, setAnimals] = useState<AnimalItem[]>([])

  const fetchAnimals = async () => {
    try {
      const res = await fetch('/api/animals?limit=100')
      const json = await res.json()
      if (!json.error) setAnimals(Array.isArray(json) ? json : json.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTests = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tests?limit=200')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setTests(Array.isArray(json) ? json : json.data || [])
    } catch (e: any) {
      setError(e.message || 'فشل تحميل دليل الفحوصات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTests(); fetchAnimals() }, [])

  const filtered = tests.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      t.testNameAr.toLowerCase().includes(q) ||
      t.testNameEn.toLowerCase().includes(q) ||
      t.testCode.toLowerCase().includes(q)
    )
  })

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowDialog(true)
  }

  const openEdit = (t: TestItem) => {
    setEditingId(t.id)
    setForm({
      testCode: t.testCode,
      testNameEn: t.testNameEn,
      testNameAr: t.testNameAr,
      category: t.category || '',
      categoryAr: t.categoryAr || '',
      minNormal: t.minNormal?.toString() || '',
      maxNormal: t.maxNormal?.toString() || '',
      minNormalOld: t.minNormalOld?.toString() || '',
      maxNormalOld: t.maxNormalOld?.toString() || '',
      unit: t.unit || '',
      price: t.price.toString(),
      turnaround: t.turnaround || '',
      animalIds: t.animalIds ? t.animalIds.split(',').filter(Boolean) : [],
    })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!form.testCode || !form.testNameAr || !form.testNameEn || !form.price) return
    setSaving(true)
    try {
      const payload = {
        testCode: form.testCode,
        testNameEn: form.testNameEn,
        testNameAr: form.testNameAr,
        category: form.category === '' ? null : form.category,
        categoryAr: form.categoryAr === '' ? null : form.categoryAr,
        minNormal: form.minNormal === '' ? null : parseFloat(form.minNormal),
        maxNormal: form.maxNormal === '' ? null : parseFloat(form.maxNormal),
        minNormalOld: form.minNormalOld === '' ? null : parseFloat(form.minNormalOld),
        maxNormalOld: form.maxNormalOld === '' ? null : parseFloat(form.maxNormalOld),
        unit: form.unit === '' ? null : form.unit,
        price: parseFloat(form.price),
        turnaround: form.turnaround === '' ? null : form.turnaround,
        animalIds: form.animalIds.length > 0 ? form.animalIds.join(',') : null,
      }

      const res = editingId
        ? await fetch('/api/tests', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingId, ...payload }),
          })
        : await fetch('/api/tests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'فشل الحفظ')
      }

      setShowDialog(false)
      fetchTests()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (t: TestItem) => {
    if (!confirm(`إيقاف فحص "${t.testNameAr}"؟ لن يظهر بعد الآن في التقرير السريع.`)) return
    try {
      const res = await fetch(`/api/tests?id=${t.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل الإيقاف')
      fetchTests()
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <AlertTriangle className="w-10 h-10 text-destructive opacity-60" />
        <p className="text-sm font-medium text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchTests} className="gap-2">
          <RefreshCw className="w-4 h-4" /> إعادة المحاولة
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث في الفحوصات..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="w-4 h-4" /> فحص جديد
          </Button>
        </CardContent>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <FlaskConical className="w-12 h-12 opacity-20" />
            <p className="text-sm">{search ? 'لا توجد نتائج تطابق البحث' : 'لا توجد فحوصات بعد'}</p>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-start p-3 font-medium text-muted-foreground">الرمز</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">الاسم</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">التصنيف</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">المعدل الطبيعي</th>
                    <th className="text-start p-3 font-medium text-muted-foreground">السعر</th>
                    <th className="text-start p-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-xs">{t.testCode}</td>
                      <td className="p-3">
                        <p className="font-medium">{t.testNameAr}</p>
                        <p className="text-xs text-muted-foreground">{t.testNameEn}</p>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{t.categoryAr || t.category || '-'}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {t.minNormal !== null && t.maxNormal !== null ? `${t.minNormal} - ${t.maxNormal} ${t.unit || ''}` : '-'}
                      </td>
                      <td className="p-3 font-medium">{t.price} ر.س</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeactivate(t)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold border-b pb-2">
              {editingId ? 'تعديل فحص مخبري' : 'إضافة فحص مخبري جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            
            {/* القسم الأول: معلومات الفحص الأساسية */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">معلومات الفحص الأساسية</h3>
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border">
                <div>
                  <Label className="text-xs font-medium">الرمز *</Label>
                  <Input className="h-9 mt-1" value={form.testCode} onChange={e => setForm({ ...form, testCode: e.target.value })} placeholder="CBC" />
                </div>
                <div>
                  <Label className="text-xs font-medium">السعر (ر.س) *</Label>
                  <Input className="h-9 mt-1" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="80" />
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">الاسم (عربي) *</Label>
                    <Input className="h-9 mt-1 text-right" value={form.testNameAr} onChange={e => setForm({ ...form, testNameAr: e.target.value })} dir="rtl" placeholder="هيموغلوبين" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">الاسم (إنجليزي) *</Label>
                    <Input className="h-9 mt-1" value={form.testNameEn} onChange={e => setForm({ ...form, testNameEn: e.target.value })} placeholder="Hemoglobin" />
                  </div>
                </div>
              </div>
            </div>

            {/* القسم الثاني: التصنيف والوحدة */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">التصنيف والوحدات الطبية</h3>
              <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg border">
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs font-medium">التصنيف (عربي)</Label>
                    <Input className="h-9 mt-1 text-right" value={form.categoryAr} onChange={e => setForm({ ...form, categoryAr: e.target.value })} placeholder="أمراض الدم" dir="rtl" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">التصنيف (إنجليزي)</Label>
                    <Input className="h-9 mt-1" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Hematology" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">الوحدة الطبية</Label>
                  <Select
                    value={COMMON_UNITS.includes(form.unit) ? form.unit : (form.unit ? 'custom' : '—')}
                    onValueChange={(val) => {
                      if (val === 'custom') {
                        setForm({ ...form, unit: 'custom-input' })
                      } else if (val === '—') {
                        setForm({ ...form, unit: '' })
                      } else {
                        setForm({ ...form, unit: val })
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 mt-1 font-mono">
                      <SelectValue placeholder="اختر الوحدة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="—">— (بدون وحدة)</SelectItem>
                      <SelectItem value="g/dL">g/dL</SelectItem>
                      <SelectItem value="mg/dL">mg/dL</SelectItem>
                      <SelectItem value="µg/dL">µg/dL</SelectItem>
                      <SelectItem value="U/L">U/L</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="10³/µL">10³/µL</SelectItem>
                      <SelectItem value="10⁶/µL">10⁶/µL</SelectItem>
                      <SelectItem value="ng/mL">ng/mL</SelectItem>
                      <SelectItem value="custom">كتابة يدوية...</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {(!COMMON_UNITS.includes(form.unit) || form.unit === 'custom-input') && (
                    <Input
                      className="h-9 mt-2 font-mono"
                      value={form.unit === 'custom-input' ? '' : form.unit}
                      onChange={e => setForm({ ...form, unit: e.target.value })}
                      placeholder="اكتب الوحدة هنا..."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* القسم الثالث: المعدلات الطبيعية حسب فئة العمر */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">نطاق المعدل الطبيعي (المواليد والبالغين)</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
                {/* فئة الحيوانات الصغيرة */}
                <div className="space-y-2 border-l pl-3">
                  <span className="text-xs font-bold text-primary block mb-1">صغير السن (Little)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">الحد الأدنى</Label>
                      <Input className="h-8 mt-0.5" type="number" step="any" value={form.minNormal} onChange={e => setForm({ ...form, minNormal: e.target.value })} placeholder="0" />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">الحد الأقصى</Label>
                      <Input className="h-8 mt-0.5" type="number" step="any" value={form.maxNormal} onChange={e => setForm({ ...form, maxNormal: e.target.value })} placeholder="0" />
                    </div>
                  </div>
                </div>
                
                {/* فئة الحيوانات الكبيرة */}
                <div className="space-y-2 pr-1">
                  <span className="text-xs font-bold text-primary block mb-1">كبير السن (Old)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">الحد الأدنى</Label>
                      <Input className="h-8 mt-0.5" type="number" step="any" value={form.minNormalOld} onChange={e => setForm({ ...form, minNormalOld: e.target.value })} placeholder="0" />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">الحد الأقصى</Label>
                      <Input className="h-8 mt-0.5" type="number" step="any" value={form.maxNormalOld} onChange={e => setForm({ ...form, maxNormalOld: e.target.value })} placeholder="0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* القسم الرابع: ينطبق على الحيوانات */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ينطبق على الحيوانات</h3>
              <div className="p-3 bg-muted/30 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-3">إذا لم يتم تحديد أي حيوان، فسيظهر الفحص لجميع الحيوانات.</p>
                <div className="flex flex-wrap gap-4">
                  {animals.map(a => (
                    <div key={a.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`animal-${a.id}`}
                        checked={form.animalIds.includes(a.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setForm({ ...form, animalIds: [...form.animalIds, a.id] })
                          } else {
                            setForm({ ...form, animalIds: form.animalIds.filter(id => id !== a.id) })
                          }
                        }}
                      />
                      <label htmlFor={`animal-${a.id}`} className="text-sm font-medium leading-none cursor-pointer">
                        {a.icon} {a.nameAr}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
          <DialogFooter className="border-t pt-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDialog(false)}>إلغاء</Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !form.testCode || !form.testNameAr || !form.price}>
              {saving ? 'جاري الحفظ...' : 'حفظ الفحص'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}