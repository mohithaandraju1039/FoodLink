import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { volunteerApi } from '../../api/volunteer.api';
import { VolunteerTask, VolunteerTaskStatus } from '../../types';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Truck, MapPin, Phone, CheckCircle2, ArrowRight, ShieldCheck, Key, Navigation } from 'lucide-react';

export const MyDeliveriesPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Status update modal state
  const [selectedTask, setSelectedTask] = useState<VolunteerTask | null>(null);
  const [nextStatus, setNextStatus] = useState<VolunteerTaskStatus | null>(null);
  const [inputClaimCode, setInputClaimCode] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyDeliveries = async () => {
    try {
      if (user) {
        const data = await volunteerApi.getTasks({ volunteerId: user.id });
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to fetch volunteer deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDeliveries();
  }, [user]);

  const handleOpenStatusModal = (task: VolunteerTask, status: VolunteerTaskStatus) => {
    setSelectedTask(task);
    setNextStatus(status);
    setInputClaimCode('');
    setError(null);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedTask || !nextStatus) return;

    if (nextStatus === 'COMPLETED' && !inputClaimCode.trim()) {
      setError('Please enter the receiver verification claim code to complete the delivery.');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      await volunteerApi.updateTaskStatus(selectedTask.id, nextStatus, inputClaimCode);
      setSelectedTask(null);
      setNextStatus(null);
      await fetchMyDeliveries();
    } catch (err: any) {
      setError(err.message || 'Failed to update task status.');
    } finally {
      setUpdating(false);
    }
  };

  // Helper step details
  const getStepButtonText = (status: VolunteerTaskStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return { label: 'Start Pickup Journey', next: 'PICKUP_IN_PROGRESS' as VolunteerTaskStatus, color: 'primary' };
      case 'PICKUP_IN_PROGRESS':
        return { label: 'Confirm Picked Up from Donor', next: 'PICKED_UP' as VolunteerTaskStatus, color: 'primary' };
      case 'PICKED_UP':
        return { label: 'Start Delivery Journey to Receiver', next: 'DELIVERY_IN_PROGRESS' as VolunteerTaskStatus, color: 'primary' };
      case 'DELIVERY_IN_PROGRESS':
        return { label: 'Mark Delivery Completed', next: 'COMPLETED' as VolunteerTaskStatus, color: 'primary' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-content-main">{t('volunteer_my_deliveries')}</h1>
        <p className="text-xs text-content-muted">
          Manage step-by-step progress for your accepted pickup and delivery tasks.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No Delivery Tasks Assigned"
          description="You currently have no active or historical delivery tasks. Browse available tasks to pick up food!"
        />
      ) : (
        <div className="space-y-6">
          {tasks.map((task) => {
            const stepAction = getStepButtonText(task.status);
            return (
              <div
                key={task.id}
                className="rounded-3xl border border-surface-border bg-surface-card p-6 shadow-sm space-y-6"
              >
                {/* Header & Status Indicator */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600">
                      Task ID: {task.id}
                    </span>
                    <h3 className="text-lg font-bold text-content-main mt-0.5">{task.listingTitle}</h3>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-700 dark:text-brand-300">
                    Status: {task.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Step Progress Tracker Stepper */}
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                  {[
                    { key: 'ACCEPTED', label: '1. Accepted' },
                    { key: 'PICKUP_IN_PROGRESS', label: '2. En Route Pickup' },
                    { key: 'PICKED_UP', label: '3. Picked Up' },
                    { key: 'DELIVERY_IN_PROGRESS', label: '4. Out for Delivery' },
                    { key: 'COMPLETED', label: '5. Delivered' },
                  ].map((step, idx) => {
                    const stepOrder: VolunteerTaskStatus[] = [
                      'ACCEPTED',
                      'PICKUP_IN_PROGRESS',
                      'PICKED_UP',
                      'DELIVERY_IN_PROGRESS',
                      'COMPLETED',
                    ];
                    const currentIdx = stepOrder.indexOf(task.status);
                    const isDone = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div
                        key={step.key}
                        className={`p-2 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : isDone
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                            : 'bg-surface-hover text-content-muted border-surface-border'
                        }`}
                      >
                        {step.label}
                      </div>
                    );
                  })}
                </div>

                {/* Pickup & Receiver Address details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-hover text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">
                      📍 Pickup Location (Donor)
                    </span>
                    <div className="font-bold text-content-main">{task.donorName}</div>
                    <div className="text-content-muted">{task.pickupAddress}</div>
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(task.pickupAddress)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-brand-600 hover:underline mt-1"
                    >
                      <Navigation className="w-3 h-3" /> Open in Google Maps
                    </a>
                  </div>

                  <div className="space-y-1 border-t md:border-t-0 md:border-l border-surface-border pt-3 md:pt-0 md:pl-4">
                    <span className="font-bold text-sky-600 dark:text-sky-400 block uppercase tracking-wider">
                      🎯 Drop-off Location (Receiver)
                    </span>
                    <div className="font-bold text-content-main">{task.receiverName}</div>
                    <div className="text-content-muted">{task.deliveryAddress}</div>
                    <div className="text-content-muted">Phone: {task.receiverPhone}</div>
                  </div>
                </div>

                {/* Step Action Button */}
                {stepAction && task.status !== 'COMPLETED' && (
                  <div className="flex justify-end pt-2">
                    <Button
                      size="lg"
                      onClick={() => handleOpenStatusModal(task, stepAction.next)}
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      {stepAction.label}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lifecycle Status Confirmation Modal */}
      {selectedTask && nextStatus && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => {
            setSelectedTask(null);
            setNextStatus(null);
          }}
          title={`Update Delivery Progress - ${nextStatus.replace(/_/g, ' ')}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 font-semibold">
                {error}
              </div>
            )}

            <p className="text-content-muted">
              Are you sure you want to transition task <span className="font-bold text-content-main">{selectedTask.id}</span> to status{' '}
              <span className="font-bold text-brand-600">{nextStatus.replace(/_/g, ' ')}</span>?
            </p>

            {nextStatus === 'COMPLETED' && (
              <div className="space-y-2 p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800">
                <label className="block font-bold text-brand-800 dark:text-brand-200 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> Enter Receiver Verification Code
                </label>
                <Input
                  placeholder="e.g. FL-CLM-7842"
                  value={inputClaimCode}
                  onChange={(e) => setInputClaimCode(e.target.value)}
                  className="font-mono text-base font-bold uppercase tracking-wider text-center"
                  required
                />
                <p className="text-[10px] text-content-muted">
                  Ask the receiver for their 4-digit verification claim code upon handover to complete the delivery.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t border-surface-border">
              <Button variant="outline" className="w-full" onClick={() => setSelectedTask(null)}>
                Cancel
              </Button>
              <Button className="w-full" isLoading={updating} onClick={handleConfirmStatusChange}>
                Confirm Transition
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
