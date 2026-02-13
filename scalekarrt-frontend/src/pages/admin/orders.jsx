import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api/admin';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await adminAPI.getAllOrders(params);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchOrders}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Orders</h1>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-48"
        >
          <option value="">All Status</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Items</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">
                      {order._id.slice(-8)}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium">{order.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {order.orderItems?.length || 0}
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold">
                      {formatCurrency(order.totalPrice)}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <Badge variant={getStatusColor(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
