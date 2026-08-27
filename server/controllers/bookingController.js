import { BookingModel } from '../models/Booking.js';
import { sendBookingConfirmationEmail } from '../services/emailService.js';

// GET /api/bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await BookingModel.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Error in getBookings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
};

// GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingModel.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { bookingRef: id }],
    });

    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: `Booking ${id} not found`,
      });
    }

    return res.status(200).json({
      status: 'success',
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking details',
      error: error.message,
    });
  }
};

// GET /api/bookings/my
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const bookings = await BookingModel.find({
      $or: [{ user: userId }, { email: userEmail }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Error in getMyBookings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your bookings',
      error: error.message,
    });
  }
};

// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const {
      hotelId,
      hotelName,
      firstName,
      lastName,
      email,
      phone,
      checkIn,
      checkOut,
      adults,
      children,
      roomType,
      specialRequests,
      paymentMethod,
      totalPrice,
      bookingRef,
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !checkIn || !checkOut || totalPrice === undefined) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required guest and stay details',
      });
    }

    const ref = bookingRef || 'LX-' + Math.floor(100000 + Math.random() * 900000);

    const newBooking = await BookingModel.create({
      user: req.user ? req.user.id : undefined,
      bookingRef: ref,
      hotelId: hotelId || 1,
      hotelName: hotelName || 'LuxeStay Hotel',
      firstName,
      lastName,
      email,
      phone,
      checkIn,
      checkOut,
      adults: adults || 1,
      children: children || 0,
      roomType: roomType || 'standard',
      specialRequests: specialRequests || '',
      paymentMethod: paymentMethod || 'card',
      totalPrice: Number(totalPrice),
      status: 'confirmed',
    });

    // Send confirmation email via Resend (awaited so serverless lambdas do not freeze mid-flight)
    try {
      await sendBookingConfirmationEmail(newBooking);
    } catch (emailErr) {
      console.error('⚠️ [Resend] Non-fatal email sending error:', emailErr.message || emailErr);
    }

    return res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: newBooking,
    });
  } catch (error) {
    console.error('Error in createBooking:', error);
    return res.status(400).json({
      status: 'fail',
      message: error.message || 'Could not create booking',
    });
  }
};

// PUT /api/bookings/:id
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedBooking = await BookingModel.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { bookingRef: id }] },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        status: 'fail',
        message: `Booking ${id} not found`,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Booking updated successfully',
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message || 'Could not update booking',
    });
  }
};

// DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBooking = await BookingModel.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { bookingRef: id }],
    });

    if (!deletedBooking) {
      return res.status(404).json({
        status: 'fail',
        message: `Booking ${id} not found`,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Booking deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Could not delete booking',
      error: error.message,
    });
  }
};
