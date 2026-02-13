import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';

import { productsAPI } from '../../api/products';
import { useAuthStore } from '../../store/authStore';
import { CATEGORIES } from '../../utils/constants';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import toast from 'react-hot-toast';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 2;

export default function AddProduct() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
  });

  // ================= AUTH GUARD =================
  useEffect(() => {
    if (!isAuthenticated) return navigate('/login');
    if (user?.role !== 'seller') return navigate('/');
  }, [isAuthenticated, user]);

  // ================= INPUT CHANGE =================
  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ================= IMAGE UPLOAD =================
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    // Validate count
    if (formData.images.length + files.length > MAX_IMAGES) {
      return toast.error(`Maximum ${MAX_IMAGES} images allowed`);
    }

    // Validate type & size
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return toast.error('Only image files allowed');
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return toast.error(`Each image must be < ${MAX_FILE_SIZE_MB}MB`);
      }
    }

    setUploadingImages(true);

    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));

    try {
      const res = await productsAPI.uploadImages(fd);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...res.data.images],
      }));

      toast.success('Images uploaded');
    } finally {
      setUploadingImages(false);
    }
  };

  // ================= REMOVE IMAGE =================
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    if (!formData.name.trim() || formData.name.length < 3)
      return 'Product name must be at least 3 characters';

    if (!formData.description.trim() || formData.description.length < 10)
      return 'Description must be at least 10 characters';

    if (!formData.category) return 'Please select category';

    if (Number(formData.price) <= 0) return 'Price must be greater than 0';

    if (Number(formData.stock) < 0) return 'Stock cannot be negative';

    if (!formData.images.length) return 'Upload at least one image';

    return null;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) return toast.error(error);

    setLoading(true);

    try {
      await productsAPI.create({
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });

      toast.success('Product added! Awaiting admin approval.');
      navigate('/seller/products');
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* ================= BASIC INFO ================= */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

            <div className="space-y-4">
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  maxLength={1000}
                  className="input"
                  required
                />
                <p className="text-xs text-gray-400 text-right">
                  {formData.description.length}/1000
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Price (₹)"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />

                <div>
                  <label className="label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* ================= IMAGES ================= */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Product Images</h2>

            <label className="btn btn-secondary cursor-pointer">
              <Upload className="w-5 h-5" />
              {uploadingImages ? 'Uploading...' : 'Upload Images'}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImages || formData.images.length >= MAX_IMAGES}
              />
            </label>

            <p className="text-sm text-gray-500 mt-2">
              Up to {MAX_IMAGES} images • Max {MAX_FILE_SIZE_MB}MB each
            </p>

            {/* PREVIEW */}
            {!!formData.images.length && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img.url}
                      className="w-full h-full object-cover rounded-lg aspect-square"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {i === 0 && (
                      <span className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ================= ACTIONS ================= */}
          <div className="flex gap-4 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => navigate('/seller/products')}>
              Cancel
            </Button>

            <Button type="submit" loading={loading} disabled={uploadingImages}>
              Add Product
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
