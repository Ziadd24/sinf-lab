'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { AppSidebar, type NavItem } from '@/components/app-sidebar'
import { DashboardView } from '@/components/dashboard'
import { SamplesView } from '@/components/samples-view'
import { ResultsView } from '@/components/results-view'
import { ClinicsView } from '@/components/clinics-view'
import { PatientsView } from '@/components/patients-view'
import { InvoicesView } from '@/components/invoices-view'
import { TestCatalogView } from '@/components/test-catalog-view'
import { ReportView } from '@/components/report-view'
import { QuickReportWizard } from '@/components/quick-report-wizard'
import { Bell, Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const navTitles: Record<NavItem, string> = {
  dashboard: 'لوحة التحكم',
  samples: 'عينات المختبر',
  results: 'نتائج الفحوصات',
  reports: 'التقارير الطبية',
  'quick-report': 'تقرير سريع',
  clinics: 'العيادات',
  patients: 'المرضى',
  invoices: 'الفواتير',
  tests: 'دليل الفحوصات',
}

export function AppLayout() {
  const { t } = useLanguage()
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard': return <DashboardView />
      case 'samples': return <SamplesView />
      case 'results': return <ResultsView />
      case 'reports': return <ReportView />
      case 'quick-report': return <QuickReportWizard />
      case 'clinics': return <ClinicsView />
      case 'patients': return <PatientsView />
      case 'invoices': return <InvoicesView />
      case 'tests': return <TestCatalogView />
    }
  }

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      <AppSidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b bg-card flex items-center gap-4 px-6 shrink-0">
          <h1 className="text-lg font-semibold">{navTitles[activeNav]}</h1>
          <div className="flex-1" />
          <div className="relative w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t('Search...', 'بحث...')} className="pr-9 h-9" />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <div className="flex items-center gap-2 mr-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium leading-tight">{t('Lab Admin', 'مدير المختبر')}</p>
              <p className="text-[10px] text-muted-foreground">{t('SINF-VET Lab', 'مختبر SINF-VET')}</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}