import express from 'express';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotelController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

// Public routes — no authentication required
router.get('/', getHotels);
router.get('/:id', getHotelById);

// Admin-only routes — must be logged in AND have role "admin"
router.post('/', protect, requireAdmin, createHotel);
router.put('/:id', protect, requireAdmin, updateHotel);
router.delete('/:id', protect, requireAdmin, deleteHotel);

export default router;
