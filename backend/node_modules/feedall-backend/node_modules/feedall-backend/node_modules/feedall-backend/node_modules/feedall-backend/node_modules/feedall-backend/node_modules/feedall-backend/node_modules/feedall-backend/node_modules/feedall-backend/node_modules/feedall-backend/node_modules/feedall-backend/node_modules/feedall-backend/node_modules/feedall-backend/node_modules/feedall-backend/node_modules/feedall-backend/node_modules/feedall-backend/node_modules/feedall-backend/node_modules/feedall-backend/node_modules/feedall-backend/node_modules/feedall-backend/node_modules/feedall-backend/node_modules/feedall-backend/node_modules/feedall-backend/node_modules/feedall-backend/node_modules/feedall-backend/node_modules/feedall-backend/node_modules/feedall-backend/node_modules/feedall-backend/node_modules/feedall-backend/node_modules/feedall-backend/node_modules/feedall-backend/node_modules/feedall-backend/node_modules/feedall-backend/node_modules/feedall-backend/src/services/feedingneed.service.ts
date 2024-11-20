import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/middleware/error';

export class FeedingNeedService {
  static async createFeedingNeed(data: {
    location: string;
    beneficiaries: number;
    duration: number;
    mealsPerDay: number;
    totalMeals: number;
    budget: number;
    evidence: any;
    coordinates: any;
    ngoId: string;
  }) {
    // Validate NGO
    const ngo = await prisma.user.findUnique({
      where: { id: data.ngoId, role: 'NGO' },
    });

    if (!ngo) {
      throw new AppError(404, 'NGO not found');
    }

    return prisma.feedingNeed.create({
      data: {
        ...data,
        status: 'pending',
        ngo: { connect: { id: data.ngoId } },
      },
      include: {
        ngo: true,
      },
    });
  }

  static async getFeedingNeedById(id: string) {
    const feedingNeed = await prisma.feedingNeed.findUnique({
      where: { id },
      include: {
        ngo: true,
      },
    });

    if (!feedingNeed) {
      throw new AppError(404, 'Feeding need not found');
    }

    return feedingNeed;
  }

  static async updateFeedingNeed(
    id: string,
    data: Partial<{
      location: string;
      beneficiaries: number;
      duration: number;
      mealsPerDay: number;
      totalMeals: number;
      budget: number;
      evidence: any;
      coordinates: any;
      status: string;
    }>
  ) {
    const feedingNeed = await this.getFeedingNeedById(id);

    return prisma.feedingNeed.update({
      where: { id },
      data,
      include: {
        ngo: true,
      },
    });
  }

  static async getFeedingNeedsByNGO(ngoId: string) {
    return prisma.feedingNeed.findMany({
      where: { ngoId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getActiveFeedingNeeds(filters?: {
    location?: string;
    maxBudget?: number;
    minBeneficiaries?: number;
  }) {
    const where: Prisma.FeedingNeedWhereInput = {
      status: { in: ['pending', 'in-progress'] },
    };

    if (filters?.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters?.maxBudget) {
      where.budget = { lte: filters.maxBudget };
    }

    if (filters?.minBeneficiaries) {
      where.beneficiaries = { gte: filters.minBeneficiaries };
    }

    return prisma.feedingNeed.findMany({
      where,
      include: {
        ngo: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateFundingProgress(id: string, amount: number) {
    const feedingNeed = await this.getFeedingNeedById(id);
    const newProgress = feedingNeed.fundingProgress + amount;
    const status = newProgress >= feedingNeed.budget ? 'funded' : 'pending';

    return prisma.feedingNeed.update({
      where: { id },
      data: {
        fundingProgress: newProgress,
        status,
      },
      include: {
        ngo: true,
      },
    });
  }

  static async getNearbyFeedingNeeds(coordinates: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  }) {
    // This is a simplified version. In production, you'd want to use
    // PostGIS or a similar geospatial database for proper distance calculations
    const needs = await prisma.feedingNeed.findMany({
      where: {
        status: { in: ['pending', 'in-progress'] },
      },
      include: {
        ngo: true,
      },
    });

    return needs.filter((need) => {
      const needCoords = need.coordinates as any;
      const distance = calculateDistance(
        coordinates.latitude,
        coordinates.longitude,
        needCoords.latitude,
        needCoords.longitude
      );
      return distance <= coordinates.radiusKm;
    });
  }
}

// Haversine formula for calculating distance between two points on Earth
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
