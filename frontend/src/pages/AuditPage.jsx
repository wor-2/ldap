import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Search,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import auditService from '../services/auditService';
import { useToast } from '../components/Toast';

const AuditPage = () => {
  const { addToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const isMountedRef = useRef(true);

  const fetchLogs = useCallback(
    async (currentPage = 0, currentSearch = '', silent = false) => {
      try {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        const res = await auditService.getLogs(currentPage, size, currentSearch);
        const data = res.data?.data || res.data || {};

        if (isMountedRef.current) {
          const list = data.content || (Array.isArray(data) ? data : []);
          setLogs(list);
          const totalElements = data.totalElements ?? list.length;
          setTotal(totalElements);
          setTotalPages(data.totalPages ?? Math.max(1, Math.ceil(totalElements / size)));
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
        if (isMountedRef.current && !silent) {
          addToast('Failed to load audit logs.', 'error');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [size, addToast]
  );

  // Fetch on mount and when page or search changes
  useEffect(() => {
    isMountedRef.current = true;
    fetchLogs(page, search);

    return () => {
      isMountedRef.current = false;
    };
  }, [page, search, fetchLogs]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchLogs(page, search, true);
    }, 30000);

    return () => {
      clearInterval(timer);
    };
  }, [page, search, fetchLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(0);
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return dateStr;
    }
  };

  const getActionBadge = (action = '') => {
    const act = action.toUpperCase();
    if (act.startsWith('CREATE_')) return <span className="badge badge-cyan">{action}</span>;
    if (act.startsWith('DELETE_')) return <span className="badge badge-red">{action}</span>;
    if (act.startsWith('ADD_')) return <span className="badge badge-green">{action}</span>;
    if (act.startsWith('REMOVE_')) return <span className="badge badge-amber">{action}</span>;
    if (act.startsWith('ASSIGN_')) return <span className="badge badge-violet">{action}</span>;
    if (act.startsWith('REVOKE_')) return <span className="badge badge-red">{action}</span>;
    if (act.includes('LOGIN')) return <span className="badge badge-blue">{action}</span>;
    return <span className="badge badge-cyan">{action}</span>;
  };

  const getStatusBadge = (status = '') => {
    const s = String(status).toUpperCase();
    if (s === 'SUCCESS' || s === '200' || s === 'OK' || s === 'TRUE') {
      return (
        <span className="badge badge-green" style={{ display: 'inline-flex', gap: '4px' }}>
          <CheckCircle2 size={12} />
          SUCCESS
        </span>
      );
    }
    return (
      <span className="badge badge-red" style={{ display: 'inline-flex', gap: '4px' }}>
        <XCircle size={12} />
        FAILURE
      </span>
    );
  };

  const truncate = (str, len = 50) => {
    if (!str) return '—';
    return str.length > len ? `${str.substring(0, len)}...` : str;
  };

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h1 className="page-title">Audit Log</h1>

            {/* Live Indicator */}
            <div
              className="glass-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontWeight: 600 }}>Live (30s)</span>
              {isRefreshing && (
                <RefreshCw size={12} className="spinner" style={{ border: 'none', animation: 'spin 1s linear infinite' }} />
              )}
            </div>
          </div>
          <p className="page-subtitle">
            Immutable Active Directory audit trail of administrative actions and security events
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fetchLogs(page, search, false)}
          disabled={loading || isRefreshing}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} className={loading || isRefreshing ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '520px' }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: 'none' }}>
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="input-field"
              placeholder="Search by actor, target, action or details..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 18px' }}>
            Search
          </button>
          {search && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleResetSearch}
              style={{ fontSize: '0.85rem' }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Table Container */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '70px 0' }}>
            <div className="spinner spinner-lg"></div>
            <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '0.9rem' }}>
              Loading audit logs...
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={50} color="#64748b" />
            </div>
            <div className="empty-state-text" style={{ fontWeight: 600, marginBottom: '6px' }}>
              No audit logs found
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {search
                ? `No log entries matched your filter "${search}".`
                : 'No audit records currently available in the database.'}
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target Type</th>
                <th>Target</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const logId = log.id || `log-${index}`;
                const actorName = log.actor || log.actorUsername || 'system';
                const action = log.action || 'UNKNOWN';
                const targetType = log.targetType || log.resourceType || '—';
                const target = log.target || log.resource || '—';
                const status = log.status || (log.success === false ? 'FAILURE' : 'SUCCESS');
                const details =
                  log.details ||
                  (typeof log.message === 'string' ? log.message : '') ||
                  (log.metadata ? JSON.stringify(log.metadata) : '—');

                return (
                  <tr key={logId}>
                    <td style={{ whiteSpace: 'nowrap', color: '#94a3b8', fontSize: '0.82rem' }}>
                      {formatTimestamp(log.timestamp || log.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCircle size={18} color="var(--accent-cyan)" />
                        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{actorName}</span>
                      </div>
                    </td>
                    <td>{getActionBadge(action)}</td>
                    <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>
                        {targetType}
                      </span>
                    </td>
                    <td
                      style={{
                        color: '#e2e8f0',
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        maxWidth: '180px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={target}
                    >
                      {target}
                    </td>
                    <td>{getStatusBadge(status)}</td>
                    <td
                      style={{
                        color: '#94a3b8',
                        fontSize: '0.82rem',
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={details}
                    >
                      {truncate(details, 50)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && logs.length > 0 && (
        <div className="pagination">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span style={{ fontSize: '0.88rem', color: '#94a3b8', padding: '0 12px' }}>
            Page <strong style={{ color: '#e2e8f0' }}>{page + 1}</strong> of{' '}
            <strong style={{ color: '#e2e8f0' }}>{totalPages}</strong>
            {total > 0 && <span style={{ marginLeft: '8px', color: '#64748b' }}>({total} entries)</span>}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditPage;
