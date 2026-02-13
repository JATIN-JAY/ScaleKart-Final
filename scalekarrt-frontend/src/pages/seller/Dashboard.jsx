import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Plus,
} from 'lucide-react';

import { productsAPI } from '../../api/products';
import { ordersAPI } from '../../api/orders';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../utils/formatters';

import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= AUTH + DATA =================
  useEffect(() => {
    // Wait until auth state is known
    if (isAuthenticated === null) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'seller') {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user]);

  // ================= FETCH DATA =================
  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        productsAPI.getMyProducts({ limit: 1 }),
        ordersAPI.getSellerOrders({ limit: 10 }),
      ]);

      const orders = ordersRes.data.orders || [];

      let totalRevenue = 0;
      let pendingOrders = 0;

      orders.forEach((order) => {
        order.orderItems.forEach((item) => {
          if (item.seller === user?._id) {
            totalRevenue += item.price * item.quantity;
          }
        });

        if (order.orderStatus === 'Processing') {
          pendingOrders++;
        }
      });

      setStats({
        totalProducts: productsRes.data.pagination?.total || 0,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ================= STATUS COLOR =================
  const getStatusColor = (status) => {
    const colors = {
      Processing: 'warning',
      Shipped: 'primary',
      Delivered: 'success',
      Cancelled: 'danger',
    };
    return colors[status] || 'primary';
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>

        <Link to="/seller/products/add" className="btn btn-primary flex gap-2">
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={stats.totalProducts} icon={<Package />} />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingBag />} />
        <StatCard title="Revenue" value={formatCurrency(stats.totalRevenue)} icon={<DollarSign />} />
        <StatCard title="Pending Orders" value={stats.pendingOrders} icon={<TrendingUp />} />
      </div>

      {/* Recent Orders */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>

        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        ) : (
          <table className="w-full">
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.slice(-8)}</td>
                  <td>{formatCurrency(order.totalPrice)}</td>
                  <td>
                    <Badge variant={getStatusColor(order.orderStatus)}>
                      {order.orderStatus}
                    </Badge>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <Card className="p-6 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="text-primary-600">{icon}</div>
    </Card>
  );
}
