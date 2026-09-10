import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { volunteerApi } from '../../api/volunteer.api';
import { VolunteerTask } from '../../types';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Truck, MapPin, Phone, Users, Clock, ArrowRight, Navigation } from 'lucide-react';

export const AvailableTasksPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const data = await volunteerApi.getTasks({ availableOnly: true });
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch available tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAcceptTask = async (taskId: string) => {
    setAcceptingId(taskId);
    try {
      await volunteerApi.acceptTask(taskId);
      navigate('/volunteer/deliveries');
    } catch (err: any) {
      alert(err.message || 'Failed to accept task.');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-content-main">{t('volunteer_available_tasks')}</h1>
        <p className="text-xs text-content-muted">
          Select a food pickup task below to accept and begin your delivery journey.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No Available Pickup Tasks"
          description="All currently claimed food donations have assigned volunteers. Check back shortly for new pickup requests!"
        />
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-3xl border border-surface-border bg-surface-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row justify-between gap-6"
            >
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    AVAILABLE TASK
                  </span>
                  <span className="text-xs font-semibold text-content-muted">
                    {task.category.replace('_', ' ')} • {task.quantityServings} Servings
                  </span>
                </div>

                <h3 className="text-lg font-bold text-content-main">{task.listingTitle}</h3>

                {/* Pickup vs Drop-off layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-hover text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">
                      📍 1. Pickup From (Donor)
                    </span>
                    <div className="font-bold text-content-main">{task.donorName}</div>
                    <div className="text-content-muted">{task.pickupAddress}</div>
                    <div className="text-content-muted">Phone: {task.donorPhone}</div>
                  </div>

                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-surface-border pt-3 sm:pt-0 sm:pl-4">
                    <span className="font-bold text-sky-600 dark:text-sky-400 block uppercase tracking-wider">
                      🎯 2. Deliver To (Receiver)
                    </span>
                    <div className="font-bold text-content-main">{task.receiverName}</div>
                    <div className="text-content-muted">{task.deliveryAddress}</div>
                    <div className="text-content-muted">Phone: {task.receiverPhone}</div>
                  </div>
                </div>
              </div>

              <div className="flex lg:flex-col items-center justify-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-surface-border">
                <Button
                  size="lg"
                  isLoading={acceptingId === task.id}
                  onClick={() => handleAcceptTask(task.id)}
                  icon={<Truck className="w-4 h-4" />}
                >
                  Accept Delivery Task
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
