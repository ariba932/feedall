import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export const mockUUID = 'test-uuid';
export const mockDate = new Date('2024-01-01');

export const createTestContext = () => {
  const ctx = {
    prisma: mockDeep<PrismaClient>(),
  };
  return ctx;
};

export const createMockData = {
  impact: (overrides = {}) => ({
    id: mockUUID,
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
    entityId: mockUUID,
    entityType: 'DONATION',
    date: mockDate,
    createdAt: mockDate,
    updatedAt: mockDate,
    ...overrides,
  })
};

//to create mockContract
export const mockContract = () => ({ // eslint-disable-line
  id: mockUUID,
  name: 'Test Contract',
  description: 'Test Contract Description',
  startDate: mockDate
  });

// to create mockDonation
export const mockDonation = () => ({ // eslint-disable-line
  id: mockUUID,
  name: 'Test Donation',
  description: 'Test Donation Description',
  startDate: mockDate
  });

// to create mockFoodPack
export const mockFoodPack = () => ({ // eslint-disable-line
  id: mockUUID,
  name: 'Test Food Pack',
  description: 'Test Food Pack Description',
  startDate: mockDate
  });

// to create mockFoodPackItem
export const mockFoodPackItem = () => ({ // eslint-disable-line
  id: mockUUID,
  name: 'Test Food Pack Item',
  description: 'Test Food Pack Item Description',
  startDate: mockDate
  });

//to create mockProvider
export const mockProvider = () => ({ // eslint-disable-line
  id: mockUUID,
  name: 'Test Provider',
  description: 'Test Provider Description',
  startDate: mockDate
  }); 

//to create mockFeedingNeed
export const mockFeedingNeed = () => ({ // eslint-disable-line
  id: mockUUID,
  name: 'Test Feeding Need',
  description: 'Test Feeding Need Description',
  startDate: mockDate
  });

export const mockUser = () => ({ // eslint-disable-line
  id: mockUUID,
  name: 'Test User',
  email: 'YyK7x@example.com',
  password: 'password',
  role: 'user'
  });

//to create a mockSigner
export const mockSigner = () => ({ // eslint-disable-line
  id: mockUUID,
  name: 'Test Signer',
  email: 'YyK7x@example.com',
  password: 'password',
  role: 'signer'
  });
  