import React from 'react';
import { CalendarDays, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function SummaryCards({ appointments = [] }) {
  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === 'Pending').length;
  const confirmed = appointments.filter((a) => a.status === 'Confirmed').length;
  const cancelled = appointments.filter((a) => a.status === 'Cancelled').length;

  return (
    <section className="metrics-grid" aria-label="Appointment metrics summary">
      {/* Total Appointments */}
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-label">Total Appointments</span>
          <div className="metric-icon-badge metric-icon-total">
            <CalendarDays size={18} />
          </div>
        </div>
        <div className="metric-value">{total}</div>
        <div className="metric-accent-bar" style={{ backgroundColor: 'var(--primary)' }} />
      </div>

      {/* Pending Appointments */}
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-label">Pending</span>
          <div className="metric-icon-badge metric-icon-pending">
            <Clock size={18} />
          </div>
        </div>
        <div className="metric-value" style={{ color: 'var(--warning-text)' }}>
          {pending}
        </div>
        <div className="metric-accent-bar" style={{ backgroundColor: 'var(--warning)' }} />
      </div>

      {/* Confirmed Appointments */}
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-label">Confirmed</span>
          <div className="metric-icon-badge metric-icon-confirmed">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="metric-value" style={{ color: 'var(--success-text)' }}>
          {confirmed}
        </div>
        <div className="metric-accent-bar" style={{ backgroundColor: 'var(--success)' }} />
      </div>

      {/* Cancelled Appointments */}
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-label">Cancelled</span>
          <div className="metric-icon-badge metric-icon-cancelled">
            <XCircle size={18} />
          </div>
        </div>
        <div className="metric-value" style={{ color: 'var(--danger-text)' }}>
          {cancelled}
        </div>
        <div className="metric-accent-bar" style={{ backgroundColor: 'var(--danger)' }} />
      </div>
    </section>
  );
}
