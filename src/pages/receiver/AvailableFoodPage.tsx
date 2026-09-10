import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { listingsApi } from '../../api/listings.api';
import { claimsApi } from '../../api/claims.api';
import { FoodListing, FoodCategory } from '../../types';
import { FoodCard } from '../../components/food/FoodCard';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Search, Filter, ShoppingBag, Clock, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AvailableFoodPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');

  // Claim Modal State
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [estimatedPickupTime, setEstimatedPickupTime] = useState('Within 1-2 hours');
  const [claimNotes, setClaimNotes] = useState('');
  const [deliveryAddressOverride, setDeliveryAddressOverride] = useState(
    user?.organization ? `${user.organization}, ${user.city}` : `${user?.name}, ${user?.city}`
  );
  const [claiming, setClaiming] = useState(false);
  const [claimSuccessCode, setClaimSuccessCode] = useState<string | null>(null);

  const fetchAvailableFood = async () => {
    try {
      const data = await listingsApi.getListings({ status: 'ACTIVE' });
      setListings(data);
    } catch (err) {
      console.error('Error fetching available food:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableFood();
  }, []);

  const handleConfirmClaim = async () => {
    if (!selectedListing) return;

    setClaiming(true);
    try {
      const res = await claimsApi.claimFood({
        listingId: selectedListing.id,
        estimatedPickupTime,
        claimNotes,
        deliveryAddressOverride,
      });

      setClaimSuccessCode(res.listing.claimCode || 'FL-CLM-OK');
      // Refresh list
      await fetchAvailableFood();
    } catch (err: any) {
      alert(err.message || 'Failed to claim food item.');
    } finally {
      setClaiming(false);
    }
  };

  const cities = Array.from(new Set(listings.map((l) => l.city)));

  const filteredListings = listings.filter((l) => {
    if (categoryFilter !== 'ALL' && l.category !== categoryFilter) return false;
    if (cityFilter !== 'ALL' && l.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.donorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-content-main">{t('receiver_available_title')}</h1>
        <p className="text-xs text-content-muted">
          Browse fresh surplus food available for pickup. Claim items for your NGO, orphanage, or community shelter.
        </p>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-card border border-surface-border shadow-sm">
        <div className="sm:col-span-1">
          <Input
            placeholder={t('receiver_search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full h-[42px] rounded-xl border border-surface-border bg-surface-card text-content-main text-xs font-semibold px-3 focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Categories</option>
            <option value="COOKED_MEALS">Cooked Meals</option>
            <option value="BAKERY">Bakery & Pastries</option>
            <option value="FRESH_PRODUCE">Fresh Produce</option>
            <option value="RAW_INGREDIENTS">Raw Ingredients</option>
            <option value="PACKAGED_FOOD">Packaged Food</option>
            <option value="DAIRY">Dairy</option>
          </select>
        </div>

        <div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full h-[42px] rounded-xl border border-surface-border bg-surface-card text-content-main text-xs font-semibold px-3 focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filteredListings.length === 0 ? (
        <EmptyState
          title="No Available Food Found"
          description="Try adjusting your category or city filters to find active surplus food listings."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <FoodCard
              key={listing.id}
              listing={listing}
              actionText={t('receiver_claim_btn')}
              onAction={(l) => {
                setSelectedListing(l);
                setClaimSuccessCode(null);
              }}
            />
          ))}
        </div>
      )}

      {/* Claim Modal */}
      {selectedListing && (
        <Modal
          isOpen={!!selectedListing}
          onClose={() => {
            setSelectedListing(null);
            setClaimSuccessCode(null);
          }}
          title={claimSuccessCode ? 'Food Claimed Successfully!' : `Claim Food - ${selectedListing.title}`}
          maxWidth="lg"
        >
          {claimSuccessCode ? (
            <div className="space-y-6 text-center py-4 animate-scaleUp">
              <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 inline-flex border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-content-main">Claim Confirmed!</h3>
                <p className="text-xs text-content-muted mt-1">
                  Your claim has been recorded. Present this verification code to the donor or volunteer driver upon handover.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 space-y-1">
                <span className="text-xs text-brand-700 dark:text-brand-300 font-semibold uppercase tracking-wider block">
                  Verification Claim Code
                </span>
                <span className="text-2xl font-black text-brand-700 dark:text-brand-300 tracking-widest font-mono">
                  {claimSuccessCode}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedListing(null);
                    setClaimSuccessCode(null);
                    navigate('/receiver/claims');
                  }}
                >
                  View My Claims
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl border border-surface-border bg-surface-hover space-y-2">
                <div className="font-bold text-content-main text-sm">{selectedListing.title}</div>
                <div className="text-content-muted">{selectedListing.description}</div>
                <div className="flex justify-between font-semibold text-content-main pt-2 border-t border-surface-border">
                  <span>Donor: {selectedListing.donorName}</span>
                  <span>Servings: {selectedListing.quantityServings}</span>
                </div>
              </div>

              <Input
                label={t('receiver_pickup_est')}
                placeholder="e.g. Today at 4:30 PM"
                value={estimatedPickupTime}
                onChange={(e) => setEstimatedPickupTime(e.target.value)}
                required
              />

              <Input
                label="Delivery Address / Drop-off Location"
                placeholder="e.g. Hope Orphanage Campus, Kukatpally"
                value={deliveryAddressOverride}
                onChange={(e) => setDeliveryAddressOverride(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-content-main uppercase tracking-wider mb-1">
                  Pickup Notes / Instructions for Volunteer Driver
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-xl border border-surface-border bg-surface-card text-content-main text-sm p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Mention recipient group details, gate entry requirements, or timing preferences..."
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                Notice: Claiming this item reserves it exclusively for your organization. A volunteer task will automatically be dispatched to our delivery force.
              </div>

              <Button className="w-full" size="lg" isLoading={claiming} onClick={handleConfirmClaim}>
                Confirm Food Claim
              </Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
