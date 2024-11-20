import express from 'express';
import { ImpactService } from '../services/impact.service';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/error';

const router = express.Router();

/**
 * @route GET /api/impact/user/:userId
 * @desc Get impact metrics for a specific user
 * @access Private
 */
router.get('/user/:userId', authenticateToken, async (req, res, next) => {
  try {
    // Users can view their own impact or admins can view any user's impact
    if (req.user.id !== req.params.userId && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to view this user\'s impact');
    }
    const impact = await ImpactService.getUserImpact(req.params.userId);
    res.json(impact);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/impact/platform
 * @desc Get platform-wide impact metrics
 * @access Public
 */
router.get('/platform', async (req, res, next) => {
  try {
    const impact = await ImpactService.getPlatformImpact();
    res.json(impact);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/impact/region/:regionId
 * @desc Get impact metrics for a specific region
 * @access Private
 */
router.get('/region/:regionId', authenticateToken, async (req, res, next) => {
  try {
    const impact = await ImpactService.getRegionImpact(req.params.regionId);
    res.json(impact);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/impact/ngo/:ngoId
 * @desc Get impact metrics for a specific NGO
 * @access Private
 */
router.get('/ngo/:ngoId', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'NGO' && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to view NGO impact metrics');
    }
    const impact = await ImpactService.getNGOImpact(req.params.ngoId);
    res.json(impact);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/impact/provider/:providerId
 * @desc Get impact metrics for a specific service provider
 * @access Private
 */
router.get('/provider/:providerId', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'SERVICE_PROVIDER' && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to view provider impact metrics');
    }
    const impact = await ImpactService.getProviderImpact(req.params.providerId);
    res.json(impact);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/impact/points/:userId
 * @desc Get impact points for a specific user
 * @access Private
 */
router.get('/points/:userId', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to view these impact points');
    }
    const points = await ImpactService.getUserImpactPoints(req.params.userId);
    res.json(points);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/impact/leaderboard
 * @desc Get impact leaderboard
 * @access Private
 */
router.get('/leaderboard', authenticateToken, async (req, res, next) => {
  try {
    const { role, timeframe, limit } = req.query;
    const leaderboard = await ImpactService.getImpactLeaderboard({
      role: role as string,
      timeframe: timeframe as string,
      limit: limit ? Number(limit) : 10,
    });
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/impact/statistics
 * @desc Get detailed impact statistics
 * @access Private - Admin only
 */
router.get('/statistics', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can view detailed impact statistics');
    }
    const { startDate, endDate } = req.query;
    const statistics = await ImpactService.getImpactStatistics({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });
    res.json(statistics);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/impact/trends
 * @desc Get impact trends over time
 * @access Private - Admin only
 */
router.get('/trends', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can view impact trends');
    }
    const { metric, timeframe } = req.query;
    const trends = await ImpactService.getImpactTrends({
      metric: metric as string,
      timeframe: timeframe as string,
    });
    res.json(trends);
  } catch (error) {
    next(error);
  }
});

export default router;
