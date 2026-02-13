import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();

  const {
    items = [],
    removeItem,
    updateQuantity,
    getTotal,
    getTax,
    getShipping,
    getGrandTotal,
  } = useCartStore();

  // ================= SAFE FILTER =================
  const validItems = items.filter((item) => item?.product);

  // ================= EMPTY CART =================
  if (validItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ================= HANDLERS =================
  const handleDecrease = (item) => {
    if (item.quantity <= 1) return;
    updateQuantity(item.product._id, item.quantity - 1);
  };

  const handleIncrease = (item) => {
    if (item.quantity >= item.product.stock) {
      toast.error('Maximum stock reached');
      return;
    }
    updateQuantity(item.product._id, item.quantity + 1);
  };

  const handleRemove = (productId) => {
    removeItem(productId);
    toast.success('Item removed from cart');
  };

  const handleCheckout = () => {
    if (validItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  // ================= UI =================
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= CART ITEMS ================= */}
        <div className="lg:col-span-2 space-y-4">
          {validItems.map((item) => (
            <div key={item.product._id} className="card p-4">
              <div className="flex gap-4">
                {/* Image */}
                <Link to={`/products/${item.product._id}`}>
                  <img
                    src={item.product.images?.[0]?.url || '/placeholder-product.png'}
                    alt={item.product.name}
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

                  <p className="text-gray-600 text-sm mb-2">
                    {item.product.category}
                  </p>

                  <p className="text-lg font-bold text-primary-600">
                    {formatCurrency(item.product.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleDecrease(item)}
                        disabled={item.quantity <= 1}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="px-4 py-2 font-medium">{item.quantity}</span>

                      <button
                        onClick={() => handleIncrease(item)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.product._id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Stock Warning */}
                  {item.quantity >= item.product.stock && (
                    <p className="text-red-500 text-sm mt-2">
                      Maximum stock reached
                    </p>
                  )}
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-20">
                  <p className="text-lg font-bold">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= ORDER SUMMARY ================= */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(getTotal())}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">
                  {formatCurrency(getTax())}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {getShipping() === 0 ? 'FREE' : formatCurrency(getShipping())}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary-600">
                  {formatCurrency(getGrandTotal())}
                </span>
              </div>
            </div>

            <Button onClick={handleCheckout} className="w-full" size="lg">
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </Button>

            <Link
              to="/products"
              className="block text-center text-primary-600 hover:underline mt-4"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
