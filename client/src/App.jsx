import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, RefreshCw, CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import SummaryCards from './components/SummaryCards';
import FilterBar from './components/FilterBar';
import AppointmentList from './components/AppointmentList';
import AppointmentForm from './components/AppointmentForm';
import { getAppointments, updateAppointmentStatus, checkBackendHealth } from './services/api';

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState({ connected: false, state: 'checking', databaseName: null });

  // Initial load
  useEffect(() => {
    loadData();
    checkHealth();
  }, []);

  const checkHealth = useCallback(async () => {
    const health = await checkBackendHealth();
    if (health.ok && health.database) {
      setDbStatus(health.database);
    } else {
      setDbStatus({ connected: false, state: 'disconnected', databaseName: null });
    }
  }, []);

  const loadData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await getAppointments();
      setAppointments(data);

      if (isManualRefresh) {
        toast.info('Appointments refreshed from database.', {
          id: 'refresh-data-info',
          duration: 2500,
        });
      }
    } catch (err) {
      toast.error(err.message || 'Could not connect to the server. Check your connection.', {
        id: 'server-connection-error',
        duration: 4500,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleStatusChange = useCallback(async (id, newStatus) => {
    try {
      const updated = await updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      toast.success(`Appointment status updated to "${newStatus}" for ${updated.customerName}.`, {
        id: `status-update-${id}`,
        duration: 3500,
      });
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update appointment status. Please try again.', {
        id: `status-update-error-${id}`,
        duration: 4500,
      });
      throw err;
    }
  }, []);

  const handleCreateSuccess = useCallback((newApt) => {
    setAppointments((prev) => [newApt, ...prev]);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('All');
    toast.info('Filters have been reset.', {
      id: 'filters-reset-info',
      duration: 2500,
    });
  }, []);

  // Filtered & searched appointments derived state (partial, case-insensitive match)
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Status matching
      const matchesStatus =
        statusFilter === 'All' ||
        apt.status?.toLowerCase() === statusFilter.toLowerCase();

      // Customer name partial, case-insensitive matching
      const matchesSearch =
        !searchQuery.trim() ||
        (apt.customerName &&
          apt.customerName.toLowerCase().includes(searchQuery.trim().toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  // Status counts for badge tabs
  const counts = useMemo(() => {
    return {
      All: appointments.length,
      Pending: appointments.filter((a) => a.status === 'Pending').length,
      Confirmed: appointments.filter((a) => a.status === 'Confirmed').length,
      Cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
    };
  }, [appointments]);

  return (
    <div className="container">
      {/* Toast Notification Mount Point */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3500}
        expand={false}
      />

      {/* Top Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon-box" aria-hidden="true">
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 className="app-title">Appointment Manager</h1>
            <p className="app-subtitle">Manage upcoming appointments and client schedules</p>
          </div>
        </div>

        <div className="header-actions">
          {/* MongoDB Persistence Indicator */}
          <div
            className="persistence-indicator"
            title={
              dbStatus.connected
                ? `Connected to MongoDB database: ${dbStatus.databaseName || 'appointment_manager'}`
                : 'MongoDB offline. Fallback in effect.'
            }
          >
            <div className="persistence-dot-wrapper">
              {dbStatus.connected && <div className="persistence-pulse" />}
              <div
                className={`persistence-dot ${
                  dbStatus.connected
                    ? 'connected'
                    : dbStatus.state === 'checking'
                    ? 'checking'
                    : 'disconnected'
                }`}
              />
            </div>
            <span>
              {dbStatus.connected
                ? 'MongoDB Persisted'
                : dbStatus.state === 'checking'
                ? 'Checking DB...'
                : 'DB Offline'}
            </span>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              loadData(true);
              checkHealth();
            }}
            title="Reload appointments from server"
            disabled={isLoading || isRefreshing}
            aria-label="Refresh appointments from database"
          >
            <RefreshCw
              size={15}
              className={isLoading || isRefreshing ? 'btn-spin' : ''}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>

          {/* Add appointment button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsFormOpen(true)}
            aria-label="Schedule a new appointment"
          >
            <Plus size={17} aria-hidden="true" />
            <span>Add Appointment</span>
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <SummaryCards appointments={appointments} />

      {/* Search and Status Filters */}
      <FilterBar
        search={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        counts={counts}
        onReset={handleResetFilters}
      />

      {/* Appointment Table & Mobile Cards */}
      <AppointmentList
        appointments={filteredAppointments}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onResetFilters={handleResetFilters}
        onOpenCreateModal={() => setIsFormOpen(true)}
      />

      {/* Appointment Creation Modal */}
      <AppointmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
