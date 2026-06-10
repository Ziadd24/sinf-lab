'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent } from '@/components/ui/card'
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
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'

interface SpeciesItem { id: string; nameEn: string; nameAr: string; icon: string | null }
interface ClinicItem { id: string; clinicName: string; clinicNameAr: string | null }

interface Pet {
  id: string
  name: string
  nameAr: string | null
  speciesId: string
  breed: string | null
  breedAr: string | null
  birthDate: string | null
  gender: string
  chipNumber: string | null
  ownerName: string | null
  ownerNameAr: string | null
  ownerPhone: string | null
  clinicId: string | null
  species: SpeciesItem
  clinic: ClinicItem | null
  _count: { samples: number }
}

export function PatientsView() {
  const { t } = useLanguage()
  const [pets, setPets] = useState<Pet[]>([])
  const [species, setSpecies] = useState<SpeciesItem[]>([])
  const [clinics, setClinics] = useState<ClinicItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('All')
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Pet | null>(null)

  const [form, setForm] = useState({
    name: '', nameAr: '', speciesId: '', breed: '', breedAr: '',
    gender: 'Unknown', chipNumber: '', ownerName: '', ownerNameAr: '', ownerPhone: '', clinicId: '',
  })

  const fetchData = () => {
    Promise.all([
      fetch('/api/pets').then(r => r.json()),
      fetch('/api/species').then(r => r.json()),
      fetch('/api/clinics').then(r => r.json()),
    ]).then(([p, s, c]) => { setPets(p); setSpecies(s); setClinics(c); setLoading(false) })
  }
  useEffect(() => { fetchData() }, [])

  const filtered = pets.filter(p => {
    if (speciesFilter !== 'All' && p.speciesId !== speciesFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name.toLowerCase().includes(q) || (p.ownerName || '').toLowerCase().includes(q) || (p.breed || '').toLowerCase().includes(q)
    }
    return true
  })

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', nameAr: '', speciesId: '', breed: '', breedAr: '', gender: 'Unknown', chipNumber: '', ownerName: '', ownerNameAr: '', ownerPhone: '', clinicId: '' })
    setShowDialog(true)
  }

  const openEdit = (p: Pet) => {
    setEditing(p)
    setForm({
      name: p.name, nameAr: p.nameAr || '', speciesId: p.speciesId, breed: p.breed || '', breedAr: p.breedAr || '',
      gender: p.gender, chipNumber: p.chipNumber || '', ownerName: p.ownerName || '', ownerNameAr: p.ownerNameAr || '',
      ownerPhone: p.ownerPhone || '', clinicId: p.clinicId || '',
    })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (editing) {
      await fetch('/api/pets', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...form, clinicId: form.clinicId || null }),
      })
    } else {
      await fetch('/api/pets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, clinicId: form.clinicId || null }),
      })
    }
    setShowDialog(false); fetchData()
  }

  const handleDelete = async (id: string) => {
    if (confirm('حذف هذا المريض؟')) {
      await fetch(`/api/pets?id=${id}`, { method: 'DELETE' })
      fetchData()
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  const genderAr = (g: string) => g === 'Male' ? 'ذكر' : g === 'Female' ? 'أنثى' : 'غير معروف'

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث المرضى..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="النوع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">كل الأنواع</SelectItem>
                {species.map(s => <SelectItem key={s.id} value={s.id}>{s.icon} {s.nameAr}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={openNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 ml-2" /> إضافة مريض
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
                  <th className="text-start p-3 font-medium text-muted-foreground">الاسم</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">النوع</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">السلالة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الجنس</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">المالك</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الهاتف</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">العيادة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">العينات</th>
                  <th className="text-start p-3 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{p.nameAr || p.name}</td>
                    <td className="p-3">{p.species.icon} {p.species.nameAr}</td>
                    <td className="p-3 text-xs">{p.breedAr || p.breed || '-'}</td>
                    <td className="p-3 text-xs">{genderAr(p.gender)}</td>
                    <td className="p-3 text-xs">{p.ownerNameAr || p.ownerName || '-'}</td>
                    <td className="p-3 text-xs font-mono">{p.ownerPhone || '-'}</td>
                    <td className="p-3 text-xs">{p.clinic ? (p.clinic.clinicNameAr || '') : '-'}</td>
                    <td className="p-3 text-center">{p._count.samples}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
            <DialogTitle>{editing ? 'تعديل المريض' : 'إضافة مريض'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الاسم (إنجليزي)</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>الاسم (عربي)</Label><Input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} dir="rtl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>النوع</Label>
                <Select value={form.speciesId} onValueChange={v => setForm({ ...form, speciesId: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger>
                  <SelectContent>
                    {species.map(s => <SelectItem key={s.id} value={s.id}>{s.icon} {s.nameAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الجنس</Label>
                <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unknown">غير معروف</SelectItem>
                    <SelectItem value="Male">ذكر</SelectItem>
                    <SelectItem value="Female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>السلالة (إنجليزي)</Label><Input value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} /></div>
              <div><Label>السلالة (عربي)</Label><Input value={form.breedAr} onChange={e => setForm({ ...form, breedAr: e.target.value })} dir="rtl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>المالك (إنجليزي)</Label><Input value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} /></div>
              <div><Label>المالك (عربي)</Label><Input value={form.ownerNameAr} onChange={e => setForm({ ...form, ownerNameAr: e.target.value })} dir="rtl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>هاتف المالك</Label><Input value={form.ownerPhone} onChange={e => setForm({ ...form, ownerPhone: e.target.value })} /></div>
              <div><Label>رقم الشريحة</Label><Input value={form.chipNumber} onChange={e => setForm({ ...form, chipNumber: e.target.value })} /></div>
            </div>
            <div>
              <Label>العيادة</Label>
              <Select value={form.clinicId} onValueChange={v => setForm({ ...form, clinicId: v })}>
                <SelectTrigger><SelectValue placeholder="اختر العيادة..." /></SelectTrigger>
                <SelectContent>
                  {clinics.map(c => <SelectItem key={c.id} value={c.id}>{c.clinicNameAr || c.clinicName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.speciesId}>{editing ? 'تحديث' : 'إنشاء'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
