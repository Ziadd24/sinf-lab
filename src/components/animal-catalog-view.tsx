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
import { Plus, Pencil, Trash2, RefreshCw, Search } from 'lucide-react'

interface AnimalItem {
  id: string
  nameEn: string
  nameAr: string
  icon: string | null
  active: boolean
}

const emptyForm = {
  nameEn: '',
  nameAr: '',
  icon: '',
}

export function AnimalCatalogView() {
  const [animals, setAnimals] = useState<AnimalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchAnimals = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/animals?limit=200')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setAnimals(Array.isArray(json) ? json : json.data || [])
    } catch (e: any) {
      setError(e.message || 'فشل تحميل الحيوانات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAnimals() }, [])

  const filtered = animals.filter(a => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.nameAr.toLowerCase().includes(q) ||
      a.nameEn.toLowerCase().includes(q)
    )
  })

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowDialog(true)
  }

  const openEdit = (a: AnimalItem) => {
    setEditingId(a.id)
    setForm({
      nameEn: a.nameEn,
      nameAr: a.nameAr,
      icon: a.icon || '',
    })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!form.nameAr || !form.nameEn) return
    setSaving(true)
    try {
      const payload = {
        nameEn: form.nameEn,
        nameAr: form.nameAr,
        icon: form.icon === '' ? null : form.icon,
      }

      const res = editingId
        ? await fetch('/api/animals', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingId, ...payload }),
          })
        : await fetch('/api/animals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'فشل الحفظ')
      }

      setShowDialog(false)
      fetchAnimals()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحيوان؟')) return
    try {
      const res = await fetch(`/api/animals?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل الحذف')
      fetchAnimals()
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الحيوانات..."
            className="pr-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" onClick={fetchAnimals} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={openNew} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" /> إضافة حيوان
          </Button>
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-red-500">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchAnimals}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(a => (
            <Card key={a.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardContent className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 shrink-0 bg-muted rounded-full flex items-center justify-center text-xl">
                    {a.icon || '🐾'}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-sm truncate">{a.nameAr}</h3>
                    <p className="text-xs text-muted-foreground truncate">{a.nameEn}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(a)}>
                    <Pencil className="w-3.5 h-3.5 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-10 text-center text-muted-foreground border rounded-lg border-dashed">
              لا توجد حيوانات مطابقة.
            </div>
          )}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'تعديل حيوان' : 'إضافة حيوان'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>الاسم بالعربية <span className="text-red-500">*</span></Label>
              <Input
                value={form.nameAr}
                onChange={e => setForm({ ...form, nameAr: e.target.value })}
                dir="rtl"
              />
            </div>
            <div className="grid gap-2">
              <Label>الاسم بالإنجليزية <span className="text-red-500">*</span></Label>
              <Input
                value={form.nameEn}
                onChange={e => setForm({ ...form, nameEn: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="grid gap-2">
              <Label>أيقونة (إيموجي)</Label>
              <Input
                value={form.icon}
                onChange={e => setForm({ ...form, icon: e.target.value })}
                placeholder="مثال: 🐫"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving || !form.nameAr || !form.nameEn}>
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
