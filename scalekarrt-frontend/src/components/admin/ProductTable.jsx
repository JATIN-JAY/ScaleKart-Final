import { formatCurrency, formatDate } from '../../utils/formatters';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function ProductTable({ products = [], onAction }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Seller</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Submitted</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                No pending products
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0]?.url || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-sm">
                  {product.seller?.storeName || product.seller?.name || '—'}
                </td>

                <td className="px-4 py-3 text-sm font-semibold">
                  {formatCurrency(product.price || 0)}
                </td>

                <td className="px-4 py-3 text-sm">{product.stock ?? '—'}</td>

                <td className="px-4 py-3 text-sm">
                  {product.createdAt ? formatDate(product.createdAt) : '—'}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAction('approve', product)}
                      className="p-2 hover:bg-gray-100 rounded"
                      aria-label="Approve product"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </button>

                    <button
                      onClick={() => onAction('reject', product)}
                      className="p-2 hover:bg-gray-100 rounded"
                      aria-label="Reject product"
                    >
                      <XCircle className="w-4 h-4 text-orange-600" />
                    </button>

                    <button
                      onClick={() => onAction('delete', product)}
                      className="p-2 hover:bg-gray-100 rounded"
                      aria-label="Delete product"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
