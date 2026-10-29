const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [1, 'Customer name cannot be empty'],
    },
    service: {
      type: String,
      required: [true, 'Service is required'],
      trim: true,
      minlength: [1, 'Service cannot be empty'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Date and time is required'],
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: 'Invalid date and time format',
      },
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Pending', 'Confirmed', 'Cancelled'],
        message: 'Status must be one of: Pending, Confirmed, Cancelled',
      },
      default: 'Pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Helpful index for filtering and sorting
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ customerName: 1 });
appointmentSchema.index({ dateTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;

