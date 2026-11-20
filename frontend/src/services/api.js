import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('ad-manager-auth');
    if (raw) {
      const t = JSON.parse(raw)?.state?.token;
      if (t) {
        config.headers.Authorization = `Bearer ${t}`;
      }
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ad-manager-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
