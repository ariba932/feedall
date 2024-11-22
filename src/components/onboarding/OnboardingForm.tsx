import React, { useState } from 'react';
import { useRouter } from 'next/router';
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

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ type }) => {
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
    value: string | React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value instanceof Event ? (value.target as HTMLInputElement | HTMLSelectElement).value : value,
    }));
  };

  const handleKycDocuments = (documents: Document[]) => {
    setFormData((prev) => ({
      ...prev,
      kycDocuments: documents,
    }));
  };

  const removeKycDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      kycDocuments: prev.kycDocuments.filter((_, i) => i !== index),
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

  const handleFileUpload = (field: 'operatingLicense', files: File[]) => {
    const createDocument = (file: File, type: Document['type']): Document => ({
      type,
      documentNumber: '',
      issuingAuthority: '',
      issueDate: new Date().toISOString(),
      documentImage: {
        url: URL.createObjectURL(file),
        alt: file.name,
      },
    });

    setFormData((prev) => ({
      ...prev,
      operatingLicense: files.length > 0 ? createDocument(files[0], 'BUSINESS_LICENSE') : null,
    }));
  };

  const handleSubmit = async () => {
    try {
      const endpoint = isDonor ? '/api/onboarding/donor' : '/api/onboarding/non-donor';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: isDonor ? 'DONOR' : 'SERVICE_PROVIDER',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Registration successful! Please check your email for verification.');
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        router.push('/auth/verify-email');
      } else {
        toast.error(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      const err = error as ErrorWithStatus;
      console.error('Registration error:', err);
      toast.error(err.message || 'Failed to submit registration. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Account
        return (
          <div className="space-y-4">
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

      case 1: // Personal Info
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
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
              onChange={(value) => handleAddressChange('street', value)}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                value={formData.address.city}
                onChange={(value) => handleAddressChange('city', value)}
                required
              />
              <Input
                label="State"
                value={formData.address.state}
                onChange={(value) => handleAddressChange('state', value)}
                required
              />
              <Input
                label="Postal Code"
                value={formData.address.postalCode}
                onChange={(value) => handleAddressChange('postalCode', value)}
                required
              />
            </div>
            <Input
              label="Country"
              value={formData.address.country}
              onChange={(value) => handleAddressChange('country', value)}
              required
            />
          </div>
        );

      case 2: // Business Info (non-donor only)
        return !isDonor ? (
          <div className="space-y-4">
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
              onChange={(e) => handleInputChange('businessType', e)}
              options={[
                { value: 'NGO', label: 'Non-Profit Organization' },
                { value: 'LOGISTICS', label: 'Logistics Provider' },
                { value: 'SERVICE_PROVIDER', label: 'Service Provider' },
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
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Review Your Information</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Account Details</h4>
                <p>Email: {formData.email}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <p>First Name: {formData.firstName}</p>
                  <p>Last Name: {formData.lastName}</p>
                  <p>Phone: {formData.phone}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Address</h4>
                <p>{formData.address.street}</p>
                <p>{formData.address.city}, {formData.address.state} {formData.address.postalCode}</p>
                <p>{formData.address.country}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-600">
                Please review your information carefully. Once submitted, your application will be reviewed by our team.
                You will receive an email once your account is verified.
              </p>
            </div>
          </div>
        );

      case 3: // Documents (non-donor only)
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">KYC Documents</h3>
              <FileUpload
                label="Upload KYC Documents"
                accept="image/*,.pdf"
                multiple
                onChange={(files) => {
                  const documents: Document[] = files.map((file) => ({
                    type: 'GOVERNMENT_ID' as const,
                    documentNumber: '',
                    issuingAuthority: '',
                    issueDate: new Date().toISOString(),
                    documentImage: {
                      url: URL.createObjectURL(file),
                      alt: file.name,
                    },
                  }));
                  handleKycDocuments(documents);
                }}
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {formData.kycDocuments.map((doc, index) => (
                  <div key={index} className="relative">
                    <div className="relative w-32 h-32">
                      <Image
                        src={doc.documentImage.url}
                        alt={doc.documentImage.alt}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <button
                      onClick={() => removeKycDocument(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <span className="sr-only">Remove</span>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Operating License</h3>
              <FileUpload
                label="Upload Operating License"
                accept="image/*,.pdf"
                onChange={(files) => handleFileUpload('operatingLicense', files)}
              />
              {formData.operatingLicense && (
                <div className="relative w-32 h-32">
                  <Image
                    src={formData.operatingLicense.documentImage.url}
                    alt={formData.operatingLicense.documentImage.alt}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4: // Confirmation (non-donor only)
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Review Your Information</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Account Details</h4>
                <p>Email: {formData.email}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <p>First Name: {formData.firstName}</p>
                  <p>Last Name: {formData.lastName}</p>
                  <p>Phone: {formData.phone}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Address</h4>
                <p>{formData.address.street}</p>
                <p>{formData.address.city}, {formData.address.state} {formData.address.postalCode}</p>
                <p>{formData.address.country}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Business Information</h4>
                <p>Company Name: {formData.companyName}</p>
                <p>Tax ID: {formData.taxId}</p>
                <p>Business Type: {formData.businessType}</p>
                <p>Registration Number: {formData.registrationNumber}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-600">
                Please review your information carefully. Once submitted, your application will be reviewed by our team.
                You will receive an email once your account is verified.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.email && formData.password;
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.phone &&
          formData.address.street &&
          formData.address.city &&
          formData.address.state &&
          formData.address.country &&
          formData.address.postalCode
        );
      case 2:
        if (isDonor) return true;
        return (
          formData.companyName &&
          formData.taxId &&
          formData.businessType &&
          formData.registrationNumber
        );
      case 3:
        return formData.kycDocuments.length > 0 && formData.operatingLicense;
      default:
        return true;
    }
  };

  const maxSteps = isDonor ? 3 : 5;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <StepIndicator currentStep={currentStep} steps={steps} />
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (currentStep === maxSteps - 1) {
              handleSubmit();
            } else {
              setCurrentStep((prev) => prev + 1);
            }
          }}
          className="space-y-6"
        >
          {renderStep()}
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              disabled={!canProceed()}
              className="ml-auto"
            >
              {currentStep === maxSteps - 1 ? 'Submit' : 'Next'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
