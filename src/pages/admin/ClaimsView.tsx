import React, { useState, useEffect } from 'react';
import { listingsApi } from '../../api/listings.api';
import { FoodListing } from '../../types';
import { Spinner } from '../../components/common/Spinner';
import { FoodStatusBadge } from '../../components/food/FoodStatusBadge';
import { Key, User, Phone, MapPin } from 'lucide-react';

export const ClaimsView: React.FC = () => {
  const [claims, setClaims] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const data = await listingsApi.getListings();
        setClaims(data.filter((l) => l.claimedByReceiverId));
      } catch (err) {
        console.error('Error fetching admin claims:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-content-main">Receiver Food Claims Registry</h2>
        <p className="text-xs text-content-muted">Monitor all food claims, verification codes, and receiver details.</p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="rounded-3xl border border-surface-border bg-surface-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-hover text-content-muted uppercase tracking-wider font-bold border-b border-surface-border">
                <tr>
                  <th className="p-4">Listing Title</th>
                  <th className="p-4">Claim Code</th>
                  <th className="p-4">Receiver NGO</th>
                  <th className="p-4">Donor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Claimed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="p-4 font-bold text-content-main">{claim.title}</td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/40 px-2 py-1 rounded-lg border border-brand-200">
                        {claim.claimCode || 'FL-CLM-0000'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-content-main">{claim.claimedByReceiverName}</div>
                      <div className="text-content-muted">{claim.claimedByReceiverPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-content-main">{claim.donorName}</div>
                      <div className="text-content-muted">{claim.city}</div>
                    </td>
                    <td className="p-4">
                      <FoodStatusBadge status={claim.status} />
                    </td>
                    <td className="p-4 text-content-muted">
                      {claim.claimedAt ? new Date(claim.claimedAt).toLocaleString() : '—'}
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
