import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { authAPI } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const setUser = useAuthStore((state) => state.setUser);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      setLoading(true);

      const res = await authAPI.login(formData.email, formData.password);

      const user = res?.data?.user;

      if (!user) {
        throw new Error('Invalid login response');
      }

      setUser(user);

      toast.success('Logged in successfully!');

      // redirect logic
      const from = location.state?.from || '/';

      const redirectPath =
        user.role === 'admin'
          ? '/admin/dashboard'
          : user.role === 'seller'
          ? '/seller/dashboard'
          : from;

      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error('Login error:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please try again.';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600">Login to your ScaleKarrt account</p>
        </div>

        {/* Login Card */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              icon={Mail}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <Button type="submit" className="w-full" loading={loading}>
              Login
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:underline font-medium"
              >
                Register here
              </Link>
            </p>
          </div>
        </Card>

        {/* Demo Credentials (remove in production if needed) */}
        <Card className="p-4 mt-4 bg-blue-50 border-blue-200">
          <p className="text-sm font-semibold mb-2">Demo Credentials:</p>
          <div className="text-xs space-y-1 text-gray-700">
            <p>
              <strong>Admin:</strong> admin@scalekarrt.com / Admin@123456
            </p>
            <p>
              <strong>Seller:</strong> seller@example.com / password123
            </p>
            <p>
              <strong>Buyer:</strong> john@example.com / password123
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
