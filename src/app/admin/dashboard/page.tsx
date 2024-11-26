import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { FaUsers, FaHandHoldingHeart, FaTruck, FaBuilding } from 'react-icons/fa';
import { MdVolunteerActivism } from 'react-icons/md';
import StatsCard from '@/components/admin/StatsCard';
import UserActivityChart from '@/components/admin/UserActivityChart';
import RecentUsers from '@/components/admin/RecentUsers';

export default async function AdminDashboard() {
  const supabase = createServerComponentClient({ cookies: () => cookies() });

  // Fetch user statistics
  const { data: userStats } = await supabase
    .from('profiles')
    .select('roles, is_donor, is_admin', { count: 'exact' });

  const stats = [
    {
      name: 'Total Users',
      value: userStats?.length || 0,
      icon: FaUsers,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      name: 'Donors',
      value: userStats?.filter((user) => user.is_donor).length || 0,
      icon: FaHandHoldingHeart,
      color: 'text-primary-600 dark:text-primary-400',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
    },
    {
      name: 'Service Providers',
      value:
        userStats?.filter((user) =>
          user.roles?.includes('SERVICE_PROVIDER')
        ).length || 0,
      icon: FaBuilding,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      name: 'Logistics Partners',
      value:
        userStats?.filter((user) =>
          user.roles?.includes('LOGISTICS')
        ).length || 0,
      icon: FaTruck,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      name: 'Volunteers',
      value:
        userStats?.filter((user) =>
          user.roles?.includes('VOLUNTEER')
        ).length || 0,
      icon: MdVolunteerActivism,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor and manage your platform's performance and user base.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.name}
            name={stat.name}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Activity Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Activity
          </h3>
          <UserActivityChart />
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Users
          </h3>
          <RecentUsers />
        </div>
      </div>
    </div>
  );
}
