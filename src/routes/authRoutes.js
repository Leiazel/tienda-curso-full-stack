import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/config', authController.getAuthConfig);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.get('/me', requireAuth, authController.getMe);

export default router;
