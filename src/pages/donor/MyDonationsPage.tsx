import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { listingsApi } from '../../api/listings.api';
import { FoodListing, ListingStatus } from '../../types';
import { FoodCard } from '../../components/food/FoodCard';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { FoodStatusBadge } from '../../components/food/FoodStatusBadge';
import { Ban, CheckCircle2, Clock, Phone, MapPin, User } from 'lucide-react';

export const MyDonationsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchDonations = async () => {
    try {
      if (user) {
        const data = await listingsApi.getListings({ donorId: user.id });
        setListings(data);
      }
    } catch (err) {
      console.error('Error fetching donor listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [user]);

  const handleCancelListing = async (listingId: string) => {
    setCancelling(true);
    try {
      await listingsApi.cancelListing(listingId);
      setSelectedListing(null);
      await fetchDonations();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel listing.');
    } finally {
      setCancelling(false);
    }
  };

  const filteredListings = listings.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-content-main">{t('donor_my_donations')}</h1>
          <p className="text-xs text-content-muted">View, manage, and track all your surplus food donations.</p>
        </div>

        {/* Filter Pills */}
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
      ) : filteredListings.length === 0 ? (
        <EmptyState
          title="No Donations Found"
          description={`There are no donations matching the "${statusFilter}" filter status.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <FoodCard
              key={listing.id}
              listing={listing}
              actionText="Manage & Details"
              onAction={(l) => setSelectedListing(l)}
            />
          ))}
        </div>
      )}

      {/* Listing Detail & Management Modal */}
      {selectedListing && (
        <Modal
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
          title={`Donation Details - ${selectedListing.title}`}
          maxWidth="xl"
        >
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-hover">
              <span className="font-bold text-content-main">Current Status:</span>
              <FoodStatusBadge status={selectedListing.status} />
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-content-main uppercase text-[11px] tracking-wider">Food Description</h4>
              <p className="text-content-muted leading-relaxed">{selectedListing.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl border border-surface-border">
              <div>
                <span className="text-content-muted block">Quantity Servings:</span>
                <span className="font-bold text-content-main">{selectedListing.quantityServings} servings</span>
              </div>
              <div>
                <span className="text-content-muted block">Weight / Items:</span>
                <span className="font-bold text-content-main">{selectedListing.quantityKgOrItems}</span>
              </div>
              <div>
                <span className="text-content-muted block">Prepared At:</span>
                <span className="font-semibold text-content-main">
                  {new Date(selectedListing.preparedAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-content-muted block">Expires At:</span>
                <span className="font-semibold text-content-main">
                  {new Date(selectedListing.expiresAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Claimed Info if available */}
            {selectedListing.claimedByReceiverId && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                <h4 className="font-bold text-amber-800 dark:text-amber-300 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Receiver Claim & Pickup Info
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-amber-700 dark:text-amber-400 block">Claimed By:</span>
                    <span className="font-bold text-content-main">{selectedListing.claimedByReceiverOrg || selectedListing.claimedByReceiverName}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 dark:text-amber-400 block">Contact Phone:</span>
                    <span className="font-bold text-content-main">{selectedListing.claimedByReceiverPhone}</span>
                  </div>
                  {selectedListing.estimatedPickupTime && (
                    <div>
                      <span className="text-amber-700 dark:text-amber-400 block">Pickup Time:</span>
                      <span className="font-semibold text-content-main">{selectedListing.estimatedPickupTime}</span>
                    </div>
                  )}
                  {selectedListing.volunteerStatus && (
                    <div>
                      <span className="text-amber-700 dark:text-amber-400 block">Pickup Status:</span>
                      <span className="font-bold uppercase text-amber-700 dark:text-amber-300">
                        {selectedListing.volunteerStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                  {selectedListing.claimCode && (
                    <div className="col-span-2 pt-1 border-t border-amber-200 dark:border-amber-800">
                      <span className="text-amber-700 dark:text-amber-400 block">Verification Code:</span>
                      <span className="font-black text-amber-900 dark:text-amber-100 text-sm tracking-wider font-mono">{selectedListing.claimCode}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cancel Action if ACTIVE */}
            {selectedListing.status === 'ACTIVE' && (
              <div className="pt-4 border-t border-surface-border flex justify-end gap-3">
                <Button
                  variant="danger"
                  icon={<Ban className="w-4 h-4" />}
                  isLoading={cancelling}
                  onClick={() => handleCancelListing(selectedListing.id)}
                >
                  Cancel Donation Listing
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
