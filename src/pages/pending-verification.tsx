import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function PendingVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Application Submitted
            </h2>
            <p className="mt-4 text-sm text-gray-600">
              Thank you for your interest in joining FeedAll. Your application is currently under
              review by our team. We will notify you via email once your account has been verified.
            </p>
            <p className="mt-4 text-sm text-gray-600">
              This process typically takes 1-2 business days. If you have any questions, please
              don't hesitate to contact our support team.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
