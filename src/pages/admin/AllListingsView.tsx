import React, { useState, useEffect } from 'react';
import { listingsApi } from '../../api/listings.api';
import { FoodListing } from '../../types';
import { FoodCard } from '../../components/food/FoodCard';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';

export const AllListingsView: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchListings = async () => {
    try {
      const data = await listingsApi.getListings();
      setListings(data);
    } catch (err) {
      console.error('Error fetching admin listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filtered = listings.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-content-main">All Food Donations Oversight</h2>
          <p className="text-xs text-content-muted">Comprehensive inventory of active, claimed, completed, and expired listings.</p>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-surface-card border border-surface-border">
          {['ALL', 'ACTIVE', 'CLAIMED', 'COMPLETED', 'EXPIRED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-content-muted hover:text-content-main hover:bg-surface-hover'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="No Listings Found" description={`No entries matching status "${statusFilter}".`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <FoodCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};
