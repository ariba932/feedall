"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserRole } from '@/types/user';
import { StepIndicator } from './StepIndicator';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { FileUpload } from '../ui/FileUpload';
import { toast } from 'react-hot-toast';

interface OnboardingFormProps {
  type: 'donor' | 'non-donor';
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface DocumentImage {
  url: string;
  alt: string;
}

interface Document {
  type: 'GOVERNMENT_ID' | 'BUSINESS_LICENSE';
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  documentImage: DocumentImage;
}

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: Address;
  role: UserRole;
  companyName: string;
  taxId: string;
  businessType: string;
  registrationNumber: string;
  kycDocuments: Document[];
  operatingLicense: Document | null;
}

interface ErrorWithStatus extends Error {
  status?: number;
  message: string;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ type }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    role: type === 'donor' ? UserRole.DONOR : UserRole.SERVICE_PROVIDER,
    companyName: '',
    taxId: '',
    businessType: '',
    registrationNumber: '',
    kycDocuments: [],
    operatingLicense: null,
  });

  const isDonor = type === 'donor';
  const steps = isDonor
    ? ['Account', 'Personal Info', 'Confirmation']
    : ['Account', 'Personal Info', 'Business Info', 'Documents', 'Confirmation'];

  const handleInputChange = (
    field: keyof Omit<FormData, 'address' | 'kycDocuments'>,
    value: string | React.ChangeEvent<HTMLInputElement> | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value instanceof Event ? (value.target as HTMLInputElement).value : value,
    }));
  };

  const handleSelectChange = (
    field: keyof Pick<FormData, 'businessType'>,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleFileUpload = async (file: File, documentType: Document['type']) => {
    try {
      // Handle file upload logic here
      const documentImage = {
        url: 'placeholder-url',
        alt: file.name,
      };

      const newDocument: Document = {
        type: documentType,
        documentNumber: '',
        issuingAuthority: '',
        issueDate: '',
        documentImage,
      };

      setFormData((prev) => ({
        ...prev,
        kycDocuments: [...prev.kycDocuments, newDocument],
      }));
    } catch (error) {
      toast.error('Error uploading file');
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Handle form submission logic here
      toast.success('Onboarding completed successfully!');
      router.push('/dashboard');
    } catch (error) {
      const err = error as ErrorWithStatus;
      toast.error(err.message || 'An error occurred during onboarding');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e)}
              required
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e)}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e)}
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e)}
              required
            />
            <Input
              label="Street Address"
              value={formData.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={formData.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                required
              />
              <Input
                label="State"
                value={formData.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Country"
                value={formData.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                required
              />
              <Input
                label="Postal Code"
                value={formData.address.postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                required
              />
            </div>
          </div>
        );
      case 2:
        if (!isDonor) {
          return (
            <div className="space-y-6">
              <Input
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e)}
                required
              />
              <Input
                label="Tax ID"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e)}
                required
              />
              <Select
                label="Business Type"
                value={formData.businessType}
                onChange={(e) => handleSelectChange('businessType', e)}
                options={[
                  { value: 'corporation', label: 'Corporation' },
                  { value: 'llc', label: 'LLC' },
                  { value: 'partnership', label: 'Partnership' },
                  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
                ]}
                required
              />
              <Input
                label="Registration Number"
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange('registrationNumber', e)}
                required
              />
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review Your Information</h3>
            {/* Add confirmation content */}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <FileUpload
              label="Government ID"
              accept="image/*,.pdf"
              onUpload={(file) => handleFileUpload(file, 'GOVERNMENT_ID')}
            />
            <FileUpload
              label="Business License"
              accept="image/*,.pdf"
              onUpload={(file) => handleFileUpload(file, 'BUSINESS_LICENSE')}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review Your Information</h3>
            {/* Add confirmation content */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form onSubmit={handleSubmit} className="space-y-8">
        <StepIndicator steps={steps} currentStep={currentStep} />
        {renderStep()}
        <div className="flex justify-between">
          {currentStep > 0 && (
            <Button type="button" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="submit">Complete</Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default OnboardingForm;
