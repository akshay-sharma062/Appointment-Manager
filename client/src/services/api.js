// Normalize Base URL: remove trailing slashes
const rawUrl = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = rawUrl.replace(/\/+$/, '');

/**
 * Safe JSON parser that catches HTML error pages (e.g. Vercel 404 / 500 HTML)
 * and returns clear, understandable errors instead of "Unexpected token '<'".
 */
async function parseSafeJson(res) {
  const text = await res.text();

  if (!text) {
    return {};
  }

  // Check if server returned HTML instead of JSON
  if (text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
    const statusInfo = res.status ? ` (HTTP ${res.status})` : '';
    throw new Error(
      `Backend returned an HTML page instead of JSON${statusInfo}. ` +
      `Check that VITE_API_URL points to your backend Vercel URL (e.g. https://your-backend.vercel.app/api).`
    );
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse server response as JSON: ${text.slice(0, 120)}`);
  }
}

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
  const data = await parseSafeJson(res);

  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch appointments (${res.status})`);
  }

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

  const data = await parseSafeJson(res);

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

  const data = await parseSafeJson(res);

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
      return { ok: false, message: `Server returned status ${res.status}` };
    }
    const data = await parseSafeJson(res);
    return {
      ok: true,
      database: data.database,
      uptime: data.uptime,
    };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
