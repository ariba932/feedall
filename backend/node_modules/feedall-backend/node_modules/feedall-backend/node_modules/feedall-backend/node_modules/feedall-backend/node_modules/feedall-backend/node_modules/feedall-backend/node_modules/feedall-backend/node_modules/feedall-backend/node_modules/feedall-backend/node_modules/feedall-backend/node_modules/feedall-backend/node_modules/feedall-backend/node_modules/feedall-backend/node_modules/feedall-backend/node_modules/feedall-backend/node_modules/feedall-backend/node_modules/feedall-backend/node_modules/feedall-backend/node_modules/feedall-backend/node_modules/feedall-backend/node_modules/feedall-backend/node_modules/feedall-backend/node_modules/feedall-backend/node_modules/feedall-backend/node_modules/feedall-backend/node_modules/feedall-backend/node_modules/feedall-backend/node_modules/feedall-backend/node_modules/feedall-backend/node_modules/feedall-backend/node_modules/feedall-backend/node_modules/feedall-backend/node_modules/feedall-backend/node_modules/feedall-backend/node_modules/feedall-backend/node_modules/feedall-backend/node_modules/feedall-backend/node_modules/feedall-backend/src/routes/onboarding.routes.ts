import express from 'express';
import { OnboardingService } from '../services/onboarding.service';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { UserRole } from '@prisma/client';
import {
  donorOnboardingSchema,
  nonDonorOnboardingSchema,
  kycVerificationSchema,
} from '../schemas/onboarding.schema';

const router = express.Router();
const onboardingService = new OnboardingService();

/**
 * @route POST /api/onboarding/donor
 * @desc Onboard a new donor (self-service)
 * @access Public
 */
router.post(
  '/donor',
  validateRequest({
    body: donorOnboardingSchema,
  }),
  async (req, res, next) => {
    try {
      const user = await onboardingService.onboardDonor(req.body);
      res.status(201).json({
        message: 'Donor registration successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/onboarding/non-donor
 * @desc Onboard a new non-donor user (requires KYC)
 * @access Public
 */
router.post(
  '/non-donor',
  validateRequest({
    body: nonDonorOnboardingSchema,
  }),
  async (req, res, next) => {
    try {
      const user = await onboardingService.onboardNonDonor(req.body);
      res.status(201).json({
        message: 'Registration successful. Your account is pending KYC verification.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/onboarding/kyc/pending
 * @desc Get pending KYC verifications
 * @access Private - Admin only
 */
router.get(
  '/kyc/pending',
  authenticate,
  async (req, res, next) => {
    try {
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view pending KYC verifications');
      }

      const { page, limit } = req.query;
      const pendingVerifications = await onboardingService.getPendingKYCVerifications(
        Number(page) || 1,
        Number(limit) || 10
      );
      res.json(pendingVerifications);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /api/onboarding/kyc/verify/:userId
 * @desc Verify KYC documents for a user
 * @access Private - Admin only
 */
router.put(
  '/kyc/verify/:userId',
  authenticate,
  validateRequest({
    body: kycVerificationSchema,
  }),
  async (req, res, next) => {
    try {
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can verify KYC documents');
      }

      const { verificationStatus, verificationNotes } = req.body;
      const user = await onboardingService.verifyKYC(
        req.params.userId,
        verificationStatus,
        verificationNotes
      );

      res.json({
        message: `KYC verification ${verificationStatus.toLowerCase()}`,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
