import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { User, Mail, Lock, Store } from 'lucide-react';

import { authAPI } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    storeName: '',
    storeDescription: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /** ---------- VALIDATION ---------- */
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';

    if (!formData.email.includes('@'))
      newErrors.email = 'Enter a valid email address';

    if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (formData.role === 'seller' && !formData.storeName.trim())
      newErrors.storeName = 'Store name is required for sellers';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent double submit
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'seller' && {
          storeName: formData.storeName.trim(),
          storeDescription: formData.storeDescription.trim(),
        }),
      };

      const res = await authAPI.register(payload);
      const user = res.data.user;

      setUser(user);
      toast.success('Account created successfully!');

      /** Safe redirect */
      const redirect =
        user.role === 'seller'
          ? '/seller/dashboard'
          : user.role === 'admin'
          ? '/admin/dashboard'
          : '/products';

      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  /** ---------- UI ---------- */

  return (
    <>
      

      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-gray-600">Join ScaleKarrt today</p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Role Selection */}
              <div>
                <label className="label">I want to</label>
                <div className="grid grid-cols-2 gap-4">
                  {['buyer', 'seller'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={`p-4 border-2 rounded-lg ${
                        formData.role === role
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <p className="font-semibold">
                        {role === 'buyer' ? 'Buy Products' : 'Sell Products'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {role === 'buyer' ? 'As a customer' : 'As a seller'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={errors.name}
                icon={User}
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={errors.email}
                icon={Mail}
                required
              />

              {formData.role === 'seller' && (
                <>
                  <Input
                    label="Store Name"
                    name="storeName"
                    value={formData.storeName}
                    onChange={(e) =>
                      setFormData({ ...formData, storeName: e.target.value })
                    }
                    error={errors.storeName}
                    icon={Store}
                    required
                  />

                  <div>
                    <label className="label">Store Description (Optional)</label>
                    <textarea
                      name="storeDescription"
                      value={formData.storeDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storeDescription: e.target.value,
                        })
                      }
                      rows="3"
                      className="input"
                    />
                  </div>
                </>
              )}

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                error={errors.password}
                icon={Lock}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                error={errors.confirmPassword}
                icon={Lock}
                required
              />

              <Button type="submit" className="w-full" loading={loading}>
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-medium hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
