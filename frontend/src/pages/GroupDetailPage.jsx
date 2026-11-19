import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Trash2,
  Search,
  User,
  AlertCircle,
  Check,
} from 'lucide-react';
import groupService from '../services/groupService';
import userService from '../services/userService';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const GroupDetailPage = () => {
  const { groupDn: rawGroupDn } = useParams();
  const groupDn = decodeURIComponent(rawGroupDn || '');
  const { addToast } = useToast();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Member Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingUserDn, setAddingUserDn] = useState(null);
  const [removingMemberDn, setRemovingMemberDn] = useState(null);

  const fetchGroupData = useCallback(async () => {
    if (!groupDn) return;

    try {
      setLoading(true);
      const [groupRes, membersRes] = await Promise.allSettled([
        groupService.getGroup(groupDn),
        groupService.getMembers(groupDn),
      ]);

      if (groupRes.status === 'fulfilled') {
        const gData = groupRes.value?.data?.data || groupRes.value?.data || null;
        setGroup(gData);
      } else {
        console.error('Failed to get group info:', groupRes.reason);
      }

      if (membersRes.status === 'fulfilled') {
        const mData = membersRes.value?.data?.data || membersRes.value?.data || [];
        setMembers(Array.isArray(mData) ? mData : []);
      } else {
        console.error('Failed to get members:', membersRes.reason);
      }
    } catch (err) {
      console.error('Error fetching group details:', err);
      addToast('Error fetching group details.', 'error');
    } finally {
      setLoading(false);
    }
  }, [groupDn, addToast]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  // Debounced search for users in modal
  useEffect(() => {
    if (!showAddModal) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await userService.listUsers(searchQuery.trim());
        const users = res.data?.data || res.data || [];
        setSearchResults(Array.isArray(users) ? users : []);
      } catch (err) {
        console.error('Failed to search users:', err);
        addToast('Error searching users.', 'error');
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, showAddModal, addToast]);

  const handleAddMember = async (targetUser) => {
    const userDn = targetUser.dn || targetUser.distinguishedName;
    if (!userDn) {
      addToast('User DN not found for this user.', 'error');
      return;
    }

    setAddingUserDn(userDn);
    try {
      await groupService.addMember(groupDn, userDn);
      addToast(
        `Added "${targetUser.cn || targetUser.uid || 'User'}" to group successfully!`,
        'success'
      );
      setShowAddModal(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchGroupData();
    } catch (err) {
      console.error('Failed to add member:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to add member to group.';
      addToast(msg, 'error');
    } finally {
      setAddingUserDn(null);
    }
  };

  const handleRemoveMember = async (member) => {
    // Member could be a string DN or an object with dn/cn
    const memberDn = typeof member === 'string' ? member : member.dn || member.distinguishedName;
    const memberName = typeof member === 'string' ? member : member.cn || member.uid || memberDn;

    if (!window.confirm(`Are you sure you want to remove member:\n"${memberName}"\nfrom this group?`)) {
      return;
    }

    setRemovingMemberDn(memberDn);
    try {
      await groupService.removeMember(groupDn, memberDn);
      addToast('Member removed successfully.', 'success');
      fetchGroupData();
    } catch (err) {
      console.error('Failed to remove member:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to remove member.';
      addToast(msg, 'error');
    } finally {
      setRemovingMemberDn(null);
    }
  };

  const getInitials = (str = '') => {
    if (!str) return 'U';
    const clean = str.replace(/^cn=/i, '').split(/[\s,]+/);
    if (clean.length >= 2) {
      return (clean[0][0] + clean[clean.length - 1][0]).toUpperCase();
    }
    return clean[0].slice(0, 2).toUpperCase();
  };

  const formatDnShort = (dnStr = '') => {
    if (typeof dnStr !== 'string') return dnStr;
    const match = dnStr.match(/^(?:cn|uid)=([^,]+)/i);
    return match ? match[1] : dnStr;
  };

  return (
    <div className="fade-in">
      {/* Back Link */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/groups"
          className="btn btn-ghost"
          style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Groups</span>
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="spinner spinner-lg"></div>
          <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '0.9rem' }}>
            Loading group details...
          </p>
        </div>
      ) : (
        <>
          {/* Group Info Glass Card */}
          <div className="card" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(124, 58, 237, 0.15)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a78bfa',
                  flexShrink: 0,
                }}
              >
                <Users size={28} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h1 className="page-title" style={{ fontSize: '1.6rem', margin: 0 }}>
                    {group?.cn || group?.groupName || formatDnShort(groupDn)}
                  </h1>
                  <span className="badge badge-violet">{members.length} Members</span>
                </div>
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '0.82rem',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    marginTop: '6px',
                  }}
                >
                  {groupDn}
                </div>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: group?.description ? '#94a3b8' : '#64748b',
                    marginTop: '12px',
                    lineHeight: '1.5',
                  }}
                >
                  {group?.description || 'No description provided for this group.'}
                </p>
              </div>
            </div>
          </div>

          {/* Members Section Glass Card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 className="card-title">Members ({members.length})</h2>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowAddModal(true);
                }}
              >
                <UserPlus size={16} />
                <span>Add Member</span>
              </button>
            </div>

            {members.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state-icon">
                  <User size={48} color="#64748b" />
                </div>
                <div className="empty-state-text">No members in this group yet.</div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
                  Click "Add Member" to assign Active Directory users to this group.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {members.map((member, idx) => {
                  const memberDn =
                    typeof member === 'string'
                      ? member
                      : member.dn || member.distinguishedName || `m-${idx}`;
                  const shortName = formatDnShort(memberDn);
                  const isRemoving = removingMemberDn === memberDn;

                  return (
                    <div
                      key={memberDn}
                      className="glass-sm glass-hover"
                      style={{
                        padding: '12px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                        <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.75rem' }}>
                          {getInitials(shortName)}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>
                            {shortName}
                          </div>
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: '#64748b',
                              fontFamily: 'monospace',
                              wordBreak: 'break-all',
                            }}
                          >
                            {memberDn}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        title="Remove member from group"
                        disabled={isRemoving}
                        onClick={() => handleRemoveMember(member)}
                      >
                        {isRemoving ? <span className="spinner"></span> : <Trash2 size={16} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          if (!addingUserDn) {
            setShowAddModal(false);
          }
        }}
        title="Add User to Group"
        size="md"
      >
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label className="label" htmlFor="userSearchInput">
              Search Users
            </label>
            <div className="input-wrapper">
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Search size={18} />
              </span>
              <input
                id="userSearchInput"
                type="text"
                className="input-field"
                placeholder="Type display name, username, or email..."
                style={{ paddingLeft: '40px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Results List */}
          <div
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '6px',
            }}
          >
            {searching ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span className="spinner"></span>
                <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Searching users...
                </span>
              </div>
            ) : !searchQuery.trim() ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.85rem' }}>
                Start typing above to search domain users.
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.85rem' }}>
                No domain users matched "{searchQuery}".
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {searchResults.map((usr) => {
                  const uDn = usr.dn || usr.distinguishedName;
                  const isAdding = addingUserDn === uDn;
                  const isAlreadyMember = members.some((m) => {
                    const mDn = typeof m === 'string' ? m : m.dn || m.distinguishedName;
                    return mDn && uDn && mDn.toLowerCase() === uDn.toLowerCase();
                  });

                  return (
                    <div
                      key={uDn || usr.uid}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {getInitials(usr.cn || usr.displayName || usr.uid)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#e2e8f0' }}>
                            {usr.cn || usr.displayName || usr.uid}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                              {usr.uid || usr.sAMAccountName || 'User'}
                            </span>
                            {usr.mail && (
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {usr.mail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isAlreadyMember ? (
                        <span
                          style={{
                            fontSize: '0.78rem',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600,
                          }}
                        >
                          <Check size={14} /> Member
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                          disabled={isAdding}
                          onClick={() => handleAddMember(usr)}
                        >
                          {isAdding ? <span className="spinner"></span> : 'Add'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowAddModal(false)}
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GroupDetailPage;
