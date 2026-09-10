import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { ThemePreset } from '../../types';
import { Sun, Moon, Palette } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { mode, preset, toggleMode, setPreset } = useTheme();
  const { t } = useI18n();

  const presets: { id: ThemePreset; name: string; color: string; border: string }[] = [
    { id: 'food-green', name: 'Fresh Food Green', color: 'bg-emerald-500', border: 'border-emerald-400' },
    { id: 'ocean-blue', name: 'Ocean Blue', color: 'bg-sky-500', border: 'border-sky-400' },
    { id: 'royal-purple', name: 'Royal Purple', color: 'bg-purple-600', border: 'border-purple-400' },
    { id: 'sunset', name: 'Warm Sunset', color: 'bg-orange-500', border: 'border-orange-400' },
    { id: 'teal-mint', name: 'Teal Mint', color: 'bg-teal-500', border: 'border-teal-400' },
    { id: 'midnight', name: 'Midnight Dark', color: 'bg-indigo-600', border: 'border-indigo-400' },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Light / Dark Mode Toggle Button */}
      <button
        onClick={toggleMode}
        title={mode === 'light' ? t('theme_dark') : t('theme_light')}
        className="p-2 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover transition-colors text-content-main flex items-center justify-center shadow-sm"
      >
        {mode === 'light' ? <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" /> : <Sun className="w-4 h-4 text-amber-400" />}
      </button>

      {/* Preset Swatches Dropdown */}
      <div className="relative group">
        <button
          className="p-2 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover transition-colors text-content-main flex items-center gap-1.5 text-xs font-semibold shadow-sm"
          title={t('theme_preset')}
        >
          <Palette className="w-4 h-4 text-brand-500" />
          <span className="hidden sm:inline capitalize">{preset.replace('-', ' ')}</span>
        </button>

        <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface-card border border-surface-border rounded-2xl shadow-xl p-2 hidden group-hover:block z-50 animate-fadeIn">
          <div className="text-[10px] font-bold text-content-muted px-2 py-1 uppercase tracking-wider">
            {t('theme_preset')} (6 Presets)
          </div>
          <div className="space-y-1 mt-1">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                  preset === p.id
                    ? 'bg-brand-50 font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                    : 'hover:bg-surface-hover text-content-main'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${p.color} ring-2 ${p.border} shrink-0`} />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
