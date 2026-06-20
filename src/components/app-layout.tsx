'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { AppSidebar, type NavItem } from '@/components/app-sidebar'
import { DashboardView } from '@/components/dashboard'
import { QuickReportWizard } from '@/components/quick-report-wizard'
import { PastReportsView } from '@/components/past-reports-view'
import { SettingsView } from '@/components/settings-view'
import { BackupView } from '@/components/backup-view'
import { InvoicesView } from '@/components/invoices-view'
import { Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const navTitles: Record<NavItem, string> = {
  dashboard: 'لوحة التحكم',
  'quick-report': 'تقرير سريع',
  'past-reports': 'سجل التقارير',
  settings: 'الإعدادات',
  invoices: 'الفواتير',
  backup: 'النسخ الاحتياطي',
}

export function AppLayout() {
  const { t } = useLanguage()
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const savedNav = localStorage.getItem('activeNav') as NavItem | null
    if (savedNav && Object.keys(navTitles).includes(savedNav)) {
      setActiveNav(savedNav)
    }
  }, [])

  const handleNavChange = (nav: NavItem) => {
    setActiveNav(nav)
    localStorage.setItem('activeNav', nav)
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard': return <DashboardView />
      case 'quick-report': return <QuickReportWizard />
      case 'past-reports': return <PastReportsView />
      case 'settings': return <SettingsView />
      case 'invoices': return <InvoicesView />
      case 'backup': return <BackupView />
    }
  }

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      <AppSidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b bg-card flex items-center gap-4 px-6 shrink-0 print:hidden">
          <h1 className="text-lg font-semibold">{navTitles[activeNav]}</h1>
          <div className="flex-1" />
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