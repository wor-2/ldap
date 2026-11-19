import React, { useState, useEffect, useCallback } from 'react';
import {
  Key,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Calendar,
  AlertCircle,
  Shield,
  Clock,
} from 'lucide-react';
import permissionService from '../services/permissionService';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const PermissionsPage = () => {
  const { addToast } = useToast();

  // Catalog State
  const [permissions, setPermissions] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // User Permissions State
  const [targetUsername, setTargetUsername] = useState('');
  const [loadedUsername, setLoadedUsername] = useState('');
  const [userPermissions, setUserPermissions] = useState([]);
  const [loadingUserPerms, setLoadingUserPerms] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: 'CUSTOM',
  });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignForm, setAssignForm] = useState({
    username: '',
    permissionId: '',
    expiresAt: '',
  });

  const fetchCatalog = useCallback(async () => {
    try {
      setLoadingPerms(true);
      const res = await permissionService.listPermissions();
      const data = res.data?.data || res.data || [];
      setPermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load permissions catalog:', err);
      addToast('Failed to load permission catalog.', 'error');
    } finally {
      setLoadingPerms(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const loadUserPermissions = async (userToLoad) => {
    const u = (userToLoad || targetUsername).trim();
    if (!u) {
      addToast('Please enter a username to inspect permissions.', 'warning');
      return;
    }

    try {
      setLoadingUserPerms(true);
      const res = await permissionService.getUserPermissions(u);
      const data = res.data?.data || res.data || [];
      setUserPermissions(Array.isArray(data) ? data : []);
      setLoadedUsername(u);
    } catch (err) {
      console.error('Failed to load user permissions:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        `Failed to retrieve permissions for "${u}".`;
      addToast(msg, 'error');
    } finally {
      setLoadingUserPerms(false);
    }
  };

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    setCreateError('');

    const nameTrimmed = createForm.name.trim();
    if (!nameTrimmed) {
      setCreateError('Permission name is required.');
      return;
    }

    setCreating(true);
    try {
      await permissionService.createPermission({
        name: nameTrimmed,
        description: createForm.description.trim(),
        category: createForm.category,
      });

      addToast(`Permission "${nameTrimmed}" added to catalog.`, 'success');
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', category: 'CUSTOM' });
      fetchCatalog();
    } catch (err) {
      console.error('Failed to create permission:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error creating permission.';
      setCreateError(msg);
      addToast(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePermission = async (perm) => {
    if (!window.confirm(`Delete permission "${perm.name}" from catalog?`)) {
      return;
    }

    setDeletingId(perm.id);
    try {
      await permissionService.deletePermission(perm.id);
      addToast(`Permission "${perm.name}" removed from catalog.`, 'success');
      fetchCatalog();
      if (loadedUsername) {
        loadUserPermissions(loadedUsername);
      }
    } catch (err) {
      console.error('Failed to delete permission:', err);
      addToast('Failed to delete permission from catalog.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenAssignModal = () => {
    setAssignError('');
    setAssignForm({
      username: loadedUsername || targetUsername.trim(),
      permissionId: permissions[0]?.id ? String(permissions[0].id) : '',
      expiresAt: '',
    });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignError('');

    const usernameTrimmed = assignForm.username.trim();
    if (!usernameTrimmed) {
      setAssignError('Target username is required.');
      return;
    }
    if (!assignForm.permissionId) {
      setAssignError('Please select a permission to assign.');
      return;
    }

    setAssigning(true);
    try {
      const payload = {
        username: usernameTrimmed,
        permissionId: assignForm.permissionId,
        expiresAt: assignForm.expiresAt ? new Date(assignForm.expiresAt).toISOString() : null,
      };

      await permissionService.assignPermission(payload);
      addToast(`Permission assigned to ${usernameTrimmed} successfully!`, 'success');
      setShowAssignModal(false);

      if (usernameTrimmed.toLowerCase() === loadedUsername.toLowerCase()) {
        loadUserPermissions(usernameTrimmed);
      } else {
        setTargetUsername(usernameTrimmed);
        loadUserPermissions(usernameTrimmed);
      }
    } catch (err) {
      console.error('Failed to assign permission:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error assigning permission.';
      setAssignError(msg);
      addToast(msg, 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleRevokePermission = async (permAssignment) => {
    const id = permAssignment.assignmentId || permAssignment.id;
    const pName = permAssignment.name || permAssignment.permissionName || 'Permission';

    if (!window.confirm(`Revoke permission "${pName}" from user "${loadedUsername}"?`)) {
      return;
    }

    setRevokingId(id);
    try {
      await permissionService.revokePermission(id);
      addToast(`Revoked "${pName}" from ${loadedUsername}.`, 'success');
      loadUserPermissions(loadedUsername);
    } catch (err) {
      console.error('Failed to revoke permission:', err);
      addToast('Failed to revoke permission.', 'error');
    } finally {
      setRevokingId(null);
    }
  };

  const renderCategoryBadge = (category = '') => {
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

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Permissions & RBAC</h1>
          <p className="page-subtitle">
            Configure system permissions catalog and manage role assignments per user
          </p>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid-2">
        {/* LEFT COLUMN: Permission Catalog */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Key size={20} color="var(--accent-cyan)" />
              <h2 className="card-title">Permission Catalog ({permissions.length})</h2>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
              onClick={() => {
                setCreateError('');
                setShowCreateModal(true);
              }}
            >
              <Plus size={16} />
              <span>Add Permission</span>
            </button>
          </div>

          {loadingPerms ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
                Loading catalog...
              </p>
            </div>
          ) : permissions.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 10px' }}>
              <div className="empty-state-icon">
                <Key size={40} color="#64748b" />
              </div>
              <div className="empty-state-text">No permissions defined yet.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {permissions.map((perm) => {
                const isDeleting = deletingId === perm.id;
                return (
                  <div
                    key={perm.id}
                    className="glass-sm glass-hover"
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.92rem' }}>
                          {perm.name}
                        </span>
                        {renderCategoryBadge(perm.category)}
                      </div>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: perm.description ? '#94a3b8' : '#64748b',
                          fontStyle: perm.description ? 'normal' : 'italic',
                          margin: 0,
                        }}
                      >
                        {perm.description || 'No description provided'}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn-icon btn-icon-danger"
                      title="Delete permission"
                      disabled={isDeleting}
                      onClick={() => handleDeletePermission(perm)}
                    >
                      {isDeleting ? <span className="spinner"></span> : <Trash2 size={15} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Assign to User */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCheck size={20} color="#a78bfa" />
              <h2 className="card-title">Assign to User</h2>
            </div>
            {loadedUsername && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
                onClick={handleOpenAssignModal}
              >
                <Plus size={16} />
                <span>Assign Permission</span>
              </button>
            )}
          </div>

          {/* Username Search bar */}
          <div style={{ marginBottom: '20px' }}>
            <label className="label" htmlFor="userSearchPerms">
              Target Username (UID)
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="input-wrapper" style={{ flex: 1 }}>
                <input
                  id="userSearchPerms"
                  type="text"
                  className="input-field"
                  placeholder="Enter username (e.g. jdoe, admin)"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUserPermissions()}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => loadUserPermissions()}
                disabled={loadingUserPerms || !targetUsername.trim()}
              >
                {loadingUserPerms ? <span className="spinner"></span> : <Search size={16} />}
                <span>Load</span>
              </button>
            </div>
          </div>

          {/* User's Current Permissions List */}
          <div>
            {loadingUserPerms ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Loading user permissions...
                </p>
              </div>
            ) : !loadedUsername ? (
              <div className="empty-state" style={{ padding: '40px 10px' }}>
                <div className="empty-state-icon">
                  <Shield size={40} color="#64748b" />
                </div>
                <div className="empty-state-text">Enter a username above and click "Load".</div>
              </div>
            ) : userPermissions.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 10px' }}>
                <div className="empty-state-icon">
                  <UserX size={40} color="#64748b" />
                </div>
                <div className="empty-state-text">
                  No active permissions assigned to "{loadedUsername}".
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: '16px', fontSize: '0.85rem' }}
                  onClick={handleOpenAssignModal}
                >
                  <Plus size={16} />
                  <span>Assign First Permission</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Active for <strong style={{ color: 'var(--accent-cyan)' }}>{loadedUsername}</strong>:
                  </span>
                  <span className="badge badge-cyan">{userPermissions.length} Granted</span>
                </div>

                {userPermissions.map((assignment, index) => {
                  const assignId = assignment.assignmentId || assignment.id || index;
                  const isRevoking = revokingId === assignId;
                  const permName = assignment.name || assignment.permissionName || 'Permission';
                  const grantedBy = assignment.grantedBy || assignment.grantedByName || 'System';

                  return (
                    <div
                      key={assignId}
                      className="glass-sm glass-hover"
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>
                            {permName}
                          </span>
                          {renderCategoryBadge(assignment.category)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Granted by: <span style={{ color: '#94a3b8' }}>{grantedBy}</span>
                          {assignment.expiresAt && (
                            <span style={{ marginLeft: '10px', color: '#f59e0b' }}>
                              Expires: {new Date(assignment.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{
                          color: '#ef4444',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          borderRadius: '6px',
                        }}
                        disabled={isRevoking}
                        onClick={() => handleRevokePermission(assignment)}
                      >
                        {isRevoking ? <span className="spinner"></span> : 'Revoke'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Permission Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          if (!creating) setShowCreateModal(false);
        }}
        title="Create New Permission"
        size="md"
      >
        <form onSubmit={handleCreatePermission}>
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
                marginBottom: '16px',
                color: '#f87171',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{createError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="label" htmlFor="permName">
              Permission Name *
            </label>
            <input
              id="permName"
              type="text"
              className="input-field"
              placeholder="e.g. AD_USER_RESET_PASSWORD"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              disabled={creating}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="permCategory">
              Category *
            </label>
            <select
              id="permCategory"
              className="input-field"
              value={createForm.category}
              onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              disabled={creating}
            >
              <option value="READ">READ</option>
              <option value="WRITE">WRITE</option>
              <option value="ADMIN">ADMIN</option>
              <option value="CUSTOM">CUSTOM</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="permDesc">
              Description
            </label>
            <textarea
              id="permDesc"
              className="input-field"
              placeholder="What access or action this permission grants..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              disabled={creating}
              rows={3}
            />
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
                  <span>Creating...</span>
                </span>
              ) : (
                'Create Permission'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Permission Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          if (!assigning) setShowAssignModal(false);
        }}
        title="Assign Permission to User"
        size="md"
      >
        <form onSubmit={handleAssignSubmit}>
          {assignError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                color: '#f87171',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{assignError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="label" htmlFor="assignUsername">
              Username *
            </label>
            <input
              id="assignUsername"
              type="text"
              className="input-field"
              placeholder="e.g. jdoe"
              value={assignForm.username}
              onChange={(e) => setAssignForm({ ...assignForm, username: e.target.value })}
              disabled={assigning}
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="assignPermissionId">
              Select Permission *
            </label>
            <select
              id="assignPermissionId"
              className="input-field"
              value={assignForm.permissionId}
              onChange={(e) => setAssignForm({ ...assignForm, permissionId: e.target.value })}
              disabled={assigning}
              required
            >
              <option value="" disabled>
                -- Choose from Catalog --
              </option>
              {permissions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="assignExpiresAt">
              Expiration Date (Optional)
            </label>
            <input
              id="assignExpiresAt"
              type="date"
              className="input-field"
              value={assignForm.expiresAt}
              onChange={(e) => setAssignForm({ ...assignForm, expiresAt: e.target.value })}
              disabled={assigning}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={assigning}
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={assigning}>
              {assigning ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span className="spinner"></span>
                  <span>Assigning...</span>
                </span>
              ) : (
                'Grant Permission'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PermissionsPage;
