const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Fetch appointments with optional status and customer-name search filters
 */
export async function getAppointments({ status = 'All', search = '' } = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'All') {
    params.append('status', status);
  }
  if (search && search.trim()) {
    params.append('search', search.trim());
  }

  const queryString = params.toString();
  const url = `${BASE_URL}/appointments${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch appointments (${res.status})`);
  }
  const data = await res.json();
  return data.data || [];
}

/**
 * Create a new appointment
 */
export async function createAppointment(appointmentData) {
  const res = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || 'Failed to create appointment');
    error.errors = data.errors || {};
    error.status = res.status;
    throw error;
  }

  return data.data;
}

/**
 * Change appointment status
 */
export async function updateAppointmentStatus(id, newStatus) {
  const res = await fetch(`${BASE_URL}/appointments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: newStatus }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || 'Failed to update appointment status');
    error.errors = data.errors || {};
    throw error;
  }

  return data.data;
}

/**
 * Check backend health and MongoDB connection
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) {
      return { ok: false, message: `Server error: ${res.status}` };
    }
    const data = await res.json();
    return {
      ok: true,
      database: data.database,
      uptime: data.uptime,
    };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

