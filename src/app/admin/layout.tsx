import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaUsers, FaBoxOpen, FaChartBar, FaCog } from 'react-icons/fa'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard/overview')
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/admin" className="text-xl font-bold text-indigo-600">
            Admin Panel
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaChartBar className="w-5 h-5 text-gray-500" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaUsers className="w-5 h-5 text-gray-500" />
            <span>Users</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaBoxOpen className="w-5 h-5 text-gray-500" />
            <span>Inventory</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaCog className="w-5 h-5 text-gray-500" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="h-16 bg-white shadow-sm">
          <div className="h-full px-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
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
  )
}
