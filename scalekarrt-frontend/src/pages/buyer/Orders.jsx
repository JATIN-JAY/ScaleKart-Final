import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Package } from 'lucide-react';

import { ordersAPI } from '../../api/orders';
import { formatCurrency, formatDate } from '../../utils/formatters';

import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

import toast from 'react-hot-toast';

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  /** ---------- FETCH ---------- */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await ordersAPI.getMyOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /** ---------- CANCEL ORDER (Optimistic) ---------- */
  const handleCancel = async (orderId) => {
    setCancelling(orderId);

    // optimistic update
    const previousOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, orderStatus: 'Cancelled' } : o
      )
    );

    try {
      await ordersAPI.cancel(orderId);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel order');
      setOrders(previousOrders); // rollback
    } finally {
      setCancelling(null);
    }
  };

  /** ---------- STATUS COLOR ---------- */
  const getStatusColor = (status) => {
    const colors = {
      Processing: 'warning',
      Shipped: 'primary',
      Delivered: 'success',
      Cancelled: 'danger',
    };
    return colors[status] || 'primary';
  };

  /** ---------- LOADING ---------- */
  if (loading) return <Loader fullScreen />;

  /** ---------- ERROR ---------- */
  if (error)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchOrders}>Retry</Button>
      </div>
    );

  /** ---------- UI ---------- */
  return (
    <>
      

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              Start shopping to see your orders here
            </p>
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID: {order._id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <Badge variant={getStatusColor(order.orderStatus)}>
                    {order.orderStatus}
                  </Badge>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <img
                        src={item.image || '/placeholder-product.png'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">
                      Total: {formatCurrency(order.totalPrice)}
                    </p>

                    <p className="text-sm text-gray-500">
                      Payment:{' '}
                      {order.paymentInfo?.method || 'N/A'} (
                      {order.paymentInfo?.status || 'Unknown'})
                    </p>
                  </div>

                  {order.orderStatus === 'Processing' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(order._id)}
                      loading={cancelling === order._id}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
