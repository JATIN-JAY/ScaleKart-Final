import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, ShoppingBag, DollarSign } from 'lucide-react';

import { adminAPI } from '../../api/admin';
import { useAuthStore } from '../../store/authStore';

import { formatCurrency } from '../../utils/formatters';

import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ================= AUTH GUARD =================
  useEffect(() => {
    if (!isAuthenticated) return navigate('/login');
    if (user?.role !== 'admin') return navigate('/');
  }, [isAuthenticated, user]);

  // ================= FETCH =================
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await adminAPI.getAnalytics();
      setAnalytics(res.data.analytics);
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ================= STATES =================
  if (loading) return <Loader fullScreen />;

  if (error)
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchAnalytics}>Retry</Button>
      </div>
    );

  if (!analytics)
    return <div className="text-center py-16">No analytics data available</div>;

  // safe fallbacks
  const topProducts = analytics.topProducts || [];
  const topSellers = analytics.topSellers || [];
  const categories = analytics.categoryDistribution || [];

  // ================= UI =================
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-8 h-8 text-blue-600" />}
          bg="bg-blue-100"
          title="Total Users"
          value={analytics.users?.total ?? 0}
          sub={`${analytics.users?.newUsers ?? 0} new this month`}
        />

        <StatCard
          icon={<Package className="w-8 h-8 text-green-600" />}
          bg="bg-green-100"
          title="Total Products"
          value={analytics.products?.total ?? 0}
          sub={`${analytics.products?.pending ?? 0} pending approval`}
        />

        <StatCard
          icon={<ShoppingBag className="w-8 h-8 text-purple-600" />}
          bg="bg-purple-100"
          title="Total Orders"
          value={analytics.orders?.total ?? 0}
          sub={`${analytics.orders?.processing ?? 0} processing`}
        />

        <StatCard
          icon={<DollarSign className="w-8 h-8 text-orange-600" />}
          bg="bg-orange-100"
          title="Total Revenue"
          value={formatCurrency(analytics.revenue?.total ?? 0)}
          sub={`${formatCurrency(analytics.revenue?.monthly ?? 0)} this month`}
        />
      </div>

      {/* ================= TOP PRODUCTS ================= */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Top Products</h2>

        {topProducts.length === 0 ? (
          <Empty text="No top products yet" />
        ) : (
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={product._id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-bold text-lg text-gray-400">
                  #{index + 1}
                </span>

                <img
                  src={product.images?.[0]?.url || '/placeholder-product.png'}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />

                <div className="flex-1">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    {product.ratings} ⭐ ({product.numOfReviews} reviews)
                  </p>
                </div>

                <p className="font-bold text-primary-600">
                  {formatCurrency(product.price)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ================= TOP SELLERS ================= */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Top Sellers</h2>

        {topSellers.length === 0 ? (
          <Empty text="No seller data available" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Seller
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Store
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Total Sales
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Orders
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topSellers.map((seller, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-sm">
                      {seller.seller?.name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {seller.seller?.storeName}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-primary-600">
                      {formatCurrency(seller.totalSales)}
                    </td>
                    <td className="px-4 py-3 text-sm">{seller.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ================= CATEGORY DISTRIBUTION ================= */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Category Distribution</h2>

        {categories.length === 0 ? (
          <Empty text="No category data" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.category}
                className="text-center p-4 bg-gray-50 rounded-lg"
              >
                <p className="text-2xl font-bold text-primary-600">
                  {cat.count}
                </p>
                <p className="text-sm text-gray-600">{cat.category}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ================= SMALL COMPONENTS =================

function StatCard({ icon, bg, title, value, sub }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{sub}</p>
        </div>
        <div className={`${bg} p-3 rounded-lg`}>{icon}</div>
      </div>
    </Card>
  );
}

function Empty({ text }) {
  return <p className="text-gray-500 text-center py-8">{text}</p>;
}
