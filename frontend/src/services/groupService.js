import api from './api';

const groupService = {
  listGroups: (q) => api.get('/groups', { params: q ? { q } : {} }),
  getGroup: (dn) => api.get(`/groups/${encodeURIComponent(dn)}`),
  createGroup: (d) => api.post('/groups', d),
  deleteGroup: (dn) => api.delete(`/groups/${encodeURIComponent(dn)}`),
  getMembers: (dn) => api.get(`/groups/${encodeURIComponent(dn)}/members`),
  addMember: (dn, userDn) => api.post(`/groups/${encodeURIComponent(dn)}/members`, { userDn }),
  removeMember: (dn, userDn) => api.delete(`/groups/${encodeURIComponent(dn)}/members`, { params: { userDn } }),
};

export default groupService;
