import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, Clock, AlertCircle, SearchX, Plus, Loader2 } from 'lucide-react';

function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getInitials(name = '') {
  if (!name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AppointmentList({
  appointments,
  onStatusChange,
  isLoading,
  searchQuery,
  statusFilter,
  onResetFilters,
  onOpenCreateModal,
}) {
  const [updatingId, setUpdatingId] = useState(null);

  async function handleStatusSelect(id, newStatus, currentStatus) {
    if (newStatus === currentStatus) return;
    try {
      setUpdatingId(id);
      await onStatusChange(id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  }

  // Refined Shimmering Skeleton Loader
  if (isLoading) {
    return (
      <div className="table-container" aria-busy="true" aria-label="Loading appointments">
        <table className="desktop-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Date & Time</th>
              <th>Current Status</th>
              <th style={{ textAlign: 'right' }}>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((n) => (
              <tr key={n}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="skeleton-cell" style={{ width: '34px', height: '34px', borderRadius: '50%' }} />
                    <div className="skeleton-cell" style={{ width: '130px', height: '16px' }} />
                  </div>
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: '90px', height: '16px' }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: '150px', height: '16px' }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: '80px', height: '24px', borderRadius: '9999px' }} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="skeleton-cell" style={{ width: '110px', height: '30px', marginLeft: 'auto' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty State
  if (appointments.length === 0) {
    const hasFilter = Boolean(searchQuery.trim()) || statusFilter !== 'All';

    if (hasFilter) {
      return (
        <div className="empty-state" role="status">
          <div className="empty-state-icon-wrapper">
            <SearchX size={30} />
          </div>
          <h3 className="empty-state-title">No matching appointments found</h3>
          <p className="empty-state-desc">
            No records matched your search query{' '}
            {searchQuery ? `"${searchQuery}"` : ''}{' '}
            {statusFilter !== 'All' ? `under status "${statusFilter}"` : ''}.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onResetFilters}
          >
            Clear Search & Filters
          </button>
        </div>
      );
    }

    return (
      <div className="empty-state" role="status">
        <div className="empty-state-icon-wrapper">
          <Calendar size={30} />
        </div>
        <h3 className="empty-state-title">No appointments scheduled</h3>
        <p className="empty-state-desc">
          There are currently no appointments in the system. Create your first appointment to get started.
        </p>
        {onOpenCreateModal && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            <span>Schedule Appointment</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="table-container">
        <table className="desktop-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Date & Time</th>
              <th>Current Status</th>
              <th style={{ textAlign: 'right' }}>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => {
              const isUpdating = updatingId === apt.id;
              return (
                <tr key={apt.id}>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar" aria-hidden="true">
                        {getInitials(apt.customerName)}
                      </div>
                      <span className="customer-name">{apt.customerName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="service-tag">{apt.service}</span>
                  </td>
                  <td>
                    <span className="date-time-cell">
                      <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{formatDateTime(apt.dateTime)}</span>
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={apt.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="status-select-wrapper" style={{ justifyContent: 'flex-end' }}>
                      {isUpdating && (
                        <Loader2
                          size={14}
                          className="btn-spin"
                          style={{ marginRight: '8px', color: 'var(--primary)' }}
                        />
                      )}
                      <select
                        className="status-select"
                        value={apt.status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusSelect(apt.id, e.target.value, apt.status)}
                        aria-label={`Change status for ${apt.customerName}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards">
        {appointments.map((apt) => {
          const isUpdating = updatingId === apt.id;
          return (
            <article key={apt.id} className="appointment-mobile-card">
              <div className="card-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="customer-avatar" aria-hidden="true">
                    {getInitials(apt.customerName)}
                  </div>
                  <div>
                    <h4 className="customer-name" style={{ fontSize: '1rem' }}>
                      {apt.customerName}
                    </h4>
                    <span className="service-tag">{apt.service}</span>
                  </div>
                </div>
                <StatusBadge status={apt.status} />
              </div>

              <div className="card-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span>{formatDateTime(apt.dateTime)}</span>
                </div>
              </div>

              <div className="card-footer-row">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Change Status:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isUpdating && (
                    <Loader2 size={14} className="btn-spin" style={{ color: 'var(--primary)' }} />
                  )}
                  <select
                    className="status-select"
                    value={apt.status}
                    disabled={isUpdating}
                    onChange={(e) => handleStatusSelect(apt.id, e.target.value, apt.status)}
                    aria-label={`Change status for ${apt.customerName}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
