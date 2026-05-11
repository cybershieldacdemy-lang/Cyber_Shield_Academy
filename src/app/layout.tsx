import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import CookieConsent from "@/components/compliance/CookieConsent";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#faf6ee',
};

export const metadata: Metadata = {
  title: "أكاديمية الدرع السيبراني | Cyber Shield Academy",
  description: "منصة تعليمية متخصصة في الأمن السيبراني - تعلم حماية الأنظمة والشبكات والبيانات من التهديدات الرقمية",
  keywords: "أمن سيبراني, cybersecurity, تعليم, حماية, اختراق, شبكات, تشفير",
  metadataBase: new URL('https://cybershield.academy'),
  openGraph: {
    title: "أكاديمية الدرع السيبراني | Cyber Shield Academy",
    description: "منصة تعليمية متخصصة في الأمن السيبراني",
    type: 'website',
    locale: 'ar_SA',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Single optimized font load — only needed weights, display=swap for fast LCP */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
