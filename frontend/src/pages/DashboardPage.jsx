import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UsersRound,
  Key,
  FileText,
  Activity,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import dashboardService from '../services/dashboardService';
import auditService from '../services/auditService';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/Toast';

const DashboardPage = () => {
  const { addToast } = useToast();
  const user = useAuthStore((state) => state.user);

  const [stats, setStats] = useState({
    totalUsers: null,
    totalGroups: null,
    totalPermissions: null,
    totalAuditEntries: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [recentLogs, setRecentLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await dashboardService.getStats();
        const data = res.data?.data || res.data || {};
        if (isMounted) {
          setStats({
            totalUsers: data.totalUsers ?? 0,
            totalGroups: data.totalGroups ?? 0,
            totalPermissions: data.totalPermissions ?? 0,
            totalAuditEntries: data.totalAuditEntries ?? 0,
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        if (isMounted) {
          addToast('Failed to load dashboard statistics.', 'error');
        }
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    const fetchRecentLogs = async () => {
      try {
        setLogsLoading(true);
        const res = await auditService.getLogs(0, 5);
        const data = res.data?.data?.content || res.data?.content || res.data?.data || res.data || [];
        if (isMounted) {
          setRecentLogs(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch (err) {
        console.error('Failed to load recent activity logs:', err);
        if (isMounted) {
          addToast('Failed to load recent activity logs.', 'error');
        }
      } finally {
        if (isMounted) setLogsLoading(false);
      }
    };

    fetchStats();
    fetchRecentLogs();

    return () => {
      isMounted = false;
    };
  }, [addToast]);

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

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back,{' '}
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {user?.displayName || user?.username || 'Super User'}
            </span>
          </p>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <StatsCard
          title="Total Users"
          value={statsLoading ? null : stats.totalUsers}
          icon={Users}
          color="cyan"
        />
        <StatsCard
          title="AD Groups"
          value={statsLoading ? null : stats.totalGroups}
          icon={UsersRound}
          color="violet"
        />
        <StatsCard
          title="Permissions"
          value={statsLoading ? null : stats.totalPermissions}
          icon={Key}
          color="green"
        />
        <StatsCard
          title="Audit Entries"
          value={statsLoading ? null : stats.totalAuditEntries}
          icon={FileText}
          color="amber"
        />
      </div>

      {/* Recent Activity Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="var(--accent-cyan)" />
            <h2 className="card-title">Recent Activity</h2>
          </div>
          <Link
            to="/audit"
            className="btn btn-ghost"
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
          >
            View All Logs
            <ArrowRight size={15} style={{ marginLeft: '4px' }} />
          </Link>
        </div>

        {logsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner-lg spinner"></div>
            <p style={{ marginTop: '12px', fontSize: '0.88rem', color: '#94a3b8' }}>
              Loading recent activities...
            </p>
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ShieldAlert size={48} color="#64748b" />
            </div>
            <div className="empty-state-text">No recent audit log entries recorded.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentLogs.map((log, index) => (
              <div
                key={log.id || index}
                className="glass-sm glass-hover"
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(0, 212, 255, 0.1)',
                      border: '1px solid rgba(0, 212, 255, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {(log.actor || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                        {log.actor || 'System'}
                      </span>{' '}
                      <span style={{ color: '#94a3b8' }}>performed</span>{' '}
                      {getActionBadge(log.action)}
                    </div>
                    {log.target && (
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          marginTop: '2px',
                          fontFamily: 'monospace',
                        }}
                      >
                        Target: {log.target}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                  }}
                >
                  <Clock size={14} />
                  <span>{formatTimestamp(log.timestamp || log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
