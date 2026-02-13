import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatters';
import Button from '../common/Button';
import { ArrowRight } from 'lucide-react';

export default function CartSummary() {
  const navigate = useNavigate();

  const { getTotal, getTax, getShipping, getGrandTotal, items } = useCartStore();

  const total = getTotal();
  const tax = getTax();
  const shipping = getShipping();
  const grandTotal = getGrandTotal();

  const remainingForFreeShipping = Math.max(0, 100 - total);

  return (
    <div className="card p-6 sticky top-20">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(total)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Tax (10%)</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
          </span>
        </div>
      </div>

      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span className="text-primary-600">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {remainingForFreeShipping > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          Add ₹{remainingForFreeShipping.toFixed(2)} more for free shipping!
        </p>
      )}

      <Button
        onClick={() => items.length > 0 && navigate('/checkout')}
        className="w-full"
        size="lg"
        disabled={items.length === 0}
      >
        Proceed to Checkout
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
