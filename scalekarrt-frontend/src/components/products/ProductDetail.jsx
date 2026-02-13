import { useState, memo } from 'react';
import {
  Star,
  ShoppingCart,
  Minus,
  Plus,
  Package,
  Shield,
  Truck,
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/formatters';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

function ProductDetail({ product, loading }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated, user } = useAuthStore();

  // ================= LOADING STATE =================
  if (loading) return <Loader />;

  // ================= SAFETY CHECK =================
  if (!product) {
    return (
      <div className="text-center py-16 text-gray-500">
        Product not found.
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : [{ url: '/placeholder-product.png' }];

  // ================= HANDLERS =================
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (user?.role !== 'buyer') {
      toast.error('Only buyers can add items to cart');
      return;
    }

    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    addItem(product, quantity);
    toast.success(`${quantity} item(s) added to cart!`);
  };

  const decreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQuantity = () =>
    setQuantity((q) => Math.min(product.stock, q + 1));

  // ================= UI =================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ================= IMAGES ================= */}
      <div>
        {/* Main Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
          <img
            src={images[selectedImage]?.url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square bg-gray-100 rounded-lg overflow-hidden focus:outline-none ${
                  selectedImage === index ? 'ring-2 ring-primary-600' : ''
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={image.url}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= INFO ================= */}
      <div>
        {/* Category */}
        <Badge variant="primary" className="mb-2">
          {product.category}
        </Badge>

        {/* Name */}
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

        {/* Rating */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(product.ratings)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.ratings} ({product.numOfReviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="mb-6 text-4xl font-bold text-primary-600">
          {formatCurrency(product.price)}
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-600 whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Stock */}
        <div className="mb-6">
          {product.stock > 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <Package className="w-5 h-5" />
              <span className="font-medium">
                {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <Package className="w-5 h-5" />
              <span className="font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Quantity */}
        {product.stock > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Quantity
            </label>

            <div className="flex items-center border border-gray-300 rounded-lg w-fit">
              <button
                onClick={decreaseQuantity}
                className="p-2 hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(
                      1,
                      Math.min(product.stock, Number(e.target.value))
                    )
                  )
                }
                className="w-16 text-center outline-none"
              />

              <button
                onClick={increaseQuantity}
                className="p-2 hover:bg-gray-100"
                disabled={quantity >= product.stock}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Add to Cart */}
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full mb-6 flex items-center justify-center gap-2"
          size="lg"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </Button>

        {/* Features */}
        <div className="border-t pt-6 space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5" />
            Free shipping on orders over ₹100
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5" />
            100% Secure Payment
          </div>
        </div>

        {/* Seller */}
        <div className="border-t mt-6 pt-6">
          <h3 className="font-semibold mb-2">Seller Information</h3>
          <p className="font-medium">
            {product.seller?.storeName || product.seller?.name}
          </p>
          {product.seller?.storeDescription && (
            <p className="text-sm text-gray-500 mt-1">
              {product.seller.storeDescription}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProductDetail);
