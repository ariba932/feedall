import { FeedingNeedService } from '../../services/feedingneed.service';
import { BlockchainService } from '../../services/blockchain.service';
import {
  createTestContext,
  mockContract,
  mockProvider,
  mockSigner,
  createMockData,
} from '../utils/test-utils';
import { FeedingNeedStatus } from '@prisma/client';

describe('FeedingNeedService', () => {
  const ctx = createTestContext();
  const blockchainService = new BlockchainService();
  let feedingNeedService: FeedingNeedService;

  beforeEach(() => {
    feedingNeedService = new FeedingNeedService(ctx.prisma, blockchainService);
    // Mock blockchain service methods
    jest.spyOn(blockchainService, 'getContract').mockResolvedValue(mockContract);
    jest.spyOn(blockchainService, 'getProvider').mockResolvedValue(mockProvider);
    jest.spyOn(blockchainService, 'getSigner').mockResolvedValue(mockSigner);
  });

  describe('createFeedingNeed', () => {
    const mockFeedingNeedData = {
      title: 'Test Feeding Need',
      description: 'Test feeding need description',
      beneficiaries: 100,
      location: 'Lagos, Nigeria',
      coordinates: {
        latitude: 6.5244,
        longitude: 3.3792,
      },
      requiredItems: ['Rice', 'Beans'],
      urgencyLevel: 'HIGH',
      targetDate: new Date(),
    };

    it('should create a feeding need and blockchain contract', async () => {
      const mockCreatedFeedingNeed = createMockData.feedingNeed();
      ctx.prisma.feedingNeed.create.mockResolvedValue(mockCreatedFeedingNeed);

      const result = await feedingNeedService.createFeedingNeed(mockFeedingNeedData);

      expect(result).toEqual(mockCreatedFeedingNeed);
      expect(ctx.prisma.feedingNeed.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: mockFeedingNeedData.title,
          description: mockFeedingNeedData.description,
          beneficiaries: mockFeedingNeedData.beneficiaries,
          location: mockFeedingNeedData.location,
          status: FeedingNeedStatus.PENDING,
          contractAddress: expect.any(String),
        }),
      });
      expect(mockContract.createFeedingNeed).toHaveBeenCalled();
    });

    it('should handle blockchain contract creation failure', async () => {
      mockContract.createFeedingNeed.mockRejectedValue(new Error('Blockchain error'));

      await expect(feedingNeedService.createFeedingNeed(mockFeedingNeedData))
        .rejects.toThrow('Failed to create feeding need contract');
    });
  });

  describe('getFeedingNeed', () => {
    it('should return a feeding need by id', async () => {
      const mockFeedingNeed = createMockData.feedingNeed();
      ctx.prisma.feedingNeed.findUnique.mockResolvedValue(mockFeedingNeed);

      const result = await feedingNeedService.getFeedingNeed(mockFeedingNeed.id);

      expect(result).toEqual(mockFeedingNeed);
      expect(ctx.prisma.feedingNeed.findUnique).toHaveBeenCalledWith({
        where: { id: mockFeedingNeed.id },
      });
    });

    it('should return null for non-existent feeding need', async () => {
      ctx.prisma.feedingNeed.findUnique.mockResolvedValue(null);

      const result = await feedingNeedService.getFeedingNeed('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateFeedingNeedStatus', () => {
    const mockFeedingNeed = createMockData.feedingNeed();

    it('should update feeding need status and blockchain contract', async () => {
      const newStatus = FeedingNeedStatus.IN_PROGRESS;
      const updatedFeedingNeed = { ...mockFeedingNeed, status: newStatus };

      ctx.prisma.feedingNeed.findUnique.mockResolvedValue(mockFeedingNeed);
      ctx.prisma.feedingNeed.update.mockResolvedValue(updatedFeedingNeed);

      const result = await feedingNeedService.updateFeedingNeedStatus(mockFeedingNeed.id, newStatus);

      expect(result).toEqual(updatedFeedingNeed);
      expect(ctx.prisma.feedingNeed.update).toHaveBeenCalledWith({
        where: { id: mockFeedingNeed.id },
        data: { status: newStatus },
      });
      expect(mockContract.updateStatus).toHaveBeenCalledWith(mockFeedingNeed.id, newStatus);
    });

    it('should handle non-existent feeding need', async () => {
      ctx.prisma.feedingNeed.findUnique.mockResolvedValue(null);

      await expect(feedingNeedService.updateFeedingNeedStatus(mockFeedingNeed.id, FeedingNeedStatus.IN_PROGRESS))
        .rejects.toThrow('Feeding need not found');
    });

    it('should handle blockchain status update failure', async () => {
      ctx.prisma.feedingNeed.findUnique.mockResolvedValue(mockFeedingNeed);
      mockContract.updateStatus.mockRejectedValue(new Error('Blockchain error'));

      await expect(feedingNeedService.updateFeedingNeedStatus(mockFeedingNeed.id, FeedingNeedStatus.IN_PROGRESS))
        .rejects.toThrow('Failed to update feeding need status on blockchain');
    });
  });

  describe('listFeedingNeeds', () => {
    it('should return paginated feeding needs', async () => {
      const mockFeedingNeeds = [
        createMockData.feedingNeed(),
        createMockData.feedingNeed({ id: 'feedingneed-2' }),
      ];
      const mockCount = 2;

      ctx.prisma.feedingNeed.findMany.mockResolvedValue(mockFeedingNeeds);
      ctx.prisma.feedingNeed.count.mockResolvedValue(mockCount);

      const result = await feedingNeedService.listFeedingNeeds({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        items: mockFeedingNeeds,
        total: mockCount,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply filters correctly', async () => {
      const filters = {
        status: FeedingNeedStatus.PENDING,
        location: 'Lagos',
        minBeneficiaries: 50,
        maxBeneficiaries: 150,
        urgencyLevel: 'HIGH',
      };

      await feedingNeedService.listFeedingNeeds({
        page: 1,
        limit: 10,
        ...filters,
      });

      expect(ctx.prisma.feedingNeed.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: filters.status,
          location: { contains: filters.location, mode: 'insensitive' },
          beneficiaries: {
            gte: filters.minBeneficiaries,
            lte: filters.maxBeneficiaries,
          },
          urgencyLevel: filters.urgencyLevel,
        }),
        skip: 0,
        take: 10,
      });
    });
  });

  describe('updateFeedingNeedDetails', () => {
    const mockFeedingNeed = createMockData.feedingNeed();

    it('should update feeding need details', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
        beneficiaries: 150,
        targetDate: new Date(),
      };
      const updatedFeedingNeed = { ...mockFeedingNeed, ...updateData };

      ctx.prisma.feedingNeed.findUnique.mockResolvedValue(mockFeedingNeed);
      ctx.prisma.feedingNeed.update.mockResolvedValue(updatedFeedingNeed);

      const result = await feedingNeedService.updateFeedingNeedDetails(mockFeedingNeed.id, updateData);

      expect(result).toEqual(updatedFeedingNeed);
      expect(ctx.prisma.feedingNeed.update).toHaveBeenCalledWith({
        where: { id: mockFeedingNeed.id },
        data: updateData,
      });
    });

    it('should handle non-existent feeding need', async () => {
      ctx.prisma.feedingNeed.findUnique.mockResolvedValue(null);

      await expect(feedingNeedService.updateFeedingNeedDetails(mockFeedingNeed.id, { title: 'Updated Title' }))
        .rejects.toThrow('Feeding need not found');
    });
  });
});
