import { Router } from 'express';
import { getTeams, getTeamById, createTeam, updateTeam } from '../controllers/team.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/', authenticate, authorizeRole(['ADMIN']), createTeam);
router.put('/:id', authenticate, authorizeRole(['ADMIN', 'TEAM']), updateTeam);

export default router;
