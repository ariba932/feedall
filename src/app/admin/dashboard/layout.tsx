'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChartBar, FaUsers, FaUserShield, FaCog } from 'react-icons/fa';
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Overview',
    href: '/admin/dashboard',
    icon: FaChartBar,
  },
  {
    name: 'User Management',
    href: '/admin/dashboard/users',
    icon: FaUsers,
  },
  {
    name: 'Role Management',
    href: '/admin/dashboard/roles',
    icon: FaUserShield,
  },
  {
    name: 'Settings',
    href: '/admin/dashboard/settings',
    icon: FaCog,
  },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-200 ease-in-out',
          {
            '-translate-x-full': !sidebarOpen,
            'translate-x-0': sidebarOpen,
          }
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <RiMenuFoldLine className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-150',
                  {
                    'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400':
                      isActive,
                    'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700':
                      !isActive,
                  }
                )}
              >
                <item.icon
                  className={cn('mr-4 flex-shrink-0 h-6 w-6', {
                    'text-primary-600 dark:text-primary-400': isActive,
                    'text-gray-400 group-hover:text-gray-500 dark:text-gray-300':
                      !isActive,
                  })}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div
        className={cn('transition-all duration-200 ease-in-out', {
          'ml-64': sidebarOpen,
          'ml-0': !sidebarOpen,
        })}
      >
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <RiMenuUnfoldLine className="w-6 h-6" />
            </button>
          )}
        </div>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
