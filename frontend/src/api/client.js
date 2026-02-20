import axios from 'axios';

const fallback =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : '/api';

const baseURL = import.meta.env?.VITE_API_BASE || fallback;

const client = axios.create({
  baseURL,
  timeout: 15000,
});

client.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    if (!cfg.headers['Content-Type']) {
      cfg.headers['Content-Type'] = 'application/json';
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      try {
        localStorage.removeItem('token');
      } catch {
        // noop (e.g. storage unavailable)
      }
      if (typeof window !== 'undefined') {
        const cur =
          window.location.pathname +
          window.location.search +
          window.location.hash;

        if (!cur.startsWith('/login')) {
          const qs = new URLSearchParams({ next: cur }).toString();
          window.location.href = `/login?${qs}`;
        }
      }
    }

    return Promise.reject(err);
  }
);

export default client;
