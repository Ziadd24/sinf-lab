import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
});

// Clean standard metadata object
export const metadata: Metadata = {
  title: "SINF-VET | نظام إدارة المختبر البيطري",
  description: "نظام إدارة المختبر البيطري المهني للسوق السعودي. إدارة العينات والنتائج والعيادات والمرضى والفواتير ودليل الفحوصات.",
  keywords: ["SINF-VET", "بيطري", "مختبر", "إدارة", "السعودية"],
  authors: [{ name: "SINF-VET Team" }],
  icons: {
    icon: "/logo.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SINF-VET",
  },
  formatDetection: {
    telephone: false,
  },
};

// Modern Next.js configuration for viewports and themes
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1e40af",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SINF-VET" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`${notoSansArabic.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>

        {/* Disabled Service Worker script to resolve the authentication redirect collision 
          causing infinite rapid refresh loops in the development environment.
        */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').then((reg) => {
                  console.log('Service Worker registered:', reg);
                }).catch((err) => {
                  console.log('Service Worker registration failed:', err);
                });
              }
            `,
          }}
        /> 
        */}
      </body>
    </html>
  );
}