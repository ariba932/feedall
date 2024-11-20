import React from 'react';
import { CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-4">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                  ${
                    index < currentStep
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === currentStep
                      ? 'border-blue-500 text-blue-500'
                      : 'border-gray-300 text-gray-300'
                  }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {/* Step label */}
              <span
                className={`mt-2 text-xs sm:text-sm text-center
                  ${
                    index === currentStep
                      ? 'text-blue-500 font-medium'
                      : index < currentStep
                      ? 'text-green-500'
                      : 'text-gray-500'
                  }`}
              >
                {step}
              </span>
            </div>
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2
                  ${
                    index < currentStep
                      ? 'bg-green-500'
                      : index === currentStep
                      ? 'bg-blue-200'
                      : 'bg-gray-200'
                  }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
