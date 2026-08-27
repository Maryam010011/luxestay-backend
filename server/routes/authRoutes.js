import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register — public, always creates "customer" role
router.post('/register', register);

// POST /api/auth/login — public, returns signed JWT
router.post('/login', login);

// GET /api/auth/me — protected, returns current user info from token
router.get('/me', protect, getMe);

export default router;
