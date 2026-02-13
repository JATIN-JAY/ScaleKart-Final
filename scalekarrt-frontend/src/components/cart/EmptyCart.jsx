import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import Button from '../common/Button';

export default function EmptyCart() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <ShoppingBag
          className="w-24 h-24 mx-auto text-gray-300 mb-4"
          aria-hidden="true"
        />

        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>

        <p className="text-gray-600 mb-6">
          Add some products to get started!
        </p>

        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    </div>
  );
}
