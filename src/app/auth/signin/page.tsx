import { createClient } from '@/utils/supabase/server'
//import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FaUserPlus, FaHandHoldingHeart, FaTruck, FaUsers } from 'react-icons/fa';
import { BiDonateHeart } from 'react-icons/bi';
import { MdVolunteerActivism } from 'react-icons/md';
import SignInForm from '@/components/auth/SignInForm';

export default async function SignIn() {
  //const cookieStore = cookies();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Get user roles
    const { data: userRoles } = await supabase.rpc('get_user_roles', {
      user_id: user.id,
    });

    // Check if user is admin
    const isAdmin = userRoles?.includes('ADMIN');

    if (isAdmin) {
      redirect('/admin/dashboard');
    } else {
      // For non-admin users, redirect to their primary role dashboard
      // Priority: DONOR > SERVICE_PROVIDER > NGO > LOGISTICS > VOLUNTEER
      if (userRoles?.includes('DONOR')) {
        redirect('/dashboard/donor');
      } else if (userRoles?.includes('SERVICE_PROVIDER')) {
        redirect('/dashboard/service-provider');
      } else if (userRoles?.includes('NGO')) {
        redirect('/dashboard/ngo');
      } else if (userRoles?.includes('LOGISTICS')) {
        redirect('/dashboard/logistics');
      } else if (userRoles?.includes('VOLUNTEER')) {
        redirect('/dashboard/volunteer');
      } else {
        redirect('/dashboard/overview');
      }
    }
  }

  const registrationOptions = [
    {
      title: 'Food Donor',
      description: 'Register as a food donor to contribute surplus food',
      icon: <BiDonateHeart className="w-8 h-8" />,
      href: '/onboarding/donor',
      color: 'text-primary-600 dark:text-primary-400',
    },
    {
      title: 'Service Provider',
      description: 'Partner with us to provide food-related services',
      icon: <FaHandHoldingHeart className="w-8 h-8" />,
      href: '/onboarding/service-provider',
      color: 'text-accent-600 dark:text-accent-400',
    },
    {
      title: 'NGO',
      description: 'Register your organization to receive and distribute food',
      icon: <FaUsers className="w-8 h-8" />,
      href: '/onboarding/ngo',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Logistics Partner',
      description: 'Help with food transportation and delivery',
      icon: <FaTruck className="w-8 h-8" />,
      href: '/onboarding/logistics',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Volunteer',
      description: 'Join our community of volunteers',
      icon: <MdVolunteerActivism className="w-8 h-8" />,
      href: '/onboarding/volunteer',
      color: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Sign In Form */}
          <div>
            <div className="max-w-md mx-auto">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Welcome back! Please sign in to continue.
              </p>
              <div className="mt-8">
                <SignInForm />
              </div>
            </div>
          </div>

          {/* Registration Options */}
          <div className="lg:border-l lg:border-gray-200 dark:lg:border-gray-700 lg:pl-12">
            <div className="max-w-lg mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create a new account
              </h3>
              <div className="grid gap-6">
                {registrationOptions.map((option) => (
                  <Link
                    key={option.title}
                    href={option.href}
                    className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200"
                  >
                    <div className={`flex-shrink-0 ${option.color}`}>
                      {option.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {option.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
