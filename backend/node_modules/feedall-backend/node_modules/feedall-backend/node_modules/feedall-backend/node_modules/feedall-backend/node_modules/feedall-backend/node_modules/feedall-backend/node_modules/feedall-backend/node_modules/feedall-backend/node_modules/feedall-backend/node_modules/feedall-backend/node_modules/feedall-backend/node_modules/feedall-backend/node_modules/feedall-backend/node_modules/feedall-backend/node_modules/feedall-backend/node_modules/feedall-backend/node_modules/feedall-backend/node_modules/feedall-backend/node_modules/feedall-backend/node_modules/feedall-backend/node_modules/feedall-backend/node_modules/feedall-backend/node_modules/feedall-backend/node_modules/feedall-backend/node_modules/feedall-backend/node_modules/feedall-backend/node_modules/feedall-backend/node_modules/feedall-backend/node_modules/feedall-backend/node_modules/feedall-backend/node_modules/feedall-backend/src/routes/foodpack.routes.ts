import express from 'express';
import { FoodPackService } from '../services/foodpack.service';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/error';

const router = express.Router();

/**
 * @route POST /api/foodpacks
 * @desc Create a new food pack
 * @access Private - Service Provider only
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'SERVICE_PROVIDER') {
      throw new AppError(403, 'Only service providers can create food packs');
    }
    const foodPack = await FoodPackService.createFoodPack({
      ...req.body,
      providerId: req.user.id,
    });
    res.status(201).json(foodPack);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/foodpacks/:id
 * @desc Get food pack by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const foodPack = await FoodPackService.getFoodPackById(req.params.id);
    res.json(foodPack);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/foodpacks/:id
 * @desc Update food pack
 * @access Private - Service Provider (owner) only
 */
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const foodPack = await FoodPackService.getFoodPackById(req.params.id);
    
    if (foodPack.providerId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to update this food pack');
    }

    const updatedPack = await FoodPackService.updateFoodPack(
      req.params.id,
      req.body
    );
    res.json(updatedPack);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/foodpacks/provider/:providerId
 * @desc Get all food packs by provider
 * @access Private
 */
router.get('/provider/:providerId', authenticateToken, async (req, res, next) => {
  try {
    const foodPacks = await FoodPackService.getFoodPacksByProvider(
      req.params.providerId
    );
    res.json(foodPacks);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/foodpacks/available
 * @desc Get all available food packs with optional filters
 * @access Private
 */
router.get('/available', authenticateToken, async (req, res, next) => {
  try {
    const { deliveryZone, maxUnitCost, minQuantity } = req.query;
    const foodPacks = await FoodPackService.getAvailableFoodPacks({
      deliveryZone: deliveryZone as string,
      maxUnitCost: maxUnitCost ? Number(maxUnitCost) : undefined,
      minQuantity: minQuantity ? Number(minQuantity) : undefined,
    });
    res.json(foodPacks);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/foodpacks/:id/sponsor
 * @desc Sponsor a food pack
 * @access Private - Donor only
 */
router.post('/:id/sponsor', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'DONOR') {
      throw new AppError(403, 'Only donors can sponsor food packs');
    }

    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      throw new AppError(400, 'Valid quantity required for sponsorship');
    }

    const sponsoredPack = await FoodPackService.sponsorFoodPack(
      req.params.id,
      req.user.id,
      quantity
    );
    res.json(sponsoredPack);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/foodpacks/sponsored/:sponsorId
 * @desc Get all sponsored food packs by sponsor
 * @access Private
 */
router.get('/sponsored/:sponsorId', authenticateToken, async (req, res, next) => {
  try {
    // Check if user is requesting their own sponsored packs or is an admin
    if (req.user.id !== req.params.sponsorId && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to view these sponsored packs');
    }

    const sponsoredPacks = await FoodPackService.getSponsoredFoodPacks(
      req.params.sponsorId
    );
    res.json(sponsoredPacks);
  } catch (error) {
    next(error);
  }
});

export default router;
