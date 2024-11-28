'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiHome, FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Handle hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { label: 'Dashboard', icon: FiHome, href: '/dashboard/donor' },
    { label: 'Profile', icon: FiUser, href: '/dashboard/profile' },
  ];

  // Determine if we're on mobile based on window width
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 transform transition-transform duration-200 ease-in-out z-30 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${isMobile ? 'w-64' : 'w-64'} shadow-lg`}
      >
        {/* Logo and close button container */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
            FeedAll
          </div>
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiX className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="mt-6 px-4">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-2 transition-colors"
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </a>
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-2 transition-colors"
          >
            <FiLogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div
        className={`transition-margin duration-200 ease-in-out ${
          isSidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* Top navigation bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiMenu className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'dark' ? (
                  <FiSun className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                ) : (
                  <FiMoon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4">{children}</main>
      </div>

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
