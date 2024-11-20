export enum UserRole {
  DONOR = 'DONOR',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  ADMIN = 'ADMIN'
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
