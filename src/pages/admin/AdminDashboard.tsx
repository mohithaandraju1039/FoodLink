import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { adminApi } from '../../api/admin.api';
import { PlatformStats, AuditLog, UserRole } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Spinner } from '../../components/common/Spinner';
import { UsersView } from './UsersView';
import { AllListingsView } from './AllListingsView';
import { ClaimsView } from './ClaimsView';
import { TasksView } from './TasksView';
import { AuditLogsView } from './AuditLogsView';
import { SettingsView } from './SettingsView';
import {
  Users,
  Utensils,
  ShoppingBag,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Settings,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { setActAsRole } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSwitchPortal = (targetRole: UserRole) => {
    setActAsRole(targetRole);
    navigate(`/${targetRole.toLowerCase()}`);
  };

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'listings' | 'users' | 'claims' | 'tasks' | 'audit' | 'settings'
  >('overview');

  const fetchAdminData = async () => {
    try {
      const [s, logs] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAuditLogs({ limit: 8 }),
      ]);
      setStats(s);
      setRecentLogs(logs);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
    { id: 'listings', label: 'All Listings', icon: <Utensils className="w-4 h-4" /> },
    { id: 'users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'claims', label: 'Claims', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'tasks', label: 'Volunteer Tasks', icon: <Truck className="w-4 h-4" /> },
    { id: 'audit', label: t('admin_audit_logs'), icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: t('admin_settings'), icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-brand-600 text-white shadow-lg">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-100">
            Admin Control Center
          </span>
          <h1 className="text-2xl font-black mt-1">Platform Operations Oversight</h1>
          <p className="text-xs text-brand-100 mt-1 max-w-xl">
            Complete visibility over platform users, food listings, claims, volunteer deliveries, audit trails, and global system settings.
          </p>
        </div>

        {/* Portal Preview / Switch Portal Quick Links */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => handleSwitchPortal('DONOR')}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Utensils className="w-3.5 h-3.5" /> View Donor Portal
          </button>
          <button
            onClick={() => handleSwitchPortal('RECEIVER')}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> View Receiver Portal
          </button>
          <button
            onClick={() => handleSwitchPortal('VOLUNTEER')}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" /> View Volunteer Portal
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-surface-card border border-surface-border shadow-sm overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-content-muted hover:text-content-main hover:bg-surface-hover'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Tab Content View */}
      {loading ? (
        <Spinner />
      ) : activeTab === 'overview' ? (
        <div className="space-y-8">
          {/* KPI Cards Grid */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title={t('dash_total_users')}
                value={stats.totalUsers}
                icon={<Users className="w-5 h-5" />}
                color="blue"
                description={`${stats.totalDonors} Donors • ${stats.totalReceivers} Receivers • ${stats.totalVolunteers} Volunteers`}
              />
              <StatCard
                title="Active Food Listings"
                value={stats.activeListings}
                icon={<Utensils className="w-5 h-5" />}
                color="emerald"
                description={`${stats.claimedListings} Claimed • ${stats.expiredListings} Expired`}
              />
              <StatCard
                title={t('dash_completed_deliveries')}
                value={stats.completedDeliveries}
                icon={<CheckCircle2 className="w-5 h-5" />}
                color="purple"
                description="Successfully delivered by taskforce"
              />
              <StatCard
                title={t('dash_meals_saved')}
                value={stats.totalServingsSaved}
                icon={<Sparkles className="w-5 h-5" />}
                color="amber"
                description={`~${stats.estimatedKgSaved} Kg food saved from landfills`}
              />
            </div>
          )}

          {/* Audit Logs Live Stream */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-content-main">Recent System Audit Stream</h2>
              <button
                onClick={() => setActiveTab('audit')}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                View Full Logs &rarr;
              </button>
            </div>

            <div className="rounded-3xl border border-surface-border bg-surface-card overflow-hidden shadow-sm">
              <div className="divide-y divide-surface-border">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-surface-hover transition-colors text-xs">
                    <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-content-main uppercase tracking-wider text-[11px]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-content-muted">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-content-muted">{log.details}</p>
                      <div className="text-[10px] text-content-muted font-medium">
                        Actor: <span className="font-bold text-content-main">{log.actorName}</span> ({log.actorRole})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <UsersView />
      ) : activeTab === 'listings' ? (
        <AllListingsView />
      ) : activeTab === 'claims' ? (
        <ClaimsView />
      ) : activeTab === 'tasks' ? (
        <TasksView />
      ) : activeTab === 'audit' ? (
        <AuditLogsView />
      ) : (
        <SettingsView />
      )}
    </div>
  );
};
