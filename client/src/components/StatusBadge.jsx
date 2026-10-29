import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = status ? status.toLowerCase() : 'pending';

  return (
    <span className={`badge badge-${normalized}`} role="status">
      <span className="badge-dot" aria-hidden="true" />
      <span>{status || 'Pending'}</span>
    </span>
  );
}
