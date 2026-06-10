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
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'

interface Clinic {
  id: string
  clinicName: string
  clinicNameAr: string | null
  taxNumber: string | null
  commercialRegister: string | null
  contactName: string | null
  contactNameAr: string | null
  phone: string
  email: string | null
  address: string | null
  addressAr: string | null
  city: string | null
  cityAr: string | null
  active: boolean
  _count: { samples: number; invoices: number; pets: number }
}

export function ClinicsView() {
  const { t } = useLanguage()
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Clinic | null>(null)

  const [form, setForm] = useState({
    clinicNameAr: '', taxNumber: '', commercialRegister: '',
    contactNameAr: '', phone: '', email: '',
    addressAr: '', cityAr: '',
  })

  const fetchClinics = () => {
    fetch('/api/clinics').then(r => r.json()).then(d => { 
      // Handle array or wrapped object pagination safely
      setClinics(d.data || d || [])
      setLoading(false) 
    })
  }
  useEffect(() => { fetchClinics() }, [])

  const filtered = clinics.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (c.clinicNameAr || '').includes(q) || (c.clinicName || '').toLowerCase().includes(q) || (c.cityAr || '').includes(q)
  })

  const openNew = () => {
    setEditing(null)
    setForm({ clinicNameAr: '', taxNumber: '', commercialRegister: '', contactNameAr: '', phone: '', email: '', addressAr: '', cityAr: '' })
    setShowDialog(true)
  }

  const openEdit = (c: Clinic) => {
    setEditing(c)
    setForm({
      clinicNameAr: c.clinicNameAr || '', taxNumber: c.taxNumber || '',
      commercialRegister: c.commercialRegister || '', contactNameAr: c.contactNameAr || '',
      phone: c.phone, email: c.email || '', addressAr: c.addressAr || '',
      cityAr: c.cityAr || '',
    })
    setShowDialog(true)
  }

  const handleSave = async () => {
    const payload = {
      clinicName: form.clinicNameAr,
      clinicNameAr: form.clinicNameAr,
      contactName: form.contactNameAr,
      contactNameAr: form.contactNameAr,
      phone: form.phone,
      email: form.email,
      taxNumber: form.taxNumber,
      commercialRegister: form.commercialRegister,
      address: form.addressAr,
      addressAr: form.addressAr,
      city: form.cityAr,
      cityAr: form.cityAr
    }

    if (editing) {
      await fetch('/api/clinics', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...payload }),
      })
    } else {
      await fetch('/api/clinics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, active: true }),
      })
    }
    setShowDialog(false)
    fetchClinics()
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه العيادة نهائياً؟')) {
      // 💡 Fixed: Pass ID as a query param so route.ts's searchParams parses it correctly!
      await fetch(`/api/clinics?id=${id}`, {
        method: 'DELETE',
      })
      fetchClinics()
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث العيادات..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Button onClick={openNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 ml-2" /> إضافة عيادة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-start p-3 font-medium text-muted-foreground">الاسم</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">جهة الاتصال</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الهاتف</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">البريد</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">المدينة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الرقم الضريبي</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">العينات</th>
                  <th className="text-center p-3 font-medium text-muted-foreground w-24">خيارات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{c.clinicNameAr || c.clinicName}</td>
                    <td className="p-3 text-xs">{c.contactNameAr || c.contactName || '-'}</td>
                    <td className="p-3 text-xs font-mono">{c.phone}</td>
                    <td className="p-3 text-xs">{c.email || '-'}</td>
                    <td className="p-3 text-xs">{c.cityAr || c.city || '-'}</td>
                    <td className="p-3 text-xs font-mono">{c.taxNumber || '-'}</td>
                    <td className="p-3 text-center">{c._count?.samples || 0}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEdit(c)}
                          title="تعديل العيادة"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(c.id)}
                          title="حذف العيادة"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
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

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل العيادة' : 'إضافة عيادة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>اسم العيادة</Label>
              <Input value={form.clinicNameAr} onChange={e => setForm({ ...form, clinicNameAr: e.target.value })} dir="rtl" placeholder="عيادة الأمل البيطرية" />
            </div>
            <div>
              <Label>جهة الاتصال (اسم المسؤول)</Label>
              <Input value={form.contactNameAr} onChange={e => setForm({ ...form, contactNameAr: e.target.value })} dir="rtl" placeholder="د. محمد العتيبي" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الهاتف</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="05xxxxxxxx" />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="clinic@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الرقم الضريبي</Label>
                <Input value={form.taxNumber} onChange={e => setForm({ ...form, taxNumber: e.target.value })} placeholder="الرقم الضريبي" />
              </div>
              <div>
                <Label>السجل التجاري</Label>
                <Input value={form.commercialRegister} onChange={e => setForm({ ...form, commercialRegister: e.target.value })} placeholder="رقم السجل" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>المدينة</Label>
                <Input value={form.cityAr} onChange={e => setForm({ ...form, cityAr: e.target.value })} dir="rtl" placeholder="الرياض" />
              </div>
              <div>
                <Label>العنوان</Label>
                <Input value={form.addressAr} onChange={e => setForm({ ...form, addressAr: e.target.value })} dir="rtl" placeholder="اسم الحي" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={!form.clinicNameAr || !form.phone}>{editing ? 'تحديث' : 'إنشاء'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}