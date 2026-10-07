import { Router } from 'express';
import authRoutes from './auth.routes';
import playerRoutes from './player.routes';
import teamRoutes from './team.routes';
import auctionRoutes from './auction.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/players', playerRoutes);
router.use('/teams', teamRoutes);
router.use('/auction', auctionRoutes);

export default router;
