import { VerificationService } from '../../services/verification.service';
import {
  createTestContext,
  createMockData,
} from '../utils/test-utils';
import { VerificationStatus, VerificationType } from '@prisma/client';

describe('VerificationService', () => {
  const ctx = createTestContext();
  let verificationService: VerificationService;

  beforeEach(() => {
    verificationService = new VerificationService(ctx.prisma);
  });

  describe('createVerification', () => {
    const mockVerificationData = {
      volunteerId: createMockData.user().id,
      type: VerificationType.DONATION_DELIVERY,
      entityId: createMockData.donation().id,
      entityType: 'DONATION',
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      priority: 'HIGH',
      description: 'Verify donation delivery',
      requirements: ['Photo evidence', 'Recipient signature'],
    };

    it('should create a verification request', async () => {
      const mockCreatedVerification = createMockData.verification();
      ctx.prisma.verification.create.mockResolvedValue(mockCreatedVerification);

      const result = await verificationService.createVerification(mockVerificationData);

      expect(result).toEqual(mockCreatedVerification);
      expect(ctx.prisma.verification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          volunteerId: mockVerificationData.volunteerId,
          type: mockVerificationData.type,
          entityId: mockVerificationData.entityId,
          entityType: mockVerificationData.entityType,
          status: VerificationStatus.PENDING,
          dueDate: mockVerificationData.dueDate,
          priority: mockVerificationData.priority,
          description: mockVerificationData.description,
          requirements: mockVerificationData.requirements,
        }),
      });
    });

    it('should validate due date is in the future', async () => {
      const invalidData = {
        ...mockVerificationData,
        dueDate: new Date(Date.now() - 86400000), // Yesterday
      };

      await expect(verificationService.createVerification(invalidData))
        .rejects.toThrow('Due date must be in the future');
    });
  });

  describe('getVerification', () => {
    it('should return a verification by id', async () => {
      const mockVerification = createMockData.verification();
      ctx.prisma.verification.findUnique.mockResolvedValue(mockVerification);

      const result = await verificationService.getVerification(mockVerification.id);

      expect(result).toEqual(mockVerification);
      expect(ctx.prisma.verification.findUnique).toHaveBeenCalledWith({
        where: { id: mockVerification.id },
      });
    });

    it('should return null for non-existent verification', async () => {
      ctx.prisma.verification.findUnique.mockResolvedValue(null);

      const result = await verificationService.getVerification('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateVerificationStatus', () => {
    const mockVerification = createMockData.verification();

    it('should update verification status', async () => {
      const newStatus = VerificationStatus.IN_PROGRESS;
      const updatedVerification = { ...mockVerification, status: newStatus };

      ctx.prisma.verification.findUnique.mockResolvedValue(mockVerification);
      ctx.prisma.verification.update.mockResolvedValue(updatedVerification);

      const result = await verificationService.updateVerificationStatus(mockVerification.id, newStatus);

      expect(result).toEqual(updatedVerification);
      expect(ctx.prisma.verification.update).toHaveBeenCalledWith({
        where: { id: mockVerification.id },
        data: { status: newStatus },
      });
    });

    it('should handle non-existent verification', async () => {
      ctx.prisma.verification.findUnique.mockResolvedValue(null);

      await expect(verificationService.updateVerificationStatus(mockVerification.id, VerificationStatus.IN_PROGRESS))
        .rejects.toThrow('Verification not found');
    });

    it('should validate status transitions', async () => {
      const completedVerification = createMockData.verification({ status: VerificationStatus.COMPLETED });
      ctx.prisma.verification.findUnique.mockResolvedValue(completedVerification);

      await expect(verificationService.updateVerificationStatus(completedVerification.id, VerificationStatus.IN_PROGRESS))
        .rejects.toThrow('Cannot update completed verification');
    });
  });

  describe('addVerificationEvidence', () => {
    const mockVerification = createMockData.verification();
    const mockEvidence = {
      images: ['image1.jpg', 'image2.jpg'],
      description: 'Evidence description',
      location: {
        latitude: 6.5244,
        longitude: 3.3792,
      },
      timestamp: new Date(),
      metadata: {
        temperature: '25C',
        humidity: '60%',
      },
    };

    it('should add evidence to verification', async () => {
      const updatedVerification = {
        ...mockVerification,
        evidence: [...(mockVerification.evidence || []), mockEvidence],
      };

      ctx.prisma.verification.findUnique.mockResolvedValue(mockVerification);
      ctx.prisma.verification.update.mockResolvedValue(updatedVerification);

      const result = await verificationService.addVerificationEvidence(mockVerification.id, mockEvidence);

      expect(result).toEqual(updatedVerification);
      expect(ctx.prisma.verification.update).toHaveBeenCalledWith({
        where: { id: mockVerification.id },
        data: {
          evidence: [...(mockVerification.evidence || []), mockEvidence],
        },
      });
    });

    it('should handle non-existent verification', async () => {
      ctx.prisma.verification.findUnique.mockResolvedValue(null);

      await expect(verificationService.addVerificationEvidence(mockVerification.id, mockEvidence))
        .rejects.toThrow('Verification not found');
    });

    it('should validate evidence data', async () => {
      const invalidEvidence = {
        ...mockEvidence,
        images: [], // Empty images array
      };

      await expect(verificationService.addVerificationEvidence(mockVerification.id, invalidEvidence))
        .rejects.toThrow('Evidence must include at least one image');
    });
  });

  describe('listVerifications', () => {
    it('should return paginated verifications', async () => {
      const mockVerifications = [
        createMockData.verification(),
        createMockData.verification({ id: 'verification-2' }),
      ];
      const mockCount = 2;

      ctx.prisma.verification.findMany.mockResolvedValue(mockVerifications);
      ctx.prisma.verification.count.mockResolvedValue(mockCount);

      const result = await verificationService.listVerifications({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        items: mockVerifications,
        total: mockCount,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply filters correctly', async () => {
      const filters = {
        volunteerId: createMockData.user().id,
        type: VerificationType.DONATION_DELIVERY,
        status: VerificationStatus.PENDING,
        priority: 'HIGH',
        startDate: new Date(),
        endDate: new Date(),
      };

      await verificationService.listVerifications({
        page: 1,
        limit: 10,
        ...filters,
      });

      expect(ctx.prisma.verification.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          volunteerId: filters.volunteerId,
          type: filters.type,
          status: filters.status,
          priority: filters.priority,
          dueDate: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        }),
        skip: 0,
        take: 10,
      });
    });
  });

  describe('getVerificationsByEntity', () => {
    it('should return verifications for an entity', async () => {
      const entityId = createMockData.donation().id;
      const entityType = 'DONATION';
      const mockVerifications = [
        createMockData.verification(),
        createMockData.verification({ id: 'verification-2' }),
      ];

      ctx.prisma.verification.findMany.mockResolvedValue(mockVerifications);

      const result = await verificationService.getVerificationsByEntity(entityId, entityType);

      expect(result).toEqual(mockVerifications);
      expect(ctx.prisma.verification.findMany).toHaveBeenCalledWith({
        where: {
          entityId,
          entityType,
        },
      });
    });
  });
});
