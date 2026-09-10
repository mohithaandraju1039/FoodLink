import React, { useState, useEffect } from 'react';
import { volunteerApi } from '../../api/volunteer.api';
import { VolunteerTask } from '../../types';
import { Spinner } from '../../components/common/Spinner';

export const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await volunteerApi.getTasks();
        setTasks(data);
      } catch (err) {
        console.error('Error fetching admin volunteer tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-content-main">Volunteer Tasks Pipeline</h2>
        <p className="text-xs text-content-muted">Track volunteer taskforce assignments, pickup status, and completion timeline.</p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="rounded-3xl border border-surface-border bg-surface-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-hover text-content-muted uppercase tracking-wider font-bold border-b border-surface-border">
                <tr>
                  <th className="p-4">Listing</th>
                  <th className="p-4">Assigned Volunteer</th>
                  <th className="p-4">Donor Pickup</th>
                  <th className="p-4">Receiver Drop-off</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="p-4 font-bold text-content-main">{t.listingTitle}</td>
                    <td className="p-4">
                      {t.volunteerName ? (
                        <div>
                          <div className="font-bold text-content-main">{t.volunteerName}</div>
                          <div className="text-content-muted">{t.volunteerPhone}</div>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-bold">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-content-main">{t.donorName}</div>
                      <div className="text-content-muted truncate max-w-xs">{t.pickupAddress}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-content-main">{t.receiverName}</div>
                      <div className="text-content-muted truncate max-w-xs">{t.deliveryAddress}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-md bg-brand-50 text-brand-700 font-bold border border-brand-200">
                        {t.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold">{t.claimCode}</td>
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
