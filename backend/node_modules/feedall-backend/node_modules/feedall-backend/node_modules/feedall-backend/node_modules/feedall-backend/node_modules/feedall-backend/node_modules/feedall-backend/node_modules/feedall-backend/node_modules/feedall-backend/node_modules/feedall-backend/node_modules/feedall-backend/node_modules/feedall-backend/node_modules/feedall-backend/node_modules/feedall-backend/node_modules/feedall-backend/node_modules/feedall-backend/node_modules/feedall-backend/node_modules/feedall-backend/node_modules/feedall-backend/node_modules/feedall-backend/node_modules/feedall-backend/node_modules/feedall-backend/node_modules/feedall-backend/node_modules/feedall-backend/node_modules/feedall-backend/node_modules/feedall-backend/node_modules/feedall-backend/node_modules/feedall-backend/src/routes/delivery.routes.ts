import express from 'express';
import { DeliveryService } from '../services/delivery.service';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/error';

const router = express.Router();

/**
 * @route POST /api/deliveries
 * @desc Create a new delivery
 * @access Private - Admin or Service Provider
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SERVICE_PROVIDER') {
      throw new AppError(403, 'Not authorized to create deliveries');
    }
    const delivery = await DeliveryService.createDelivery({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json(delivery);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/deliveries/:id
 * @desc Get delivery by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const delivery = await DeliveryService.getDeliveryById(req.params.id);
    res.json(delivery);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/deliveries/:id/status
 * @desc Update delivery status
 * @access Private - Logistics or Admin
 */
router.put('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'LOGISTICS' && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to update delivery status');
    }

    const { status, location, notes } = req.body;
    const updatedDelivery = await DeliveryService.updateDeliveryStatus(
      req.params.id,
      status,
      {
        location,
        notes,
        updatedBy: req.user.id,
      }
    );
    res.json(updatedDelivery);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/deliveries/logistics/:logisticsId
 * @desc Get all deliveries assigned to a logistics provider
 * @access Private - Logistics
 */
router.get('/logistics/:logisticsId', authenticateToken, async (req, res, next) => {
  try {
    if (
      req.user.role !== 'LOGISTICS' &&
      req.user.id !== req.params.logisticsId &&
      req.user.role !== 'ADMIN'
    ) {
      throw new AppError(403, 'Not authorized to view these deliveries');
    }

    const deliveries = await DeliveryService.getDeliveriesByLogistics(
      req.params.logisticsId
    );
    res.json(deliveries);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/deliveries/:id/evidence
 * @desc Add delivery evidence (photos, signatures, etc.)
 * @access Private - Logistics
 */
router.post('/:id/evidence', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'LOGISTICS') {
      throw new AppError(403, 'Only logistics providers can add delivery evidence');
    }

    const { evidenceType, evidenceData } = req.body;
    const updatedDelivery = await DeliveryService.addDeliveryEvidence(
      req.params.id,
      {
        type: evidenceType,
        data: evidenceData,
        addedBy: req.user.id,
      }
    );
    res.json(updatedDelivery);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/deliveries/search
 * @desc Search deliveries by criteria
 * @access Private - Admin only
 */
router.get('/search', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can search all deliveries');
    }

    const {
      status,
      startDate,
      endDate,
      logisticsId,
      zone,
    } = req.query;

    const deliveries = await DeliveryService.searchDeliveries({
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      logisticsId: logisticsId as string,
      zone: zone as string,
    });
    res.json(deliveries);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/deliveries/:id/assign
 * @desc Assign delivery to logistics provider
 * @access Private - Admin only
 */
router.put('/:id/assign', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can assign deliveries');
    }

    const { logisticsId } = req.body;
    const updatedDelivery = await DeliveryService.assignDelivery(
      req.params.id,
      logisticsId
    );
    res.json(updatedDelivery);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/deliveries/pending
 * @desc Get all pending deliveries
 * @access Private - Admin or Logistics
 */
router.get('/pending', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'LOGISTICS') {
      throw new AppError(403, 'Not authorized to view pending deliveries');
    }

    const pendingDeliveries = await DeliveryService.getPendingDeliveries();
    res.json(pendingDeliveries);
  } catch (error) {
    next(error);
  }
});

export default router;
