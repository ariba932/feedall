import { PrismaClient, DeliveryStatus, User, Donation, Delivery, DonationStatus } from '@prisma/client';
import { Contract } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Create Test Context with Mocked Prisma
export const createTestContext = () => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
};

// Mock Contract for Blockchain - Single contract for donation lifecycle
export const mockContract = {
  // Donation creation and updates
  createDonation: jest.fn(),
  updateDonationStatus: jest.fn(),
  
  // Delivery tracking
  assignDelivery: jest.fn(),
  updateDeliveryStatus: jest.fn(),
  
  // Verification
  verifyDelivery: jest.fn(),
  
  // Contract state queries
  getDonationStatus: jest.fn(),
  getDeliveryStatus: jest.fn(),
  getVerificationStatus: jest.fn(),
  
  // Utility methods
  connect: jest.fn().mockReturnThis(),
  
  // Events
  emit: jest.fn(),
  on: jest.fn(),
} as unknown as Contract;

// Mock Provider
export const mockProvider = new JsonRpcProvider();

// Mock Signer
export const mockSigner = new Wallet('0x' + '0'.repeat(64), mockProvider);

// Mock Data Generators
export const createMockData = {
  user: (overrides = {}): User => ({
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    email: 'test@example.com',
    name: 'Test User',
    phone: '+2348012345678',
    walletAddress: '0x' + '0'.repeat(40),
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'USER',
    ...overrides
  }),

  donation: (overrides = {}): Donation => ({
    id: 'donation-' + Math.random().toString(36).substr(2, 9),
    donorId: 'donor-' + Math.random().toString(36).substr(2, 9),
    title: 'Test Donation',
    description: 'Test Description',
    quantity: 100,
    unit: 'KG',
    category: 'FOOD',
    status: DonationStatus.PENDING,
    pickupAddress: 'Test Pickup Address',
    createdAt: new Date(),
    updatedAt: new Date(),
    contractAddress: '0x' + '0'.repeat(40),
    images: ['image1.jpg', 'image2.jpg'],
    expiryDate: new Date(Date.now() + 7 * 24 * 3600000), // 7 days from now
    verificationStatus: 'PENDING',
    verifiedAt: null,
    verifiedBy: null,
    ...overrides
  }),

  delivery: (overrides = {}): Delivery => ({
    id: 'delivery-' + Math.random().toString(36).substr(2, 9),
    logisticsId: 'logistics-' + Math.random().toString(36).substr(2, 9),
    donationId: 'donation-' + Math.random().toString(36).substr(2, 9),
    pickupAddress: 'Test Pickup Address',
    deliveryAddress: 'Test Delivery Address',
    scheduledPickupTime: new Date(),
    scheduledDeliveryTime: new Date(Date.now() + 3600000),
    actualPickupTime: null,
    actualDeliveryTime: null,
    status: DeliveryStatus.PENDING,
    vehicleType: 'VAN',
    weight: 100,
    recipientName: 'Test Recipient',
    recipientPhone: '+2348012345678',
    contractAddress: '0x' + '0'.repeat(40),
    createdAt: new Date(),
    updatedAt: new Date(),
    verificationStatus: 'PENDING',
    verifiedAt: null,
    verifiedBy: null,
    ...overrides
  }),

  // Mock Impact Data
  impact: (overrides = {}) => ({
    id: 'impact-' + Math.random().toString(36).substr(2, 9),
    description: 'Test impact',
    beneficiaries: JSON.stringify({
      count: 100,
      demographics: {
        children: 30,
        adults: 50,
        elderly: 20
      }
    }),
    location: JSON.stringify({
      address: 'Test Location',
      city: 'Test City',
      state: 'Test State',
      coordinates: {
        lat: 0,
        lng: 0
      }
    }),
    evidence: JSON.stringify({
      images: ['image1.jpg', 'image2.jpg'],
      description: 'Impact evidence description',
      testimonials: [
        {
          name: 'John Doe',
          role: 'Beneficiary',
          content: 'This helped my community',
          rating: 5
        }
      ]
    }),
    category: 'MEALS_SERVED',
    metrics: JSON.stringify([
      {
        category: 'MEALS_SERVED',
        value: 100,
        unit: 'meals',
        description: 'Meals served'
      }
    ]),
    sdgGoals: [1, 2], // Zero Hunger, No Poverty
    entityId: 'entity-' + Math.random().toString(36).substr(2, 9),
    entityType: 'DONATION',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  })
};