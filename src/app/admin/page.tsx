import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { FaUsers, FaBoxOpen, FaChartLine, FaExclamationTriangle } from 'react-icons/fa'

export default async function AdminDashboard() {
  const supabase = createServerComponentClient({ cookies })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: totalUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })

  const { data: activeUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('is_active', true)

  const stats = [
    {
      name: 'Total Users',
      value: totalUsers?.length || 0,
      icon: <FaUsers className="w-8 h-8 text-white" />,
      bgColor: 'bg-blue-500',
    },
    {
      name: 'Active Users',
      value: activeUsers?.length || 0,
      icon: <FaChartLine className="w-8 h-8 text-white" />,
      bgColor: 'bg-green-500',
    },
    {
      name: 'Total Inventory',
      value: '1,234',
      icon: <FaBoxOpen className="w-8 h-8 text-white" />,
      bgColor: 'bg-purple-500',
    },
    {
      name: 'Alerts',
      value: '3',
      icon: <FaExclamationTriangle className="w-8 h-8 text-white" />,
      bgColor: 'bg-red-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white p-6 shadow"
          >
            <div className={`absolute right-0 top-0 h-full w-24 ${stat.bgColor}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Users Table */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {profiles?.slice(0, 5).map((profile) => (
                <tr key={profile.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {profile.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profile.is_admin ? 'Admin' : 'User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        profile.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
