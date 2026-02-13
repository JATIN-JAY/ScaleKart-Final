import { Users, Package, ShoppingBag, DollarSign } from 'lucide-react';
import StatCard from '../dashboard/StatCard';
import { formatCurrency } from '../../utils/formatters';

export default function AnalyticsDashboard({ analytics }) {
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.users?.total ?? 0}
          icon={Users}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
          subtitle={`${analytics.users?.newUsers ?? 0} new this month`}
        />

        <StatCard
          title="Total Products"
          value={analytics.products?.total ?? 0}
          icon={Package}
          bgColor="bg-green-100"
          iconColor="text-green-600"
          subtitle={`${analytics.products?.pending ?? 0} pending`}
        />

        <StatCard
          title="Total Orders"
          value={analytics.orders?.total ?? 0}
          icon={ShoppingBag}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
          subtitle={`${analytics.orders?.processing ?? 0} processing`}
        />

        <StatCard
          title="Total Revenue"
          value={formatCurrency(analytics.revenue?.total ?? 0)}
          icon={DollarSign}
          bgColor="bg-orange-100"
          iconColor="text-orange-600"
          subtitle={`${formatCurrency(analytics.revenue?.monthly ?? 0)} this month`}
        />
      </div>

      {/* Category Distribution */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Category Distribution</h2>

        {analytics.categoryDistribution?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {analytics.categoryDistribution.map((cat) => (
              <div
                key={cat.category}
                className="text-center p-4 bg-gray-50 rounded-lg"
              >
                <p className="text-2xl font-bold text-primary-600">{cat.count}</p>
                <p className="text-sm text-gray-600">{cat.category}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No category data available
          </p>
        )}
      </div>
    </div>
  );
}
