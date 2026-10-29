import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, User, Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createAppointment } from '../services/api';

const SERVICE_OPTIONS = [
  'Consultation',
  'Follow-up',
  'Review',
  'Dental Cleaning',
  'Physical Exam',
  'Diagnostic Test',
  'Therapy Session',
];

export default function AppointmentForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customerName: '',
    service: 'Consultation',
    customService: '',
    dateTime: '',
    status: 'Pending',
  });

  const [useCustomService, setUseCustomService] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef(null);

  // Focus input and handle Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    // Autofocus name input after modal renders
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 50);

    function handleKeyDown(e) {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  function validate() {
    const newErrors = {};

    if (!formData.customerName || !formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    const effectiveService = useCustomService ? formData.customService : formData.service;
    if (!effectiveService || !effectiveService.trim()) {
      newErrors.service = 'Service is required';
    }

    if (!formData.dateTime) {
      newErrors.dateTime = 'Date and time is required';
    } else {
      const parsed = new Date(formData.dateTime);
      if (isNaN(parsed.getTime())) {
        newErrors.dateTime = 'Please enter a valid date and time';
      }
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      toast.warning('Please complete all required fields.', {
        id: 'form-validation-warning',
        duration: 3500,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const effectiveService = useCustomService
        ? formData.customService.trim()
        : formData.service.trim();

      const payload = {
        customerName: formData.customerName.trim(),
        service: effectiveService,
        dateTime: formData.dateTime,
        status: formData.status,
      };

      const created = await createAppointment(payload);
      toast.success(`Appointment scheduled successfully for ${created.customerName}.`, {
        id: 'create-appointment-success',
        duration: 3500,
      });

      onSuccess(created);
      onClose();

      // Reset form fields after successful submission
      setFormData({
        customerName: '',
        service: 'Consultation',
        customService: '',
        dateTime: '',
        status: 'Pending',
      });
      setUseCustomService(false);
      setErrors({});
    } catch (err) {
      // Preserve user form inputs so they can easily correct and retry
      if (err.errors) {
        setErrors(err.errors);
      }
      toast.error(err.message || 'Unable to schedule appointment. Please try again.', {
        id: 'create-appointment-error',
        duration: 4500,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOverlayClick() {
    if (!isSubmitting) {
      onClose();
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">Schedule New Appointment</h2>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close appointment creation modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Customer Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="customerName">
                Customer Name <span className="required" aria-hidden="true">*</span>
              </label>
              <input
                ref={nameInputRef}
                id="customerName"
                type="text"
                className={`form-input ${errors.customerName ? 'has-error' : ''}`}
                placeholder="e.g. Alex Morgan"
                value={formData.customerName}
                aria-invalid={Boolean(errors.customerName)}
                aria-describedby={errors.customerName ? 'customerName-error' : undefined}
                onChange={(e) => {
                  setFormData({ ...formData, customerName: e.target.value });
                  if (errors.customerName) setErrors({ ...errors, customerName: '' });
                }}
              />
              {errors.customerName && (
                <p id="customerName-error" className="form-error" role="alert">
                  <AlertCircle size={14} />
                  <span>{errors.customerName}</span>
                </p>
              )}
            </div>

            {/* Service Selection / Custom Service */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" htmlFor="serviceSelect" style={{ marginBottom: 0 }}>
                  Service <span className="required" aria-hidden="true">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomService(!useCustomService)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {useCustomService ? 'Choose from presets' : 'Enter custom service'}
                </button>
              </div>

              {useCustomService ? (
                <input
                  id="customService"
                  type="text"
                  className={`form-input ${errors.service ? 'has-error' : ''}`}
                  placeholder="e.g. Specialized Consultation"
                  value={formData.customService}
                  aria-invalid={Boolean(errors.service)}
                  aria-describedby={errors.service ? 'service-error' : undefined}
                  onChange={(e) => {
                    setFormData({ ...formData, customService: e.target.value });
                    if (errors.service) setErrors({ ...errors, service: '' });
                  }}
                />
              ) : (
                <select
                  id="serviceSelect"
                  className={`form-select ${errors.service ? 'has-error' : ''}`}
                  value={formData.service}
                  aria-invalid={Boolean(errors.service)}
                  aria-describedby={errors.service ? 'service-error' : undefined}
                  onChange={(e) => {
                    setFormData({ ...formData, service: e.target.value });
                    if (errors.service) setErrors({ ...errors, service: '' });
                  }}
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
              {errors.service && (
                <p id="service-error" className="form-error" role="alert">
                  <AlertCircle size={14} />
                  <span>{errors.service}</span>
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="form-group">
              <label className="form-label" htmlFor="dateTime">
                Date & Time <span className="required" aria-hidden="true">*</span>
              </label>
              <input
                id="dateTime"
                type="datetime-local"
                className={`form-input ${errors.dateTime ? 'has-error' : ''}`}
                value={formData.dateTime}
                aria-invalid={Boolean(errors.dateTime)}
                aria-describedby={errors.dateTime ? 'dateTime-error' : undefined}
                onChange={(e) => {
                  setFormData({ ...formData, dateTime: e.target.value });
                  if (errors.dateTime) setErrors({ ...errors, dateTime: '' });
                }}
              />
              {errors.dateTime && (
                <p id="dateTime-error" className="form-error" role="alert">
                  <AlertCircle size={14} />
                  <span>{errors.dateTime}</span>
                </p>
              )}
            </div>

            {/* Initial Status */}
            <div className="form-group">
              <label className="form-label" htmlFor="statusSelect">
                Initial Status <span className="required" aria-hidden="true">*</span>
              </label>
              <select
                id="statusSelect"
                className={`form-select ${errors.status ? 'has-error' : ''}`}
                value={formData.status}
                aria-invalid={Boolean(errors.status)}
                aria-describedby={errors.status ? 'status-error' : undefined}
                onChange={(e) => {
                  setFormData({ ...formData, status: e.target.value });
                  if (errors.status) setErrors({ ...errors, status: '' });
                }}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              {errors.status && (
                <p id="status-error" className="form-error" role="alert">
                  <AlertCircle size={14} />
                  <span>{errors.status}</span>
                </p>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="btn-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                'Create Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
