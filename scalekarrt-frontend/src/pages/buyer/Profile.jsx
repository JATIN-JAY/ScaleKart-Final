import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(getInitialState(user));

  /* ---------- Sync when store user changes ---------- */
  useEffect(() => {
    setFormData(getInitialState(user));
  }, [user]);

  /* ---------- Handlers ---------- */

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }

    if (formData.phone && !/^[0-9+\-\s]{7,15}$/.test(formData.phone)) {
      toast.error('Invalid phone number');
      return false;
    }

    if (formData.zipCode && !/^[0-9]{4,10}$/.test(formData.zipCode)) {
      toast.error('Invalid ZIP code');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await authAPI.updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
      });

      const updatedUser = res?.data?.user;

      if (!updatedUser) throw new Error('Invalid response');

      updateUser(updatedUser);

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            icon={User}
            required
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            icon={Mail}
            disabled
            autoComplete="email"
          />

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            icon={Phone}
            placeholder="+91 9876543210"
            autoComplete="tel"
          />

          {/* Address */}
          <div className="border-t pt-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address
            </h2>

            <div className="space-y-4">
              <Input
                label="Street Address"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="123 Main Street"
                autoComplete="street-address"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  autoComplete="address-level2"
                />

                <Input
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  autoComplete="address-level1"
                />
              </div>

              <Input
                label="ZIP Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                autoComplete="postal-code"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}

/* ---------- Helpers ---------- */

function getInitialState(user) {
  return {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
  };
}
