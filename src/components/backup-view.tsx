'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload, AlertTriangle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react'

export function BackupView() {
  const [downloading, setDownloading] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [restoreResult, setRestoreResult] = useState<{ tests: number; customers: number; reports: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    try {
      const res = await fetch('/api/backup')
      if (!res.ok) throw new Error('فشل إنشاء النسخة الاحتياطية')
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      const match = disposition?.match(/filename="(.+)"/)
      const filename = match?.[1] || `sinf-vet-backup-${new Date().toISOString().slice(0, 10)}.json`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e.message || 'فشل تحميل النسخة الاحتياطية')
    } finally {
      setDownloading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const confirmed = confirm(
      'سيتم استرجاع البيانات من هذا الملف وإضافتها إلى قاعدة البيانات الحالية. السجلات الموجودة بنفس المعرف سيتم تحديثها. هل تريد المتابعة؟'
    )
    if (!confirmed) {
      e.target.value = ''
      return
    }

    setRestoring(true)
    setError(null)
    setRestoreResult(null)
    try {
      const text = await file.text()
      const json = JSON.parse(text)

      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'فشل الاسترجاع')

      setRestoreResult(result.restored)
    } catch (e: any) {
      setError(e.message || 'الملف غير صالح أو تالف')
    } finally {
      setRestoring(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> النسخ الاحتياطي والاستعادة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            يحتوي هذا النظام على قاعدة بيانات محلية واحدة على هذا الجهاز. لحماية بيانات العملاء والتقارير
            من الفقدان (تلف الجهاز، تنسيق القرص، إلخ)، يُنصح بتحميل نسخة احتياطية بشكل دوري وحفظها في مكان آمن
            (فلاش USB، البريد الإلكتروني، أو مجلد سحابي).
          </p>

          {/* Download */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">تحميل نسخة احتياطية</p>
                <p className="text-xs text-muted-foreground mt-0.5">يشمل: دليل الفحوصات، العملاء، وكل التقارير المحفوظة</p>
              </div>
              <Button onClick={handleDownload} disabled={downloading} className="gap-2 shrink-0">
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {downloading ? 'جاري التحميل...' : 'تحميل'}
              </Button>
            </div>
          </div>

          {/* Restore */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">استرجاع من نسخة احتياطية</p>
                <p className="text-xs text-muted-foreground mt-0.5">اختر ملف JSON تم تحميله مسبقاً من هذا النظام</p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={restoring}
                className="gap-2 shrink-0"
              >
                {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {restoring ? 'جاري الاسترجاع...' : 'اختر ملف'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {restoreResult && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  تم الاسترجاع بنجاح — {restoreResult.tests} فحص، {restoreResult.customers} عميل، {restoreResult.reports} تقرير
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              يُنصح بتحميل نسخة احتياطية جديدة بشكل أسبوعي على الأقل، وخصوصاً قبل أي تحديث للنظام أو نقله إلى جهاز آخر.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}