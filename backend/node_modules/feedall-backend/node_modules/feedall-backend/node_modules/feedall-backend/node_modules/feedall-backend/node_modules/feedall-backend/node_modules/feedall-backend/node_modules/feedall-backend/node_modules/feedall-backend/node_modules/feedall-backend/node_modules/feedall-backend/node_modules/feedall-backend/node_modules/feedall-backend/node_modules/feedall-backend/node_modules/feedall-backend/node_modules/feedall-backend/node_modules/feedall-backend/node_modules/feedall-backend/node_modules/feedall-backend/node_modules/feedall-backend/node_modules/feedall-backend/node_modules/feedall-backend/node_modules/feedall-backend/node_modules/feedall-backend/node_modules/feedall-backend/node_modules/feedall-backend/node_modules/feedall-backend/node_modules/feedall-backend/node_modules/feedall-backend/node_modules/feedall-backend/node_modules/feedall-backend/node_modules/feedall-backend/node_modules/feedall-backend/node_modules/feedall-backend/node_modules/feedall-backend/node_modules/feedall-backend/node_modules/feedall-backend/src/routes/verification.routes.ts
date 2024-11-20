import express from 'express';
import { VerificationService } from '../services/verification.service';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/error';

const router = express.Router();

/**
 * @route POST /api/verifications
 * @desc Create a new verification task
 * @access Private - Admin only
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can create verification tasks');
    }
    const verification = await VerificationService.createVerification({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json(verification);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/verifications/:id
 * @desc Get verification task by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const verification = await VerificationService.getVerificationById(req.params.id);
    res.json(verification);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/verifications/:id/status
 * @desc Update verification status
 * @access Private - Volunteer or Admin
 */
router.put('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'VOLUNTEER' && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to update verification status');
    }

    const { status, notes } = req.body;
    const updatedVerification = await VerificationService.updateVerificationStatus(
      req.params.id,
      status,
      {
        notes,
        updatedBy: req.user.id,
      }
    );
    res.json(updatedVerification);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/verifications/volunteer/:volunteerId
 * @desc Get all verifications assigned to a volunteer
 * @access Private - Volunteer
 */
router.get('/volunteer/:volunteerId', authenticateToken, async (req, res, next) => {
  try {
    if (
      req.user.role !== 'VOLUNTEER' &&
      req.user.id !== req.params.volunteerId &&
      req.user.role !== 'ADMIN'
    ) {
      throw new AppError(403, 'Not authorized to view these verifications');
    }

    const verifications = await VerificationService.getVerificationsByVolunteer(
      req.params.volunteerId
    );
    res.json(verifications);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/verifications/:id/evidence
 * @desc Add verification evidence
 * @access Private - Volunteer
 */
router.post('/:id/evidence', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'VOLUNTEER') {
      throw new AppError(403, 'Only volunteers can add verification evidence');
    }

    const { evidenceType, evidenceData, location } = req.body;
    const updatedVerification = await VerificationService.addVerificationEvidence(
      req.params.id,
      {
        type: evidenceType,
        data: evidenceData,
        location,
        addedBy: req.user.id,
      }
    );
    res.json(updatedVerification);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/verifications/search
 * @desc Search verifications by criteria
 * @access Private - Admin only
 */
router.get('/search', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can search all verifications');
    }

    const {
      status,
      type,
      startDate,
      endDate,
      volunteerId,
      zone,
    } = req.query;

    const verifications = await VerificationService.searchVerifications({
      status: status as string,
      type: type as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      volunteerId: volunteerId as string,
      zone: zone as string,
    });
    res.json(verifications);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/verifications/:id/assign
 * @desc Assign verification to volunteer
 * @access Private - Admin only
 */
router.put('/:id/assign', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can assign verifications');
    }

    const { volunteerId } = req.body;
    const updatedVerification = await VerificationService.assignVerification(
      req.params.id,
      volunteerId
    );
    res.json(updatedVerification);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/verifications/analytics/:volunteerId
 * @desc Get volunteer performance analytics
 * @access Private - Admin or Volunteer (self)
 */
router.get('/analytics/:volunteerId', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.id !== req.params.volunteerId) {
      throw new AppError(403, 'Not authorized to view these analytics');
    }

    const analytics = await VerificationService.getVolunteerAnalytics(
      req.params.volunteerId
    );
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

export default router;
