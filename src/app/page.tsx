'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LanguageProvider } from '@/lib/language-context';
import { AppLayout } from '@/components/app-layout';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 💡 If the authentication check finishes and no user is found, redirect to login cleanly
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // While checking the user's login status, show a clean loading screen
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-500 font-medium">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render your actual veterinary system layout safely!
  if (status === 'authenticated') {
    return (
      <LanguageProvider>
        <AppLayout />
      </LanguageProvider>
    );
  }

  return null;
}