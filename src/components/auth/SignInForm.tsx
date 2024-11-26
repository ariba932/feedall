'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast.error(signInError.message);
        return;
      }

      // Get authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error('Authentication failed. Please try again.');
        return;
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase.rpc(
        'get_user_roles',
        {
          user_id: user.id,
        }
      );

      if (rolesError) {
        console.error('Roles error:', rolesError);
        toast.error('Error loading user roles.');
        return;
      }

      // Refresh the page to trigger server-side auth check
      router.refresh();

      // Check if user is admin
      const isAdmin = userRoles?.includes('ADMIN');

      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        // For non-admin users, redirect to their primary role dashboard
        // Priority: DONOR > SERVICE_PROVIDER > NGO > LOGISTICS > VOLUNTEER
        if (userRoles?.includes('DONOR')) {
          router.push('/dashboard/donor');
        } else if (userRoles?.includes('SERVICE_PROVIDER')) {
          router.push('/dashboard/service-provider');
        } else if (userRoles?.includes('NGO')) {
          router.push('/dashboard/ngo');
        } else if (userRoles?.includes('LOGISTICS')) {
          router.push('/dashboard/logistics');
        } else if (userRoles?.includes('VOLUNTEER')) {
          router.push('/dashboard/volunteer');
        } else {
          router.push('/dashboard/overview');
        }
      }

      toast.success('Signed in successfully!');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An error occurred while signing in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Email address
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Password
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary dark:hover:bg-primary-dark"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>

      <div className="text-sm text-center">
        <a
          href="#"
          className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          Forgot your password?
        </a>
      </div>
    </form>
  );
}
