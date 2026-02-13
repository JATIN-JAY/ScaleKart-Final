import { formatDate } from '../../utils/formatters';
import Badge from '../common/Badge';
import { CheckCircle, XCircle } from 'lucide-react';

export default function UserTable({ users = [], onAction }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-4 py-10 text-center text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                {/* User Info */}
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </td>

                {/* Role */}
                <td className="px-4 py-3">
                  <Badge variant="primary">{user.role}</Badge>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <Badge variant={user.isActive ? 'success' : 'danger'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>

                {/* Joined Date */}
                <td className="px-4 py-3 text-sm">
                  {user.createdAt ? formatDate(user.createdAt) : '—'}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {user.isActive ? (
                      <button
                        onClick={() => onAction?.('deactivate', user)}
                        className="p-2 hover:bg-gray-100 rounded"
                        aria-label="Deactivate user"
                        title="Deactivate"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onAction?.('activate', user)}
                        className="p-2 hover:bg-gray-100 rounded"
                        aria-label="Activate user"
                        title="Activate"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
