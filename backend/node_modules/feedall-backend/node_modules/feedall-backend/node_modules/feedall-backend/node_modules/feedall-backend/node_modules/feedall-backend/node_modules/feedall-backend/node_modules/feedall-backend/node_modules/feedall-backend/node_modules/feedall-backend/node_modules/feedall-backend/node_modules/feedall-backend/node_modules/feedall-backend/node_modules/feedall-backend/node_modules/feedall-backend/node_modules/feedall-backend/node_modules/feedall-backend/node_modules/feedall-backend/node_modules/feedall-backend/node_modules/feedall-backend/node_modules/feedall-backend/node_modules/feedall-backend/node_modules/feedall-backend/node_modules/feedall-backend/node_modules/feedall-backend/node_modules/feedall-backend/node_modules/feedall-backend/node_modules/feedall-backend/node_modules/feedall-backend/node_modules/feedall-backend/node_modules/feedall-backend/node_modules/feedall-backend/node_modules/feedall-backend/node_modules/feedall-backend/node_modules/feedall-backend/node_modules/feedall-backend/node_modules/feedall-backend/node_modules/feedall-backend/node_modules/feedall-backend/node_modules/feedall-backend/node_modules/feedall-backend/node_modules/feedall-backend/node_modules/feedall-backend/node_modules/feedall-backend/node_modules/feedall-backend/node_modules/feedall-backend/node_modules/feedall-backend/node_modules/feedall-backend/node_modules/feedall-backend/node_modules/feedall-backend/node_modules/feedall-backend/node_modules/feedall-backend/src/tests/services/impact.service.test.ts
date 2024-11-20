import { PrismaClient, ImpactCategory } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { ImpactService } from '../../services/impact.service';
import { createMockData } from '../utils/test-utils';

describe('ImpactService', () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let service: ImpactService;
  
  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    service = new ImpactService(prisma);
  });

  describe('create', () => {
    it('should create an impact record', async () => {
      const mockImpact = createMockData.impact();
      prisma.impact.create.mockResolvedValue(mockImpact);

      const result = await service.create(mockImpact);
      expect(result).toEqual(mockImpact);
      expect(prisma.impact.create).toHaveBeenCalledWith({
        data: mockImpact
      });
    });

    it('should handle invalid JSON data', async () => {
      const invalidImpact = {
        ...createMockData.impact(),
        metrics: 'invalid-json'
      };

      await expect(service.create(invalidImpact))
        .rejects
        .toThrow('Invalid JSON data');
    });
  });

  describe('getById', () => {
    it('should return impact by id', async () => {
      const mockImpact = createMockData.impact();
      prisma.impact.findUnique.mockResolvedValue(mockImpact);

      const result = await service.getById(mockImpact.id);
      expect(result).toEqual(mockImpact);
      expect(prisma.impact.findUnique).toHaveBeenCalledWith({
        where: { id: mockImpact.id }
      });
    });

    it('should return null for non-existent impact', async () => {
      prisma.impact.findUnique.mockResolvedValue(null);

      const result = await service.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getByEntity', () => {
    it('should return impacts by entity', async () => {
      const mockImpacts = [createMockData.impact(), createMockData.impact()];
      prisma.impact.findMany.mockResolvedValue(mockImpacts);

      const entityId = mockImpacts[0].entityId;
      const entityType = mockImpacts[0].entityType;

      const result = await service.getByEntity(entityId, entityType);
      expect(result).toEqual(mockImpacts);
      expect(prisma.impact.findMany).toHaveBeenCalledWith({
        where: { 
          entityId,
          entityType
        }
      });
    });
  });

  describe('update', () => {
    it('should update impact record', async () => {
      const mockImpact = createMockData.impact();
      const updateData = {
        description: 'Updated description',
        metrics: JSON.stringify([{
          category: 'MEALS_SERVED',
          value: 200,
          unit: 'meals',
          description: 'Updated meals served'
        }])
      };

      prisma.impact.update.mockResolvedValue({
        ...mockImpact,
        ...updateData
      });

      const result = await service.update(mockImpact.id, updateData);
      expect(result.description).toBe(updateData.description);
      expect(prisma.impact.update).toHaveBeenCalledWith({
        where: { id: mockImpact.id },
        data: updateData
      });
    });

    it('should handle non-existent impact', async () => {
      prisma.impact.update.mockRejectedValue(new Error('Record not found'));

      await expect(service.update('non-existent-id', {}))
        .rejects
        .toThrow('Record not found');
    });
  });

  describe('summarize', () => {
    it('should summarize impact metrics', async () => {
      const mockImpacts = [
        createMockData.impact({
          metrics: JSON.stringify([{
            category: 'MEALS_SERVED',
            value: 100,
            unit: 'meals'
          }])
        }),
        createMockData.impact({
          metrics: JSON.stringify([{
            category: 'MEALS_SERVED',
            value: 150,
            unit: 'meals'
          }])
        })
      ];

      prisma.impact.findMany.mockResolvedValue(mockImpacts);

      const result = await service.summarize();
      expect(result).toEqual({
        MEALS_SERVED: {
          total: 250,
          unit: 'meals',
          count: 2
        }
      });
    });

    it('should handle empty metrics', async () => {
      prisma.impact.findMany.mockResolvedValue([]);

      const result = await service.summarize();
      expect(result).toEqual({});
    });
  });
});
