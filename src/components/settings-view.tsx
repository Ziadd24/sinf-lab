'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TestCatalogView } from '@/components/test-catalog-view'
import { AnimalCatalogView } from '@/components/animal-catalog-view'
import { BundleCatalogView } from '@/components/bundle-catalog-view'
import { Settings, PawPrint, BookOpen, Package } from 'lucide-react'

export function SettingsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">الإعدادات</h2>
          <p className="text-muted-foreground">إدارة النظام والحيوانات ودليل الفحوصات</p>
        </div>
      </div>

      <Tabs defaultValue="animals" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="animals" className="flex items-center gap-2">
            <PawPrint className="w-4 h-4" />
            الحيوانات
          </TabsTrigger>
          <TabsTrigger value="bundles" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            الباقات
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            دليل الفحوصات
          </TabsTrigger>
        </TabsList>
        <TabsContent value="animals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الحيوانات</CardTitle>
              <CardDescription>
                إضافة وتعديل أنواع الحيوانات المتاحة في النظام للتقارير السريعة.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimalCatalogView />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bundles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>باقات الفحوصات</CardTitle>
              <CardDescription>
                تجميع عدة فحوصات في باقة واحدة لتسهيل اختيارها في التقارير السريعة.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BundleCatalogView />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>دليل الفحوصات</CardTitle>
              <CardDescription>
                إدارة قائمة الفحوصات المخبرية وتحديد الأسعار والقيم الطبيعية لكل حيوان.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestCatalogView />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
