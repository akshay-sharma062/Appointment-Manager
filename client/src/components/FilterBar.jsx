import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

export default function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  counts,
  onReset,
}) {
  const tabs = [
    { key: 'All', label: 'All', count: counts.All },
    { key: 'Pending', label: 'Pending', count: counts.Pending },
    { key: 'Confirmed', label: 'Confirmed', count: counts.Confirmed },
    { key: 'Cancelled', label: 'Cancelled', count: counts.Cancelled },
  ];

  const hasActiveFilters = Boolean(search.trim()) || statusFilter !== 'All';

  return (
    <nav className="filter-card" aria-label="Appointment search and status filters">
      <div className="search-wrapper">
        <Search className="search-icon" size={18} aria-hidden="true" />
        <input
          type="text"
          className="search-input"
          placeholder="Search by customer name..."
          aria-label="Search appointments by customer name"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear customer search query"
            title="Clear search"
            onClick={() => onSearchChange('')}
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="filter-tabs" role="tablist" aria-label="Filter appointments by status">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onStatusChange(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="tab-badge">{tab.count ?? 0}</span>
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={onReset}
            title="Reset active search query and status filter"
            aria-label="Reset all search queries and status filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </nav>
  );
}
