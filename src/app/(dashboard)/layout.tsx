import Link from 'next/link';
import { FaHome, FaBoxOpen, FaUsers, FaCog } from 'react-icons/fa';
import { BiDonateHeart } from 'react-icons/bi';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  if (profile?.is_admin) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard/overview" className="text-xl font-semibold">
            FeedAll
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            href="/dashboard/overview"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FaHome className="w-5 h-5" />
            <span>Overview</span>
          </Link>
          <Link
            href="/dashboard/inventory"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FaBoxOpen className="w-5 h-5" />
            <span>Inventory</span>
          </Link>
          <Link
            href="/dashboard/donations"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <BiDonateHeart className="w-5 h-5" />
            <span>Donations</span>
          </Link>
          <Link
            href="/dashboard/recipients"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FaUsers className="w-5 h-5" />
            <span>Recipients</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FaCog className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <header className="h-16 bg-white shadow-sm">
          <div className="h-full px-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
