import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { productsAPI } from '../../api/products';
import { CATEGORIES } from '../../utils/constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
  });

  /**
   * Fetch product
   */
  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await productsAPI.getById(id);
      const product = res.data.product;

      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: String(product.price ?? ''),
        category: product.category || '',
        stock: String(product.stock ?? ''),
        images: product.images || [],
      });
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Upload images
   */
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    if (formData.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setUploadingImages(true);

    const formDataImg = new FormData();
    files.forEach(file => formDataImg.append('images', file));

    try {
      const res = await productsAPI.uploadImages(formDataImg);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...res.data.images],
      }));

      toast.success('Images uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed');
    } finally {
      setUploadingImages(false);
    }
  };

  /**
   * Remove image (frontend only — backend overwrite on update)
   */
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }

    if (Number(formData.price) <= 0) {
      toast.error('Price must be greater than 0');
      return false;
    }

    if (Number(formData.stock) < 0) {
      toast.error('Stock cannot be negative');
      return false;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return false;
    }

    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return false;
    }

    return true;
  };

  /**
   * Submit update
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setUpdating(true);

    try {
      await productsAPI.update(id, {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });

      toast.success('Product updated successfully!');
      navigate('/seller/products');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update product');
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Loading state
   */
  if (loading) return <Loader fullScreen />;

  /**
   * Error state
   */
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchProduct}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        to="/seller/products"
        className="text-sm text-gray-500 hover:underline mb-4 inline-block"
      >
        ← Back to Products
      </Link>

      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* ---------- Basic Info ---------- */}
          <div>
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
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Price (₹)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
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
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Stock Quantity"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* ---------- Images ---------- */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Product Images</h2>

            <label className="btn btn-secondary cursor-pointer mb-4 inline-flex">
              <Upload className="w-5 h-5" />
              {uploadingImages ? 'Uploading...' : 'Upload Images'}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImages || formData.images.length >= 5}
              />
            </label>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img
                      src={image.url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---------- Actions ---------- */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/seller/products')}
              disabled={updating || uploadingImages}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={updating}
              disabled={uploadingImages}
            >
              Update Product
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
