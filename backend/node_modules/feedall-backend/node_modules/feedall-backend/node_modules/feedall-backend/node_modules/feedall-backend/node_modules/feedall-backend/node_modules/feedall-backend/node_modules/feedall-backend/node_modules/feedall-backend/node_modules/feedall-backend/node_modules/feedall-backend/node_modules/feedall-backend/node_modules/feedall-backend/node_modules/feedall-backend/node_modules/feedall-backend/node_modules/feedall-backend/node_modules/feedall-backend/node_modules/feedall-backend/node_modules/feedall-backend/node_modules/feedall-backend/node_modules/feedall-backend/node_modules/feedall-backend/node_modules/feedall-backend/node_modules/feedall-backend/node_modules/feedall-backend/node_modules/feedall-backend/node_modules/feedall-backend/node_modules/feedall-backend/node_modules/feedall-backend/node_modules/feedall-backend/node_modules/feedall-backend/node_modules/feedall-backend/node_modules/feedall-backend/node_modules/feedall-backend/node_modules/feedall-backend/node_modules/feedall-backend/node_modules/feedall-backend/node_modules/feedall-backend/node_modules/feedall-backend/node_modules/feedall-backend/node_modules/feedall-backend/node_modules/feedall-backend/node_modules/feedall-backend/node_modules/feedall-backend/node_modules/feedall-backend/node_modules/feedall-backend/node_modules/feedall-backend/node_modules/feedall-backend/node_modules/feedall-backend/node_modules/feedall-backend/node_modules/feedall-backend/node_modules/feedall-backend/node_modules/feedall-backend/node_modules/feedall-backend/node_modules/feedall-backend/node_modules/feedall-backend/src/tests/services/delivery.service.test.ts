import { PrismaClient, DeliveryStatus, UserRole, UserStatus, VerificationStatus } from '@prisma/client';
import { BlockchainService } from '../../services/blockchain.service';
import { DeliveryService } from '../../services/delivery.service';
import { createMockContext, MockContext } from '../context';

describe('DeliveryService', () => {
  let ctx: MockContext;
  let deliveryService: DeliveryService;
  let blockchainService: BlockchainService;
  let mockContract: any;
  let mockProvider: any;
  let mockSigner: any;

  beforeEach(() => {
    ctx = createMockContext();
    blockchainService = new BlockchainService();
    deliveryService = new DeliveryService(ctx.prisma, blockchainService);

    mockContract = {
      connect: jest.fn().mockReturnThis(),
      assignDelivery: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(true),
      }),
      updateDeliveryStatus: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(true),
      }),
      verifyDelivery: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(true),
      }),
    };

    mockProvider = {};
    mockSigner = {};

    jest.spyOn(blockchainService, 'getContract').mockResolvedValue(mockContract);
    jest.spyOn(blockchainService, 'getProvider').mockResolvedValue(mockProvider);
    jest.spyOn(blockchainService, 'getSigner').mockResolvedValue(mockSigner);
  });

  describe('createDelivery', () => {
    it('should create a new delivery and return it', async () => {
      const mockLogistics = {
        id: 'logistics-1',
        email: 'logistics@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.LOGISTICS,
        status: UserStatus.ACTIVE,
        walletAddress: '0x123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDonation = {
        id: 'donation-1',
        contractAddress: '0xabc',
      };

      const mockDeliveryData = {
        logisticsId: mockLogistics.id,
        donationId: mockDonation.id,
        pickupAddress: '123 Pickup St',
        deliveryAddress: '456 Delivery St',
        scheduledPickupTime: new Date('2024-01-01T10:00:00Z'),
        scheduledDeliveryTime: new Date('2024-01-01T14:00:00Z'),
        vehicleType: 'truck',
        weight: 1000,
        recipientName: 'Jane Smith',
        recipientPhone: '+1234567890',
      };

      ctx.prisma.user.findUnique.mockResolvedValue(mockLogistics);
      ctx.prisma.donation.findUnique.mockResolvedValue(mockDonation);

      const mockCreatedDelivery = {
        ...mockDeliveryData,
        id: 'delivery-1',
        status: DeliveryStatus.PENDING,
        verificationStatus: VerificationStatus.PENDING,
        verifiedAt: null,
        verifiedBy: null,
        evidence: null,
        gpsData: null,
        actualTime: null,
        contractAddress: mockDonation.contractAddress,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        logistics: mockLogistics,
      };

      ctx.prisma.delivery.create.mockResolvedValue(mockCreatedDelivery);

      const result = await deliveryService.createDelivery(mockDeliveryData);

      expect(result).toEqual(mockCreatedDelivery);
      expect(ctx.prisma.delivery.create).toHaveBeenCalledWith({
        data: {
          ...mockDeliveryData,
          status: DeliveryStatus.PENDING,
          verificationStatus: VerificationStatus.PENDING,
          contractAddress: mockDonation.contractAddress,
        },
        include: {
          logistics: true,
        },
      });

      expect(mockContract.assignDelivery).toHaveBeenCalledWith(
        'delivery-1',
        mockLogistics.walletAddress,
        mockDeliveryData.pickupAddress,
        mockDeliveryData.deliveryAddress,
        Math.floor(mockDeliveryData.scheduledPickupTime.getTime() / 1000),
        Math.floor(mockDeliveryData.scheduledDeliveryTime.getTime() / 1000),
      );
    });

    it('should throw an error if logistics provider is not found', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue(null);

      await expect(deliveryService.createDelivery({
        logisticsId: 'non-existent-logistics',
        donationId: 'donation-1',
        pickupAddress: '123 Pickup St',
        deliveryAddress: '456 Delivery St',
        scheduledPickupTime: new Date(),
        scheduledDeliveryTime: new Date(),
        vehicleType: 'truck',
        weight: 1000,
        recipientName: 'Jane Smith',
        recipientPhone: '+1234567890',
      })).rejects.toThrow('Logistics provider not found');
    });

    it('should throw an error if donation is not found', async () => {
      const mockLogistics = {
        id: 'logistics-1',
        role: UserRole.LOGISTICS,
        walletAddress: '0x123',
      };

      ctx.prisma.user.findUnique.mockResolvedValue(mockLogistics);
      ctx.prisma.donation.findUnique.mockResolvedValue(null);

      await expect(deliveryService.createDelivery({
        logisticsId: 'logistics-1',
        donationId: 'non-existent-donation',
        pickupAddress: '123 Pickup St',
        deliveryAddress: '456 Delivery St',
        scheduledPickupTime: new Date(),
        scheduledDeliveryTime: new Date(),
        vehicleType: 'truck',
        weight: 1000,
        recipientName: 'Jane Smith',
        recipientPhone: '+1234567890',
      })).rejects.toThrow('Donation not found');
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should update delivery status and return updated delivery', async () => {
      const mockDelivery = {
        id: 'delivery-1',
        status: DeliveryStatus.PENDING,
        verificationStatus: VerificationStatus.PENDING,
        contractAddress: '0xabc',
        pickupAddress: '123 Pickup St',
        deliveryAddress: '456 Delivery St',
        scheduledPickupTime: new Date(),
        scheduledDeliveryTime: new Date(),
        actualTime: null,
        gpsData: null,
        evidence: null,
        logisticsId: 'logistics-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newStatus = DeliveryStatus.IN_TRANSIT;
      const evidence = {
        location: '123.456,789.012',
        notes: 'Picked up from donor',
        images: ['pickup.jpg'],
      };

      ctx.prisma.delivery.findUnique.mockResolvedValue(mockDelivery);
      ctx.prisma.delivery.update.mockResolvedValue({
        ...mockDelivery,
        status: newStatus,
        evidence,
      });

      const result = await deliveryService.updateDeliveryStatus(
        mockDelivery.id,
        newStatus,
        evidence,
      );

      expect(result.status).toBe(newStatus);
      expect(result.evidence).toEqual(evidence);
      expect(mockContract.updateDeliveryStatus).toHaveBeenCalledWith(
        mockDelivery.id,
        newStatus,
        JSON.stringify(evidence),
      );
    });

    it('should throw an error if delivery is not found', async () => {
      ctx.prisma.delivery.findUnique.mockResolvedValue(null);

      await expect(deliveryService.updateDeliveryStatus(
        'non-existent-id',
        DeliveryStatus.IN_TRANSIT,
      )).rejects.toThrow('Delivery not found');
    });
  });

  describe('verifyDelivery', () => {
    const mockVerifier = {
      id: 'verifier-1',
      email: 'verifier@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      walletAddress: '0x456',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockDelivery = {
      id: 'delivery-1',
      status: DeliveryStatus.DELIVERED,
      verificationStatus: VerificationStatus.PENDING,
      contractAddress: '0xabc',
      pickupAddress: '123 Pickup St',
      deliveryAddress: '456 Delivery St',
      scheduledPickupTime: new Date(),
      scheduledDeliveryTime: new Date(),
      actualTime: new Date(),
      gpsData: {
        pickup: { lat: 123.456, lng: 789.012 },
        delivery: { lat: 345.678, lng: 901.234 },
      },
      evidence: null,
      logisticsId: 'logistics-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should verify a delivered delivery successfully', async () => {
      const verificationData = {
        status: VerificationStatus.VERIFIED,
        notes: 'Delivery verified through GPS and recipient confirmation',
        images: ['delivery1.jpg', 'delivery2.jpg'],
      };

      ctx.prisma.delivery.findUnique.mockResolvedValue(mockDelivery);
      ctx.prisma.delivery.update.mockResolvedValue({
        ...mockDelivery,
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedAt: expect.any(Date),
        verifiedBy: mockVerifier.id,
        evidence: verificationData,
      });

      const result = await deliveryService.verifyDelivery(
        mockDelivery.id,
        mockVerifier.id,
        verificationData,
      );

      expect(result.verificationStatus).toBe(VerificationStatus.VERIFIED);
      expect(result.verifiedBy).toBe(mockVerifier.id);
      expect(result.verifiedAt).toBeInstanceOf(Date);
      expect(result.evidence).toEqual(verificationData);
      
      expect(mockContract.verifyDelivery).toHaveBeenCalledWith(
        mockDelivery.id,
        mockVerifier.walletAddress,
        JSON.stringify(verificationData),
      );
    });

    it('should throw error when verifying non-delivered delivery', async () => {
      const nonDeliveredDelivery = {
        ...mockDelivery,
        status: DeliveryStatus.IN_TRANSIT,
      };

      ctx.prisma.delivery.findUnique.mockResolvedValue(nonDeliveredDelivery);

      await expect(deliveryService.verifyDelivery(
        nonDeliveredDelivery.id,
        mockVerifier.id,
        {
          status: VerificationStatus.VERIFIED,
          notes: 'Test',
          images: [],
        },
      )).rejects.toThrow('Only delivered deliveries can be verified');
    });

    it('should throw error when delivery is already verified', async () => {
      const verifiedDelivery = {
        ...mockDelivery,
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: 'other-verifier',
      };

      ctx.prisma.delivery.findUnique.mockResolvedValue(verifiedDelivery);

      await expect(deliveryService.verifyDelivery(
        verifiedDelivery.id,
        mockVerifier.id,
        {
          status: VerificationStatus.VERIFIED,
          notes: 'Test',
          images: [],
        },
      )).rejects.toThrow('Delivery is already verified');
    });

    it('should handle blockchain verification failure', async () => {
      mockContract.verifyDelivery.mockRejectedValue(
        new Error('Blockchain verification failed')
      );

      ctx.prisma.delivery.findUnique.mockResolvedValue(mockDelivery);

      await expect(deliveryService.verifyDelivery(
        mockDelivery.id,
        mockVerifier.id,
        {
          status: VerificationStatus.VERIFIED,
          notes: 'Test',
          images: [],
        },
      )).rejects.toThrow('Blockchain verification failed');
    });
  });

  describe('rejectVerification', () => {
    it('should reject delivery verification with reason', async () => {
      const mockDelivery = {
        id: 'delivery-1',
        status: DeliveryStatus.DELIVERED,
        verificationStatus: VerificationStatus.PENDING,
        contractAddress: '0xabc',
      };

      const rejectionReason = 'GPS data inconsistent with delivery location';

      ctx.prisma.delivery.findUnique.mockResolvedValue(mockDelivery);
      ctx.prisma.delivery.update.mockResolvedValue({
        ...mockDelivery,
        verificationStatus: VerificationStatus.REJECTED,
        evidence: {
          status: VerificationStatus.REJECTED,
          notes: rejectionReason,
        },
      });

      const result = await deliveryService.verifyDelivery(
        mockDelivery.id,
        'verifier-1',
        {
          status: VerificationStatus.REJECTED,
          notes: rejectionReason,
        },
      );

      expect(result.verificationStatus).toBe(VerificationStatus.REJECTED);
      expect(result.evidence.notes).toBe(rejectionReason);
      expect(mockContract.verifyDelivery).toHaveBeenCalledWith(
        mockDelivery.id,
        'verifier-1',
        JSON.stringify({
          status: VerificationStatus.REJECTED,
          notes: rejectionReason,
        }),
      );
    });
  });
});
