import { PrismaClient, DonationStatus, UserRole, UserStatus, VerificationStatus, Prisma } from '@prisma/client';
import { BlockchainService } from '../../services/blockchain.service';
import { DonationService } from '../../services/donation.service';
import { createMockContext, MockContext } from '../context';
import { ethers } from 'ethers';

jest.mock('ethers');

describe('DonationService', () => {
  let ctx: MockContext;
  let donationService: DonationService;
  let blockchainService: BlockchainService;

  beforeEach(() => {
    ctx = createMockContext();
    blockchainService = new BlockchainService();
    donationService = new DonationService(ctx.prisma as any, blockchainService);

    // Mock blockchain service methods
    const mockContract = {
      connect: jest.fn().mockReturnThis(),
      createDonation: jest.fn().mockResolvedValue({ wait: () => Promise.resolve({ contractAddress: '0x123' }) }),
      updateDonationStatus: jest.fn().mockResolvedValue({ wait: () => Promise.resolve({}) }),
    };

    const mockProvider = new ethers.providers.JsonRpcProvider();
    const mockSigner = new ethers.Wallet('0x123', mockProvider);

    jest.spyOn(blockchainService as any, 'provider').mockReturnValue(mockProvider);
    jest.spyOn(blockchainService as any, 'wallet').mockReturnValue(mockSigner);
    jest.spyOn(blockchainService as any, 'deploySmartContract').mockResolvedValue(mockContract);
  });

  describe('createDonation', () => {
    it('should create a new donation and return it', async () => {
      const mockDonor: Prisma.UserCreateInput = {
        id: 'donor-1',
        email: 'donor@test.com',
        password: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.DONOR,
        status: UserStatus.ACTIVE,
        walletAddress: '0x456',
        avatar: null,
        bio: null,
        companyName: null,
        address: null,
        phone: null,
        emailVerified: false,
        verificationDocuments: null,
        preferences: {},
        impactPoints: 0,
        lastLogin: null,
        failedLogins: 0,
        resetToken: null,
        resetTokenExp: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockCreatedDonation: Prisma.DonationCreateInput = {
        id: 'donation-1',
        title: 'Test Donation',
        description: 'Test Description',
        quantity: 100,
        unit: 'kg',
        category: 'food',
        pickupAddress: '123 Test St',
        images: ['test.jpg'],
        status: DonationStatus.PENDING,
        contractAddress: '0x123',
        verificationStatus: VerificationStatus.PENDING,
        verifiedAt: null,
        verifiedBy: null,
        evidence: null,
        deliveryId: null,
        expiryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        donor: {
          connect: { id: mockDonor.id }
        }
      };

      ctx.prisma.user.findUnique.mockResolvedValue(mockDonor);
      ctx.prisma.donation.create.mockResolvedValue(mockCreatedDonation);

      const result = await donationService.createDonation({
        title: 'Test Donation',
        description: 'Test Description',
        quantity: 100,
        unit: 'kg',
        category: 'food',
        pickupAddress: '123 Test St',
        images: ['test.jpg'],
        donorId: 'donor-1',
        expiryDate: new Date(),
      });

      expect(result).toEqual(mockCreatedDonation);
    });

    it('should throw an error if donor is not found', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue(null);

      await expect(donationService.createDonation({
        title: 'Test Donation',
        description: 'Test Description',
        quantity: 100,
        unit: 'kg',
        category: 'food',
        pickupAddress: '123 Test St',
        images: ['image1.jpg'],
        donorId: 'non-existent-donor',
      })).rejects.toThrow('Donor not found');
    });
  });

  describe('updateDonationStatus', () => {
    it('should update donation status and return updated donation', async () => {
      const mockDonation: Prisma.DonationCreateInput = {
        id: 'donation-1',
        title: 'Test Donation',
        description: 'Test Description',
        quantity: 100,
        unit: 'kg',
        category: 'food',
        pickupAddress: '123 Test St',
        images: ['test.jpg'],
        status: DonationStatus.COMPLETED,
        contractAddress: '0x123',
        verificationStatus: VerificationStatus.PENDING,
        verifiedAt: null,
        verifiedBy: null,
        evidence: null,
        deliveryId: null,
        expiryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        donor: {
          connect: { id: 'donor-1' }
        }
      };

      const evidence = {
        notes: 'Verification successful',
        images: ['verification.jpg']
      };

      ctx.prisma.donation.findUnique.mockResolvedValue(mockDonation);
      ctx.prisma.donation.update.mockResolvedValue({
        ...mockDonation,
        status: DonationStatus.VERIFIED,
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: 'verifier-1',
        evidence
      });

      const result = await donationService.updateDonationStatus(
        'donation-1',
        DonationStatus.VERIFIED,
        evidence
      );

      expect(result.status).toBe(DonationStatus.VERIFIED);
      expect(result.verificationStatus).toBe(VerificationStatus.VERIFIED);
      expect(result.evidence).toEqual(evidence);
    });

    it('should throw error if donation not found', async () => {
      ctx.prisma.donation.findUnique.mockResolvedValue(null);

      await expect(donationService.updateDonationStatus(
        'non-existent',
        DonationStatus.VERIFIED,
        { notes: 'test', images: [] }
      )).rejects.toThrow('Donation not found');
    });

    it('should throw error if donation is already verified', async () => {
      const verifiedDonation: Prisma.DonationCreateInput = {
        id: 'donation-1',
        title: 'Test Donation',
        description: 'Test Description',
        quantity: 100,
        unit: 'kg',
        category: 'food',
        pickupAddress: '123 Test St',
        images: ['test.jpg'],
        status: DonationStatus.VERIFIED,
        contractAddress: '0x123',
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: 'verifier-1',
        evidence: { notes: 'Already verified' },
        deliveryId: null,
        expiryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        donor: {
          connect: { id: 'donor-1' }
        }
      };

      ctx.prisma.donation.findUnique.mockResolvedValue(verifiedDonation);

      await expect(donationService.updateDonationStatus(
        'donation-1',
        DonationStatus.VERIFIED,
        { notes: 'test', images: [] }
      )).rejects.toThrow('Donation is already verified');
    });

    it('should handle blockchain errors gracefully', async () => {
      const mockDonation: Prisma.DonationCreateInput = {
        id: 'donation-1',
        title: 'Test Donation',
        description: 'Test Description',
        quantity: 100,
        unit: 'kg',
        category: 'food',
        pickupAddress: '123 Test St',
        images: ['test.jpg'],
        status: DonationStatus.COMPLETED,
        contractAddress: '0x123',
        verificationStatus: VerificationStatus.PENDING,
        verifiedAt: null,
        verifiedBy: null,
        evidence: null,
        deliveryId: null,
        expiryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        donor: {
          connect: { id: 'donor-1' }
        }
      };

      jest.spyOn(blockchainService as any, 'deploySmartContract').mockRejectedValue(
        new Error('Blockchain verification failed')
      );

      ctx.prisma.donation.findUnique.mockResolvedValue(mockDonation);

      await expect(donationService.updateDonationStatus(
        mockDonation.id,
        DonationStatus.VERIFIED,
        { notes: 'Test', images: [] }
      )).rejects.toThrow('Blockchain verification failed');
    });
  });

  describe('rejectVerification', () => {
    it('should reject donation verification with reason', async () => {
      const mockDonation: Prisma.DonationCreateInput = {
        id: 'donation-1',
        status: DonationStatus.COMPLETED,
        verificationStatus: VerificationStatus.PENDING,
        contractAddress: '0xabc',
        donor: {
          connect: { id: 'donor-1' }
        }
      };

      const rejectionReason = 'Documentation incomplete';

      ctx.prisma.donation.findUnique.mockResolvedValue(mockDonation);
      ctx.prisma.donation.update.mockResolvedValue({
        ...mockDonation,
        verificationStatus: VerificationStatus.REJECTED,
        evidence: {
          status: VerificationStatus.REJECTED,
          notes: rejectionReason,
        },
      });

      const result = await donationService.updateDonationStatus(
        mockDonation.id,
        DonationStatus.REJECTED,
        {
          status: VerificationStatus.REJECTED,
          notes: rejectionReason,
        },
      );

      expect(result.verificationStatus).toBe(VerificationStatus.REJECTED);
      expect(result.evidence.notes).toBe(rejectionReason);
    });
  });
});
