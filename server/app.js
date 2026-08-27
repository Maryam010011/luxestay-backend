import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import hotelRoutes from './routes/hotelRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// CORS configuration (supports local dev and Vercel production)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or any vercel.app / localhost domain
      if (!origin || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent browser and CDN caching for all API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Database connection middleware - guarantees DB is connected before any handler runs
app.use(async (req, res, next) => {
  // Allow healthcheck to return state without blocking
  if (req.path === '/api/health') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ Request intercepted: MongoDB connection failure:', err.message);
    return res.status(503).json({
      status: 'error',
      message: 'Database connection failed. Please verify MONGODB_URI in environment variables.',
      error: err.message,
    });
  }
});

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = states[mongoose.connection.readyState] || 'unknown';
  res.status(200).json({
    status: 'ok',
    message: 'LuxeStay Hotel API is running',
    database: {
      status: dbState,
      readyState: mongoose.connection.readyState,
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 handler for unrecognized API endpoints
app.use('/api', (req, res) => {
  res.status(404).json({ status: 'fail', message: `API route ${req.originalUrl} not found` });
});

export default app;
