import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated, user } = useAuthStore();

  // Defensive guard
  if (!product) return null;

  const {
    _id,
    name,
    images = [],
    category,
    ratings = 0,
    numOfReviews = 0,
    price = 0,
    stock = 0,
    seller,
  } = product;

  const imageUrl = images[0]?.url || '/placeholder-product.png';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (user?.role !== 'buyer') {
      toast.error('Only buyers can add items to cart');
      return;
    }

    if (stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    addItem(product, 1);
    toast.success('Added to cart!');
  };

  return (
    <Link
      to={`/products/${_id}`}
      className="group focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
      aria-label={`View product ${name}`}
    >
      <div className="card overflow-hidden hover:shadow-xl transition-all duration-300 bg-white">
        {/* IMAGE */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-product.png';
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* STOCK BADGES */}
          {stock === 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              OUT OF STOCK
            </div>
          )}

          {stock > 0 && stock < 10 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              Only {stock} left
            </div>
          )}

          {/* QUICK ACTIONS */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Quick view product"
                className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100"
                onClick={(e) => e.preventDefault()}
              >
                <Eye className="w-5 h-5" />
              </button>

              <button
                type="button"
                aria-label="Add to cart"
                onClick={handleAddToCart}
                disabled={stock === 0}
                className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="p-4">
          {/* CATEGORY */}
          <p className="text-xs text-gray-500 uppercase mb-1">{category}</p>

          {/* NAME */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {name}
          </h3>

          {/* RATING */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-sm font-medium">{ratings.toFixed(1)}</span>
            </div>
            <span className="text-xs text-gray-500">
              ({numOfReviews} reviews)
            </span>
          </div>

          {/* PRICE + CTA */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(price)}
            </span>

            <button
              type="button"
              aria-label="Add to cart"
              onClick={handleAddToCart}
              disabled={stock === 0}
              className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>

          {/* SELLER */}
          <p className="text-xs text-gray-500 mt-2">
            by {seller?.storeName || seller?.name || 'Unknown'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default memo(ProductCard);
