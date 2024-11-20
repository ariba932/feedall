import React, { useState } from 'react';
import { useRouter } from 'next/router';
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

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ type }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
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

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleFileUpload = (field: string, files: File[]) => {
    if (field === 'kycDocuments') {
      setFormData((prev) => ({
        ...prev,
        kycDocuments: [
          ...prev.kycDocuments,
          ...files.map((file) => ({
            type: 'GOVERNMENT_ID',
            documentNumber: '',
            issuingAuthority: '',
            issueDate: new Date().toISOString(),
            documentImage: {
              url: URL.createObjectURL(file),
              alt: file.name,
            },
          })),
        ],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          type: 'BUSINESS_LICENSE',
          documentNumber: '',
          issuingAuthority: '',
          issueDate: new Date().toISOString(),
          documentImage: {
            url: URL.createObjectURL(files[0]),
            alt: files[0].name,
          },
        },
      }));
    }
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
        // Store any necessary data in localStorage
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        router.push('/auth/verify-email');
      } else {
        toast.error(data.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to submit registration. Please try again.');
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
              onChange={(value) => handleInputChange('email', value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
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
                onChange={(value) => handleInputChange('firstName', value)}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(value) => handleInputChange('lastName', value)}
                required
              />
            </div>
            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(value) => handleInputChange('phone', value)}
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
              onChange={(value) => handleInputChange('companyName', value)}
              required
            />
            <Input
              label="Tax ID"
              value={formData.taxId}
              onChange={(value) => handleInputChange('taxId', value)}
              required
            />
            <Select
              label="Business Type"
              value={formData.businessType}
              onChange={(value) => handleInputChange('businessType', value)}
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
              onChange={(value) => handleInputChange('registrationNumber', value)}
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
                label="Upload Government ID"
                accept="image/*,.pdf"
                multiple
                onChange={(files) => handleFileUpload('kycDocuments', files)}
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {formData.kycDocuments.map((doc: any, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={doc.documentImage.url}
                      alt={doc.documentImage.alt}
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      onClick={() => {
                        const newDocs = [...formData.kycDocuments];
                        newDocs.splice(index, 1);
                        handleInputChange('kycDocuments', newDocs);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
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
                <div className="mt-2 relative group w-1/2">
                  <img
                    src={formData.operatingLicense.documentImage.url}
                    alt={formData.operatingLicense.documentImage.alt}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => handleInputChange('operatingLicense', null)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
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
