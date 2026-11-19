import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Folder,
  AlertCircle,
} from 'lucide-react';
import groupService from '../services/groupService';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const GroupsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ groupName: '', description: '' });
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingDn, setDeletingDn] = useState(null);

  const fetchGroups = useCallback(async (query = '') => {
    try {
      setLoading(true);
      const res = await groupService.listGroups(query);
      const data = res.data?.data || res.data || [];
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      addToast('Failed to load active directory groups.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Debounced search on input
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchGroups(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search, fetchGroups]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const groupNameTrimmed = createForm.groupName.trim();
    if (!groupNameTrimmed) {
      setFormError('Group name is required.');
      return;
    }

    // Pattern validation for group name: alphanumeric, dashes, underscores
    const groupNameRegex = /^[a-zA-Z0-9_\- ]{3,64}$/;
    if (!groupNameRegex.test(groupNameTrimmed)) {
      setFormError(
        'Group name must be 3-64 characters and contain only letters, numbers, spaces, underscores, or dashes.'
      );
      return;
    }

    setCreating(true);
    try {
      await groupService.createGroup({
        groupName: groupNameTrimmed,
        description: createForm.description.trim(),
      });

      addToast(`Group "${groupNameTrimmed}" created successfully!`, 'success');
      setShowCreateModal(false);
      setCreateForm({ groupName: '', description: '' });
      fetchGroups(search);
    } catch (err) {
      console.error('Failed to create group:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error creating group.';
      setFormError(msg);
      addToast(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (group) => {
    const dn = group.dn || group.distinguishedName;
    const name = group.cn || group.groupName || dn;

    if (
      !window.confirm(
        `Are you sure you want to delete AD group "${name}"?\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingDn(dn);
    try {
      await groupService.deleteGroup(dn);
      addToast(`Group "${name}" deleted successfully.`, 'success');
      fetchGroups(search);
    } catch (err) {
      console.error('Failed to delete group:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to delete group.';
      addToast(msg, 'error');
    } finally {
      setDeletingDn(null);
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">AD Groups</h1>
            {!loading && (
              <span className="badge badge-cyan" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                {groups.length} {groups.length === 1 ? 'group' : 'groups'}
              </span>
            )}
          </div>
          <p className="page-subtitle">Manage Active Directory security and distribution groups</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFormError('');
            setCreateForm({ groupName: '', description: '' });
            setShowCreateModal(true);
          }}
        >
          <Plus size={18} />
          <span>Create Group</span>
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
            placeholder="Search groups by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Groups Grid / Loading / Empty */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="spinner spinner-lg"></div>
          <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '0.9rem' }}>
            Loading AD groups...
          </p>
        </div>
      ) : groups.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <Folder size={54} color="#64748b" />
          </div>
          <div className="empty-state-text" style={{ fontWeight: 600, marginBottom: '8px' }}>
            No groups found
          </div>
          <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '360px', margin: '0 auto' }}>
            {search
              ? `No active directory groups matched "${search}". Try another search term.`
              : 'Get started by creating your first Active Directory group.'}
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {groups.map((group, index) => {
            const dn = group.dn || group.distinguishedName || `group-${index}`;
            const name = group.cn || group.groupName || 'Unnamed Group';
            const memberCount =
              group.memberCount ??
              (Array.isArray(group.members) ? group.members.length : 0);
            const description = group.description || group.desc;
            const isDeleting = deletingDn === dn;

            return (
              <div
                key={dn}
                className="card glass-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '190px',
                  padding: '22px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          background: 'rgba(124, 58, 237, 0.12)',
                          border: '1px solid rgba(124, 58, 237, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#a78bfa',
                          flexShrink: 0,
                        }}
                      >
                        <Users size={18} />
                      </div>
                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: '#e2e8f0',
                          wordBreak: 'break-word',
                        }}
                      >
                        {name}
                      </h3>
                    </div>

                    <span
                      className="badge badge-violet"
                      style={{ fontSize: '0.72rem', flexShrink: 0 }}
                    >
                      {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: description ? '#94a3b8' : '#64748b',
                      lineHeight: '1.45',
                      fontStyle: description ? 'normal' : 'italic',
                      marginBottom: '16px',
                    }}
                  >
                    {description || 'No description provided'}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-color)',
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '0.82rem' }}
                    onClick={() => navigate(`/groups/${encodeURIComponent(dn)}`)}
                  >
                    <span>Members</span>
                    <ExternalLink size={14} />
                  </button>

                  <button
                    type="button"
                    className="btn-icon btn-icon-danger"
                    title="Delete group"
                    disabled={isDeleting}
                    onClick={() => handleDeleteGroup(group)}
                  >
                    {isDeleting ? <span className="spinner"></span> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          if (!creating) {
            setShowCreateModal(false);
            setFormError('');
          }
        }}
        title="Create New AD Group"
        size="md"
      >
        <form onSubmit={handleCreateSubmit}>
          {formError && (
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
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="label" htmlFor="groupName">
              Group Name *
            </label>
            <input
              id="groupName"
              type="text"
              className="input-field"
              placeholder="e.g. SG-Security-Ops"
              value={createForm.groupName}
              onChange={(e) => setCreateForm({ ...createForm, groupName: e.target.value })}
              disabled={creating}
              autoFocus
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Alphanumeric characters, spaces, dashes and underscores.
            </span>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="groupDescription">
              Description
            </label>
            <textarea
              id="groupDescription"
              className="input-field"
              placeholder="Brief description of the group's purpose and scope..."
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
              onClick={() => {
                setShowCreateModal(false);
                setFormError('');
              }}
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
                'Create Group'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GroupsPage;
