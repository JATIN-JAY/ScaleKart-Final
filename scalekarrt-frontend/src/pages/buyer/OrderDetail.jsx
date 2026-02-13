import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';
import { ordersAPI } from '../../api/orders';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

export default function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      try {
        const res = await ordersAPI.getById(id);
        if (isMounted) setOrder(res?.data?.order || null);
      } catch (err) {
        console.error('Error fetching order:', err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const getStatusColor = (status) => {
    const colors = {
      Processing: 'warning',
      Shipped: 'primary',
      Delivered: 'success',
      Cancelled: 'danger',
    };
    return colors[status] || 'primary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Processing: Package,
      Shipped: Truck,
      Delivered: CheckCircle,
    };
    return icons[status] || Package;
  };

  /* ---------- States ---------- */

  if (loading) return <Loader fullScreen />;

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Order not found</h2>
        <p className="text-gray-600 mb-6">
          The order you are looking for does not exist or was removed.
        </p>
        <Link to="/orders" className="text-primary-600 hover:underline">
          Go back to orders
        </Link>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(order.orderStatus);

  /* ---------- UI ---------- */

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back */}
      <Link
        to="/orders"
        className="flex items-center gap-2 text-primary-600 hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">Order Details</h1>
                <p className="text-gray-600 break-all">Order ID: {order._id}</p>
                <p className="text-sm text-gray-500">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>

              <Badge variant={getStatusColor(order.orderStatus)}>
                <span className="flex items-center gap-1">
                  <StatusIcon className="w-4 h-4" />
                  {order.orderStatus}
                </span>
              </Badge>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <h2 className="font-semibold mb-3">Items</h2>

              {(order.orderItems || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <img
                    src={item?.image || '/placeholder-product.png'}
                    alt={item?.name}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <div className="flex-1">
                    <h3 className="font-medium">{item?.name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item?.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: {formatCurrency(item?.price || 0)}
                    </p>
                  </div>

                  <p className="font-bold">
                    {formatCurrency((item?.price || 0) * (item?.quantity || 0))}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Shipping */}
          <Card className="p-6">
            <h2 className="font-semibold mb-3">Shipping Address</h2>

            {order.shippingAddress ? (
              <div className="text-gray-700 space-y-1">
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <p>
                  {order.shippingAddress.country} -{' '}
                  {order.shippingAddress.zipCode}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No shipping address available</p>
            )}
          </Card>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20">
            <h2 className="font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <Row label="Subtotal" value={order.itemsPrice} />
              <Row label="Tax" value={order.taxPrice} />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>
                  {order.shippingPrice === 0
                    ? 'FREE'
                    : formatCurrency(order.shippingPrice)}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary-600">
                {formatCurrency(order.totalPrice)}
              </span>
            </div>

            {/* Payment */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Payment Information</h3>

              {order.paymentInfo ? (
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Method: {order.paymentInfo.method}</p>
                  <p>Status: {order.paymentInfo.status}</p>
                  {order.paymentInfo.id && (
                    <p className="text-xs text-gray-500 break-all">
                      ID: {order.paymentInfo.id}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Payment details unavailable
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small Reusable Row ---------- */

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span>{formatCurrency(value || 0)}</span>
    </div>
  );
}
