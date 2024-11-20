import { PrismaClient, User, UserRole, UserStatus } from '@prisma/client';
import { AppError } from '@/middleware/error';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export class OnboardingService {
  constructor(private readonly prisma: PrismaClient = prisma) {}

  /**
   * Handle donor onboarding - automatically activated
   */
  async onboardDonor(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: any;
    companyName?: string;
    taxId?: string;
    preferredPickupTimes?: string[];
  }): Promise<User> {
    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create donor user with active status
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: UserRole.DONOR,
        status: UserStatus.ACTIVE, // Donors are automatically activated
        preferences: {},
        verificationDocuments: {},
      },
    });
  }

  /**
   * Handle non-donor onboarding - requires KYC verification
   */
  async onboardNonDonor(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: any;
    role: UserRole;
    companyName: string;
    taxId: string;
    businessType: string;
    kycDocuments: any[];
    registrationNumber: string;
    operatingLicense: any;
  }): Promise<User> {
    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    if (data.role === UserRole.DONOR) {
      throw new AppError(400, 'Invalid role for non-donor onboarding');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user with inactive status pending KYC verification
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        status: UserStatus.INACTIVE, // Non-donors start as inactive
        preferences: {},
        verificationDocuments: {
          documents: data.kycDocuments,
          operatingLicense: data.operatingLicense,
          submittedAt: new Date(),
          status: 'PENDING',
        },
      },
    });
  }

  /**
   * Verify KYC documents and activate user
   */
  async verifyKYC(
    userId: string,
    verificationStatus: 'VERIFIED' | 'REJECTED',
    notes?: string
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.role === UserRole.DONOR) {
      throw new AppError(400, 'Donors do not require KYC verification');
    }

    const verificationDocuments = {
      ...user.verificationDocuments,
      status: verificationStatus,
      verifiedAt: new Date(),
      notes,
    };

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        status: verificationStatus === 'VERIFIED' ? UserStatus.ACTIVE : UserStatus.INACTIVE,
        verificationDocuments,
      },
    });
  }

  /**
   * Get pending KYC verifications
   */
  async getPendingKYCVerifications(page = 1, limit = 10) {
    const where = {
      role: { not: UserRole.DONOR },
      status: UserStatus.INACTIVE,
      verificationDocuments: {
        path: ['status'],
        equals: 'PENDING',
      },
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          companyName: true,
          verificationDocuments: true,
          createdAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
