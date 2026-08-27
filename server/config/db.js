import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

// Fail immediately if database is not connected rather than waiting for 10s buffering timeout
mongoose.set('bufferCommands', false);

let cachedConnectionPromise = null;

export const connectDB = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is already in progress, return the pending promise
  if (cachedConnectionPromise && (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 1)) {
    return cachedConnectionPromise;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    const errorMsg = 'MONGODB_URI is not defined in environment variables.';
    console.error(`❌ [DB] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // DNS SRV fallback ONLY for local Windows environments (not in Vercel serverless)
  if (!process.env.VERCEL) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) {
      // Ignore if system resolver handles DNS
    }
  }

  try {
    cachedConnectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    const conn = await cachedConnectionPromise;
    console.log(`✅ MongoDB connected to: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    cachedConnectionPromise = null;
    console.error('❌ MongoDB connection error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
};

