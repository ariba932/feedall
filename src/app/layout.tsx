import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext';
import ClientProviders from '@/components/providers/ClientProviders';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FeedAll - Connecting Food Surplus with Those in Need',
  description: 'FeedAll is a platform connecting food donors with verified recipients, making food donation simple, secure, and impactful.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <body className={inter.className}>
        <ThemeProvider>
          <ClientProviders />
          {children}
          <Footer />
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
