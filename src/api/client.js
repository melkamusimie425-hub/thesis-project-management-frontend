import axios from 'axios';

// The Laravel API is served from the local dev server (php artisan serve).
const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const client = axios.create({ baseURL, withCredentials: false });

// Attach the bearer token from local storage on every request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('otpms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 responses so stale tokens clear cleanly.
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('otpms_token');
      localStorage.removeItem('otpms_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default client;
