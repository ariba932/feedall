import { Router } from 'express';
import userRoutes from './user.routes';
import feedRoutes from './feed.routes';
import donationRoutes from './donation.routes';
import foodPackRoutes from './foodpack.routes';
import feedingNeedRoutes from './feedingneed.routes';
import deliveryRoutes from './delivery.routes';
import verificationRoutes from './verification.routes';
import impactRoutes from './impact.routes';
import statisticsRoutes from './statistics.routes';
import contractRoutes from './contract.routes';

const router = Router();

// User and Feed routes
router.use('/users', userRoutes);
router.use('/feeds', feedRoutes);

// Core feature routes
router.use('/donations', donationRoutes);
router.use('/food-packs', foodPackRoutes);
router.use('/feeding-needs', feedingNeedRoutes);
router.use('/deliveries', deliveryRoutes);

// Support feature routes
router.use('/verifications', verificationRoutes);
router.use('/impact', impactRoutes);
router.use('/statistics', statisticsRoutes);

// Blockchain routes
router.use('/contracts', contractRoutes);

export default router;
