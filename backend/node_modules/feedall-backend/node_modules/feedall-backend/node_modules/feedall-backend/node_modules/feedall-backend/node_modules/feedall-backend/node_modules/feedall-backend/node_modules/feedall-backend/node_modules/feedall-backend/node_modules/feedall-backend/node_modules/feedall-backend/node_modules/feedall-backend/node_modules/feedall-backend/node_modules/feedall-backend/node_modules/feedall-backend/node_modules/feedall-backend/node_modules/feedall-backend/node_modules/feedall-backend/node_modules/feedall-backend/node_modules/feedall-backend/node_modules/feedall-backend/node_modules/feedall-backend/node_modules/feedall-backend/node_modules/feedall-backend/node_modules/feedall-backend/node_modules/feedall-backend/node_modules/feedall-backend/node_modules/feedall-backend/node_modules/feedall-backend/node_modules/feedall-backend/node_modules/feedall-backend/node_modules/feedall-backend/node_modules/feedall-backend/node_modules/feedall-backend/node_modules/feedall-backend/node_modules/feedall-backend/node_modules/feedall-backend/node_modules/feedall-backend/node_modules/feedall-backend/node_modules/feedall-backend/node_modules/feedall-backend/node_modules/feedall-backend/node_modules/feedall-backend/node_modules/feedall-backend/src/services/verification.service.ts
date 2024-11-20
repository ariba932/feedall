import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/middleware/error';

export class VerificationService {
  static async createVerification(data: {
    type: string;
    evidence?: any;
    notes?: string;
    volunteerId: string;
  }) {
    // Validate volunteer
    const volunteer = await prisma.user.findUnique({
      where: { id: data.volunteerId, role: 'VOLUNTEER' },
    });

    if (!volunteer) {
      throw new AppError(404, 'Volunteer not found');
    }

    return prisma.verification.create({
      data: {
        ...data,
        status: 'pending',
        volunteer: { connect: { id: data.volunteerId } },
      },
      include: {
        volunteer: true,
      },
    });
  }

  static async getVerificationById(id: string) {
    const verification = await prisma.verification.findUnique({
      where: { id },
      include: {
        volunteer: true,
      },
    });

    if (!verification) {
      throw new AppError(404, 'Verification not found');
    }

    return verification;
  }

  static async updateVerificationStatus(
    id: string,
    status: string,
    notes?: string
  ) {
    const verification = await this.getVerificationById(id);
    const data: any = { status };

    if (notes) {
      data.notes = notes;
    }

    return prisma.verification.update({
      where: { id },
      data,
      include: {
        volunteer: true,
      },
    });
  }

  static async addVerificationEvidence(id: string, evidence: any) {
    const verification = await this.getVerificationById(id);
    const currentEvidence = verification.evidence || [];

    return prisma.verification.update({
      where: { id },
      data: {
        evidence: [...currentEvidence, evidence],
      },
      include: {
        volunteer: true,
      },
    });
  }

  static async getVerificationsByVolunteer(volunteerId: string) {
    return prisma.verification.findMany({
      where: { volunteerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getPendingVerifications() {
    return prisma.verification.findMany({
      where: { status: 'pending' },
      include: {
        volunteer: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async searchVerifications(filters: {
    type?: string;
    status?: string[];
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status?.length) {
      where.status = { in: filters.status };
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    return prisma.verification.findMany({
      where,
      include: {
        volunteer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getVerificationsByType(type: string) {
    return prisma.verification.findMany({
      where: { type },
      include: {
        volunteer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getVolunteerStats(volunteerId: string) {
    const verifications = await prisma.verification.findMany({
      where: { volunteerId },
    });

    return {
      total: verifications.length,
      pending: verifications.filter((v) => v.status === 'pending').length,
      verified: verifications.filter((v) => v.status === 'verified').length,
      rejected: verifications.filter((v) => v.status === 'rejected').length,
    };
  }
}
