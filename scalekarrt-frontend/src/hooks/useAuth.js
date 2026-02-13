import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  // ----- derived role helpers (memoized) -----
  const roles = useMemo(() => {
    const role = user?.role;

    return {
      isBuyer: role === 'buyer',
      isSeller: role === 'seller',
      isAdmin: role === 'admin',
      hasRole: (r) => role === r,
    };
  }, [user?.role]);

  return {
    user,
    isAuthenticated,
    setUser,
    logout,
    ...roles,
  };
};
