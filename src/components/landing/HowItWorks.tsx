import { BiDonateHeart } from 'react-icons/bi';
import { MdVerified, MdLocalShipping } from 'react-icons/md';
import { FaHandshake } from 'react-icons/fa';

export default function HowItWorks() {
  const steps = [
    {
      icon: <BiDonateHeart className="w-8 h-8" />,
      title: "Register & Donate",
      description: "Sign up and list your food donations with details and photos."
    },
    {
      icon: <MdVerified className="w-8 h-8" />,
      title: "Verification",
      description: "Our team verifies the donation quality and authenticity."
    },
    {
      icon: <MdLocalShipping className="w-8 h-8" />,
      title: "Pickup & Delivery",
      description: "Coordinate pickup or delivery with our logistics partners."
    },
    {
      icon: <FaHandshake className="w-8 h-8" />,
      title: "Track Impact",
      description: "Monitor your donation's journey and impact in real-time."
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our blockchain-powered platform makes food donation simple, transparent, and impactful
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/4 left-full w-full h-0.5 bg-primary/20 -z-10"></div>
              )}
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
