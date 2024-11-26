'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';
import { FaUserCircle } from 'react-icons/fa';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  roles: string[];
  created_at: string;
}

export default function RecentUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchRecentUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, roles, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setUsers(data);
      }
    }

    fetchRecentUsers();
  }, [supabase]);

  function getRoleLabel(roles: string[]) {
    if (!roles || roles.length === 0) return 'User';
    return roles.map((role) => role.replace('_', ' ')).join(', ');
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <FaUserCircle className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.full_name || 'Unnamed User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(user.created_at), 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-primary-600 dark:text-primary-400">
              {getRoleLabel(user.roles)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
