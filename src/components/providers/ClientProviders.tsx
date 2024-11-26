'use client';

import ThemeToggle from '@/components/common/ThemeToggle';
import { AuthProvider } from './AuthProvider';

export default function ClientProviders({ children }: { children?: React.ReactNode }) {
  return (
    <AuthProvider>
      <>
        <ThemeToggle />
        {children}
      </>
    </AuthProvider>
  );
}
