'use client'

import { LanguageProvider } from '@/lib/language-context'
import { AppLayout } from '@/components/app-layout'

export default function Home() {
  return (
    <LanguageProvider>
      <AppLayout />
    </LanguageProvider>
  )
}
