'use client';

import { useState } from 'react';
import { FaHeart, FaHistory, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { MdFastfood } from 'react-icons/md';

export default function DonorDashboard() {
  const [userName, setUserName] = useState('Friend');

  const stats = [
    { label: 'Total Donations', value: '0', icon: FaHeart },
    { label: 'Lives Impacted', value: '0', icon: MdFastfood },
    { label: 'Active Donations', value: '0', icon: FaCalendarAlt },
  ];

  const quickActions = [
    {
      title: 'Donate Food',
      description: 'Start a new food donation',
      icon: FaHeart,
      action: () => {},
      color: 'bg-rose-500 dark:bg-rose-600',
    },
    {
      title: 'View History',
      description: 'See your donation history',
      icon: FaHistory,
      action: () => {},
      color: 'bg-blue-500 dark:bg-blue-600',
    },
    {
      title: 'Find Nearby',
      description: 'Locate donation centers',
      icon: FaMapMarkerAlt,
      action: () => {},
      color: 'bg-green-500 dark:bg-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600 rounded-lg text-white p-8">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to FeedAll, {userName}! 👋
        </h1>
        <p className="text-lg opacity-90">
          Thank you for joining our mission to fight hunger and reduce food waste.
          Your generosity makes a difference.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-900 rounded-full">
                <stat.icon className="h-6 w-6 text-rose-500 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-left transform hover:scale-105 transition-transform duration-200 hover:shadow-xl w-full"
            >
              <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Getting Started with FeedAll
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              How to Make Your First Donation
            </h3>
            <ol className="space-y-4 text-gray-600 dark:text-gray-400">
              <li className="flex items-center space-x-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-500 dark:text-rose-400 flex items-center justify-center font-bold">
                  1
                </span>
                <span>Click on "Donate Food" to start a new donation</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-500 dark:text-rose-400 flex items-center justify-center font-bold">
                  2
                </span>
                <span>Fill in the details about your food donation</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-500 dark:text-rose-400 flex items-center justify-center font-bold">
                  3
                </span>
                <span>Choose a convenient pickup time and location</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-500 dark:text-rose-400 flex items-center justify-center font-bold">
                  4
                </span>
                <span>Submit and track your donation's journey</span>
              </li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Tips for Effective Donations
            </h3>
            <ul className="space-y-4 text-gray-600 dark:text-gray-400">
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-400 flex items-center justify-center mt-1">
                  ✓
                </div>
                <span>Check food quality and packaging before donating</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-400 flex items-center justify-center mt-1">
                  ✓
                </div>
                <span>Ensure proper storage temperature until pickup</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-400 flex items-center justify-center mt-1">
                  ✓
                </div>
                <span>Label items with ingredients and expiry dates</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-400 flex items-center justify-center mt-1">
                  ✓
                </div>
                <span>Pack similar items together for easier handling</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
