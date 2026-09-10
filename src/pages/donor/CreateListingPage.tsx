import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { listingsApi } from '../../api/listings.api';
import { FoodCategory, PackagingType, StorageTemp, DietaryTag } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { PlusCircle, ShieldCheck, MapPin, Clock, Utensils, AlertTriangle, ArrowLeft } from 'lucide-react';

export const CreateListingPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Helper date defaults: prepared now, expires in 6 hours
  const now = new Date();
  const nowStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const expiryStr = new Date(now.getTime() + 6 * 3600 * 1000 - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>('COOKED_MEALS');
  const [quantityServings, setQuantityServings] = useState<number>(30);
  const [quantityKgOrItems, setQuantityKgOrItems] = useState('10 kg');
  const [preparedAt, setPreparedAt] = useState(nowStr);
  const [expiresAt, setExpiresAt] = useState(expiryStr);
  const [packagingType, setPackagingType] = useState<PackagingType>('SEALED_CONTAINER');
  const [storageTemp, setStorageTemp] = useState<StorageTemp>('HOT');
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>(['VEGETARIAN']);
  const [hygieneChecked, setHygieneChecked] = useState(false);
  const [pickupAddress, setPickupAddress] = useState(user?.organization || 'Main Banquet Kitchen');
  const [landmark, setLandmark] = useState('Near Main Entrance');
  const [city, setCity] = useState(user?.city || 'Hyderabad');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories: { id: FoodCategory; name: string }[] = [
    { id: 'COOKED_MEALS', name: 'Cooked Meals' },
    { id: 'BAKERY', name: 'Bakery & Pastries' },
    { id: 'FRESH_PRODUCE', name: 'Fresh Fruits & Veg' },
    { id: 'RAW_INGREDIENTS', name: 'Raw Grains & Groceries' },
    { id: 'PACKAGED_FOOD', name: 'Packaged Snacks & Drinks' },
    { id: 'DAIRY', name: 'Dairy & Milk' },
    { id: 'BEVERAGES', name: 'Beverages' },
    { id: 'OTHER', name: 'Other Surplus' },
  ];

  const packagingOptions: { id: PackagingType; name: string }[] = [
    { id: 'SEALED_CONTAINER', name: 'Sealed Containers' },
    { id: 'BOXED', name: 'Cardboard Boxes' },
    { id: 'BULK_TRAY', name: 'Bulk Aluminum Trays' },
    { id: 'INSULATED_BAG', name: 'Insulated Thermal Bags' },
    { id: 'CANNED_PACKET', name: 'Canned / Sealed Packets' },
    { id: 'OTHER', name: 'Other Packaging' },
  ];

  const dietaryOptions: DietaryTag[] = ['VEGETARIAN', 'VEGAN', 'HALAL', 'NON_VEG', 'NUT_FREE', 'GLUTEN_FREE'];

  const toggleDietaryTag = (tag: DietaryTag) => {
    setDietaryTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !pickupAddress || !city) {
      setError('Please fill in all required fields.');
      return;
    }

    if (quantityServings <= 0) {
      setError('Quantity in servings must be greater than zero.');
      return;
    }

    const prep = new Date(preparedAt);
    const exp = new Date(expiresAt);

    if (exp <= prep) {
      setError('Expiry time must be strictly after the preparation time.');
      return;
    }

    if (!hygieneChecked) {
      setError('You must confirm the hygiene and food safety declaration checklist.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await listingsApi.createListing({
        title,
        description,
        category,
        quantityServings: Number(quantityServings),
        quantityKgOrItems,
        preparedAt: new Date(preparedAt).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        packagingType,
        storageTemp,
        dietaryTags,
        hygieneChecked,
        pickupAddress,
        landmark,
        city,
        imageUrl,
      });

      navigate('/donor/donations');
    } catch (err: any) {
      setError(err.message || 'Failed to publish donation listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-xs font-bold text-content-muted hover:text-content-main mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h1 className="text-2xl font-black text-content-main">{t('donor_create_title')}</h1>
          <p className="text-xs text-content-muted">
            Provide accurate details so receivers and volunteers can safely handle and pick up the food.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-surface-card p-8 rounded-3xl border border-surface-border shadow-sm">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 flex items-center gap-2">
            <Utensils className="w-4 h-4" /> Food Details
          </h3>

          <Input
            label={t('donor_food_title')}
            placeholder="e.g. Fresh Vegetable Biryani & Raita"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-content-main uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-surface-border bg-surface-card text-content-main text-sm p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Describe the items, ingredients, preparation method, and handling instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-main uppercase tracking-wider mb-1.5">
                {t('donor_category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full rounded-xl border border-surface-border bg-surface-card text-content-main text-sm p-2.5 focus:ring-2 focus:ring-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-main uppercase tracking-wider mb-1.5">
                Storage Temp
              </label>
              <select
                value={storageTemp}
                onChange={(e) => setStorageTemp(e.target.value as StorageTemp)}
                className="w-full rounded-xl border border-surface-border bg-surface-card text-content-main text-sm p-2.5 focus:ring-2 focus:ring-brand-500"
              >
                <option value="HOT">Hot Food</option>
                <option value="COLD">Cold / Refrigerated</option>
                <option value="ROOM_TEMP">Room Temperature</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quantities & Timing Section */}
        <div className="space-y-4 pt-6 border-t border-surface-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Quantity & Expiry Timeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('donor_servings')}
              type="number"
              min={1}
              value={quantityServings}
              onChange={(e) => setQuantityServings(parseInt(e.target.value, 10) || 0)}
              required
            />
            <Input
              label={t('donor_quantity')}
              placeholder="e.g. 15 kg (3 trays)"
              value={quantityKgOrItems}
              onChange={(e) => setQuantityKgOrItems(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('donor_prep_time')}
              type="datetime-local"
              value={preparedAt}
              onChange={(e) => setPreparedAt(e.target.value)}
              required
            />
            <Input
              label={t('donor_expiry_time')}
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-main uppercase tracking-wider mb-1.5">
                {t('donor_packaging')}
              </label>
              <select
                value={packagingType}
                onChange={(e) => setPackagingType(e.target.value as PackagingType)}
                className="w-full rounded-xl border border-surface-border bg-surface-card text-content-main text-sm p-2.5 focus:ring-2 focus:ring-brand-500"
              >
                {packagingOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-main uppercase tracking-wider mb-1.5">
                Photo Image URL (Optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-surface-border bg-surface-card text-content-main text-sm p-2.5"
              />
            </div>
          </div>

          {/* Dietary Checkbox Badges */}
          <div>
            <label className="block text-xs font-semibold text-content-main uppercase tracking-wider mb-2">
              Dietary Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((tag) => {
                const isSelected = dietaryTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleDietaryTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-surface-border bg-surface-card text-content-muted hover:bg-surface-hover'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4 pt-6 border-t border-surface-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Pickup Address Location
          </h3>

          <Input
            label={t('donor_address')}
            placeholder="Plot / Street / Gate No"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('donor_landmark')}
              placeholder="e.g. Opposite Metro Pillar 42"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />
            <Input
              label={t('auth_city')}
              placeholder="Hyderabad / Bengaluru"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Mandatory Hygiene Declaration */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hygieneChecked}
              onChange={(e) => setHygieneChecked(e.target.checked)}
              className="mt-1 w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              required
            />
            <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 leading-relaxed">
              <ShieldCheck className="w-4 h-4 inline-block mr-1 text-emerald-600" />
              {t('donor_hygiene_check')}
            </span>
          </label>
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={submitting}>
          {t('donor_submit')}
        </Button>
      </form>
    </div>
  );
};
