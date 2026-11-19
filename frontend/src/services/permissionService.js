import api from './api';

const permissionService = {
  listPermissions: () => api.get('/permissions'),
  createPermission: (d) => api.post('/permissions', d),
  deletePermission: (id) => api.delete(`/permissions/${id}`),
  assignPermission: (d) => api.post('/permissions/assign', d),
  revokePermission: (id) => api.delete(`/permissions/assign/${id}`),
  getUserPermissions: (u) => api.get(`/permissions/user/${u}`),
};

export default permissionService;
