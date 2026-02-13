import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useRazorpay } from '../../hooks/useRazorpay';
import { formatCurrency } from '../../utils/formatters';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';
import { CreditCard, MapPin } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();
  const { items, getSubtotal, getTax, getShipping, getGrandTotal, clearCart } =
    useCartStore();

  const { initiatePayment, loading: paymentLoading } = useRazorpay();

  const [formData, setFormData] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    country: user?.address?.country || 'India',
    zipCode: user?.address?.zipCode || '',
    phone: user?.phone || '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const { street, city, state, zipCode, phone } = formData;

    if (!street || !city || !state || !zipCode || !phone) {
      toast.error('Please fill all shipping details');
      return false;
    }

    if (!/^\d{6}$/.test(zipCode)) {
      toast.error('Invalid ZIP code');
      return false;
    }

    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      toast.error('Invalid phone number');
      return false;
    }

    if (items.length === 0) {
      toast.error('Cart is empty');
      return false;
    }

    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // ✅ FINAL CORRECT PAYLOAD
      const payload = {
        amount: getGrandTotal(), // 🔥 REQUIRED by backend
        items: items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: formData,
      };

      console.log('PAYMENT PAYLOAD →', payload);

      await initiatePayment({
        ...payload,
        prefill: {
          name: user.name,
          email: user.email,
          contact: formData.phone,
        },
        onSuccess: () => {
          clearCart();
          navigate('/orders');
        },
      });
    } catch (err) {
      console.error(err);
      toast.error('Payment initialization failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handlePayment}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-bold">Shipping Address</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input label="Street" name="street" value={formData.street} onChange={handleInputChange} required />
                </div>

                <Input label="City" name="city" value={formData.city} onChange={handleInputChange} required />
                <Input label="State" name="state" value={formData.state} onChange={handleInputChange} required />
                <Input label="ZIP Code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
                <Input label="Country" name="country" value={formData.country} disabled />

                <div className="md:col-span-2">
                  <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-bold">Secure Razorpay Payment</h2>
              </div>
              <p className="text-sm text-gray-600">
                Pay using UPI, Cards, Net Banking, or Wallets via Razorpay.
              </p>
            </Card>
          </div>

          {/* RIGHT */}
          <div>
            <Card className="sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product._id} className="flex justify-between text-sm">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span>{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(getTax())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{getShipping() === 0 ? 'FREE' : formatCurrency(getShipping())}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(getGrandTotal())}</span>
              </div>

              <Button type="submit" size="lg" className="w-full" loading={submitting || paymentLoading}>
                Pay {formatCurrency(getGrandTotal())}
              </Button>
            </Card>
          </div>

        </div>
      </form>
    </div>
  );
}
