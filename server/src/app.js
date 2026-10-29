const express = require('express');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointmentRoutes');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/db');
const { seedInitialDataIfEmpty } = require('./utils/seed');

const app = express();

let isSeeded = false;

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
app.use(express.json());

// Serverless database connection middleware (ensures connection on Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!isSeeded) {
      await seedInitialDataIfEmpty();
      isSeeded = true;
    }
  } catch (err) {
    // If DB is offline, continue so /api/health can report status without crashing
    console.error('[DB Middleware]:', err.message);
  }
  next();
});

// Root welcome route for quick health inspection in browser
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Appointment Manager API is live and operational.',
    endpoints: {
      health: '/api/health',
      appointments: '/api/appointments',
    },
  });
});

// Support both /api prefix and root routes (handles Vercel serverless routing edge cases)
app.use('/api', appointmentRoutes);
app.use('/', appointmentRoutes);

// Fallback for unhandled routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
