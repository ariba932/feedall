import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function PendingVerificationPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        
        <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Email Sent!
        </h2>
        
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
        
        <div className="mt-6">
          <Link
            href="/auth/login"
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
