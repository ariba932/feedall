import { FaBoxOpen, FaUsers, FaTruck } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';

export default function DashboardOverviewPage() {
  const stats = [
    {
      label: 'Total Donations',
      value: '1,234',
      icon: <FaBoxOpen className="w-6 h-6" />,
      change: '+12.3%',
    },
    {
      label: 'Active Recipients',
      value: '567',
      icon: <FaUsers className="w-6 h-6" />,
      change: '+5.4%',
    },
    {
      label: 'Deliveries Made',
      value: '890',
      icon: <FaTruck className="w-6 h-6" />,
      change: '+8.1%',
    },
    {
      label: 'Verified Partners',
      value: '45',
      icon: <MdVerifiedUser className="w-6 h-6" />,
      change: '+2.3%',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-lg bg-white p-6 shadow"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                {stat.icon}
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.label}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Donations */}
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Recent Donations
            </h3>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Coming soon...</p>
            </div>
          </div>
        </div>

        {/* Active Recipients */}
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Active Recipients
            </h3>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
