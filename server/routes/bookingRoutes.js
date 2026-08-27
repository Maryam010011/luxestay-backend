import express from 'express';
import {
  getBookings,
  getBookingById,
  getMyBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

// GET /api/bookings/my — logged-in customer sees only their own bookings
// Must be BEFORE /:id to avoid "my" being treated as an ID param
router.get('/my', protect, getMyBookings);

// GET /api/bookings — admin only (all bookings)
router.get('/', protect, requireAdmin, getBookings);

// POST /api/bookings — PROTECTED (only logged-in customers or admins can create bookings)
router.post('/', protect, createBooking);

// Individual booking routes (admin only for full management)
router.get('/:id', protect, requireAdmin, getBookingById);
router.put('/:id', protect, requireAdmin, updateBooking);
router.delete('/:id', protect, requireAdmin, deleteBooking);

export default router;
