import express from 'express';
import { StatisticsService } from '../services/statistics.service';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/error';

const router = express.Router();

/**
 * @route GET /api/statistics/platform
 * @desc Get platform-wide statistics
 * @access Private - Admin only
 */
router.get('/platform', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can view platform statistics');
    }
    const { startDate, endDate } = req.query;
    const statistics = await StatisticsService.getPlatformStatistics({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });
    res.json(statistics);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/statistics/users
 * @desc Get user-related statistics
 * @access Private - Admin only
 */
router.get('/users', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can view user statistics');
    }
    const { role, timeframe } = req.query;
    const statistics = await StatisticsService.getUserStatistics({
      role: role as string,
      timeframe: timeframe as string,
    });
    res.json(statistics);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/statistics/donations
 * @desc Get donation-related statistics
 * @access Private - Admin only
 */
router.get('/donations', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can view donation statistics');
    }
    const { startDate, endDate, type } = req.query;
    const statistics = await StatisticsService.getDonationStatistics({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      type: type as string,
    });
    res.json(statistics);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/statistics/deliveries
 * @desc Get delivery-related statistics
 * @access Private - Admin only
 */
router.get('/deliveries', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can view delivery statistics');
    }
    const { startDate, endDate, status } = req.query;
    const statistics = await StatisticsService.getDeliveryStatistics({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      status: status as string,
    });
    res.json(statistics);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/statistics/verifications
 * @desc Get verification-related statistics
 * @access Private - Admin only
 */
router.get('/verifications', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can view verification statistics');
    }
    const { startDate, endDate, type } = req.query;
    const statistics = await StatisticsService.getVerificationStatistics({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      type: type as string,
    });
    res.json(statistics);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/statistics/regions
 * @desc Get region-wise statistics
 * @access Private - Admin only
 */
router.get('/regions', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can view regional statistics');
    }
    const { startDate, endDate } = req.query;
    const statistics = await StatisticsService.getRegionalStatistics({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });
    res.json(statistics);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/statistics/trends
 * @desc Get trend analysis
 * @access Private - Admin only
 */
router.get('/trends', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can view trend analysis');
    }
    const { metric, timeframe } = req.query;
    const trends = await StatisticsService.getTrendAnalysis({
      metric: metric as string,
      timeframe: timeframe as string,
    });
    res.json(trends);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/statistics/performance
 * @desc Get platform performance metrics
 * @access Private - Admin only
 */
router.get('/performance', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can view performance metrics');
    }
    const { startDate, endDate } = req.query;
    const performance = await StatisticsService.getPlatformPerformance({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });
    res.json(performance);
  } catch (error) {
    next(error);
  }
});

export default router;
