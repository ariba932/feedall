import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error';
import { config } from '../config';

const prisma = new PrismaClient();

interface SmartContractData {
  contractType: 'DONATION' | 'FOODPACK' | 'FEEDINGNEED' | 'DELIVERY';
  parties: string[];
  amount?: number;
  terms: any;
  metadata: any;
}

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor() {
    // Initialize connection to the blockchain network (e.g., Ethereum testnet or mainnet)
    this.provider = new ethers.providers.JsonRpcProvider(config.blockchain.rpcUrl);
    this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider);
  }

  /**
   * Create a smart contract for a donation transaction
   */
  async createDonationContract(
    donationId: string,
    donorId: string,
    recipientId: string,
    amount: number,
    terms: any
  ) {
    try {
      const contractData: SmartContractData = {
        contractType: 'DONATION',
        parties: [donorId, recipientId],
        amount,
        terms,
        metadata: {
          donationId,
          timestamp: new Date().toISOString(),
        },
      };

      const contract = await this.deploySmartContract(contractData);

      // Store contract reference in database
      await prisma.smartContract.create({
        data: {
          contractAddress: contract.address,
          contractType: 'DONATION',
          donationId,
          status: 'ACTIVE',
          data: contractData,
        },
      });

      return contract;
    } catch (error) {
      throw new AppError(500, 'Failed to create donation smart contract');
    }
  }

  /**
   * Create a smart contract for a food pack sponsorship
   */
  async createFoodPackContract(
    foodPackId: string,
    providerId: string,
    sponsorId: string,
    quantity: number,
    terms: any
  ) {
    try {
      const contractData: SmartContractData = {
        contractType: 'FOODPACK',
        parties: [providerId, sponsorId],
        amount: quantity,
        terms,
        metadata: {
          foodPackId,
          timestamp: new Date().toISOString(),
        },
      };

      const contract = await this.deploySmartContract(contractData);

      await prisma.smartContract.create({
        data: {
          contractAddress: contract.address,
          contractType: 'FOODPACK',
          foodPackId,
          status: 'ACTIVE',
          data: contractData,
        },
      });

      return contract;
    } catch (error) {
      throw new AppError(500, 'Failed to create food pack smart contract');
    }
  }

  /**
   * Create a smart contract for a feeding need fulfillment
   */
  async createFeedingNeedContract(
    feedingNeedId: string,
    ngoId: string,
    donorId: string,
    amount: number,
    terms: any
  ) {
    try {
      const contractData: SmartContractData = {
        contractType: 'FEEDINGNEED',
        parties: [ngoId, donorId],
        amount,
        terms,
        metadata: {
          feedingNeedId,
          timestamp: new Date().toISOString(),
        },
      };

      const contract = await this.deploySmartContract(contractData);

      await prisma.smartContract.create({
        data: {
          contractAddress: contract.address,
          contractType: 'FEEDINGNEED',
          feedingNeedId,
          status: 'ACTIVE',
          data: contractData,
        },
      });

      return contract;
    } catch (error) {
      throw new AppError(500, 'Failed to create feeding need smart contract');
    }
  }

  /**
   * Create a smart contract for a delivery agreement
   */
  async createDeliveryContract(
    deliveryId: string,
    logisticsId: string,
    clientId: string,
    terms: any
  ) {
    try {
      const contractData: SmartContractData = {
        contractType: 'DELIVERY',
        parties: [logisticsId, clientId],
        terms,
        metadata: {
          deliveryId,
          timestamp: new Date().toISOString(),
        },
      };

      const contract = await this.deploySmartContract(contractData);

      await prisma.smartContract.create({
        data: {
          contractAddress: contract.address,
          contractType: 'DELIVERY',
          deliveryId,
          status: 'ACTIVE',
          data: contractData,
        },
      });

      return contract;
    } catch (error) {
      throw new AppError(500, 'Failed to create delivery smart contract');
    }
  }

  /**
   * Deploy a smart contract to the blockchain
   */
  private async deploySmartContract(contractData: SmartContractData) {
    try {
      // Here we would use ethers.js to deploy the actual smart contract
      // This is a simplified example - in production, you would:
      // 1. Load the appropriate contract ABI
      // 2. Deploy with proper gas estimation
      // 3. Wait for confirmation
      // 4. Handle contract events

      const ContractFactory = new ethers.ContractFactory(
        config.blockchain.contractABI,
        config.blockchain.contractBytecode,
        this.wallet
      );

      const contract = await ContractFactory.deploy(
        contractData.contractType,
        contractData.parties,
        contractData.amount || 0,
        JSON.stringify(contractData.terms),
        JSON.stringify(contractData.metadata)
      );

      await contract.deployed();

      return contract;
    } catch (error) {
      throw new AppError(500, 'Failed to deploy smart contract');
    }
  }

  /**
   * Get smart contract details
   */
  async getContractDetails(contractAddress: string) {
    try {
      const contract = await prisma.smartContract.findUnique({
        where: { contractAddress },
      });

      if (!contract) {
        throw new AppError(404, 'Smart contract not found');
      }

      // Get on-chain data
      const onChainData = await this.getOnChainContractData(contractAddress);

      return {
        ...contract,
        onChainData,
      };
    } catch (error) {
      throw new AppError(500, 'Failed to get contract details');
    }
  }

  /**
   * Get contract data from the blockchain
   */
  private async getOnChainContractData(contractAddress: string) {
    try {
      const contract = new ethers.Contract(
        contractAddress,
        config.blockchain.contractABI,
        this.provider
      );

      // Get contract state from blockchain
      const state = await contract.getState();
      return state;
    } catch (error) {
      throw new AppError(500, 'Failed to get on-chain contract data');
    }
  }

  /**
   * Update contract status
   */
  async updateContractStatus(
    contractAddress: string,
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  ) {
    try {
      const contract = await prisma.smartContract.update({
        where: { contractAddress },
        data: { status },
      });

      // Update status on blockchain
      const ethersContract = new ethers.Contract(
        contractAddress,
        config.blockchain.contractABI,
        this.wallet
      );

      await ethersContract.updateStatus(status);

      return contract;
    } catch (error) {
      throw new AppError(500, 'Failed to update contract status');
    }
  }
}
