import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle } from 'lucide-react';

import { adminAPI } from '../../api/admin';
import { useAuthStore } from '../../store/authStore';

import { formatDate } from '../../utils/formatters';

import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [actionModal, setActionModal] = useState({
    isOpen: false,
    user: null,
    action: null,
  });

  const [processing, setProcessing] = useState(false);

  // ================= AUTH GUARD =================
  useEffect(() => {
    if (!isAuthenticated) return navigate('/login');
    if (user?.role !== 'admin') return navigate('/');
  }, [isAuthenticated, user]);

  // ================= DEBOUNCE SEARCH =================
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
      };

      const res = await adminAPI.getAllUsers(params);

      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, roleFilter, page]);

  // ================= ACTION HANDLER =================
  const handleAction = async () => {
    const { user, action } = actionModal;
    if (!user) return;

    setProcessing(true);

    try {
      // optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id
            ? {
                ...u,
                isActive:
                  action === 'activate'
                    ? true
                    : action === 'deactivate'
                    ? false
                    : u.isActive,
                isVerifiedSeller:
                  action === 'verify'
                    ? true
                    : action === 'unverify'
                    ? false
                    : u.isVerifiedSeller,
              }
            : u
        )
      );

      if (action === 'activate' || action === 'deactivate') {
        await adminAPI.updateUserStatus(user._id, action === 'activate');
      }

      if (action === 'verify') await adminAPI.verifySeller(user._id);
      if (action === 'unverify') await adminAPI.unverifySeller(user._id);

      setActionModal({ isOpen: false, user: null, action: null });
    } catch {
      fetchUsers(); // fallback sync
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
        <Button onClick={fetchUsers}>Retry</Button>
      </div>
    );

  // ================= UI =================
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      {/* ===== Filters ===== */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search by name or email..."
              className="input pl-10"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => {
              setPage(1);
              setRoleFilter(e.target.value);
            }}
            className="input md:w-48"
          >
            <option value="">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </Card>

      {/* ===== Users Table ===== */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">User</th>
                <th className="th">Role</th>
                <th className="th">Status</th>
                <th className="th">Joined</th>
                <th className="th">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="td">
                      <p className="font-medium">{u.name}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </td>

                    <td className="td">
                      <Badge>{u.role}</Badge>
                      {u.role === 'seller' && (
                        <Badge
                          variant={u.isVerifiedSeller ? 'success' : 'warning'}
                          className="ml-2"
                        >
                          {u.isVerifiedSeller ? 'Verified' : 'Unverified'}
                        </Badge>
                      )}
                    </td>

                    <td className="td">
                      <Badge variant={u.isActive ? 'success' : 'danger'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>

                    <td className="td">{formatDate(u.createdAt)}</td>

                    <td className="td">
                      <div className="flex gap-2">
                        <IconBtn
                          icon={
                            u.isActive ? (
                              <XCircle className="text-red-600" />
                            ) : (
                              <CheckCircle className="text-green-600" />
                            )
                          }
                          onClick={() =>
                            setActionModal({
                              isOpen: true,
                              user: u,
                              action: u.isActive ? 'deactivate' : 'activate',
                            })
                          }
                        />

                        {u.role === 'seller' && (
                          <IconBtn
                            icon={
                              u.isVerifiedSeller ? (
                                <XCircle className="text-orange-600" />
                              ) : (
                                <CheckCircle className="text-blue-600" />
                              )
                            }
                            onClick={() =>
                              setActionModal({
                                isOpen: true,
                                user: u,
                                action: u.isVerifiedSeller
                                  ? 'unverify'
                                  : 'verify',
                              })
                            }
                          />
                        )}
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
          <b>{actionModal.user?.name}</b>?
        </p>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setActionModal({ isOpen: false })}
          >
            Cancel
          </Button>

          <Button onClick={handleAction} loading={processing}>
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ================= SMALL UI =================
function IconBtn({ icon, onClick }) {
  return (
    <button onClick={onClick} className="p-2 hover:bg-gray-100 rounded">
      {icon}
    </button>
  );
}
