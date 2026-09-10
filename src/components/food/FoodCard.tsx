import React from 'react';
import { FoodListing } from '../../types';
import { FoodStatusBadge } from './FoodStatusBadge';
import { Badge } from '../common/Badge';
import { MapPin, Clock, Users, ShieldCheck, Calendar, Package } from 'lucide-react';

interface FoodCardProps {
  listing: FoodListing;
  onAction?: (listing: FoodListing) => void;
  actionText?: string;
  actionVariant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export const FoodCard: React.FC<FoodCardProps> = ({
  listing,
  onAction,
  actionText = 'View Details',
  actionVariant = 'primary',
}) => {
  // Calculate remaining time
  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours}h ${minutes}m remaining`;
  };

  const isExpired = listing.status === 'EXPIRED' || new Date(listing.expiresAt) <= new Date();

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Top Banner Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={listing.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
          alt={listing.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <FoodStatusBadge status={listing.status} />
          <Badge variant="purple">{listing.category.replace('_', ' ')}</Badge>
        </div>

        {listing.hygieneChecked && (
          <div className="absolute top-3 right-3 bg-emerald-600/90 text-white text-[11px] font-semibold px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Hygiene Certified
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 font-semibold mb-1">
            <span>{listing.donorName}</span>
          </div>

          <h3 className="text-base font-bold text-content-main line-clamp-1 group-hover:text-brand-600 transition-colors">
            {listing.title}
          </h3>

          <p className="text-xs text-content-muted line-clamp-2 mt-1.5 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-surface-border">
          <div className="flex items-center gap-1.5 text-content-main">
            <Users className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="font-semibold">{listing.quantityServings} Servings</span>
          </div>

          <div className="flex items-center gap-1.5 text-content-main">
            <Package className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="truncate">{listing.quantityKgOrItems}</span>
          </div>

          <div className="flex items-center gap-1.5 text-content-muted col-span-2">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{listing.pickupAddress}, {listing.city}</span>
          </div>

          <div className="flex items-center gap-1.5 text-content-muted col-span-2">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className={isExpired ? 'text-rose-500 font-semibold' : 'font-medium'}>
              {getTimeRemaining(listing.expiresAt)}
            </span>
          </div>
        </div>

        {/* Dietary Badges */}
        {listing.dietaryTags && listing.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listing.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-md bg-surface-hover text-content-muted font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        {onAction && (
          <button
            onClick={() => onAction(listing)}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors ${
              actionVariant === 'primary'
                ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                : actionVariant === 'secondary'
                ? 'bg-surface-hover text-content-main hover:bg-slate-200 dark:hover:bg-slate-700'
                : 'border border-surface-border hover:bg-surface-hover text-content-main'
            }`}
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};
