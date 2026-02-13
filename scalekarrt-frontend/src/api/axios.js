import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// ========================================
// AXIOS INSTANCE
// ========================================
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🔥 use cookies for auth
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ========================================
// REQUEST INTERCEPTOR
// (NO localStorage token — cookies handle auth)
// ========================================
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ========================================
// RESPONSE INTERCEPTOR (REFRESH FLOW)
// ========================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,

  async (error) => {
    const originalRequest = error.config;

    // ========================================
    // 401 → TRY REFRESH TOKEN
    // ========================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        // 🔥 CLEAR AUTH STATE
        localStorage.removeItem('auth-storage');

        // 🔥 avoid redirect loop
        if (!window.location.pathname.includes('/login')) {
          window.location.replace('/login');
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ========================================
    // IGNORE LOGOUT ERRORS
    // ========================================
    if (originalRequest.url?.includes('/auth/logout')) {
      return Promise.reject(error);
    }

    // ========================================
    // NETWORK ERROR
    // ========================================
    if (!error.response) {
      toast.error('Network error. Please check your internet connection.');
      return Promise.reject(error);
    }

    // ========================================
    // SHOW SERVER ERROR (ONCE)
    // ========================================
    const message =
      error.response?.data?.message ||
      'Something went wrong. Please try again.';

    if (!originalRequest._toastShown) {
      toast.error(message);
      originalRequest._toastShown = true;
    }

    return Promise.reject(error);
  }
);

export default api;
