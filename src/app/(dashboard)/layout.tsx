import Link from 'next/link';
import { FaHome, FaBoxOpen, FaUsers, FaCog } from 'react-icons/fa';
import { BiDonateHeart } from 'react-icons/bi';
import { redirect } from 'next/navigation';

// Redirect root dashboard path to overview
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if we're at the root dashboard path and redirect if needed
  if (typeof window !== 'undefined' && window.location.pathname === '/dashboard') {
    redirect('/dashboard/overview');
  }

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="text-xl font-bold text-primary-light dark:text-primary">FeedAll</Link>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { label: 'Overview', href: '/dashboard/overview', icon: <FaHome className="w-5 h-5" /> },
            { label: 'Donations', href: '/dashboard/donations', icon: <BiDonateHeart className="w-5 h-5" /> },
            { label: 'Inventory', href: '/dashboard/inventory', icon: <FaBoxOpen className="w-5 h-5" /> },
            { label: 'Recipients', href: '/dashboard/recipients', icon: <FaUsers className="w-5 h-5" /> },
            { label: 'Settings', href: '/dashboard/settings', icon: <FaCog className="w-5 h-5" /> },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-md text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="h-full px-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-text-light dark:text-text-dark">Welcome back!</h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FaCog className="w-5 h-5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-primary-light dark:bg-primary"></div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
