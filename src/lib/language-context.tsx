'use client'

import React, { createContext, useContext, useCallback } from 'react'

interface LanguageContextType {
  t: (en: string, ar: string) => string
  isRtl: boolean
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType>({
  t: (_en: string, ar: string) => ar,
  isRtl: true,
  dir: 'rtl',
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const t = useCallback((_en: string, ar: string) => ar, [])
  const isRtl = true
  const dir = 'rtl' as const

  return (
    <LanguageContext.Provider value={{ t, isRtl, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
