import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('Initiating database connection...');
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 LuxeStay Backend Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server due to database connection error:', error.message);
    process.exit(1);
  }
}

startServer();
