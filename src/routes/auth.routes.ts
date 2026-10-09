import { Router } from 'express';
import { login, register, getCurrentUser, resetPassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/reset-password', authenticate, resetPassword);
router.get('/me', authenticate, getCurrentUser);

export default router;
