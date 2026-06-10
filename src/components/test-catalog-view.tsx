'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Search, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'

interface SpeciesItem { id: string; nameEn: string; nameAr: string; icon: string | null }

interface TestItem {
  id: string
  testCode: string
  testNameEn: string
  testNameAr: string
  category: string | null
  categoryAr: string | null
  speciesId: string | null
  species: SpeciesItem | null
  minNormal: number | null
  maxNormal: number | null
  unit: string | null
  price: number
  turnaround: string | null
  active: boolean
}

export function TestCatalogView() {
  const { t } = useLanguage()
  const [tests, setTests] = useState<TestItem[]>([])
  const [species, setSpecies] = useState<SpeciesItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [speciesFilter, setSpeciesFilter] = useState('All')
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<TestItem | null>(null)

  const [form, setForm] = useState({
    testCode: '', testNameEn: '', testNameAr: '', category: '', categoryAr: '',
    speciesId: '', minNormal: '', maxNormal: '', unit: '', price: '', turnaround: '',
  })

  const fetchData = () => {
    Promise.all([
      fetch('/api/tests').then(r => r.json()),
      fetch('/api/species').then(r => r.json()),
    ]).then(([te, s]) => { setTests(te); setSpecies(s); setLoading(false) })
  }
  useEffect(() => { fetchData() }, [])

  const categories = [...new Set(tests.map(te => te.category).filter(Boolean))] as string[]

  const filtered = tests.filter(te => {
    if (categoryFilter !== 'All' && te.category !== categoryFilter) return false
    if (speciesFilter !== 'All' && te.speciesId !== speciesFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return te.testCode.toLowerCase().includes(q) || te.testNameEn.toLowerCase().includes(q) || te.testNameAr.includes(q)
    }
    return true
  })

  const openNew = () => {
    setEditing(null)
    setForm({ testCode: '', testNameEn: '', testNameAr: '', category: '', categoryAr: '', speciesId: '', minNormal: '', maxNormal: '', unit: '', price: '', turnaround: '' })
    setShowDialog(true)
  }

  const openEdit = (te: TestItem) => {
    setEditing(te)
    setForm({
      testCode: te.testCode, testNameEn: te.testNameEn, testNameAr: te.testNameAr,
      category: te.category || '', categoryAr: te.categoryAr || '', speciesId: te.speciesId || '',
      minNormal: te.minNormal !== null ? String(te.minNormal) : '', maxNormal: te.maxNormal !== null ? String(te.maxNormal) : '',
      unit: te.unit || '', price: String(te.price), turnaround: te.turnaround || '',
    })
    setShowDialog(true)
  }

  const handleSave = async () => {
    const data = {
      testCode: form.testCode,
      testNameEn: form.testNameEn,
      testNameAr: form.testNameAr,
      category: form.category || null,
      categoryAr: form.categoryAr || null,
      speciesId: form.speciesId || null,
      minNormal: form.minNormal ? parseFloat(form.minNormal) : null,
      maxNormal: form.maxNormal ? parseFloat(form.maxNormal) : null,
      unit: form.unit || null,
      price: parseFloat(form.price) || 0,
      turnaround: form.turnaround || null,
    }

    if (editing) {
      await fetch('/api/tests', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...data }),
      })
    } else {
      await fetch('/api/tests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, active: true }),
      })
    }
    setShowDialog(false); fetchData()
  }

  const toggleActive = async (te: TestItem) => {
    await fetch('/api/tests', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: te.id, active: !te.active }),
    })
    fetchData()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث الفحوصات..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="الفئة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">كل الفئات</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c!}>{tests.find(te => te.category === c)?.categoryAr || c!}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="النوع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">كل الأنواع</SelectItem>
                {species.map(s => <SelectItem key={s.id} value={s.id}>{s.icon} {s.nameAr}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={openNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 ml-2" /> إضافة فحص
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-start p-3 font-medium text-muted-foreground">الرمز</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الاسم</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الفئة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">النوع</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">النطاق المرجعي</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الوحدة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">السعر</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">مدة التنفيذ</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الحالة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(te => (
                  <tr key={te.id} className={`border-t hover:bg-muted/30 transition-colors ${!te.active ? 'opacity-50' : ''}`}>
                    <td className="p-3 font-mono text-xs">{te.testCode}</td>
                    <td className="p-3">{te.testNameAr}</td>
                    <td className="p-3 text-xs">{te.category ? (te.categoryAr || te.category) : '-'}</td>
                    <td className="p-3 text-xs">{te.species ? `${te.species.icon} ${te.species.nameAr}` : 'عام'}</td>
                    <td className="p-3 text-xs font-mono">
                      {te.minNormal !== null && te.maxNormal !== null ? `${te.minNormal} - ${te.maxNormal}` : '-'}
                    </td>
                    <td className="p-3 text-xs">{te.unit || '-'}</td>
                    <td className="p-3 font-mono">{te.price} ر.س</td>
                    <td className="p-3 text-xs text-muted-foreground">{te.turnaround || '-'}</td>
                    <td className="p-3">
                      {te.active
                        ? <Badge className="bg-green-100 text-green-700 border-0">نشط</Badge>
                        : <Badge variant="secondary">غير نشط</Badge>}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(te)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleActive(te)}>
                          {te.active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل الفحص' : 'إضافة فحص'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>رمز الفحص</Label><Input value={form.testCode} onChange={e => setForm({ ...form, testCode: e.target.value })} /></div>
              <div><Label>السعر (ر.س)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الاسم (إنجليزي)</Label><Input value={form.testNameEn} onChange={e => setForm({ ...form, testNameEn: e.target.value })} /></div>
              <div><Label>الاسم (عربي)</Label><Input value={form.testNameAr} onChange={e => setForm({ ...form, testNameAr: e.target.value })} dir="rtl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الفئة (إنجليزي)</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>الفئة (عربي)</Label><Input value={form.categoryAr} onChange={e => setForm({ ...form, categoryAr: e.target.value })} dir="rtl" /></div>
            </div>
            <div>
              <Label>النوع</Label>
              <Select value={form.speciesId} onValueChange={v => setForm({ ...form, speciesId: v })}>
                <SelectTrigger><SelectValue placeholder="عام (كل الأنواع)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">عام (كل الأنواع)</SelectItem>
                  {species.map(s => <SelectItem key={s.id} value={s.id}>{s.icon} {s.nameAr}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>الحد الأدنى</Label><Input type="number" step="0.1" value={form.minNormal} onChange={e => setForm({ ...form, minNormal: e.target.value })} /></div>
              <div><Label>الحد الأقصى</Label><Input type="number" step="0.1" value={form.maxNormal} onChange={e => setForm({ ...form, maxNormal: e.target.value })} /></div>
              <div><Label>الوحدة</Label><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
            </div>
            <div>
              <Label>مدة التنفيذ</Label>
              <Input value={form.turnaround} onChange={e => setForm({ ...form, turnaround: e.target.value })} placeholder="مثال: 2-4 ساعات" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={!form.testCode || !form.testNameEn || !form.price}>{editing ? 'تحديث' : 'إنشاء'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
