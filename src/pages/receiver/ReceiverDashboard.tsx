import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { listingsApi } from '../../api/listings.api';
import { claimsApi } from '../../api/claims.api';
import { FoodListing } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { FoodCard } from '../../components/food/FoodCard';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { ShoppingBag, Utensils, Clock, CheckCircle2, Search } from 'lucide-react';

export const ReceiverDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  const [availableListings, setAvailableListings] = useState<FoodListing[]>([]);
  const [myClaims, setMyClaims] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [available, claims] = await Promise.all([
          listingsApi.getListings({ status: 'ACTIVE' }),
          claimsApi.getMyClaims(),
        ]);
        setAvailableListings(available);
        setMyClaims(claims);
      } catch (err) {
        console.error('Failed to load receiver dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalServingsClaimed = myClaims.reduce((sum, c) => sum + c.quantityServings, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-brand-600 text-white shadow-lg">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-100">Receiver Portal</span>
          <h1 className="text-2xl font-black mt-1">Hello, {user?.name}!</h1>
          <p className="text-xs text-brand-100 mt-1 max-w-xl">
            Browse available surplus food donations near you, claim meals for your shelter or community, and track delivery progress.
          </p>
        </div>
        <Link to="/receiver/available">
          <Button
            size="lg"
            className="bg-white text-brand-700 hover:bg-brand-50 border-none font-bold shadow-md shrink-0"
            icon={<Search className="w-5 h-5" />}
          >
            Browse Available Food
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Available Food Right Now"
          value={availableListings.length}
          icon={<Utensils className="w-5 h-5" />}
          color="emerald"
          description="Active listings ready to claim"
        />
        <StatCard
          title="My Total Claims"
          value={myClaims.length}
          icon={<ShoppingBag className="w-5 h-5" />}
          color="blue"
          description="Claimed for your organization"
        />
        <StatCard
          title="Servings Received"
          value={totalServingsClaimed}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="purple"
          description="Servings saved and fed"
        />
      </div>

      {/* Available Surplus Feed Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-content-main">Fresh Surplus Food Available Now</h2>
          <Link to="/receiver/available" className="text-xs font-bold text-brand-600 hover:underline">
            View All ({availableListings.length}) &rarr;
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : availableListings.length === 0 ? (
          <EmptyState
            title="No Food Available At The Moment"
            description="Check back shortly! New food donations are posted regularly by local restaurants and hotels."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableListings.slice(0, 6).map((listing) => (
              <FoodCard key={listing.id} listing={listing} actionText="Claim Food" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
