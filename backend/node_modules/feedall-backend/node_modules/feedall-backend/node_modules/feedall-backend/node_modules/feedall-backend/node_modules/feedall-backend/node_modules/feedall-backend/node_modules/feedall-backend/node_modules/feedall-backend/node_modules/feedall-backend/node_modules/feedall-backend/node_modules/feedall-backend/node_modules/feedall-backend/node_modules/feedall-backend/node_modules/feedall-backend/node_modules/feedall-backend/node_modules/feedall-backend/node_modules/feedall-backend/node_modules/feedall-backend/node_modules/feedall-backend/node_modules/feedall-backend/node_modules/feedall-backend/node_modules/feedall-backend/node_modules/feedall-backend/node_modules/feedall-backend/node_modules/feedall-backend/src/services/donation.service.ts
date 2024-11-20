import { DonationStatus, PrismaClient, User } from '@prisma/client';
import { BlockchainService } from './blockchain.service';
import { AppError } from '@/middleware/error';

export class DonationService {
  constructor(
    private prisma: PrismaClient,
    private blockchainService: BlockchainService
  ) {}

  async createDonation(data: {
    title: string;
    description: string;
    quantity: number;
    unit: string;
    category: string;
    pickupAddress: string;
    images?: string[];
    donorId: string;
    expiryDate?: Date;
  }) {
    // Validate donor
    const donor = await this.prisma.user.findUnique({
      where: { id: data.donorId },
    });

    if (!donor) {
      throw new AppError(404, 'Donor not found');
    }

    // Create smart contract for donation
    const contract = await this.blockchainService.getContract();
    const signer = await this.blockchainService.getSigner();
    const connectedContract = contract.connect(signer);

    // Create donation in smart contract
    const tx = await connectedContract.createDonation(
      donor.walletAddress,
      data.title,
      data.description,
      data.quantity,
      data.unit,
      data.category,
      data.pickupAddress,
      Math.floor((data.expiryDate?.getTime() || Date.now() + 7 * 24 * 3600000) / 1000)
    );

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    const contractAddress = receipt.contractAddress;

    // Create donation in database
    const donation = await this.prisma.donation.create({
      data: {
        ...data,
        status: DonationStatus.PENDING,
        contractAddress,
        images: data.images || [],
        expiryDate: data.expiryDate || new Date(Date.now() + 7 * 24 * 3600000),
      },
      include: {
        donor: true,
      },
    });

    return donation;
  }

  async updateDonationStatus(
    id: string,
    status: DonationStatus,
    evidence?: {
      notes?: string;
      images?: string[];
    }
  ) {
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: { donor: true },
    });

    if (!donation) {
      throw new AppError(404, 'Donation not found');
    }

    // Get the smart contract
    const contract = await this.blockchainService.getContract(donation.contractAddress);
    const signer = await this.blockchainService.getSigner();
    const connectedContract = contract.connect(signer);

    // Update status in smart contract
    await connectedContract.updateDonationStatus(
      donation.id,
      status,
      JSON.stringify(evidence || {})
    );

    // Update in database
    return this.prisma.donation.update({
      where: { id },
      data: {
        status,
        ...(evidence && { evidence: JSON.stringify(evidence) }),
        updatedAt: new Date(),
      },
      include: {
        donor: true,
      },
    });
  }

  async getDonationById(id: string) {
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: {
        donor: true,
        delivery: {
          include: {
            logistics: true,
          },
        },
      },
    });

    if (!donation) {
      throw new AppError(404, 'Donation not found');
    }

    // Get status from blockchain
    const contract = await this.blockchainService.getContract(donation.contractAddress);
    const donationStatus = await contract.getDonationStatus(donation.id);
    const deliveryStatus = donation.delivery 
      ? await contract.getDeliveryStatus(donation.delivery.id)
      : null;
    const verificationStatus = donation.delivery
      ? await contract.getVerificationStatus(donation.delivery.id)
      : null;

    return {
      ...donation,
      blockchainStatus: donationStatus,
      delivery: donation.delivery
        ? {
            ...donation.delivery,
            blockchainStatus: deliveryStatus,
            blockchainVerificationStatus: verificationStatus,
          }
        : null,
    };
  }

  async listDonations(filters: {
    status?: DonationStatus[];
    category?: string;
    donorId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (filters.status?.length) {
      where.status = { in: filters.status };
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.donorId) {
      where.donorId = filters.donorId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [donations, total] = await Promise.all([
      this.prisma.donation.findMany({
        where,
        include: {
          donor: true,
          delivery: {
            include: {
              logistics: true,
            },
          },
        },
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.donation.count({ where }),
    ]);

    // Get blockchain status for each donation
    const donationsWithBlockchainStatus = await Promise.all(
      donations.map(async (donation) => {
        const contract = await this.blockchainService.getContract(donation.contractAddress);
        const [donationStatus, deliveryStatus, verificationStatus] = await Promise.all([
          contract.getDonationStatus(donation.id),
          donation.delivery ? contract.getDeliveryStatus(donation.delivery.id) : null,
          donation.delivery ? contract.getVerificationStatus(donation.delivery.id) : null,
        ]);

        return {
          ...donation,
          blockchainStatus: donationStatus,
          delivery: donation.delivery
            ? {
                ...donation.delivery,
                blockchainStatus: deliveryStatus,
                blockchainVerificationStatus: verificationStatus,
              }
            : null,
        };
      })
    );

    return {
      items: donationsWithBlockchainStatus,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }
}
