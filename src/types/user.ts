export enum UserRole {
  DONOR = 'donor',
  VOLUNTEER = 'volunteer',
  NGO = 'ngo',
  SERVICE_PROVIDER = 'service_provider',
  LOGISTICS_PROVIDER = 'logistics_provider'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface KYCDocument {
  type: 'GOVERNMENT_ID' | 'BUSINESS_LICENSE';
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  documentImage: {
    url: string;
    alt: string;
  };
}
