import express from 'express';
import { BlockchainService } from '../services/blockchain.service';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/error';
import {
  donationContractSchema,
  foodPackContractSchema,
  feedingNeedContractSchema,
  deliveryContractSchema,
  contractStatusSchema,
  contractAddressParamSchema,
} from '../schemas/contract.schema';

const router = express.Router();
const blockchainService = new BlockchainService();

/**
 * @route GET /api/contracts/:contractAddress
 * @desc Get smart contract details
 * @access Private
 */
router.get(
  '/:contractAddress',
  authenticateToken,
  validateRequest({
    params: contractAddressParamSchema,
  }),
  async (req, res, next) => {
    try {
      const contract = await blockchainService.getContractDetails(
        req.params.contractAddress
      );
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /api/contracts/:contractAddress/status
 * @desc Update contract status
 * @access Private - Admin only
 */
router.put(
  '/:contractAddress/status',
  authenticateToken,
  validateRequest({
    params: contractAddressParamSchema,
    body: contractStatusSchema,
  }),
  async (req, res, next) => {
    try {
      if (req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Only admins can update contract status');
      }

      const contract = await blockchainService.updateContractStatus(
        req.params.contractAddress,
        req.body.status
      );
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/contracts/donation
 * @desc Create a donation smart contract
 * @access Private
 */
router.post(
  '/donation',
  authenticateToken,
  validateRequest({
    body: donationContractSchema,
  }),
  async (req, res, next) => {
    try {
      const { donationId, donorId, recipientId, amount, terms } = req.body;
      const contract = await blockchainService.createDonationContract(
        donationId,
        donorId,
        recipientId,
        amount,
        terms
      );
      res.status(201).json(contract);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/contracts/foodpack
 * @desc Create a food pack smart contract
 * @access Private
 */
router.post(
  '/foodpack',
  authenticateToken,
  validateRequest({
    body: foodPackContractSchema,
  }),
  async (req, res, next) => {
    try {
      const { foodPackId, providerId, sponsorId, quantity, terms } = req.body;
      const contract = await blockchainService.createFoodPackContract(
        foodPackId,
        providerId,
        sponsorId,
        quantity,
        terms
      );
      res.status(201).json(contract);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/contracts/feedingneed
 * @desc Create a feeding need smart contract
 * @access Private
 */
router.post(
  '/feedingneed',
  authenticateToken,
  validateRequest({
    body: feedingNeedContractSchema,
  }),
  async (req, res, next) => {
    try {
      const { feedingNeedId, ngoId, donorId, amount, terms } = req.body;
      const contract = await blockchainService.createFeedingNeedContract(
        feedingNeedId,
        ngoId,
        donorId,
        amount,
        terms
      );
      res.status(201).json(contract);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/contracts/delivery
 * @desc Create a delivery smart contract
 * @access Private
 */
router.post(
  '/delivery',
  authenticateToken,
  validateRequest({
    body: deliveryContractSchema,
  }),
  async (req, res, next) => {
    try {
      const { deliveryId, logisticsId, clientId, terms } = req.body;
      const contract = await blockchainService.createDeliveryContract(
        deliveryId,
        logisticsId,
        clientId,
        terms
      );
      res.status(201).json(contract);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
