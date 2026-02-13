import { Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export default function CartItem({ item }) {
  const { removeItem, updateQuantity } = useCartStore();

  const decrease = () => {
    const newQty = Math.max(1, item.quantity - 1);
    updateQuantity(item.product._id, newQty);
  };

  const increase = () => {
    const newQty = Math.min(item.product.stock, item.quantity + 1);
    updateQuantity(item.product._id, newQty);
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border">
      {/* Image */}
      <Link to={`/products/${item.product._id}`}>
        <img
          src={item.product.images[0]?.url || '/placeholder-product.png'}
          alt={item.product.name}
          onError={(e) => (e.target.src = '/placeholder-product.png')}
          className="w-24 h-24 object-cover rounded-lg"
        />
      </Link>

      {/* Details */}
      <div className="flex-1">
        <Link to={`/products/${item.product._id}`}>
          <h3 className="font-semibold hover:text-primary-600 transition-colors">
            {item.product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-2">{item.product.category}</p>

        <p className="text-lg font-bold text-primary-600">
          {formatCurrency(item.product.price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={decrease}
              aria-label="Decrease quantity"
              disabled={item.quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="px-4 py-2 font-medium">{item.quantity}</span>

            <button
              onClick={increase}
              aria-label="Increase quantity"
              disabled={item.quantity >= item.product.stock}
              className="p-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item.product._id)}
            aria-label="Remove item"
            className="text-red-500 hover:text-red-700 p-2"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Stock Warning */}
        {item.quantity >= item.product.stock && (
          <p className="text-red-500 text-sm mt-2">Maximum stock reached</p>
        )}
      </div>

      {/* Subtotal */}
      <div className="text-right">
        <p className="text-lg font-bold">
          {formatCurrency(item.product.price * item.quantity)}
        </p>
      </div>
    </div>
  );
}
