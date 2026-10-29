const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const { getDbStatus } = require('../config/db');

// Valid status values
const VALID_STATUSES = ['Pending', 'Confirmed', 'Cancelled'];

/**
 * GET /api/appointments
 * Query params (optional):
 *   - status: 'Pending' | 'Confirmed' | 'Cancelled' | 'All'
 *   - search: string (matches customerName case-insensitively)
 */
async function getAppointments(req, res, next) {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      if (VALID_STATUSES.includes(status)) {
        filter.status = status;
      }
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      // Escape regex special characters to prevent regex injection
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.customerName = { $regex: escaped, $options: 'i' };
    }

    const appointments = await Appointment.find(filter).sort({ dateTime: 1 });
    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/appointments
 * Body: { customerName, service, dateTime, status }
 */
async function createAppointment(req, res, next) {
  try {
    const { customerName, service, dateTime, status } = req.body;
    const errors = {};

    // Validate customerName
    if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
      errors.customerName = 'Customer name is required';
    }

    // Validate service
    if (!service || typeof service !== 'string' || service.trim() === '') {
      errors.service = 'Service is required';
    }

    // Validate dateTime
    if (!dateTime) {
      errors.dateTime = 'Date and time is required';
    } else {
      const parsedDate = new Date(dateTime);
      if (isNaN(parsedDate.getTime())) {
        errors.dateTime = 'Invalid date and time format';
      }
    }

    // Validate status (default to Pending if omitted)
    const appointmentStatus = status ? status.trim() : 'Pending';
    if (!VALID_STATUSES.includes(appointmentStatus)) {
      errors.status = `Status must be one of: ${VALID_STATUSES.join(', ')}`;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const newAppointment = new Appointment({
      customerName: customerName.trim(),
      service: service.trim(),
      dateTime: new Date(dateTime),
      status: appointmentStatus,
    });

    const saved = await newAppointment.save();

    return res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: saved,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const fieldErrors = {};
      Object.keys(err.errors).forEach((key) => {
        fieldErrors[key] = err.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: fieldErrors,
      });
    }
    return next(err);
  }
}

/**
 * PATCH /api/appointments/:id/status
 * Body: { status }
 */
async function updateAppointmentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format',
      });
    }

    if (!status || typeof status !== 'string' || !VALID_STATUSES.includes(status.trim())) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        errors: {
          status: `Valid values are: ${VALID_STATUSES.join(', ')}`,
        },
      });
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status: status.trim() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Appointment with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: updated,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/health
 */
function getHealth(req, res) {
  const db = getDbStatus();
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    database: db,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getHealth,
};

