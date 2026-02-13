import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loader from '../components/common/Loader';

export default function AuthLayout() {
  const { user, isAuthenticated, loading } = useAuthStore();
  const location = useLocation();

  // Wait until auth state is restored (important in production)
  if (loading) {
    return <Loader fullScreen />;
  }

  // If already authenticated → redirect based on role
  if (isAuthenticated && user) {
    const redirectPath =
      location.state?.from ||
      (user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'seller'
        ? '/seller/dashboard'
        : '/');

    return <Navigate to={redirectPath} replace />;
  }

  // Not authenticated → allow access to auth pages
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Outlet />
    </div>
  );
}
