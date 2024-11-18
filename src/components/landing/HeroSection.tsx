'use client';

import Link from 'next/link';
import { BiDonateHeart } from 'react-icons/bi';
import { FaEthereum } from 'react-icons/fa';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light/10 to-accent-light/10 dark:from-primary-dark/20 dark:to-accent-dark/20" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent dark:from-primary-light dark:to-accent-light transform hover:scale-105 transition-transform duration-300">
            Feed the World, Block by Block
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12">
            Join our blockchain-powered platform to make food donations transparent,
            traceable, and impactful.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-300"
            >
              <BiDonateHeart className="w-6 h-6" />
              Start Donating
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-primary dark:text-primary-light hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-primary dark:border-primary-light font-semibold py-4 px-8 rounded-lg transition-colors duration-300"
            >
              <FaEthereum className="w-6 h-6" />
              Learn How It Works
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Trusted by leading organizations
            </p>
            <div className="flex justify-center gap-8 opacity-70">
              {/* Add your partner logos here */}
            </div>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

          {/* Hero Image */}
          <div className="relative w-full aspect-square">
            <Image
              src="/images/hero-image.png"
              alt="Food Donation Platform"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Floating Stats Card */}
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Impact</p>
                <p className="text-xl font-bold text-gray-900">50K+ Meals</p>
              </div>
            </div>
          </div>

          {/* User Avatars */}
          <div className="mt-12 flex items-center gap-8">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-2 border-white overflow-hidden"
                >
                  <Image
                    src={`/images/avatar-${i}.jpg`}
                    alt={`User ${i}`}
                    width={48}
                    height={48}
                    sizes="(max-width: 768px) 25vw, 15vw"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-gray-100">
              Join <span className="font-bold">1000+</span> donors making a difference
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
