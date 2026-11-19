import api from './api';

const authService = {
  login: (u, p) => api.post('/auth/login', { username: u, password: p }),
  me: () => api.get('/auth/me'),
};

export default authService;
