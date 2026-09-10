import React from 'react';
import { useI18n } from '../../context/I18nContext';
import { Utensils, Heart, ShieldCheck, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-surface-card border-t border-surface-border py-8 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-600 text-white">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-content-main">FoodLink Platform</span>
            </div>
            <p className="text-xs text-content-muted max-w-md leading-relaxed">
              FoodLink is an end-to-end food redistribution platform connecting restaurants, hotels, receivers, NGOs, and volunteers to eliminate surplus food waste and eliminate hunger.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-main mb-3">Platform Roles</h4>
            <ul className="space-y-2 text-xs text-content-muted">
              <li>Donor Portal (Restaurants & Hotels)</li>
              <li>Receiver Portal (NGOs & Shelters)</li>
              <li>Volunteer Delivery Taskforce</li>
              <li>Admin Oversight & Audit Center</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-main mb-3">System Features</h4>
            <ul className="space-y-2 text-xs text-content-muted">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Hygiene Safety Certified</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-brand-500" /> 15 Languages Supported</li>
              <li className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-rose-500" /> 100% Non-Profit Mission</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between text-xs text-content-muted gap-4">
          <p>© 2026 FoodLink Platform. Built for zero food waste and zero hunger.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Audit Trail</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
