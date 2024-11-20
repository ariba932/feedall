import { PrismaClient } from '@prisma/client';
import { AppError } from '@/middleware/error';
import {
  ImpactData,
  ImpactFilter,
  ImpactSummary,
  ImpactCategory,
} from '@/types/impact';

export class ImpactService {
  constructor(private prisma: PrismaClient) {}

  async createImpactRecord(data: ImpactData) {
    // Validate metrics
    if (!data.metrics || data.metrics.length === 0) {
      throw new AppError(400, 'At least one impact metric is required');
    }

    // Validate SDG goals
    if (data.sdgGoals.some(goal => goal < 1 || goal > 17)) {
      throw new AppError(400, 'Invalid SDG goals');
    }

    return this.prisma.impact.create({
      data: {
        entityId: data.entityId,
        entityType: data.entityType,
        category: data.category,
        metrics: data.metrics,
        evidence: data.evidence,
        location: data.location,
        date: data.date,
        description: data.description,
        beneficiaries: data.beneficiaries,
        sdgGoals: data.sdgGoals,
      },
    });
  }

  async getImpactRecord(id: string) {
    return this.prisma.impact.findUnique({
      where: { id },
    });
  }

  async updateImpactRecord(id: string, data: Partial<ImpactData>) {
    const impact = await this.prisma.impact.findUnique({
      where: { id },
    });

    if (!impact) {
      throw new AppError(404, 'Impact record not found');
    }

    return this.prisma.impact.update({
      where: { id },
      data,
    });
  }

  async listImpactRecords(params: {
    page: number;
    limit: number;
    filters?: ImpactFilter;
  }) {
    const { page, limit, filters } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters) {
      if (filters.entityType) {
        where.entityType = filters.entityType;
      }
      if (filters.category) {
        where.category = filters.category;
      }
      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.date.lte = filters.endDate;
        }
      }
      if (filters.location) {
        where['location.address'] = { contains: filters.location, mode: 'insensitive' };
      }
      if (filters.minBeneficiaries || filters.maxBeneficiaries) {
        where['beneficiaries.total'] = {};
        if (filters.minBeneficiaries) {
          where['beneficiaries.total'].gte = filters.minBeneficiaries;
        }
        if (filters.maxBeneficiaries) {
          where['beneficiaries.total'].lte = filters.maxBeneficiaries;
        }
      }
      if (filters.sdgGoal) {
        where.sdgGoals = { has: filters.sdgGoal };
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.impact.findMany({
        where,
        skip,
        take: limit,
      }),
      this.prisma.impact.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getImpactSummary(params: {
    timeframe: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    categories?: ImpactCategory[];
    entityType?: string;
    location?: string;
  }): Promise<ImpactSummary> {
    const { timeframe, categories, entityType, location } = params;

    // Build the query based on parameters
    const query = this.prisma.$queryRaw`
      SELECT 
        SUM(beneficiaries.total) as totalBeneficiaries,
        jsonb_agg(
          jsonb_build_object(
            'category', category,
            'total', total,
            'unit', unit
          )
        ) as metrics,
        jsonb_agg(
          jsonb_build_object(
            'location', location.address,
            'count', count(*)
          )
        ) as topLocations,
        jsonb_agg(
          jsonb_build_object(
            'goal', sdg,
            'count', count(*)
          )
        ) as sdgContributions
      FROM impact
      WHERE 1=1
      ${entityType ? Prisma.sql`AND entityType = ${entityType}` : Prisma.empty}
      ${location ? Prisma.sql`AND location->>'address' ILIKE ${`%${location}%`}` : Prisma.empty}
      ${categories ? Prisma.sql`AND category = ANY(${categories})` : Prisma.empty}
      GROUP BY date_trunc(${timeframe}, date)
    `;

    const results = await query;
    return results[0];
  }

  async getImpactsByEntity(entityId: string, entityType: string) {
    return this.prisma.impact.findMany({
      where: {
        entityId,
        entityType,
      },
    });
  }

  static async calculateUserImpact(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        donations: true,
        providedPacks: true,
        sponsoredPacks: true,
        feedingNeeds: true,
        deliveries: true,
        verifications: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    let impact = {
      totalDonations: 0,
      totalAmount: 0,
      beneficiariesReached: 0,
      mealsProvided: 0,
      deliveriesCompleted: 0,
      verificationsCompleted: 0,
    };

    // Calculate impact based on user role
    switch (user.role) {
      case 'DONOR':
        impact.totalDonations = user.donations.length;
        impact.totalAmount = user.donations.reduce(
          (sum, donation) => sum + donation.amount,
          0
        );
        break;

      case 'SERVICE_PROVIDER':
        impact.totalDonations = user.providedPacks.length;
        impact.mealsProvided = user.providedPacks.reduce(
          (sum, pack) => sum + pack.sponsoredQuantity,
          0
        );
        break;

      case 'NGO':
        impact.beneficiariesReached = user.feedingNeeds.reduce(
          (sum, need) => sum + need.beneficiaries,
          0
        );
        impact.mealsProvided = user.feedingNeeds.reduce(
          (sum, need) => sum + need.totalMeals,
          0
        );
        break;

      case 'LOGISTICS':
        impact.deliveriesCompleted = user.deliveries.filter(
          (d) => d.status === 'VERIFIED'
        ).length;
        break;

      case 'VOLUNTEER':
        impact.verificationsCompleted = user.verifications.filter(
          (v) => v.status === 'verified'
        ).length;
        break;
    }

    return impact;
  }

  static async calculateOverallImpact() {
    const [
      totalDonations,
      totalAmount,
      totalPacks,
      totalBeneficiaries,
      totalMeals,
      totalDeliveries,
      totalVerifications,
    ] = await Promise.all([
      prisma.donation.count(),
      prisma.donation.aggregate({
        _sum: { amount: true },
      }),
      prisma.foodPack.aggregate({
        _sum: { sponsoredQuantity: true },
      }),
      prisma.feedingNeed.aggregate({
        _sum: { beneficiaries: true },
      }),
      prisma.feedingNeed.aggregate({
        _sum: { totalMeals: true },
      }),
      prisma.delivery.count({
        where: { status: 'VERIFIED' },
      }),
      prisma.verification.count({
        where: { status: 'verified' },
      }),
    ]);

    return {
      totalDonations,
      totalAmount: totalAmount._sum.amount || 0,
      totalPacksSponsored: totalPacks._sum.sponsoredQuantity || 0,
      totalBeneficiaries: totalBeneficiaries._sum.beneficiaries || 0,
      totalMeals: totalMeals._sum.totalMeals || 0,
      totalDeliveries,
      totalVerifications,
    };
  }

  static async calculateRegionalImpact(location: string) {
    const [feedingNeeds, deliveries] = await Promise.all([
      prisma.feedingNeed.findMany({
        where: {
          location: { contains: location, mode: 'insensitive' },
        },
        include: {
          ngo: true,
        },
      }),
      prisma.delivery.findMany({
        where: {
          OR: [
            { pickupLocation: { contains: location, mode: 'insensitive' } },
            { dropoffLocation: { contains: location, mode: 'insensitive' } },
          ],
          status: 'VERIFIED',
        },
      }),
    ]);

    return {
      totalBeneficiaries: feedingNeeds.reduce(
        (sum, need) => sum + need.beneficiaries,
        0
      ),
      totalMeals: feedingNeeds.reduce((sum, need) => sum + need.totalMeals, 0),
      totalDeliveries: deliveries.length,
      activeNGOs: new Set(feedingNeeds.map((need) => need.ngoId)).size,
    };
  }

  static async updateUserImpactPoints(userId: string, points: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        impactPoints: { increment: points },
      },
    });
  }

  static async getTopContributors(role?: UserRole, limit: number = 10) {
    const where = role ? { role } : {};

    return prisma.user.findMany({
      where,
      orderBy: {
        impactPoints: 'desc',
      },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        impactPoints: true,
        avatar: true,
      },
    });
  }

  static async generateImpactReport(startDate: Date, endDate: Date) {
    const [donations, packs, needs, deliveries, verifications] = await Promise.all([
      prisma.donation.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.foodPack.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.feedingNeed.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.delivery.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'VERIFIED',
        },
      }),
      prisma.verification.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'verified',
        },
      }),
    ]);

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      metrics: {
        donations: {
          count: donations.length,
          totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
        },
        foodPacks: {
          count: packs.length,
          sponsoredQuantity: packs.reduce((sum, p) => sum + p.sponsoredQuantity, 0),
        },
        feedingNeeds: {
          count: needs.length,
          beneficiaries: needs.reduce((sum, n) => sum + n.beneficiaries, 0),
          totalMeals: needs.reduce((sum, n) => sum + n.totalMeals, 0),
        },
        deliveries: {
          count: deliveries.length,
        },
        verifications: {
          count: verifications.length,
        },
      },
    };
  }
}
