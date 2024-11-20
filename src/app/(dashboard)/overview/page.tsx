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
      label: 'Deliveries',
      value: '890',
      icon: <FaTruck className="w-6 h-6" />,
      change: '+7.8%',
    },
    {
      label: 'Verification Rate',
      value: '98%',
      icon: <MdVerifiedUser className="w-6 h-6" />,
      change: '+2.1%',
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-background-light dark:bg-background-dark">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Dashboard Overview</h1>
        <button className="px-4 py-2 bg-primary-light dark:bg-primary text-white rounded-md hover:bg-primary dark:hover:bg-primary-dark transition-colors">
          New Donation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="text-primary-light dark:text-primary">{stat.icon}</div>
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</h3>
              <p className="text-2xl font-semibold text-text-light dark:text-text-dark">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">Recent Activity</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Add your activity list here */}
          <div className="p-4 text-text-light dark:text-text-dark">
            Coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
