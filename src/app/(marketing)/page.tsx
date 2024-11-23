import { FaShieldAlt, FaChartLine } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { BiDonateHeart } from 'react-icons/bi';
import HeroSection from '@/components/landing/HeroSection';
import FeatureCard from '@/components/landing/FeatureCard';
import StatsSection from '@/components/landing/StatsSection';
import HowItWorks from '@/components/landing/HowItWorks';
import ImpactSection from '@/components/landing/ImpactSection';
import CTASection from '@/components/landing/CTASection';

export default function Home() {
  const features = [
    {
      icon: <BiDonateHeart className="w-8 h-8 text-primary-light dark:text-primary" />,
      title: "Easy Donation Process",
      description: "Simple and intuitive platform to donate surplus food with just a few clicks."
    },
    {
      icon: <FaShieldAlt className="w-8 h-8 text-primary-light dark:text-primary" />,
      title: "Blockchain Security",
      description: "Transparent and secure tracking of donations using blockchain technology."
    },
    {
      icon: <MdVerified className="w-8 h-8 text-primary-light dark:text-primary" />,
      title: "Verified Recipients",
      description: "All recipients are verified to ensure donations reach those truly in need."
    },
    {
      icon: <FaChartLine className="w-8 h-8 text-primary-light dark:text-primary" />,
      title: "Impact Tracking",
      description: "Real-time tracking and analytics of your donation's impact on the community."
    }
  ];

  const stats = [
    { value: "50K+", label: "Meals Donated" },
    { value: "1000+", label: "Active Donors" },
    { value: "100+", label: "Partner Organizations" },
    { value: "25", label: "Cities Covered" }
  ];

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark">
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-text-light dark:text-text-dark">Why Choose FeedAll?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* How it Works */}
      <HowItWorks />

      {/* Impact Section */}
      <ImpactSection />

      {/* CTA Section */}
      <CTASection />

    </main>
  );
}
