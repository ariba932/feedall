import express from 'express';
import { FeedingNeedService } from '../services/feedingneed.service';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/error';

const router = express.Router();

/**
 * @route POST /api/feeding-needs
 * @desc Create a new feeding need
 * @access Private - NGO only
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'NGO') {
      throw new AppError(403, 'Only NGOs can create feeding needs');
    }
    const feedingNeed = await FeedingNeedService.createFeedingNeed({
      ...req.body,
      ngoId: req.user.id,
    });
    res.status(201).json(feedingNeed);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/feeding-needs/:id
 * @desc Get feeding need by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const feedingNeed = await FeedingNeedService.getFeedingNeedById(req.params.id);
    res.json(feedingNeed);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/feeding-needs/:id
 * @desc Update feeding need
 * @access Private - NGO (owner) only
 */
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const feedingNeed = await FeedingNeedService.getFeedingNeedById(req.params.id);
    
    if (feedingNeed.ngoId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to update this feeding need');
    }

    const updatedNeed = await FeedingNeedService.updateFeedingNeed(
      req.params.id,
      req.body
    );
    res.json(updatedNeed);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/feeding-needs/ngo/:ngoId
 * @desc Get all feeding needs by NGO
 * @access Private
 */
router.get('/ngo/:ngoId', authenticateToken, async (req, res, next) => {
  try {
    const feedingNeeds = await FeedingNeedService.getFeedingNeedsByNGO(
      req.params.ngoId
    );
    res.json(feedingNeeds);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/feeding-needs/search
 * @desc Search feeding needs by location and criteria
 * @access Private
 */
router.get('/search', authenticateToken, async (req, res, next) => {
  try {
    const {
      latitude,
      longitude,
      radius,
      status,
      minBeneficiaries,
      maxBudget,
    } = req.query;

    const searchCriteria = {
      location: {
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        radius: radius ? Number(radius) : undefined,
      },
      status: status as string,
      minBeneficiaries: minBeneficiaries ? Number(minBeneficiaries) : undefined,
      maxBudget: maxBudget ? Number(maxBudget) : undefined,
    };

    const feedingNeeds = await FeedingNeedService.searchFeedingNeeds(searchCriteria);
    res.json(feedingNeeds);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/feeding-needs/:id/funding
 * @desc Update feeding need funding progress
 * @access Private - Admin only
 */
router.put('/:id/funding', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to update funding information');
    }

    const { fundedAmount, fundingStatus } = req.body;
    const updatedNeed = await FeedingNeedService.updateFundingProgress(
      req.params.id,
      fundedAmount,
      fundingStatus
    );
    res.json(updatedNeed);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/feeding-needs/urgent
 * @desc Get urgent feeding needs
 * @access Private
 */
router.get('/urgent', authenticateToken, async (req, res, next) => {
  try {
    const urgentNeeds = await FeedingNeedService.getUrgentFeedingNeeds();
    res.json(urgentNeeds);
  } catch (error) {
    next(error);
  }
});

export default router;
