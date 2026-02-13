import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

import { adminAPI } from '../../api/admin';
import { useAuthStore } from '../../store/authStore';

import { formatCurrency, formatDate } from '../../utils/formatters';

import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

export default function AdminProducts() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [actionModal, setActionModal] = useState({
    isOpen: false,
    product: null,
    action: null,
  });

  const [processing, setProcessing] = useState(false);

  // ================= AUTH GUARD =================
  useEffect(() => {
    if (!isAuthenticated) return navigate('/login');
    if (user?.role !== 'admin') return navigate('/');
  }, [isAuthenticated, user]);

  // ================= FETCH PRODUCTS =================
  const fetchPendingProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await adminAPI.getPendingProducts({ page });

      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setError('Failed to load pending products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, [page]);

  // ================= ACTION HANDLER =================
  const handleAction = async () => {
    const { product, action } = actionModal;
    if (!product) return;

    setProcessing(true);

    try {
      // optimistic UI remove
      setProducts((prev) => prev.filter((p) => p._id !== product._id));

      if (action === 'approve') await adminAPI.approveProduct(product._id);
      if (action === 'reject') await adminAPI.rejectProduct(product._id);
      if (action === 'delete') await adminAPI.deleteProduct(product._id);

      setActionModal({ isOpen: false, product: null, action: null });
    } catch {
      fetchPendingProducts(); // fallback sync
    } finally {
      setProcessing(false);
    }
  };

  // ================= STATES =================
  if (loading) return <Loader fullScreen />;

  if (error)
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchPendingProducts}>Retry</Button>
      </div>
    );

  // ================= UI =================
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Product Moderation</h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">Product</th>
                <th className="th">Seller</th>
                <th className="th">Category</th>
                <th className="th">Price</th>
                <th className="th">Submitted</th>
                <th className="th">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-500">
                    No pending products
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]?.url || '/placeholder-product.png'}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="td">
                      <p className="font-medium">{p.seller?.name}</p>
                      <p className="text-xs text-gray-500">
                        {p.seller?.storeName}
                      </p>
                    </td>

                    <td className="td">{p.category}</td>

                    <td className="td font-semibold">
                      {formatCurrency(p.price)}
                    </td>

                    <td className="td">{formatDate(p.createdAt)}</td>

                    <td className="td">
                      <div className="flex gap-2">
                        <IconBtn
                          icon={<CheckCircle className="text-green-600" />}
                          onClick={() =>
                            setActionModal({
                              isOpen: true,
                              product: p,
                              action: 'approve',
                            })
                          }
                        />

                        <IconBtn
                          icon={<XCircle className="text-orange-600" />}
                          onClick={() =>
                            setActionModal({
                              isOpen: true,
                              product: p,
                              action: 'reject',
                            })
                          }
                        />

                        <IconBtn
                          icon={<Trash2 className="text-red-600" />}
                          onClick={() =>
                            setActionModal({
                              isOpen: true,
                              product: p,
                              action: 'delete',
                            })
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===== Pagination ===== */}
        <div className="flex justify-end gap-2 p-4">
          <Button
            size="sm"
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>

          <span className="px-3 py-1 text-sm">
            Page {page} / {totalPages}
          </span>

          <Button
            size="sm"
            variant="secondary"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </Card>

      {/* ===== Action Modal ===== */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false })}
        title="Confirm Action"
      >
        <p className="mb-4">
          Are you sure you want to <b>{actionModal.action}</b>{' '}
          <b>{actionModal.product?.name}</b>?
        </p>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setActionModal({ isOpen: false })}
          >
            Cancel
          </Button>

          <Button
            variant={actionModal.action === 'delete' ? 'danger' : 'primary'}
            onClick={handleAction}
            loading={processing}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ===== Small reusable icon button =====
function IconBtn({ icon, onClick }) {
  return (
    <button onClick={onClick} className="p-2 hover:bg-gray-100 rounded">
      {icon}
    </button>
  );
}
