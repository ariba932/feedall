import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ClientProviders from '@/components/providers/ClientProviders';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FeedAll - Blockchain-Powered Food Donations',
  description: 'Join our blockchain-powered platform to make food donations transparent, traceable, and impactful.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-900 transition-colors duration-200`} suppressHydrationWarning>
        <ThemeProvider>
          <ClientProviders />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
