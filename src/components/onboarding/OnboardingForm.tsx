'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';
import { UserRole } from '@/types/user';
import { registerUser } from '@/services/auth';

export default function OnboardingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const router = useRouter();

  const roles = [
    { id: UserRole.DONOR, label: 'Donor' },
    { id: UserRole.VOLUNTEER, label: 'Volunteer' },
    { id: UserRole.NGO, label: 'NGO' },
    { id: UserRole.SERVICE_PROVIDER, label: 'Service Provider' },
    { id: UserRole.LOGISTICS_PROVIDER, label: 'Logistics Provider' },
  ];

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);

    try {
      const { redirectTo } = await registerUser({
        email,
        password,
        phone,
      });

      // Refresh the page to trigger server-side auth check
      router.refresh();

      // Redirect to the donor dashboard
      router.push(redirectTo);

      toast.success('Registration successful! Welcome to FeedAll!');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-[#0D1117] rounded-lg">
      <div>
        <h2 className="text-2xl font-bold text-white">Create your account</h2>
        <p className="mt-2 text-sm text-gray-400">
          Join our community and start making a difference.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <div className="relative">
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-[#161B22] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-[#161B22] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="sr-only">
              Phone number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-[#161B22] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Select your role(s)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className="relative flex items-center p-2 rounded-md border border-gray-700 bg-[#161B22] cursor-pointer hover:bg-gray-800"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                  />
                  <span className="ml-3 text-sm text-white">{role.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}
