require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { seedInitialDataIfEmpty } = require('./utils/seed');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('[Server] Connecting to MongoDB...');
    await connectDB();
    console.log('[Server] Checking and seeding initial sample data...');
    await seedInitialDataIfEmpty();
  } catch (err) {
    console.error('=====================================================');
    console.error('WARNING: MongoDB connection failed!');
    console.error(`Error details: ${err.message}`);
    console.error('Please ensure MongoDB is running at the configured MONGODB_URI.');
    console.error('=====================================================');
  }

  app.listen(PORT, () => {
    console.log(`[Server] Server is running on port ${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[Server] Appointments API: http://localhost:${PORT}/api/appointments`);
  });
}

// In local execution start the server; in serverless (e.g. Vercel) export the Express handler
if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;
