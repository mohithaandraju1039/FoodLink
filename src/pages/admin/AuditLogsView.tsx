import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api';
import { AuditLog } from '../../types';
import { Spinner } from '../../components/common/Spinner';
import { Input } from '../../components/common/Input';
import { Search, FileText, Filter } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await adminApi.getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.actorName.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-content-main">System Audit Trail Logs</h2>
          <p className="text-xs text-content-muted">Immutable log of critical events, claims, role changes, and delivery actions.</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-xl border border-surface-border bg-surface-card text-content-main text-xs font-semibold px-3 focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Actions</option>
            <option value="LISTING_CREATED">Listing Created</option>
            <option value="FOOD_CLAIMED">Food Claimed</option>
            <option value="DELIVERY_ACCEPTED">Delivery Accepted</option>
            <option value="DELIVERY_COMPLETED">Delivery Completed</option>
            <option value="USER_REGISTERED">User Registered</option>
            <option value="USER_VERIFIED">User Verified</option>
            <option value="USER_SUSPENDED">User Suspended</option>
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
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Target Type / ID</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="p-4 text-content-muted whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-brand-600 uppercase text-[11px] bg-brand-50 dark:bg-brand-950/40 px-2 py-1 rounded-md border border-brand-200">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-content-main">{l.actorName}</div>
                      <div className="text-content-muted text-[10px] uppercase font-semibold">{l.actorRole}</div>
                    </td>
                    <td className="p-4 text-content-muted font-mono">
                      {l.targetType}: {l.targetId}
                    </td>
                    <td className="p-4 text-content-main max-w-md">{l.details}</td>
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
