import { DeliveryStatus, Prisma, PrismaClient } from '@prisma/client';
import { BlockchainService } from './blockchain.service';
import { AppError } from '@/middleware/error';

export class DeliveryService {
  constructor(
    private prisma: PrismaClient,
    private blockchainService: BlockchainService
  ) {}

  async createDelivery(data: {
    logisticsId: string;
    donationId: string;
    pickupAddress: string;
    deliveryAddress: string;
    scheduledPickupTime: Date;
    scheduledDeliveryTime: Date;
    vehicleType: string;
    weight: number;
    recipientName: string;
    recipientPhone: string;
  }) {
    // Validate logistics provider
    const logistics = await this.prisma.user.findUnique({
      where: { id: data.logisticsId, role: 'LOGISTICS' },
    });

    if (!logistics) {
      throw new AppError(404, 'Logistics provider not found');
    }

    // Get the donation to verify it exists and get its contract
    const donation = await this.prisma.donation.findUnique({
      where: { id: data.donationId },
    });

    if (!donation) {
      throw new AppError(404, 'Donation not found');
    }

    // Get the donation's smart contract
    const contract = await this.blockchainService.getContract(donation.contractAddress);
    const signer = await this.blockchainService.getSigner();
    const connectedContract = contract.connect(signer);

    // Create delivery in database
    const delivery = await this.prisma.delivery.create({
      data: {
        ...data,
        status: DeliveryStatus.PENDING,
        verificationStatus: 'PENDING',
        contractAddress: donation.contractAddress, // Use the same contract as donation
      },
      include: {
        logistics: true,
      },
    });

    // Update the smart contract to assign delivery
    await connectedContract.assignDelivery(
      delivery.id,
      logistics.walletAddress,
      delivery.pickupAddress,
      delivery.deliveryAddress,
      Math.floor(delivery.scheduledPickupTime.getTime() / 1000),
      Math.floor(delivery.scheduledDeliveryTime.getTime() / 1000)
    );

    return delivery;
  }

  async updateDeliveryStatus(
    id: string,
    status: DeliveryStatus,
    evidence?: {
      location?: string;
      notes?: string;
      images?: string[];
    }
  ) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { logistics: true },
    });

    if (!delivery) {
      throw new AppError(404, 'Delivery not found');
    }

    // Get the smart contract
    const contract = await this.blockchainService.getContract(delivery.contractAddress);
    const signer = await this.blockchainService.getSigner();
    const connectedContract = contract.connect(signer);

    // Update status in smart contract
    await connectedContract.updateDeliveryStatus(
      delivery.id,
      status,
      JSON.stringify(evidence || {})
    );

    // Update in database
    return this.prisma.delivery.update({
      where: { id },
      data: {
        status,
        ...(evidence && { evidence: JSON.stringify(evidence) }),
        updatedAt: new Date(),
      },
      include: {
        logistics: true,
      },
    });
  }

  async verifyDelivery(
    id: string,
    verifierId: string,
    verificationData: {
      status: 'VERIFIED' | 'REJECTED';
      notes?: string;
      images?: string[];
    }
  ) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { logistics: true },
    });

    if (!delivery) {
      throw new AppError(404, 'Delivery not found');
    }

    // Verify the verifier
    const verifier = await this.prisma.user.findUnique({
      where: { id: verifierId, role: 'VERIFIER' },
    });

    if (!verifier) {
      throw new AppError(404, 'Verifier not found');
    }

    // Get the smart contract
    const contract = await this.blockchainService.getContract(delivery.contractAddress);
    const signer = await this.blockchainService.getSigner();
    const connectedContract = contract.connect(signer);

    // Update verification in smart contract
    await connectedContract.verifyDelivery(
      delivery.id,
      verifier.walletAddress,
      verificationData.status,
      JSON.stringify({
        notes: verificationData.notes,
        images: verificationData.images,
      })
    );

    // Update in database
    return this.prisma.delivery.update({
      where: { id },
      data: {
        verificationStatus: verificationData.status,
        verifiedAt: new Date(),
        verifiedBy: verifierId,
        updatedAt: new Date(),
      },
      include: {
        logistics: true,
      },
    });
  }

  async getDeliveryById(id: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: {
        logistics: true,
      },
    });

    if (!delivery) {
      throw new AppError(404, 'Delivery not found');
    }

    // Get status from blockchain
    const contract = await this.blockchainService.getContract(delivery.contractAddress);
    const deliveryStatus = await contract.getDeliveryStatus(delivery.id);
    const verificationStatus = await contract.getVerificationStatus(delivery.id);

    return {
      ...delivery,
      blockchainStatus: deliveryStatus,
      blockchainVerificationStatus: verificationStatus,
    };
  }
}
