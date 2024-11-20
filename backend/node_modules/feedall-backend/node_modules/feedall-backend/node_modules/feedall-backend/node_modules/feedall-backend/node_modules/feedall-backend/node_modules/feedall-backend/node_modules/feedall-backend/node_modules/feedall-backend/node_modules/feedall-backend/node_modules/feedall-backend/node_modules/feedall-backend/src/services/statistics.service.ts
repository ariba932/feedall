import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class StatisticsService {
  static async getUserStatistics() {
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        _all: true,
      },
    });

    const activeUsers = await prisma.user.count({
      where: {
        status: 'ACTIVE',
      },
    });

    return {
      totalUsers: userStats.reduce((sum, stat) => sum + stat._count._all, 0),
      activeUsers,
      roleDistribution: userStats.reduce(
        (acc, stat) => ({
          ...acc,
          [stat.role]: stat._count._all,
        }),
        {} as Record<UserRole, number>
      ),
    };
  }

  static async getDonationStatistics(period?: {
    startDate: Date;
    endDate: Date;
  }) {
    const where = period
      ? {
          createdAt: {
            gte: period.startDate,
            lte: period.endDate,
          },
        }
      : {};

    const [donationStats, typeDistribution, avgAmount] = await Promise.all([
      prisma.donation.aggregate({
        where,
        _count: {
          _all: true,
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.donation.groupBy({
        where,
        by: ['type'],
        _count: {
          _all: true,
        },
      }),
      prisma.donation.aggregate({
        where,
        _avg: {
          amount: true,
        },
      }),
    ]);

    return {
      totalDonations: donationStats._count._all,
      totalAmount: donationStats._sum.amount || 0,
      averageAmount: avgAmount._avg.amount || 0,
      typeDistribution: typeDistribution.reduce(
        (acc, stat) => ({
          ...acc,
          [stat.type]: stat._count._all,
        }),
        {}
      ),
    };
  }

  static async getFoodPackStatistics() {
    const [packStats, availabilityStats] = await Promise.all([
      prisma.foodPack.aggregate({
        _count: {
          _all: true,
        },
        _sum: {
          quantity: true,
          sponsoredQuantity: true,
          availableQuantity: true,
        },
        _avg: {
          unitCost: true,
        },
      }),
      prisma.foodPack.count({
        where: {
          availableQuantity: { gt: 0 },
          validUntil: { gt: new Date() },
        },
      }),
    ]);

    return {
      totalPacks: packStats._count._all,
      totalQuantity: packStats._sum.quantity || 0,
      sponsoredQuantity: packStats._sum.sponsoredQuantity || 0,
      availableQuantity: packStats._sum.availableQuantity || 0,
      averageUnitCost: packStats._avg.unitCost || 0,
      availablePacks: availabilityStats,
    };
  }

  static async getFeedingNeedStatistics() {
    const [needStats, statusDistribution] = await Promise.all([
      prisma.feedingNeed.aggregate({
        _count: {
          _all: true,
        },
        _sum: {
          beneficiaries: true,
          totalMeals: true,
          budget: true,
          fundingProgress: true,
        },
      }),
      prisma.feedingNeed.groupBy({
        by: ['status'],
        _count: {
          _all: true,
        },
      }),
    ]);

    return {
      totalNeeds: needStats._count._all,
      totalBeneficiaries: needStats._sum.beneficiaries || 0,
      totalMeals: needStats._sum.totalMeals || 0,
      totalBudget: needStats._sum.budget || 0,
      totalFunding: needStats._sum.fundingProgress || 0,
      statusDistribution: statusDistribution.reduce(
        (acc, stat) => ({
          ...acc,
          [stat.status]: stat._count._all,
        }),
        {}
      ),
    };
  }

  static async getDeliveryStatistics(period?: {
    startDate: Date;
    endDate: Date;
  }) {
    const where = period
      ? {
          createdAt: {
            gte: period.startDate,
            lte: period.endDate,
          },
        }
      : {};

    const [deliveryStats, statusDistribution] = await Promise.all([
      prisma.delivery.aggregate({
        where,
        _count: {
          _all: true,
        },
      }),
      prisma.delivery.groupBy({
        where,
        by: ['status'],
        _count: {
          _all: true,
        },
      }),
    ]);

    return {
      totalDeliveries: deliveryStats._count._all,
      statusDistribution: statusDistribution.reduce(
        (acc, stat) => ({
          ...acc,
          [stat.status]: stat._count._all,
        }),
        {}
      ),
    };
  }

  static async getVerificationStatistics() {
    const [verificationStats, typeDistribution, statusDistribution] =
      await Promise.all([
        prisma.verification.aggregate({
          _count: {
            _all: true,
          },
        }),
        prisma.verification.groupBy({
          by: ['type'],
          _count: {
            _all: true,
          },
        }),
        prisma.verification.groupBy({
          by: ['status'],
          _count: {
            _all: true,
          },
        }),
      ]);

    return {
      totalVerifications: verificationStats._count._all,
      typeDistribution: typeDistribution.reduce(
        (acc, stat) => ({
          ...acc,
          [stat.type]: stat._count._all,
        }),
        {}
      ),
      statusDistribution: statusDistribution.reduce(
        (acc, stat) => ({
          ...acc,
          [stat.status]: stat._count._all,
        }),
        {}
      ),
    };
  }

  static async getActivityTimeline(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [donations, packs, needs, deliveries, verifications] = await Promise.all([
      prisma.donation.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.foodPack.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.feedingNeed.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.delivery.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.verification.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    const timeline: Record<string, any> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      timeline[dateStr] = {
        donations: 0,
        packs: 0,
        needs: 0,
        deliveries: 0,
        verifications: 0,
      };
    }

    // Count activities per day
    [
      { data: donations, key: 'donations' },
      { data: packs, key: 'packs' },
      { data: needs, key: 'needs' },
      { data: deliveries, key: 'deliveries' },
      { data: verifications, key: 'verifications' },
    ].forEach(({ data, key }) => {
      data.forEach((item) => {
        const dateStr = item.createdAt.toISOString().split('T')[0];
        if (timeline[dateStr]) {
          timeline[dateStr][key]++;
        }
      });
    });

    return Object.entries(timeline).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  }
}
