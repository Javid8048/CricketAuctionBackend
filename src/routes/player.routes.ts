import { Router } from 'express';
import {
  getPlayers,
  getPlayerById,
  registerPlayerPublic,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../controllers/player.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Public player list & detailed view
router.get('/', getPlayers);
router.get('/:id', getPlayerById);

// Public Player Registration Link (accessible by players from group links)
router.post('/register', registerPlayerPublic);

// Admin Only operations
router.post('/', authenticate, authorizeRole(['ADMIN']), createPlayer);
router.put('/:id', authenticate, authorizeRole(['ADMIN']), updatePlayer);
router.delete('/:id', authenticate, authorizeRole(['ADMIN']), deletePlayer);

export default router;
