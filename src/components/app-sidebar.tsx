'use client'

import { useLanguage } from '@/lib/language-context'
import {
  LayoutDashboard,
  ClipboardList,
  History,
  BookOpen,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export type NavItem = 'dashboard' | 'quick-report' | 'past-reports' | 'settings' | 'invoices' | 'backup'

interface AppSidebarProps {
  activeNav: NavItem
  onNavChange: (nav: NavItem) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const navItems: { id: NavItem; icon: React.ElementType; labelAr: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, labelAr: 'لوحة التحكم' },
  { id: 'quick-report', icon: ClipboardList, labelAr: 'تقرير سريع' },
  { id: 'past-reports', icon: History, labelAr: 'سجل التقارير' },
  { id: 'invoices', icon: Receipt, labelAr: 'الفواتير' },
  { id: 'settings', icon: Settings, labelAr: 'الإعدادات' },
  { id: 'backup', icon: ShieldCheck, labelAr: 'النسخ الاحتياطي' },
]

export function AppSidebar({
  activeNav,
  onNavChange,
  collapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const { t } = useLanguage()

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar border-sidebar-border transition-all duration-300 border-l'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 h-16 shrink-0', collapsed && 'justify-center')}>
        <div className="flex items-center justify-center shrink-0 py-2">
          {collapsed ? (
            <Image src="/logo.png" alt="SINF-VET" width={36} height={36} className="rounded-lg object-contain" priority />
          ) : (
            <Image src="/logo.png" alt="SINF-VET" width={100} height={100} className="object-contain" priority />
          )}
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeNav === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={cn(
                'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
              title={collapsed ? item.labelAr : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.labelAr}</span>}
            </button>
          )
        })}
      </nav>

      <Separator />

      {/* Collapse Toggle */}
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-2')}
        >
          {collapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <>
              <ChevronRight className="w-4 h-4" />
              <span>{t('Collapse', 'طي')}</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}