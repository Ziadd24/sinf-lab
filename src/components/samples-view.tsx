'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Search, Eye } from 'lucide-react'

interface Sample {
  id: string
  barcode: string
  petId: string
  clinicId: string | null
  invoiceId: string | null
  referringDoctor: string | null
  referringDoctorAr: string | null
  testIds: string
  status: string
  priority: string
  notes: string | null
  collectedAt: string
  completedAt: string | null
  pet: {
    id: string
    name: string
    nameAr: string | null
    species: { nameEn: string; nameAr: string; icon: string | null }
    clinic: { clinicName: string; clinicNameAr: string | null } | null
  }
  clinic: { clinicName: string; clinicNameAr: string | null } | null
  invoice: { invoiceNumber: string } | null
  results: { id: string; resultValue: string; isPanic: boolean; catalog: { testNameEn: string; testNameAr: string; minNormal: number | null; maxNormal: number | null; unit: string | null } }[]
}

interface Pet {
  id: string; name: string; nameAr: string | null; species: { nameEn: string; nameAr: string }
}
interface TestItem {
  id: string; testCode: string; testNameEn: string; testNameAr: string; price: number
}
interface ClinicItem {
  id: string; clinicName: string; clinicNameAr: string | null
}

export function SamplesView() {
  const { t } = useLanguage()
  const [samples, setSamples] = useState<Sample[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [tests, setTests] = useState<TestItem[]>([])
  const [clinics, setClinics] = useState<ClinicItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)

  // New sample form
  const [formPetId, setFormPetId] = useState('')
  const [formClinicId, setFormClinicId] = useState('')
  const [formDoctor, setFormDoctor] = useState('')
  const [formDoctorAr, setFormDoctorAr] = useState('')
  const [formTestIds, setFormTestIds] = useState<string[]>([])
  const [formPriority, setFormPriority] = useState('Normal')
  const [formNotes, setFormNotes] = useState('')

  const fetchData = () => {
    Promise.all([
      fetch('/api/samples').then(r => r.json()),
      fetch('/api/pets').then(r => r.json()),
      fetch('/api/tests').then(r => r.json()),
      fetch('/api/clinics').then(r => r.json()),
    ]).then(([s, p, te, c]) => {
      setSamples(s); setPets(p); setTests(te); setClinics(c); setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [])

  const filtered = samples.filter(s => {
    if (statusFilter !== 'All' && s.status !== statusFilter) return false
    if (priorityFilter !== 'All' && s.priority !== priorityFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        s.barcode.toLowerCase().includes(q) ||
        s.pet.name.toLowerCase().includes(q) ||
        s.pet.species.nameEn.toLowerCase().includes(q) ||
        (s.clinic?.clinicName || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const statusBadge: Record<string, { ar: string; cls: string }> = {
    Collected: { ar: 'تم الجمع', cls: 'bg-gray-100 text-gray-700' },
    In_Progress: { ar: 'قيد التنفيذ', cls: 'bg-amber-100 text-amber-700' },
    Completed: { ar: 'مكتمل', cls: 'bg-green-100 text-green-700' },
    Approved: { ar: 'معتمد', cls: 'bg-[#d1e3f5] text-[#053e76]' },
  }
  const priorityBadge: Record<string, { ar: string; cls: string }> = {
    Normal: { ar: 'عادي', cls: 'bg-gray-100 text-gray-600' },
    Urgent: { ar: 'عاجل', cls: 'bg-orange-100 text-orange-700' },
    STAT: { ar: 'طارئ', cls: 'bg-red-100 text-red-700' },
  }

  const handleCreate = async () => {
    const pet = pets.find(p => p.id === formPetId)
    const barcode = `SMP-${new Date().getFullYear()}-${String(samples.length + 1).padStart(4, '0')}`
    await fetch('/api/samples', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barcode,
        petId: formPetId,
        clinicId: formClinicId || pet?.species?.nameEn ? undefined : null,
        referringDoctor: formDoctor,
        referringDoctorAr: formDoctorAr,
        testIds: formTestIds.join(','),
        priority: formPriority,
        notes: formNotes,
      }),
    })
    setShowNewDialog(false)
    resetForm()
    fetchData()
  }

  const resetForm = () => {
    setFormPetId(''); setFormClinicId(''); setFormDoctor(''); setFormDoctorAr('')
    setFormTestIds([]); setFormPriority('Normal'); setFormNotes('')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث العينات..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">كل الحالات</SelectItem>
                <SelectItem value="Collected">تم الجمع</SelectItem>
                <SelectItem value="In_Progress">قيد التنفيذ</SelectItem>
                <SelectItem value="Completed">مكتمل</SelectItem>
                <SelectItem value="Approved">معتمد</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="الأولوية" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">كل الأولويات</SelectItem>
                <SelectItem value="Normal">عادي</SelectItem>
                <SelectItem value="Urgent">عاجل</SelectItem>
                <SelectItem value="STAT">طارئ</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowNewDialog(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 ml-2" /> عينة جديدة
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
                  <th className="text-start p-3 font-medium text-muted-foreground">الباركود</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الحيوان</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">النوع</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">العيادة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الطبيب</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الحالة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الأولوية</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">التاريخ</th>
                  <th className="text-start p-3 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sample => {
                  const sb = statusBadge[sample.status] || statusBadge.Collected
                  const pb = priorityBadge[sample.priority] || priorityBadge.Normal
                  return (
                    <tr key={sample.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-xs">{sample.barcode}</td>
                      <td className="p-3">{sample.pet.nameAr || sample.pet.name}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1.5">
                          {sample.pet.species.icon && <span>{sample.pet.species.icon}</span>}
                          {sample.pet.species.nameAr}
                        </span>
                      </td>
                      <td className="p-3 text-xs">{sample.clinic ? (sample.clinic.clinicNameAr || sample.clinic.clinicName) : '-'}</td>
                      <td className="p-3 text-xs">{sample.referringDoctorAr || sample.referringDoctor || '-'}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sb.cls}`}>{sb.ar}</span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${pb.cls}`}>{pb.ar}</span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(sample.collectedAt).toLocaleDateString('ar-SA')}</td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedSample(sample); setShowDetailDialog(true) }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Sample Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>عينة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الحيوان</Label>
              <Select value={formPetId} onValueChange={setFormPetId}>
                <SelectTrigger><SelectValue placeholder="اختر الحيوان..." /></SelectTrigger>
                <SelectContent>
                  {pets.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nameAr || p.name} ({p.species.nameAr})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>العيادة</Label>
              <Select value={formClinicId} onValueChange={setFormClinicId}>
                <SelectTrigger><SelectValue placeholder="اختر العيادة..." /></SelectTrigger>
                <SelectContent>
                  {clinics.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.clinicNameAr || c.clinicName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الطبيب (إنجليزي)</Label>
                <Input value={formDoctor} onChange={e => setFormDoctor(e.target.value)} />
              </div>
              <div>
                <Label>الطبيب (عربي)</Label>
                <Input value={formDoctorAr} onChange={e => setFormDoctorAr(e.target.value)} dir="rtl" />
              </div>
            </div>
            <div>
              <Label>الفحوصات</Label>
              <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                {tests.filter(te => te.active !== false).map(te => (
                  <label key={te.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formTestIds.includes(te.id)}
                      onChange={e => {
                        if (e.target.checked) setFormTestIds([...formTestIds, te.id])
                        else setFormTestIds(formTestIds.filter(i => i !== te.id))
                      }}
                      className="rounded"
                    />
                    <span>{te.testNameAr}</span>
                    <span className="mr-auto text-xs text-muted-foreground">{te.price} ر.س</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>الأولوية</Label>
              <Select value={formPriority} onValueChange={setFormPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">عادي</SelectItem>
                  <SelectItem value="Urgent">عاجل</SelectItem>
                  <SelectItem value="STAT">طارئ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Input value={formNotes} onChange={e => setFormNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>إلغاء</Button>
            <Button onClick={handleCreate} disabled={!formPetId || formTestIds.length === 0}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sample Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل العينة - {selectedSample?.barcode}</DialogTitle>
          </DialogHeader>
          {selectedSample && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">الحيوان</p>
                  <p className="font-medium">{selectedSample.pet.nameAr || selectedSample.pet.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">النوع</p>
                  <p className="font-medium">{selectedSample.pet.species.nameAr}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">العيادة</p>
                  <p className="font-medium">{selectedSample.clinic ? (selectedSample.clinic.clinicNameAr || '') : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">الطبيب</p>
                  <p className="font-medium">{selectedSample.referringDoctorAr || selectedSample.referringDoctor || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">الحالة</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${(statusBadge[selectedSample.status] || statusBadge.Collected).cls}`}>
                    {(statusBadge[selectedSample.status] || statusBadge.Collected).ar}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">الأولوية</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${(priorityBadge[selectedSample.priority] || priorityBadge.Normal).cls}`}>
                    {(priorityBadge[selectedSample.priority] || priorityBadge.Normal).ar}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">تاريخ الجمع</p>
                  <p className="font-medium">{new Date(selectedSample.collectedAt).toLocaleString('ar-SA')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">تاريخ الإكمال</p>
                  <p className="font-medium">{selectedSample.completedAt ? new Date(selectedSample.completedAt).toLocaleString('ar-SA') : '-'}</p>
                </div>
              </div>
              {selectedSample.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">ملاحظات</p>
                  <p className="font-medium">{selectedSample.notes}</p>
                </div>
              )}
              {selectedSample.results.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">النتائج</p>
                  <table className="w-full text-sm border rounded-lg">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-start p-2">الفحص</th>
                        <th className="text-start p-2">النتيجة</th>
                        <th className="text-start p-2">النطاق المرجعي</th>
                        <th className="text-start p-2">علامة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSample.results.map(r => (
                        <tr key={r.id} className={`border-t ${r.isPanic ? 'bg-red-50' : ''}`}>
                          <td className="p-2">{r.catalog.testNameAr}</td>
                          <td className={`p-2 font-mono font-medium ${r.isPanic ? 'text-red-600' : ''}`}>{r.resultValue}</td>
                          <td className="p-2 text-muted-foreground">
                            {r.catalog.minNormal !== null && r.catalog.maxNormal !== null
                              ? `${r.catalog.minNormal} - ${r.catalog.maxNormal} ${r.catalog.unit || ''}`
                              : '-'}
                          </td>
                          <td className="p-2">
                            {r.isPanic && <Badge variant="destructive" className="text-xs">حرج</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
