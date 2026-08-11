import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// ── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Request Interceptor — attach JWT from localStorage ────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — unwrap error messages ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// ── Auth API Calls ────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {Object} data - { first_name, last_name, email, password, confirm_password }
 * @returns {Promise<{access_token, token_type, user}>}
 */
export const signupUser = (data) => api.post('/auth/signup', data).then((r) => r.data);

/**
 * Log in an existing user.
 * @param {Object} data - { email, password }
 * @returns {Promise<{access_token, token_type, user}>}
 */
export const loginUser = (data) => api.post('/auth/login', data).then((r) => r.data);

/**
 * Log out the current user (server-side confirmation).
 * @returns {Promise<{message}>}
 */
export const logoutUser = () => api.post('/auth/logout').then((r) => r.data);

/**
 * Fetch current authenticated user profile.
 * @returns {Promise<{id, first_name, last_name, email}>}
 */
export const getCurrentUser = () => api.get('/auth/me').then((r) => r.data);

export default api;
