import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';

import { productsAPI } from '../../api/products';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/formatters';

import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

import toast from 'react-hot-toast';

export default function SellerProducts() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [deleting, setDeleting] = useState(false);

  // ================= AUTH GUARD =================
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'seller') {
      navigate('/');
      return;
    }

    fetchProducts(page);
  }, [isAuthenticated, user, page]);

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async (currentPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await productsAPI.getMyProducts({
        page: currentPage,
        limit: 10,
      });

      setProducts(res.data.products || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error(err);
      setError('Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE PRODUCT =================
  const handleDelete = async () => {
    if (!deleteModal.product) return;

    setDeleting(true);

    try {
      await productsAPI.delete(deleteModal.product._id);

      toast.success('Product deleted successfully');

      // ✅ functional update to avoid stale state
      setProducts((prev) => prev.filter((p) => p._id !== deleteModal.product._id));

      setDeleteModal({ isOpen: false, product: null });
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  // ================= LOADING =================
  if (loading) return <Loader fullScreen />;

  // ================= ERROR UI =================
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchProducts(page)}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Products</h1>

        <Link to="/seller/products/add">
          <Button>
            <Plus className="w-5 h-5" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* ================= TABLE ================= */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 text-left text-sm font-semibold">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No products yet. Add your first product!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    {/* PRODUCT */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]?.url || '/placeholder-product.png'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />

                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.ratings} ⭐ ({product.numOfReviews})
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-4 py-3 text-sm">{product.category}</td>

                    {/* PRICE */}
                    <td className="px-4 py-3 text-sm font-semibold">
                      {formatCurrency(product.price)}
                    </td>

                    {/* STOCK */}
                    <td className="px-4 py-3 text-sm">
                      <span className={product.stock < 10 ? 'text-red-600 font-semibold' : ''}>
                        {product.stock}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={product.isApproved ? 'success' : 'warning'}>
                        {product.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/products/${product._id}`}>
                          <IconButton icon={<Eye />} />
                        </Link>

                        <Link to={`/seller/products/edit/${product._id}`}>
                          <IconButton icon={<Edit className="text-blue-600" />} />
                        </Link>

                        <IconButton
                          icon={<Trash2 className="text-red-600" />}
                          onClick={() => setDeleteModal({ isOpen: true, product })}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${
                  p === page ? 'bg-primary-600 text-white' : 'bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* ================= DELETE MODAL ================= */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        title="Delete Product"
      >
        <p className="mb-4">
          Are you sure you want to delete{' '}
          <strong>{deleteModal.product?.name}</strong>? This action cannot be undone.
        </p>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModal({ isOpen: false, product: null })}>
            Cancel
          </Button>

          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

function IconButton({ icon, ...props }) {
  return (
    <button
      className="p-2 hover:bg-gray-100 rounded transition"
      {...props}
    >
      {icon}
    </button>
  );
}
