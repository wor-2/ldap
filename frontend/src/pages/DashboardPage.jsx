import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  User,
  KeyRound,
  ScrollText,
  Activity,
  Zap,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import dashboardService from '../services/dashboardService';
import auditService from '../services/auditService';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/Toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const user = useAuthStore((state) => state.user);

  // Live time state updated every second
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

    const fetchDashboardData = async () => {
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
        console.error('Failed to load dashboard metrics:', err);
        if (isMounted) {
          addToast('Failed to load dashboard metrics.', 'error');
        }
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    const fetchRecentAudit = async () => {
      try {
        setLogsLoading(true);
        const res = await auditService.getLogs(0, 5);
        const data =
          res.data?.data?.content ||
          res.data?.content ||
          res.data?.data ||
          res.data ||
          [];
        if (isMounted) {
          setRecentLogs(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch (err) {
        console.error('Failed to load recent activity:', err);
        if (isMounted) {
          addToast('Failed to load recent activity logs.', 'error');
        }
      } finally {
        if (isMounted) setLogsLoading(false);
      }
    };

    fetchDashboardData();
    fetchRecentAudit();

    return () => {
      isMounted = false;
    };
  }, [addToast]);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      if (diffMs < 0 || isNaN(diffMs)) return 'Just now';
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return `${diffSec || 1}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} min ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
      const diffDay = Math.floor(diffHr / 24);
      if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const getActionBadge = (action = '') => {
    const act = action.toUpperCase();
    if (act.startsWith('CREATE_') || act.startsWith('ADD_')) {
      return <span className="badge badge-cyan">{action}</span>;
    }
    if (
      act.startsWith('DELETE_') ||
      act.startsWith('REVOKE_') ||
      act.includes('REMOVE')
    ) {
      return <span className="badge badge-red">{action}</span>;
    }
    if (act.startsWith('UPDATE_') || act.startsWith('MODIFY_')) {
      return <span className="badge badge-amber">{action}</span>;
    }
    if (act.startsWith('ASSIGN_')) {
      return <span className="badge badge-violet">{action}</span>;
    }
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return <span className="badge badge-green">{action}</span>;
    }
    return <span className="badge badge-blue">{action}</span>;
  };

  const formattedDateTime =
    currentTime.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) +
    ' • ' +
    currentTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const displayName = user?.displayName || user?.username || 'Super User';

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">
            Welcome back, <span className="gradient-text">{displayName}</span>
          </h1>
          <p className="page-subtitle">
            Enterprise Directory Control Panel & Infrastructure Monitor
          </p>
        </div>

        <div className="page-actions">
          <div className="live-indicator">
            <div className="live-dot" />
            <span className="mono">{formattedDateTime}</span>
          </div>
        </div>
      </div>

      {/* Grid 4: Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <StatsCard
          title="Total Users"
          value={statsLoading ? null : stats.totalUsers}
          icon={User}
          color="cyan"
          subtitle="Active directory user accounts"
        />
        <StatsCard
          title="AD Groups"
          value={statsLoading ? null : stats.totalGroups}
          icon={Users}
          color="violet"
          subtitle="Security and distribution groups"
        />
        <StatsCard
          title="Permissions"
          value={statsLoading ? null : stats.totalPermissions}
          icon={KeyRound}
          color="green"
          subtitle="Active role-based mappings"
        />
        <StatsCard
          title="Audit Entries"
          value={statsLoading ? null : stats.totalAuditEntries}
          icon={ScrollText}
          color="amber"
          subtitle="Total immutable audit records"
        />
      </div>

      {/* System Overview: Two Columns (Recent Activity + Quick Actions) */}
      <div className="grid-2">
        {/* Left Column: Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(0, 212, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Activity size={18} color="var(--cyan)" />
              </div>
              <h2 className="card-title">Recent Activity</h2>
            </div>
            <Link
              to="/audit"
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '6px 10px', gap: '5px' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-body">
            {logsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="activity-row">
                    <div
                      className="skeleton skeleton-circle"
                      style={{ width: 34, height: 34, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        className="skeleton skeleton-text"
                        style={{ width: '50%' }}
                      />
                      <div
                        className="skeleton skeleton-text"
                        style={{ width: '70%', height: 10, marginBottom: 0 }}
                      />
                    </div>
                    <div
                      className="skeleton skeleton-text"
                      style={{ width: 50, height: 12, marginBottom: 0 }}
                    />
                  </div>
                ))}
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 16px' }}>
                <div className="empty-state-icon">
                  <ShieldCheck size={36} color="var(--cyan)" />
                </div>
                <div className="empty-state-title">No Recent Audit Logs</div>
                <div className="empty-state-text">
                  New administrative events will appear here in real time.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentLogs.map((log, index) => {
                  const actor = log.actor || 'system';
                  const actorInitial = (actor[0] || 'S').toUpperCase();

                  return (
                    <div key={log.id || index} className="activity-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--gradient-subtle)',
                            border: '1px solid var(--cyan-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: 'var(--cyan)',
                            flexShrink: 0,
                          }}
                        >
                          {actorInitial}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flexWrap: 'wrap',
                              fontSize: '0.86rem',
                            }}
                          >
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {actor}
                            </span>
                            {getActionBadge(log.action)}
                          </div>
                          {log.target && (
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginTop: '2px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '280px',
                              }}
                              title={log.target}
                            >
                              <span style={{ color: 'var(--text-hint)' }}>Target: </span>
                              {log.target}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={12} />
                        <span>{formatTimeAgo(log.timestamp || log.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(124, 58, 237, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={18} color="var(--violet-light)" />
              </div>
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              <Sparkles size={13} color="var(--cyan)" />
              <span>Shortcuts</span>
            </div>
          </div>

          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Action Tile 1: Create Group */}
              <div
                className="quick-action-tile"
                onClick={() => navigate('/groups')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/groups')}
              >
                <div
                  className="quick-action-icon"
                  style={{
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.25)',
                    color: 'var(--cyan)',
                  }}
                >
                  <Users size={22} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="quick-action-title">Create Group</div>
                  <div className="quick-action-desc">
                    Provision a new Active Directory security or distribution group
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>

              {/* Action Tile 2: Create User */}
              <div
                className="quick-action-tile"
                onClick={() => navigate('/users')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/users')}
              >
                <div
                  className="quick-action-icon"
                  style={{
                    background: 'rgba(124, 58, 237, 0.1)',
                    border: '1px solid rgba(124, 58, 237, 0.25)',
                    color: 'var(--violet-light)',
                  }}
                >
                  <User size={22} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="quick-action-title">Create User</div>
                  <div className="quick-action-desc">
                    Add a new domain user and configure group memberships
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>

              {/* Action Tile 3: Assign Permission */}
              <div
                className="quick-action-tile"
                onClick={() => navigate('/permissions')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/permissions')}
              >
                <div
                  className="quick-action-icon"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#34d399',
                  }}
                >
                  <KeyRound size={22} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="quick-action-title">Assign Permission</div>
                  <div className="quick-action-desc">
                    Grant fine-grained group permissions to directory users
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>

              {/* Action Tile 4: View Audit Log */}
              <div
                className="quick-action-tile"
                onClick={() => navigate('/audit')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/audit')}
              >
                <div
                  className="quick-action-icon"
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    color: '#fbbf24',
                  }}
                >
                  <ScrollText size={22} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="quick-action-title">View Audit Log</div>
                  <div className="quick-action-desc">
                    Inspect security trails, authentication logs, and change history
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
