import api from './axios';

// ========================================
// AUTH API SERVICE
// ========================================
export const authAPI = {
  // ================= LOGIN =================
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  // ================= REGISTER =================
  register: (userData) =>
    api.post('/auth/register', userData),

  // ================= LOGOUT =================
  logout: () =>
    api.post('/auth/logout'),

  // ================= GET CURRENT USER =================
  getMe: () =>
    api.get('/auth/me'),

  // ================= REFRESH TOKEN =================
  refreshToken: () =>
    api.post('/auth/refresh'),
};
