import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api';
import { SystemSettings, ThemePreset, ThemeMode } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Settings, Save, Mail, Sun, Moon, Palette, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { mode, preset, setMode, setPreset } = useTheme();
  const { t } = useI18n();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminApi.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const updated = await adminApi.updateSettings(settings);
      setSettings(updated);
      setMessage('System settings saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const themePresets: { id: ThemePreset; name: string; bg: string; color: string }[] = [
    { id: 'food-green', name: 'Fresh Food Green', bg: 'bg-emerald-500', color: 'border-emerald-500' },
    { id: 'ocean-blue', name: 'Ocean Blue', bg: 'bg-sky-500', color: 'border-sky-500' },
    { id: 'royal-purple', name: 'Royal Purple', bg: 'bg-purple-600', color: 'border-purple-600' },
    { id: 'sunset', name: 'Warm Sunset', bg: 'bg-orange-500', color: 'border-orange-500' },
    { id: 'teal-mint', name: 'Teal Mint', bg: 'bg-teal-500', color: 'border-teal-500' },
    { id: 'midnight', name: 'Midnight Dark', bg: 'bg-indigo-600', color: 'border-indigo-600' },
  ];

  if (loading || !settings) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-content-main">System Configuration & Appearance</h2>
        <p className="text-xs text-content-muted">Configure platform parameters, auto-expiry threshold, and theme environment.</p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
          {message}
        </div>
      )}

      {/* APPEARANCE & THEMES SECTION */}
      <div className="bg-surface-card p-6 rounded-3xl border border-surface-border shadow-sm space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 flex items-center gap-2">
          <Palette className="w-4 h-4" /> Appearance & Theme Presets
        </h3>

        {/* Light / Dark / System Mode Options */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-content-main uppercase tracking-wider">
            Appearance
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setMode('light')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                mode === 'light'
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                  : 'border-surface-border bg-surface-card text-content-muted hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Sun className="w-4 h-4 text-amber-500" /> Light
              </div>
              {mode === 'light' && <Check className="w-4 h-4 text-brand-600" />}
            </button>

            <button
              type="button"
              onClick={() => setMode('dark')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                mode === 'dark'
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                  : 'border-surface-border bg-surface-card text-content-muted hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Moon className="w-4 h-4 text-indigo-400" /> Dark
              </div>
              {mode === 'dark' && <Check className="w-4 h-4 text-brand-600" />}
            </button>

            <button
              type="button"
              onClick={() => setMode('system')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                mode === 'system'
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                  : 'border-surface-border bg-surface-card text-content-muted hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Settings className="w-4 h-4 text-slate-500" /> System
              </div>
              {mode === 'system' && <Check className="w-4 h-4 text-brand-600" />}
            </button>
          </div>
        </div>

        {/* 6 Color Presets Swatches */}
        <div className="space-y-2 pt-4 border-t border-surface-border">
          <label className="block text-xs font-semibold text-content-main uppercase tracking-wider">
            Color Palette Theme (6 Presets)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {themePresets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                  preset === p.id
                    ? `${p.color} bg-brand-50/50 dark:bg-brand-950/40 font-bold text-content-main shadow-sm`
                    : 'border-surface-border bg-surface-card text-content-muted hover:bg-surface-hover'
                }`}
              >
                <span className={`w-4 h-4 rounded-full ${p.bg} shrink-0 ring-2 ring-black/10`} />
                <span className="text-xs truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PLATFORM CONFIGURATION FORM */}
      <form onSubmit={handleSave} className="bg-surface-card p-6 rounded-3xl border border-surface-border shadow-sm space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 flex items-center gap-2">
          <Settings className="w-4 h-4" /> Platform Parameters
        </h3>

        <Input
          label="Platform Name"
          value={settings.platformName}
          onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
          required
        />

        <Input
          label="Auto Expire Listing Threshold (Hours)"
          type="number"
          min={1}
          value={settings.autoExpireHours}
          onChange={(e) => setSettings({ ...settings, autoExpireHours: parseInt(e.target.value, 10) || 24 })}
          required
        />

        <Input
          label="Support Email Contact"
          type="email"
          value={settings.contactSupportEmail}
          onChange={(e) => setSettings({ ...settings, contactSupportEmail: e.target.value })}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-content-main uppercase tracking-wider mb-1">
            Broadcast Announcement Banner
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-surface-border bg-surface-card text-content-main text-sm p-3"
            value={settings.announcementBanner}
            onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
          />
        </div>

        <div className="pt-4 border-t border-surface-border flex justify-end">
          <Button type="submit" isLoading={saving} icon={<Save className="w-4 h-4" />}>
            Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
