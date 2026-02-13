import { useState, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
  Plus,
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /** ---------- ROLE PROTECTION ---------- */
  if (!user) {
    navigate('/login');
    return <Loader fullScreen />;
  }

  /** ---------- LOGOUT ---------- */
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      logout(); // always clear local auth
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    }
  };

  /** ---------- NAV ITEMS (MEMOIZED) ---------- */
  const navItems = useMemo(() => {
    if (user.role === 'admin') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Package, label: 'Products', path: '/admin/products' },
        { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
      ];
    }

    if (user.role === 'seller') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/seller/dashboard' },
        { icon: Package, label: 'Products', path: '/seller/products' },
        { icon: Plus, label: 'Add Product', path: '/seller/products/add' },
        { icon: ShoppingBag, label: 'Orders', path: '/seller/orders' },
      ];
    }

    return [];
  }, [user.role]);

  /** ---------- ACTIVE ROUTE CHECK ---------- */
  const isActiveRoute = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
              ScaleKarrt
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User */}
          <div className="p-6 border-b">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="mt-2 inline-block text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
              {user.role}
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(item.path);

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${active
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'}
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-bold">Dashboard</h1>
          <div className="w-6" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
