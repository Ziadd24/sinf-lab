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
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Pencil, Trash2, Package, RefreshCw, Search } from 'lucide-react'

interface TestItem {
  id: string
  testCode: string
  testNameEn: string
  testNameAr: string
  category: string | null
  categoryAr: string | null
  price: number
}

interface AnimalItem {
  id: string
  nameEn: string
  nameAr: string
  icon: string | null
}

interface BundleItem {
  id: string
  nameEn: string
  nameAr: string
  testCodes: string
  animalIds: string | null
  customPrice: number | null
  active: boolean
}

const emptyForm = {
  nameEn: '',
  nameAr: '',
  testCodes: [] as string[],
  animalIds: [] as string[],
  customPrice: '' as number | string,
}

export function BundleCatalogView() {
  const [bundles, setBundles] = useState<BundleItem[]>([])
  const [tests, setTests] = useState<TestItem[]>([])
  const [animals, setAnimals] = useState<AnimalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [resBundles, resTests, resAnimals] = await Promise.all([
        fetch('/api/bundles'),
        fetch('/api/tests?limit=200'),
        fetch('/api/animals?limit=100'),
      ])
      
      const [jsonBundles, jsonTests, jsonAnimals] = await Promise.all([
        resBundles.json(),
        resTests.json(),
        resAnimals.json(),
      ])

      if (jsonBundles.error) throw new Error(jsonBundles.error)
      
      setBundles(Array.isArray(jsonBundles) ? jsonBundles : [])
      setTests(Array.isArray(jsonTests) ? jsonTests : jsonTests.data || [])
      setAnimals(Array.isArray(jsonAnimals) ? jsonAnimals : jsonAnimals.data || [])
    } catch (e: any) {
      setError(e.message || 'فشل تحميل الباقات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = bundles.filter(b => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      b.nameAr.toLowerCase().includes(q) ||
      b.nameEn.toLowerCase().includes(q)
    )
  })

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowDialog(true)
  }

  const openEdit = (b: BundleItem) => {
    setEditingId(b.id)
    setForm({
      nameEn: b.nameEn,
      nameAr: b.nameAr,
      testCodes: b.testCodes ? b.testCodes.split(',').filter(Boolean) : [],
      animalIds: b.animalIds ? b.animalIds.split(',').filter(Boolean) : [],
      customPrice: b.customPrice ?? '',
    })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!form.nameAr || form.testCodes.length === 0) return
    setSaving(true)
    try {
      const payload = {
        nameEn: form.nameEn,
        nameAr: form.nameAr,
        testCodes: form.testCodes.join(','),
        animalIds: form.animalIds.join(','),
        customPrice: form.customPrice === '' ? null : Number(form.customPrice),
      }

      const res = editingId
        ? await fetch('/api/bundles', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingId, ...payload }),
          })
        : await fetch('/api/bundles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'فشل الحفظ')
      }

      setShowDialog(false)
      fetchData()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return
    try {
      const res = await fetch(`/api/bundles?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل الحذف')
      fetchData()
    } catch (e: any) {
      alert(e.message)
    }
  }

  // Group tests by category for the dialog checkboxes
  const testsByCategory = tests.reduce((acc, test) => {
    const cat = test.categoryAr || test.category || 'أخرى'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(test)
    return acc
  }, {} as Record<string, TestItem[]>)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الباقات..."
            className="pr-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={openNew} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" /> إضافة باقة
          </Button>
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-red-500">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchData}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => (
            <Card key={b.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardContent className="p-3 flex flex-col justify-between h-full gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{b.nameAr}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{b.nameEn}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b)}>
                      <Pencil className="w-3.5 h-3.5 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(b.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {b.testCodes.split(',').slice(0, 8).map(code => {
                      const t = tests.find(x => x.testCode === code)
                      return (
                        <Badge key={code} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {t ? t.testNameAr : code}
                        </Badge>
                      )
                    })}
                    {b.testCodes.split(',').length > 8 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                        +{b.testCodes.split(',').length - 8}
                      </Badge>
                    )}
                  </div>
                  {b.customPrice !== null && (
                    <p className="text-xs font-semibold text-primary mt-2">
                      السعر: {b.customPrice} ر.س
                    </p>
                  )}
                </div>

                {b.animalIds && (
                  <div className="pt-3 border-t mt-auto">
                    <p className="text-xs text-muted-foreground mb-1">مخصصة لـ:</p>
                    <div className="flex gap-1 flex-wrap">
                      {b.animalIds.split(',').map(aid => {
                        const animal = animals.find(a => a.id === aid)
                        return animal ? (
                          <span key={aid} className="text-sm" title={animal.nameAr}>{animal.icon || animal.nameAr}</span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-10 text-center text-muted-foreground border rounded-lg border-dashed">
              لا توجد باقات مطابقة.
            </div>
          )}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'تعديل باقة' : 'إضافة باقة'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>الاسم بالعربية <span className="text-red-500">*</span></Label>
                <Input
                  value={form.nameAr}
                  onChange={e => setForm({ ...form, nameAr: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className="grid gap-2">
                <Label>الاسم بالإنجليزية (اختياري)</Label>
                <Input
                  value={form.nameEn}
                  onChange={e => setForm({ ...form, nameEn: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>سعر مخصص للباقة (اختياري)</Label>
              <Input
                type="number"
                placeholder="اتركه فارغاً لاستخدام مجموع أسعار التحاليل"
                value={form.customPrice}
                onChange={e => setForm({ ...form, customPrice: e.target.value })}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                السعر الفردي لمجموع التحاليل المختارة: <span className="font-semibold text-primary">{form.testCodes.reduce((sum, code) => sum + (tests.find(t => t.testCode === code)?.price || 0), 0)} ر.س</span>
              </p>
            </div>

            <div className="grid gap-2">
              <Label>الفحوصات المشمولة <span className="text-red-500">*</span></Label>
              <div className="border rounded-md p-3 bg-muted/10 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto">
                {Object.entries(testsByCategory).map(([cat, catTests]) => (
                  <div key={cat} className="space-y-2 border p-2 rounded-md bg-background shadow-sm">
                    <h4 className="font-semibold text-xs text-primary border-b pb-1">{cat}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {catTests.map(t => (
                        <div key={t.id} className="flex items-center space-x-2 space-x-reverse hover:bg-muted/30 p-0.5 rounded transition-colors">
                          <Checkbox
                            id={`test-${t.testCode}`}
                            checked={form.testCodes.includes(t.testCode)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setForm(prev => ({ ...prev, testCodes: [...prev.testCodes, t.testCode] }))
                              } else {
                                setForm(prev => ({ ...prev, testCodes: prev.testCodes.filter(c => c !== t.testCode) }))
                              }
                            }}
                          />
                          <label
                            htmlFor={`test-${t.testCode}`}
                            className="text-xs leading-none font-medium cursor-pointer w-full"
                          >
                            {t.testNameAr} <span className="text-muted-foreground ml-1">({t.testCode})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>ينطبق على (اختياري - اتركه فارغاً ليطبق على الجميع)</Label>
              <div className="flex flex-wrap gap-4 border rounded-md p-4 bg-muted/20">
                {animals.map(a => (
                  <div key={a.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`animal-${a.id}`}
                      checked={form.animalIds.includes(a.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setForm(prev => ({ ...prev, animalIds: [...prev.animalIds, a.id] }))
                        } else {
                          setForm(prev => ({ ...prev, animalIds: prev.animalIds.filter(id => id !== a.id) }))
                        }
                      }}
                    />
                    <label
                      htmlFor={`animal-${a.id}`}
                      className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1"
                    >
                      {a.icon} {a.nameAr}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving || !form.nameAr || form.testCodes.length === 0}>
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
