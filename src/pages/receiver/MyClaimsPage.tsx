import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { claimsApi } from '../../api/claims.api';
import { FoodListing } from '../../types';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { FoodStatusBadge } from '../../components/food/FoodStatusBadge';
import { Key, Phone, MapPin, Calendar, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const MyClaimsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  const [claims, setClaims] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const data = await claimsApi.getMyClaims();
        setClaims(data);
      } catch (err) {
        console.error('Error fetching receiver claims:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-content-main">{t('receiver_my_claims')}</h1>
        <p className="text-xs text-content-muted">
          Track the live delivery progress of food claimed by {user?.organization || user?.name}.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : claims.length === 0 ? (
        <EmptyState
          title="No Claims Found"
          description="You have not claimed any surplus food donations yet. Browse available food to submit your first claim."
        />
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="rounded-3xl border border-surface-border bg-surface-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <FoodStatusBadge status={claim.status} />
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    {claim.category.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-content-main">{claim.title}</h3>
                  <p className="text-xs text-content-muted mt-0.5">{claim.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-surface-border">
                  <div className="flex items-center gap-1.5 text-content-main">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Donor: {claim.donorName} ({claim.city})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-content-main">
                    <Phone className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span>Phone: {claim.donorPhone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-content-main">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Estimated Pickup: {claim.estimatedPickupTime}</span>
                  </div>
                </div>
              </div>

              {/* Verification Code Box */}
              <div className="w-full md:w-auto p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-center space-y-1 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 flex items-center justify-center gap-1">
                  <Key className="w-3.5 h-3.5" /> Verification Code
                </span>
                <span className="text-xl font-black font-mono tracking-widest text-brand-800 dark:text-brand-200 block">
                  {claim.claimCode || 'FL-CLM-EX'}
                </span>
                <span className="text-[10px] text-content-muted block">Show code on handover</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
