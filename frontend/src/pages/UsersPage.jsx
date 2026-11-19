import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  UserPlus,
  Search,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Briefcase,
  Building,
  Key,
  Shield,
  AlertCircle,
  Users,
} from 'lucide-react';
import userService from '../services/userService';
import permissionService from '../services/permissionService';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const UsersPage = () => {
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    title: '',
  });

  const fetchUsers = useCallback(async (query = '') => {
    try {
      setLoading(true);
      const res = await userService.listUsers(query);
      const data = res.data?.data || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      addToast('Failed to load Active Directory users.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search, fetchUsers]);

  const handleOpenDetail = async (userObj) => {
    setSelectedUser(userObj);
    setShowDetailModal(true);
    setUserPermissions([]);
    const username = userObj.uid || userObj.sAMAccountName || userObj.username;

    if (username) {
      setLoadingPermissions(true);
      try {
        const res = await permissionService.getUserPermissions(username);
        const pData = res.data?.data || res.data || [];
        setUserPermissions(Array.isArray(pData) ? pData : []);
      } catch (err) {
        console.warn('Could not fetch app permissions for user:', err);
      } finally {
        setLoadingPermissions(false);
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    const { firstName, lastName, username, email, password, phone, department, title } = createForm;

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setCreateError('First Name and Last Name are required.');
      return;
    }
    if (!username.trim()) {
      setCreateError('Username (UID) is required.');
      return;
    }
    if (!/^[a-zA-Z0-9_\-\.]{3,32}$/.test(username.trim())) {
      setCreateError('Username must be 3-32 characters (alphanumeric, dashes, dots, underscores).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setCreateError('A valid email address is required.');
      return;
    }
    if (!password || password.length < 6) {
      setCreateError('Password must be at least 6 characters long.');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        uid: username.trim(),
        cn: `${firstName.trim()} ${lastName.trim()}`,
        displayName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        department: department.trim() || undefined,
        title: title.trim() || undefined,
      };

      await userService.createUser(payload);
      addToast(`User "${payload.displayName}" created successfully!`, 'success');
      setShowCreateModal(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        phone: '',
        department: '',
        title: '',
      });
      fetchUsers(search);
    } catch (err) {
      console.error('Failed to create user:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error creating domain user.';
      setCreateError(msg);
      addToast(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name = '') => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getCategoryBadge = (category = '') => {
    switch (category.toUpperCase()) {
      case 'READ':
        return <span className="badge badge-cyan">READ</span>;
      case 'WRITE':
        return <span className="badge badge-violet">WRITE</span>;
      case 'ADMIN':
        return <span className="badge badge-red">ADMIN</span>;
      case 'CUSTOM':
      default:
        return <span className="badge badge-amber">{category || 'CUSTOM'}</span>;
    }
  };

  const formatDnGroup = (dnStr = '') => {
    const match = dnStr.match(/^cn=([^,]+)/i);
    return match ? match[1] : dnStr;
  };

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">AD Users</h1>
            {!loading && (
              <span className="badge badge-cyan" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                {users.length} {users.length === 1 ? 'user' : 'users'}
              </span>
            )}
          </div>
          <p className="page-subtitle">
            Manage Active Directory domain accounts, profiles, and access
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setCreateError('');
            setShowCreateModal(true);
          }}
        >
          <UserPlus size={18} />
          <span>Create User</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '28px' }}>
        <div className="search-bar">
          <span className="search-icon">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="input-field"
            placeholder="Search users by name, username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner spinner-lg"></div>
            <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '0.9rem' }}>
              Loading domain users...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <User size={50} color="#64748b" />
            </div>
            <div className="empty-state-text" style={{ fontWeight: 600, marginBottom: '6px' }}>
              No users found
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {search
                ? `No accounts matched your search for "${search}".`
                : 'No domain user accounts found in this directory.'}
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: '50px' }}></th>
                <th>Display Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => {
                const displayName =
                  u.displayName ||
                  u.cn ||
                  `${u.givenName || ''} ${u.sn || ''}`.trim() ||
                  u.uid ||
                  'Unknown';
                const username = u.uid || u.sAMAccountName || u.username || '—';
                const email = u.mail || u.userPrincipalName || u.email || '—';
                const phone = u.telephoneNumber || u.mobile || u.phone || '—';

                return (
                  <tr key={u.dn || username || idx}>
                    <td>
                      <div className="avatar">{getInitials(displayName)}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{displayName}</div>
                      {u.title && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.title}</div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-cyan">{username}</span>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{email}</td>
                    <td style={{ color: '#94a3b8' }}>{phone}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-icon btn-icon-primary"
                        title="View user details & permissions"
                        onClick={() => handleOpenDetail(u)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Active Directory User Profile"
        size="lg"
      >
        {selectedUser && (
          <div>
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '20px',
              }}
            >
              <div
                className="avatar"
                style={{ width: 60, height: 60, fontSize: '1.4rem', borderRadius: '16px' }}
              >
                {getInitials(
                  selectedUser.displayName || selectedUser.cn || selectedUser.uid
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0' }}>
                  {selectedUser.displayName || selectedUser.cn || selectedUser.uid}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span className="badge badge-cyan">
                    UID: {selectedUser.uid || selectedUser.sAMAccountName || '—'}
                  </span>
                  {selectedUser.department && (
                    <span className="badge badge-violet">{selectedUser.department}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid-2" style={{ marginBottom: '24px' }}>
              <div className="glass-sm" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <Mail size={15} />
                  <span>Email Address</span>
                </div>
                <div style={{ color: '#e2e8f0', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                  {selectedUser.mail || selectedUser.userPrincipalName || selectedUser.email || 'Not configured'}
                </div>
              </div>

              <div className="glass-sm" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <Phone size={15} />
                  <span>Phone Number</span>
                </div>
                <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>
                  {selectedUser.telephoneNumber || selectedUser.mobile || selectedUser.phone || 'Not configured'}
                </div>
              </div>
            </div>

            {/* AD Groups Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Users size={16} color="var(--accent-cyan)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0' }}>
                  AD Group Memberships (memberOf)
                </h4>
              </div>

              {selectedUser.memberOf &&
              (Array.isArray(selectedUser.memberOf) ? selectedUser.memberOf.length > 0 : true) ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(Array.isArray(selectedUser.memberOf)
                    ? selectedUser.memberOf
                    : [selectedUser.memberOf]
                  ).map((grp, i) => (
                    <span key={i} className="badge badge-cyan" title={grp}>
                      {formatDnGroup(grp)}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                  No group memberships recorded.
                </p>
              )}
            </div>

            {/* App Permissions Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Key size={16} color="#a78bfa" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0' }}>
                  Assigned Application Permissions
                </h4>
              </div>

              {loadingPermissions ? (
                <div style={{ padding: '12px 0' }}>
                  <span className="spinner"></span>
                  <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
                    Loading permissions...
                  </span>
                </div>
              ) : userPermissions.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                  No explicit application permissions assigned to this user.
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {userPermissions.map((perm, i) => (
                    <div
                      key={perm.id || i}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                        {perm.name || perm.permissionName || 'Permission'}
                      </span>
                      {getCategoryBadge(perm.category)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          if (!creating) setShowCreateModal(false);
        }}
        title="Create New Active Directory User"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit}>
          {createError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px',
                color: '#f87171',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{createError}</span>
            </div>
          )}

          {/* Grid: First Name & Last Name */}
          <div className="grid-2">
            <div className="form-group">
              <label className="label" htmlFor="firstName">
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                className="input-field"
                placeholder="Jane"
                value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                disabled={creating}
                required
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="lastName">
                Last Name *
              </label>
              <input
                id="lastName"
                type="text"
                className="input-field"
                placeholder="Doe"
                value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                disabled={creating}
                required
              />
            </div>
          </div>

          {/* Username & Email */}
          <div className="grid-2">
            <div className="form-group">
              <label className="label" htmlFor="newUsername">
                Username (UID) *
              </label>
              <input
                id="newUsername"
                type="text"
                className="input-field"
                placeholder="jdoe"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                disabled={creating}
                required
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="newEmail">
                Email Address *
              </label>
              <input
                id="newEmail"
                type="email"
                className="input-field"
                placeholder="jdoe@example.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                disabled={creating}
                required
              />
            </div>
          </div>

          {/* Password & Phone */}
          <div className="grid-2">
            <div className="form-group">
              <label className="label" htmlFor="newPassword">
                Initial Password *
              </label>
              <div className="input-wrapper">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Minimum 6 characters"
                  style={{ paddingRight: '40px' }}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  disabled={creating}
                  required
                />
                <span
                  className="input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="newPhone">
                Phone Number (Optional)
              </label>
              <input
                id="newPhone"
                type="text"
                className="input-field"
                placeholder="+1 555-0199"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                disabled={creating}
              />
            </div>
          </div>

          {/* Department & Title */}
          <div className="grid-2">
            <div className="form-group">
              <label className="label" htmlFor="newDepartment">
                Department (Optional)
              </label>
              <input
                id="newDepartment"
                type="text"
                className="input-field"
                placeholder="Engineering / Security"
                value={createForm.department}
                onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                disabled={creating}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="newTitle">
                Job Title (Optional)
              </label>
              <input
                id="newTitle"
                type="text"
                className="input-field"
                placeholder="Senior Security Analyst"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                disabled={creating}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={creating}
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span className="spinner"></span>
                  <span>Creating Account...</span>
                </span>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
