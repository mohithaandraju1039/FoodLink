import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { listingsApi } from '../../api/listings.api';
import { adminApi } from '../../api/admin.api';
import { FoodListing, AuditLog } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { FoodCard } from '../../components/food/FoodCard';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { FoodStatusBadge } from '../../components/food/FoodStatusBadge';
import {
  PlusCircle,
  Utensils,
  AlertCircle,
  CheckCircle2,
  Clock,
  Bell,
  User,
  Phone,
  Key,
  Truck,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  const [listings, setListings] = useState<FoodListing[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'claimed' | 'notifications'>('all');

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        if (user) {
          const [data, logs] = await Promise.all([
            listingsApi.getListings({ donorId: user.id }),
            adminApi.getAuditLogs({ limit: 20 }).catch(() => []),
          ]);
          setListings(data);
          setAuditLogs(logs.filter((l) => l.actorId === user.id || data.some((item) => item.id === l.targetId)));
        }
      } catch (err) {
        console.error('Failed to load donor listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonorData();
  }, [user]);

  const activeListings = listings.filter((l) => l.status === 'ACTIVE');
  const claimedListings = listings.filter((l) => l.status === 'CLAIMED');
  const completedListings = listings.filter((l) => l.status === 'COMPLETED');
  const expiredListings = listings.filter((l) => l.status === 'EXPIRED');

  const totalServings = listings
    .filter((l) => l.status === 'CLAIMED' || l.status === 'COMPLETED')
    .reduce((sum, l) => sum + l.quantityServings, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome Banner with High-Contrast "Post Food Donation" Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-brand-600 text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-100 bg-brand-700/60 px-3 py-1 rounded-full">
            Donor Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 max-w-xl leading-relaxed">
            Post your surplus cooked meals, bakery items, or produce to immediately feed local shelters and community kitchens.
          </p>
        </div>

        {/* HIGH CONTRAST "Post Food Donation" Button Fix */}
        <Link to="/donor/create" className="w-full sm:w-auto shrink-0">
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-extrabold text-sm shadow-lg hover:bg-slate-100 hover:shadow-xl transition-all focus:ring-4 focus:ring-white/40 active:scale-95 cursor-pointer">
            <PlusCircle className="w-5 h-5 text-brand-600" />
            <span>{t('donor_create_title')}</span>
          </button>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Donations"
          value={listings.length}
          icon={<Utensils className="w-5 h-5" />}
          color="blue"
          description="All time listings posted"
        />
        <StatCard
          title="Active Donations"
          value={activeListings.length}
          icon={<Clock className="w-5 h-5" />}
          color="emerald"
          description="Available for claim"
        />
        <StatCard
          title="Claimed Donations"
          value={claimedListings.length}
          icon={<AlertCircle className="w-5 h-5" />}
          color="amber"
          description="Claimed by receivers"
        />
        <StatCard
          title="Completed Donations"
          value={completedListings.length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="purple"
          description="Successfully delivered"
        />
        <StatCard
          title="Expired Donations"
          value={expiredListings.length}
          icon={<ShieldCheck className="w-5 h-5" />}
          color="rose"
          description="Expired past pickup limit"
        />
      </div>

      {/* Tab Filter Bar */}
      <div className="flex flex-wrap gap-2 border-b border-surface-border pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-content-muted hover:text-content-main hover:bg-surface-hover'
          }`}
        >
          <Utensils className="w-4 h-4" /> All & Active ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('claimed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'claimed'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-content-muted hover:text-content-main hover:bg-surface-hover'
          }`}
        >
          <AlertCircle className="w-4 h-4" /> Claimed Donations ({claimedListings.length})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'notifications'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-content-muted hover:text-content-main hover:bg-surface-hover'
          }`}
        >
          <Bell className="w-4 h-4" /> Claim Notifications ({claimedListings.length})
        </button>
      </div>

      {/* MAIN TAB CONTENTS */}
      {loading ? (
        <Spinner />
      ) : activeTab === 'claimed' ? (
        /* CLAIMED DONATIONS SPECIFIC LIST */
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-content-main">Claimed Food Items & Receiver Info</h2>
          {claimedListings.length === 0 ? (
            <EmptyState
              title="No Claimed Food Items Yet"
              description="When a receiver NGO or shelter claims your food, full details and verification codes will appear here."
            />
          ) : (
            <div className="space-y-4">
              {claimedListings.map((item) => {
                const volunteerStatusLabel = item.volunteerStatus
                  ? item.volunteerStatus.replace(/_/g, ' ')
                  : 'Pending Volunteer';

                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-amber-300 dark:border-amber-800 bg-surface-card p-6 shadow-sm space-y-4"
                  >
                    <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Your food donation has been claimed.</span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <FoodStatusBadge status={item.status} />
                        <h3 className="text-base font-bold text-content-main">Food: {item.title}</h3>
                      </div>
                      <span className="text-xs text-content-muted">
                        Claimed at: {item.claimedAt ? new Date(item.claimedAt).toLocaleString() : 'Recently'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs">
                      <div>
                        <span className="text-amber-800 dark:text-amber-300 font-bold block mb-1 uppercase tracking-wider text-[10px]">
                          <User className="w-3.5 h-3.5 inline mr-1" /> Claimed By
                        </span>
                        <div className="font-bold text-content-main text-sm">
                          {item.claimedByReceiverOrg || item.claimedByReceiverName}
                        </div>
                        <div className="text-content-muted">Contact: {item.claimedByReceiverPhone}</div>
                      </div>

                      <div>
                        <span className="text-amber-800 dark:text-amber-300 font-bold block mb-1 uppercase tracking-wider text-[10px]">
                          <Clock className="w-3.5 h-3.5 inline mr-1" /> Estimated Pickup
                        </span>
                        <div className="font-bold text-content-main">{item.estimatedPickupTime || 'Within 1-2 hrs'}</div>
                        <div className="text-content-muted">Servings: {item.quantityServings}</div>
                      </div>

                      <div>
                        <span className="text-amber-800 dark:text-amber-300 font-bold block mb-1 uppercase tracking-wider text-[10px]">
                          <Truck className="w-3.5 h-3.5 inline mr-1" /> Pickup Status
                        </span>
                        <div className="font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                          {volunteerStatusLabel}
                        </div>
                        {item.volunteerName && (
                          <div className="text-content-muted text-[11px]">Volunteer: {item.volunteerName} ({item.volunteerPhone})</div>
                        )}
                      </div>

                      <div>
                        <span className="text-amber-800 dark:text-amber-300 font-bold block mb-1 uppercase tracking-wider text-[10px]">
                          <Key className="w-3.5 h-3.5 inline mr-1" /> Verification Code
                        </span>
                        <div className="font-black font-mono text-base text-amber-900 dark:text-amber-100 tracking-wider">
                          {item.claimCode || 'FL-CLM-0000'}
                        </div>
                        <div className="text-[10px] text-content-muted">Verify upon pickup handover</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'notifications' ? (
        /* DONOR NOTIFICATIONS STREAM */
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-content-main">Donation Updates & Claim Notifications</h2>
          {claimedListings.length === 0 && auditLogs.length === 0 ? (
            <EmptyState
              title="No Notifications Yet"
              description="Notifications will automatically update here when receivers claim your food or volunteers start pickup journeys."
            />
          ) : (
            <div className="space-y-3">
              {claimedListings.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/30 flex items-start gap-4"
                >
                  <div className="p-2.5 rounded-xl bg-brand-600 text-white shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-content-main">
                      <span>🔔 Food Claimed: "{item.title}"</span>
                      <span className="text-[10px] text-content-muted">
                        {item.claimedAt ? new Date(item.claimedAt).toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>
                    <p className="text-content-muted">
                      Your food donation was claimed by{' '}
                      <span className="font-bold text-content-main">{item.claimedByReceiverName}</span>. Pickup Code:{' '}
                      <span className="font-mono font-bold text-brand-700">{item.claimCode}</span>.
                    </p>
                  </div>
                </div>
              ))}

              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl border border-surface-border bg-surface-card flex items-start gap-4 text-xs"
                >
                  <div className="p-2 rounded-xl bg-surface-hover text-content-muted shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between font-bold text-content-main">
                      <span>{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-content-muted">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-content-muted">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ALL & ACTIVE DONATIONS FEED */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-content-main">My Active Food Donations</h2>
            <Link to="/donor/donations" className="text-xs font-bold text-brand-600 hover:underline">
              View All ({listings.length}) &rarr;
            </Link>
          </div>

          {listings.length === 0 ? (
            <EmptyState
              title="No Food Donations Created Yet"
              description="Start reducing food waste today by posting your first surplus food donation."
              action={
                <Link to="/donor/create">
                  <Button icon={<PlusCircle className="w-4 h-4" />}>Post First Donation</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <FoodCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
