import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api';
import { User } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { Search, ShieldCheck, Ban, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleVerify = async (userId: string) => {
    setActioningId(userId);
    try {
      await adminApi.toggleVerifyUser(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to verify user.');
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleSuspend = async (userId: string) => {
    setActioningId(userId);
    try {
      await adminApi.toggleSuspendUser(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    } finally {
      setActioningId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        (u.organization && u.organization.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-content-main">User Directory & Verification</h2>
          <p className="text-xs text-content-muted">Manage platform accounts, verify NGOs/Donors, and handle suspensions.</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search users by name, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-surface-border bg-surface-card text-content-main text-xs font-semibold px-3 focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="DONOR">Donor</option>
            <option value="RECEIVER">Receiver</option>
            <option value="VOLUNTEER">Volunteer</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="rounded-3xl border border-surface-border bg-surface-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-hover text-content-muted uppercase tracking-wider font-bold border-b border-surface-border">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Organization / City</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-content-main">{u.name}</div>
                      <div className="text-content-muted text-[11px]">{u.email} • {u.phone}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.role === 'ADMIN' ? 'purple' : u.role === 'DONOR' ? 'success' : u.role === 'RECEIVER' ? 'info' : 'warning'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-content-main">{u.organization || '—'}</div>
                      <div className="text-content-muted">{u.city}</div>
                    </td>
                    <td className="p-4">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <ShieldCheck className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                          <AlertTriangle className="w-4 h-4" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={actioningId === u.id}
                        onClick={() => handleToggleVerify(u.id)}
                      >
                        {u.isVerified ? 'Unverify' : 'Verify Account'}
                      </Button>

                      {u.role !== 'ADMIN' && (
                        <Button
                          size="sm"
                          variant={u.status === 'ACTIVE' ? 'danger' : 'secondary'}
                          isLoading={actioningId === u.id}
                          onClick={() => handleToggleSuspend(u.id)}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
