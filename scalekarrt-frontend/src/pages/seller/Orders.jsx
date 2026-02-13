import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ordersAPI } from '../../api/orders';
import { useAuthStore } from '../../store/authStore';

import { formatCurrency, formatDate } from '../../utils/formatters';

import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

import toast from 'react-hot-toast';

export default function SellerOrders() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  // ================= AUTH GUARD =================
  useEffect(() => {
    if (!isAuthenticated) return navigate('/login');
    if (user?.role !== 'seller') return navigate('/');
  }, [isAuthenticated, user]);

  // ================= FETCH =================
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await ordersAPI.getSellerOrders();
      setOrders(res.data.orders);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================= STATUS =================
  const getStatusColor = (status) => {
    const colors = {
      Processing: 'warning',
      Shipped: 'primary',
      Delivered: 'success',
      Cancelled: 'danger',
    };
    return colors[status] || 'primary';
  };

  const getNextStatus = (status) => {
    if (status === 'Processing') return 'Shipped';
    if (status === 'Shipped') return 'Delivered';
    return null;
  };

  // ================= UPDATE =================
  const handleStatusUpdate = async (orderId, newStatus) => {
    // confirm before delivery
    if (newStatus === 'Delivered') {
      const confirmed = window.confirm('Mark this order as Delivered?');
      if (!confirmed) return;
    }

    setUpdatingOrder(orderId);

    try {
      await ordersAPI.updateStatus(orderId, newStatus);

      toast.success('Order status updated');

      // functional update prevents stale state bug
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );
    } catch {
      toast.error('Failed to update order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  // ================= STATES =================
  if (loading) return <Loader fullScreen />;

  if (error)
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchOrders}>Retry</Button>
      </div>
    );

  // ================= UI =================
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Products</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const nextStatus = getNextStatus(order.orderStatus);

                  return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono">
                        {order._id.slice(-8)}
                      </td>

                      <td className="px-4 py-3 text-sm">
                        <p className="font-medium">{order.user.name}</p>
                        <p className="text-xs text-gray-500">{order.user.email}</p>
                      </td>

                      <td className="px-4 py-3 text-sm space-y-1">
                        {order.orderItems.map((item, i) => (
                          <p key={i} className="text-xs">
                            {item.name} × {item.quantity}
                          </p>
                        ))}
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

                      <td className="px-4 py-3">
                        {nextStatus && order.orderStatus !== 'Cancelled' && (
                          <Button
                            size="sm"
                            loading={updatingOrder === order._id}
                            onClick={() =>
                              handleStatusUpdate(order._id, nextStatus)
                            }
                          >
                            Mark as {nextStatus}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
