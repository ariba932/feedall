'use client';

import React from 'react';
import OnboardingForm from './OnboardingForm';

interface OnboardingContainerProps {
  type: 'donor' | 'non-donor';
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({ type }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            {type === 'donor' ? 'Donor Registration' : 'Service Provider Registration'}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {type === 'donor'
              ? 'Join our community of food donors and help reduce food waste while making a difference.'
              : 'Partner with us to help distribute food to those in need and make a positive impact in your community.'}
          </p>
        </div>
        <OnboardingForm type={type} />
      </div>
    </div>
  );
};
