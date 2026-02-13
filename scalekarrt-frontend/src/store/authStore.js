import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // 🔥 start as true for proper boot guard

      // ================= SET USER =================
      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      // ================= INIT AUTH =================
      initializeAuth: async () => {
        try {
          set({ isLoading: true });

          // 🔥 check token first (prevents useless API call)
          const token = localStorage.getItem('token');

          if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          const res = await authAPI.getMe();

          set({
            user: res.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // 🔥 clear broken auth state completely
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // ================= LOGOUT =================
      logout: async () => {
        try {
          await authAPI.logout();
        } catch {
          // ignore API error
        }

        // 🔥 CRITICAL: remove token to stop jwt malformed
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');

        set({
          user: null,
          isAuthenticated: false,
        });
      },

      // ================= UPDATE USER =================
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // ================= ROLE HELPERS =================
      isAdmin: () => get().user?.role === 'admin',
      isSeller: () => get().user?.role === 'seller',
      isBuyer: () => get().user?.role === 'buyer',
    }),
    {
      name: 'auth-storage',

      // 🔥 persist only safe fields
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
