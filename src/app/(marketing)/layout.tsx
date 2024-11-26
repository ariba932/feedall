import Link from 'next/link';
import { FaSignInAlt } from 'react-icons/fa';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* Sign In Button */}
      <div className="absolute top-4 right-4 z-50">
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg"
        >
          <FaSignInAlt className="w-5 h-5" />
          <span className="hidden sm:inline">Sign In</span>
        </Link>
      </div>
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        {children}
      </div>
    </div>
  );
}
