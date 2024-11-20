import { FoodPackService } from '../../services/foodpack.service';
import { BlockchainService } from '../../services/blockchain.service';
import {
  createTestContext,
  mockContract,
  mockProvider,
  mockSigner,
  createMockData,
} from '../utils/test-utils';
import { FoodPackStatus } from '@prisma/client';

describe('FoodPackService', () => {
  const ctx = createTestContext();
  const blockchainService = new BlockchainService();
  let foodPackService: FoodPackService;

  beforeEach(() => {
    foodPackService = new FoodPackService(ctx.prisma, blockchainService);
    // Mock blockchain service methods
    jest.spyOn(blockchainService, 'getContract').mockResolvedValue(mockContract);
    jest.spyOn(blockchainService, 'getProvider').mockResolvedValue(mockProvider);
    jest.spyOn(blockchainService, 'getSigner').mockResolvedValue(mockSigner);
  });

  describe('createFoodPack', () => {
    const mockFoodPackData = {
      name: 'Test Food Pack',
      description: 'Test food pack description',
      items: ['Rice', 'Beans'],
      quantity: 100,
      nutritionalInfo: {
        calories: 2000,
        protein: 50,
        carbs: 300,
        fat: 20,
      },
    };

    it('should create a food pack and blockchain contract', async () => {
      const mockCreatedFoodPack = createMockData.foodPack();
      ctx.prisma.foodPack.create.mockResolvedValue(mockCreatedFoodPack);

      const result = await foodPackService.createFoodPack(mockFoodPackData);

      expect(result).toEqual(mockCreatedFoodPack);
      expect(ctx.prisma.foodPack.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: mockFoodPackData.name,
          description: mockFoodPackData.description,
          items: mockFoodPackData.items,
          quantity: mockFoodPackData.quantity,
          status: FoodPackStatus.AVAILABLE,
          contractAddress: expect.any(String),
        }),
      });
      expect(mockContract.createFoodPack).toHaveBeenCalled();
    });

    it('should handle blockchain contract creation failure', async () => {
      mockContract.createFoodPack.mockRejectedValue(new Error('Blockchain error'));

      await expect(foodPackService.createFoodPack(mockFoodPackData))
        .rejects.toThrow('Failed to create food pack contract');
    });
  });

  describe('getFoodPack', () => {
    it('should return a food pack by id', async () => {
      const mockFoodPack = createMockData.foodPack();
      ctx.prisma.foodPack.findUnique.mockResolvedValue(mockFoodPack);

      const result = await foodPackService.getFoodPack(mockFoodPack.id);

      expect(result).toEqual(mockFoodPack);
      expect(ctx.prisma.foodPack.findUnique).toHaveBeenCalledWith({
        where: { id: mockFoodPack.id },
      });
    });

    it('should return null for non-existent food pack', async () => {
      ctx.prisma.foodPack.findUnique.mockResolvedValue(null);

      const result = await foodPackService.getFoodPack('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateFoodPackStatus', () => {
    const mockFoodPack = createMockData.foodPack();

    it('should update food pack status and blockchain contract', async () => {
      const newStatus = FoodPackStatus.ALLOCATED;
      const updatedFoodPack = { ...mockFoodPack, status: newStatus };

      ctx.prisma.foodPack.findUnique.mockResolvedValue(mockFoodPack);
      ctx.prisma.foodPack.update.mockResolvedValue(updatedFoodPack);

      const result = await foodPackService.updateFoodPackStatus(mockFoodPack.id, newStatus);

      expect(result).toEqual(updatedFoodPack);
      expect(ctx.prisma.foodPack.update).toHaveBeenCalledWith({
        where: { id: mockFoodPack.id },
        data: { status: newStatus },
      });
      expect(mockContract.updateStatus).toHaveBeenCalledWith(mockFoodPack.id, newStatus);
    });

    it('should handle non-existent food pack', async () => {
      ctx.prisma.foodPack.findUnique.mockResolvedValue(null);

      await expect(foodPackService.updateFoodPackStatus(mockFoodPack.id, FoodPackStatus.ALLOCATED))
        .rejects.toThrow('Food pack not found');
    });

    it('should handle blockchain status update failure', async () => {
      ctx.prisma.foodPack.findUnique.mockResolvedValue(mockFoodPack);
      mockContract.updateStatus.mockRejectedValue(new Error('Blockchain error'));

      await expect(foodPackService.updateFoodPackStatus(mockFoodPack.id, FoodPackStatus.ALLOCATED))
        .rejects.toThrow('Failed to update food pack status on blockchain');
    });
  });

  describe('listFoodPacks', () => {
    it('should return paginated food packs', async () => {
      const mockFoodPacks = [
        createMockData.foodPack(),
        createMockData.foodPack({ id: 'foodpack-2' }),
      ];
      const mockCount = 2;

      ctx.prisma.foodPack.findMany.mockResolvedValue(mockFoodPacks);
      ctx.prisma.foodPack.count.mockResolvedValue(mockCount);

      const result = await foodPackService.listFoodPacks({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        items: mockFoodPacks,
        total: mockCount,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply filters correctly', async () => {
      const filters = {
        status: FoodPackStatus.AVAILABLE,
        minQuantity: 50,
        maxQuantity: 150,
        items: ['Rice'],
      };

      await foodPackService.listFoodPacks({
        page: 1,
        limit: 10,
        ...filters,
      });

      expect(ctx.prisma.foodPack.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: filters.status,
          quantity: {
            gte: filters.minQuantity,
            lte: filters.maxQuantity,
          },
          items: {
            hasEvery: filters.items,
          },
        }),
        skip: 0,
        take: 10,
      });
    });
  });

  describe('updateFoodPackQuantity', () => {
    const mockFoodPack = createMockData.foodPack();

    it('should update food pack quantity', async () => {
      const newQuantity = 150;
      const updatedFoodPack = { ...mockFoodPack, quantity: newQuantity };

      ctx.prisma.foodPack.findUnique.mockResolvedValue(mockFoodPack);
      ctx.prisma.foodPack.update.mockResolvedValue(updatedFoodPack);

      const result = await foodPackService.updateFoodPackQuantity(mockFoodPack.id, newQuantity);

      expect(result).toEqual(updatedFoodPack);
      expect(ctx.prisma.foodPack.update).toHaveBeenCalledWith({
        where: { id: mockFoodPack.id },
        data: { quantity: newQuantity },
      });
    });

    it('should handle invalid quantity', async () => {
      await expect(foodPackService.updateFoodPackQuantity(mockFoodPack.id, -10))
        .rejects.toThrow('Invalid quantity');
    });
  });
});
