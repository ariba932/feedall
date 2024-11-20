import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/middleware/error';

export class FoodPackService {
  static async createFoodPack(data: {
    name: string;
    description?: string;
    contents: any;
    unitCost: number;
    quantity: number;
    validUntil: Date;
    deliveryZones: string[];
    minOrder: number;
    deliveryTime: any;
    providerId: string;
  }) {
    // Validate provider
    const provider = await prisma.user.findUnique({
      where: { id: data.providerId, role: 'SERVICE_PROVIDER' },
    });

    if (!provider) {
      throw new AppError(404, 'Service provider not found');
    }

    return prisma.foodPack.create({
      data: {
        ...data,
        availableQuantity: data.quantity,
        provider: { connect: { id: data.providerId } },
      },
      include: {
        provider: true,
        sponsor: true,
      },
    });
  }

  static async getFoodPackById(id: string) {
    const foodPack = await prisma.foodPack.findUnique({
      where: { id },
      include: {
        provider: true,
        sponsor: true,
      },
    });

    if (!foodPack) {
      throw new AppError(404, 'Food pack not found');
    }

    return foodPack;
  }

  static async updateFoodPack(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      contents: any;
      unitCost: number;
      quantity: number;
      validUntil: Date;
      deliveryZones: string[];
      minOrder: number;
      deliveryTime: any;
    }>
  ) {
    const foodPack = await this.getFoodPackById(id);

    // If quantity is being updated, adjust availableQuantity
    if (data.quantity) {
      const quantityDiff = data.quantity - foodPack.quantity;
      data = {
        ...data,
        availableQuantity: foodPack.availableQuantity + quantityDiff,
      };
    }

    return prisma.foodPack.update({
      where: { id },
      data,
      include: {
        provider: true,
        sponsor: true,
      },
    });
  }

  static async getFoodPacksByProvider(providerId: string) {
    return prisma.foodPack.findMany({
      where: { providerId },
      include: {
        sponsor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAvailableFoodPacks(filters?: {
    deliveryZone?: string;
    maxUnitCost?: number;
    minQuantity?: number;
  }) {
    const where: Prisma.FoodPackWhereInput = {
      availableQuantity: { gt: 0 },
      validUntil: { gt: new Date() },
    };

    if (filters?.deliveryZone) {
      where.deliveryZones = { has: filters.deliveryZone };
    }

    if (filters?.maxUnitCost) {
      where.unitCost = { lte: filters.maxUnitCost };
    }

    if (filters?.minQuantity) {
      where.availableQuantity = { gte: filters.minQuantity };
    }

    return prisma.foodPack.findMany({
      where,
      include: {
        provider: true,
        sponsor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async sponsorFoodPack(id: string, sponsorId: string, quantity: number) {
    const foodPack = await this.getFoodPackById(id);

    if (foodPack.availableQuantity < quantity) {
      throw new AppError(400, 'Requested quantity exceeds available quantity');
    }

    // Validate sponsor
    const sponsor = await prisma.user.findUnique({
      where: { id: sponsorId },
    });

    if (!sponsor) {
      throw new AppError(404, 'Sponsor not found');
    }

    return prisma.foodPack.update({
      where: { id },
      data: {
        isSponsored: true,
        sponsoredQuantity: { increment: quantity },
        availableQuantity: { decrement: quantity },
        sponsor: { connect: { id: sponsorId } },
      },
      include: {
        provider: true,
        sponsor: true,
      },
    });
  }

  static async getSponsoredFoodPacks(sponsorId: string) {
    return prisma.foodPack.findMany({
      where: {
        sponsorId,
        isSponsored: true,
      },
      include: {
        provider: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
