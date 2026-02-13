import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../common/Badge';

export default function RecentOrders({ orders = [] }) {
  const getStatusColor = (status) => {
    const colors = {
      Processing: 'warning',
      Shipped: 'primary',
      Delivered: 'success',
      Cancelled: 'danger',
    };
    return colors[status] || 'primary';
  };

  return (
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
              <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                No orders yet
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono">
                  {order._id?.slice(-8)}
                </td>

                <td className="px-4 py-3 text-sm">
                  {order.user?.name || 'N/A'}
                </td>

                <td className="px-4 py-3 text-sm">
                  {order.orderItems?.length || 0}
                </td>

                <td className="px-4 py-3 text-sm font-semibold">
                  {formatCurrency(order.totalPrice || 0)}
                </td>

                <td className="px-4 py-3 text-sm">
                  <Badge variant={getStatusColor(order.orderStatus)}>
                    {order.orderStatus}
                  </Badge>
                </td>

                <td className="px-4 py-3 text-sm">
                  {order.createdAt ? formatDate(order.createdAt) : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
