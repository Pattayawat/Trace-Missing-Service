import type { Metadata } from 'next'
import { Prompt, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { IncidentProvider } from '@/context/incident-context'
import { AppLayout } from '@/components/layout/app-layout'
import './globals.css'

const prompt = Prompt({ 
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-prompt',
});
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'ระบบติดตามผู้สูญหาย | ศูนย์ประสานงานบรรเทาสาธารณภัย',
  description: 'ระบบติดตามคนหาย ผู้ประสบภัยไม่ทราบตัวตน และผู้เสียชีวิตไม่ทราบตัวตน สำหรับเหตุการณ์ภัยพิบัติหลายเหตุการณ์พร้อมกัน',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${prompt.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <IncidentProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </IncidentProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
