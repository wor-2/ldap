import api from './api';

const userService = {
  listUsers: (q) => api.get('/users', { params: q ? { q } : {} }),
  getUser: (u) => api.get(`/users/${u}`),
  createUser: (d) => api.post('/users', d),
};

export default userService;
