import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { GlobalProctoringCleanup } from '@/components/GlobalProctoringCleanup'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FairShot - Revolutionary Hiring Platform',
  description: 'Test real-world skills, not rote memorization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        <GlobalProctoringCleanup />
      </body>
    </html>
  )
}
