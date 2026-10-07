import { Router } from 'express';
import {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../controllers/player.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getPlayers);
router.get('/:id', getPlayerById);
router.post('/', authenticate, authorizeRole(['ADMIN']), createPlayer);
router.put('/:id', authenticate, authorizeRole(['ADMIN']), updatePlayer);
router.delete('/:id', authenticate, authorizeRole(['ADMIN']), deletePlayer);

export default router;
