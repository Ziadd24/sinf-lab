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
import { Plus, Search, DollarSign, Eye } from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  clinicId: string
  subTotal: number
  vatRate: number
  vatAmount: number
  totalAmount: number
  paidAmount: number
  status: string
  dueDate: string | null
  notes: string | null
  clinic: { clinicName: string; clinicNameAr: string | null }
  _count: { samples: number }
}

interface ClinicItem { id: string; clinicName: string; clinicNameAr: string | null }

export function InvoicesView() {
  const { t } = useLanguage()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clinics, setClinics] = useState<ClinicItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')

  const [form, setForm] = useState({
    clinicId: '', subTotal: '', vatRate: '0.15', notes: '', dueDate: '',
  })

  const fetchData = () => {
    Promise.all([
      fetch('/api/invoices').then(r => r.json()),
      fetch('/api/clinics').then(r => r.json()),
    ]).then(([i, c]) => { setInvoices(i); setClinics(c); setLoading(false) })
  }
  useEffect(() => { fetchData() }, [])

  const filtered = invoices.filter(inv => {
    if (statusFilter !== 'All' && inv.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return inv.invoiceNumber.toLowerCase().includes(q) || inv.clinic.clinicName.toLowerCase().includes(q)
    }
    return true
  })

  const statusBadge: Record<string, { ar: string; cls: string }> = {
    Paid: { ar: 'مدفوعة', cls: 'bg-green-100 text-green-700' },
    Partially_Paid: { ar: 'جزئي', cls: 'bg-amber-100 text-amber-700' },
    Unpaid: { ar: 'غير مدفوعة', cls: 'bg-red-100 text-red-700' },
  }

  const handleCreate = async () => {
    const sub = parseFloat(form.subTotal) || 0
    const vat = parseFloat(form.vatRate) || 0.15
    const vatAmount = sub * vat
    const total = sub + vatAmount
    const count = invoices.length + 1
    await fetch('/api/invoices', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`,
        clinicId: form.clinicId,
        subTotal: sub,
        vatRate: vat,
        vatAmount,
        totalAmount: total,
        paidAmount: 0,
        status: 'Unpaid',
        notes: form.notes,
        dueDate: form.dueDate || null,
      }),
    })
    setShowCreateDialog(false)
    setForm({ clinicId: '', subTotal: '', vatRate: '0.15', notes: '', dueDate: '' })
    fetchData()
  }

  const handlePayment = async () => {
    if (!selectedInvoice) return
    const amount = parseFloat(paymentAmount) || 0
    const newPaid = selectedInvoice.paidAmount + amount
    let newStatus = 'Unpaid'
    if (newPaid >= selectedInvoice.totalAmount) newStatus = 'Paid'
    else if (newPaid > 0) newStatus = 'Partially_Paid'

    await fetch('/api/invoices', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedInvoice.id, paidAmount: newPaid, status: newStatus }),
    })
    setShowPaymentDialog(false)
    setPaymentAmount('')
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
              <Input placeholder="بحث الفواتير..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">كل الحالات</SelectItem>
                <SelectItem value="Paid">مدفوعة</SelectItem>
                <SelectItem value="Partially_Paid">جزئي</SelectItem>
                <SelectItem value="Unpaid">غير مدفوعة</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 ml-2" /> إنشاء فاتورة
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
                  <th className="text-start p-3 font-medium text-muted-foreground">رقم الفاتورة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">العيادة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">المجموع الفرعي</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">ضريبة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الإجمالي</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">المدفوع</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">الحالة</th>
                  <th className="text-start p-3 font-medium text-muted-foreground">تاريخ الاستحقاق</th>
                  <th className="text-start p-3 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const sb = statusBadge[inv.status] || statusBadge.Unpaid
                  return (
                    <tr key={inv.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="p-3">{inv.clinic.clinicNameAr || ''}</td>
                      <td className="p-3 font-mono">{inv.subTotal.toLocaleString()} ر.س</td>
                      <td className="p-3 font-mono text-muted-foreground">{inv.vatAmount.toLocaleString()} ر.س</td>
                      <td className="p-3 font-mono font-medium">{inv.totalAmount.toLocaleString()} ر.س</td>
                      <td className="p-3 font-mono">{inv.paidAmount.toLocaleString()} ر.س</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sb.cls}`}>{sb.ar}</span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('ar-SA') : '-'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedInvoice(inv); setShowDetailDialog(true) }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {inv.status !== 'Paid' && (
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedInvoice(inv); setShowPaymentDialog(true) }}>
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إنشاء فاتورة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>العيادة</Label>
              <Select value={form.clinicId} onValueChange={v => setForm({ ...form, clinicId: v })}>
                <SelectTrigger><SelectValue placeholder="اختر العيادة..." /></SelectTrigger>
                <SelectContent>
                  {clinics.map(c => <SelectItem key={c.id} value={c.id}>{c.clinicNameAr || c.clinicName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>المجموع الفرعي (ر.س)</Label>
                <Input type="number" value={form.subTotal} onChange={e => setForm({ ...form, subTotal: e.target.value })} />
              </div>
              <div>
                <Label>نسبة الضريبة</Label>
                <Input type="number" step="0.01" value={form.vatRate} onChange={e => setForm({ ...form, vatRate: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>تاريخ الاستحقاق</Label>
              <Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            {form.subTotal && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex justify-between"><span>المجموع الفرعي:</span><span>{form.subTotal} ر.س</span></div>
                <div className="flex justify-between"><span>الضريبة (15%):</span><span>{(parseFloat(form.subTotal) * 0.15).toFixed(2)} ر.س</span></div>
                <div className="flex justify-between font-bold border-t mt-1 pt-1"><span>الإجمالي:</span><span>{(parseFloat(form.subTotal) * 1.15).toFixed(2)} ر.س</span></div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
            <Button onClick={handleCreate} disabled={!form.clinicId || !form.subTotal}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تسجيل دفعة</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>{selectedInvoice.invoiceNumber}</strong></p>
                <p>الإجمالي: {selectedInvoice.totalAmount.toLocaleString()} ر.س</p>
                <p>المدفوع: {selectedInvoice.paidAmount.toLocaleString()} ر.س</p>
                <p>المتبقي: {(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString()} ر.س</p>
              </div>
              <div>
                <Label>مبلغ الدفعة (ر.س)</Label>
                <Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="0.00" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>إلغاء</Button>
            <Button onClick={handlePayment} disabled={!paymentAmount}>تسجيل الدفعة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل الفاتورة</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">رقم الفاتورة</p><p className="font-mono">{selectedInvoice.invoiceNumber}</p></div>
                <div><p className="text-muted-foreground">العيادة</p><p>{selectedInvoice.clinic.clinicNameAr || ''}</p></div>
                <div><p className="text-muted-foreground">الحالة</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${(statusBadge[selectedInvoice.status] || statusBadge.Unpaid).cls}`}>
                    {(statusBadge[selectedInvoice.status] || statusBadge.Unpaid).ar}
                  </span>
                </div>
                <div><p className="text-muted-foreground">تاريخ الاستحقاق</p><p>{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString('ar-SA') : '-'}</p></div>
              </div>
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span>المجموع الفرعي</span><span>{selectedInvoice.subTotal.toLocaleString()} ر.س</span></div>
                <div className="flex justify-between"><span>ضريبة</span><span>{selectedInvoice.vatAmount.toLocaleString()} ر.س</span></div>
                <div className="flex justify-between font-bold border-t pt-1"><span>الإجمالي</span><span>{selectedInvoice.totalAmount.toLocaleString()} ر.س</span></div>
                <div className="flex justify-between text-green-600"><span>المدفوع</span><span>{selectedInvoice.paidAmount.toLocaleString()} ر.س</span></div>
                <div className="flex justify-between text-red-600"><span>الرصيد</span><span>{(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString()} ر.س</span></div>
              </div>
              {selectedInvoice.notes && <div><p className="text-muted-foreground text-xs">ملاحظات</p><p className="text-sm">{selectedInvoice.notes}</p></div>}
              <div><p className="text-muted-foreground text-xs">العينات المرتبطة</p><p className="text-sm">{selectedInvoice._count.samples}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
