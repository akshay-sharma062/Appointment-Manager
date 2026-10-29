const express = require('express');
const router = express.Router();
const {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getHealth,
} = require('../controllers/appointmentController');

// Health check
router.get('/health', getHealth);

// Appointments CRUD routes
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.patch('/appointments/:id/status', updateAppointmentStatus);

module.exports = router;

