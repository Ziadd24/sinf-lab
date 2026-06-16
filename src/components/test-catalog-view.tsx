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
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, FlaskConical, AlertTriangle, RefreshCw, Search } from 'lucide-react'

interface TestItem {
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
  turnaround: string | null
  active: boolean
}

const emptyForm = {
  testCode: '',
  testNameEn: '',
  testNameAr: '',
  category: '',
  categoryAr: '',
  minNormal: '',
  maxNormal: '',
  unit: '',
  price: '',
  turnaround: '',
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

  useEffect(() => { fetchTests() }, [])

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
      unit: t.unit || '',
      price: t.price.toString(),
      turnaround: t.turnaround || '',
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
        category: form.category || undefined,
        categoryAr: form.categoryAr || undefined,
        minNormal: form.minNormal ? parseFloat(form.minNormal) : undefined,
        maxNormal: form.maxNormal ? parseFloat(form.maxNormal) : undefined,
        unit: form.unit || undefined,
        price: parseFloat(form.price),
        turnaround: form.turnaround || undefined,
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'تعديل فحص' : 'فحص جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الرمز *</Label>
                <Input value={form.testCode} onChange={e => setForm({ ...form, testCode: e.target.value })} placeholder="CBC" />
              </div>
              <div>
                <Label>السعر (ر.س) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="80" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الاسم (عربي) *</Label>
                <Input value={form.testNameAr} onChange={e => setForm({ ...form, testNameAr: e.target.value })} dir="rtl" />
              </div>
              <div>
                <Label>الاسم (إنجليزي) *</Label>
                <Input value={form.testNameEn} onChange={e => setForm({ ...form, testNameEn: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>التصنيف (عربي)</Label>
                <Input value={form.categoryAr} onChange={e => setForm({ ...form, categoryAr: e.target.value })} placeholder="أمراض الدم" dir="rtl" />
              </div>
              <div>
                <Label>التصنيف (إنجليزي)</Label>
                <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Hematology" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>الحد الأدنى</Label>
                <Input type="number" value={form.minNormal} onChange={e => setForm({ ...form, minNormal: e.target.value })} />
              </div>
              <div>
                <Label>الحد الأقصى</Label>
                <Input type="number" value={form.maxNormal} onChange={e => setForm({ ...form, maxNormal: e.target.value })} />
              </div>
              <div>
                <Label>الوحدة</Label>
                <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="g/dL" />
              </div>
            </div>
            <div>
              <Label>مدة الإنجاز</Label>
              <Input value={form.turnaround} onChange={e => setForm({ ...form, turnaround: e.target.value })} placeholder="2-4 ساعات" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving || !form.testCode || !form.testNameAr || !form.price}>
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}