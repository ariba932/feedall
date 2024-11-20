import express from 'express';
import { DonationService } from '../services/donation.service';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/error';

const router = express.Router();

/**
 * @route POST /api/donations
 * @desc Create a new donation
 * @access Private
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const donation = await DonationService.createDonation({
      ...req.body,
      donorId: req.user.id, // From auth middleware
    });
    res.status(201).json(donation);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/donations/:id
 * @desc Get donation by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const donation = await DonationService.getDonationById(req.params.id);
    res.json(donation);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/donations/:id/status
 * @desc Update donation status
 * @access Private - Admin only
 */
router.put(
  '/:id/status',
  authenticateToken,
  async (req, res, next) => {
    try {
      if (req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Not authorized to update donation status');
      }
      const donation = await DonationService.updateDonationStatus(
        req.params.id,
        req.body.status
      );
      res.json(donation);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/donations/donor/:donorId
 * @desc Get all donations by donor
 * @access Private
 */
router.get('/donor/:donorId', authenticateToken, async (req, res, next) => {
  try {
    // Check if user is requesting their own donations or is an admin
    if (req.user.id !== req.params.donorId && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to view these donations');
    }
    const donations = await DonationService.getDonationsByDonor(req.params.donorId);
    res.json(donations);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/donations/provider/:providerId
 * @desc Get all donations by service provider
 * @access Private
 */
router.get('/provider/:providerId', authenticateToken, async (req, res, next) => {
  try {
    // Check if user is the provider or an admin
    if (req.user.id !== req.params.providerId && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to view these donations');
    }
    const donations = await DonationService.getDonationsByProvider(
      req.params.providerId
    );
    res.json(donations);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/donations/ngo/:ngoId
 * @desc Get all donations by NGO
 * @access Private
 */
router.get('/ngo/:ngoId', authenticateToken, async (req, res, next) => {
  try {
    // Check if user is the NGO or an admin
    if (req.user.id !== req.params.ngoId && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to view these donations');
    }
    const donations = await DonationService.getDonationsByNGO(req.params.ngoId);
    res.json(donations);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/donations/:id/payment
 * @desc Update donation payment information
 * @access Private - Admin only
 */
router.put(
  '/:id/payment',
  authenticateToken,
  async (req, res, next) => {
    try {
      if (req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Not authorized to update payment information');
      }
      const donation = await DonationService.updatePaymentInfo(
        req.params.id,
        req.body.paymentId,
        req.body.paymentStatus
      );
      res.json(donation);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /api/donations/:id/impact
 * @desc Update donation impact
 * @access Private - Admin only
 */
router.put(
  '/:id/impact',
  authenticateToken,
  async (req, res, next) => {
    try {
      if (req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Not authorized to update impact information');
      }
      const donation = await DonationService.updateImpact(
        req.params.id,
        req.body.impact
      );
      res.json(donation);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
