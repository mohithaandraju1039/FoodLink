import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { volunteerApi } from '../../api/volunteer.api';
import { VolunteerTask } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Truck, CheckCircle2, MapPin, Navigation, Clock, User } from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  const [availableTasks, setAvailableTasks] = useState<VolunteerTask[]>([]);
  const [myTasks, setMyTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const [avail, mine] = await Promise.all([
            volunteerApi.getTasks({ availableOnly: true }),
            volunteerApi.getTasks({ volunteerId: user.id }),
          ]);
          setAvailableTasks(avail);
          setMyTasks(mine);
        }
      } catch (err) {
        console.error('Error fetching volunteer data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const activeDeliveries = myTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const completedDeliveries = myTasks.filter((t) => t.status === 'COMPLETED');
  const totalMealsDelivered = completedDeliveries.reduce((sum, t) => sum + t.quantityServings, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-brand-600 text-white shadow-lg">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-100">Volunteer Taskforce</span>
          <h1 className="text-2xl font-black mt-1">Thank you, {user?.name}!</h1>
          <p className="text-xs text-brand-100 mt-1 max-w-xl">
            You are the essential bridge delivering fresh surplus food from donors to receivers.
          </p>
        </div>
        <Link to="/volunteer/tasks">
          <Button
            size="lg"
            className="bg-white text-brand-700 hover:bg-brand-50 border-none font-bold shadow-md shrink-0"
            icon={<Truck className="w-5 h-5" />}
          >
            {t('volunteer_available_tasks')} ({availableTasks.length})
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Available Pickup Tasks"
          value={availableTasks.length}
          icon={<Truck className="w-5 h-5" />}
          color="emerald"
          description="Waiting for volunteer acceptance"
        />
        <StatCard
          title="My Active Deliveries"
          value={activeDeliveries.length}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          description="Currently en route or assigned"
        />
        <StatCard
          title="Deliveries Completed"
          value={completedDeliveries.length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="purple"
          description={`${totalMealsDelivered} servings delivered`}
        />
      </div>

      {/* Active Task Highlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-content-main">My Active Deliveries</h2>
          <Link to="/volunteer/deliveries" className="text-xs font-bold text-brand-600 hover:underline">
            Manage Step-by-Step Deliveries &rarr;
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : activeDeliveries.length === 0 ? (
          <EmptyState
            title="No Active Deliveries"
            description="Accept a task from the available list to start a delivery journey."
            action={
              <Link to="/volunteer/tasks">
                <Button icon={<Truck className="w-4 h-4" />}>Browse Available Tasks</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map((task) => (
              <div
                key={task.id}
                className="p-6 rounded-3xl border border-surface-border bg-surface-card shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                      Status: {task.status.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-lg font-bold text-content-main mt-0.5">{task.listingTitle}</h3>
                  </div>
                  <Link to="/volunteer/deliveries">
                    <Button size="sm">Update Progress &rarr;</Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-hover text-xs">
                  <div>
                    <span className="font-bold text-content-muted block mb-1">📍 PICKUP LOCATION</span>
                    <div className="font-bold text-content-main">{task.donorName}</div>
                    <div className="text-content-muted">{task.pickupAddress}</div>
                  </div>
                  <div>
                    <span className="font-bold text-content-muted block mb-1">🎯 DROP-OFF DESTINATION</span>
                    <div className="font-bold text-content-main">{task.receiverName}</div>
                    <div className="text-content-muted">{task.deliveryAddress}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
